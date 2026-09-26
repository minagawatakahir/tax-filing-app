/**
 * PDF の日本語フォントのテスト
 */
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { JP_FONT, registerJapaneseFonts, resetJapaneseFontCache, resolveJapaneseFonts } from '../pdfFonts';

const collect = (doc: PDFKit.PDFDocument): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

const ENV_KEYS = ['PDF_FONT_PATH', 'PDF_FONT_FAMILY', 'PDF_FONT_BOLD_PATH', 'PDF_FONT_BOLD_FAMILY'];
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  resetJapaneseFontCache();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  resetJapaneseFontCache();
  jest.restoreAllMocks();
});

describe('日本語フォントが見つからない環境', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
  });

  test('Helvetica に切り替え、警告を1回だけ出す', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const doc1 = new PDFDocument();
    const doc2 = new PDFDocument();
    expect(registerJapaneseFonts(doc1)).toBe(false);
    expect(registerJapaneseFonts(doc2)).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('PDF_FONT_PATH');

    // Helvetica のままでも PDF は作れる
    const done = collect(doc1);
    doc1.font(JP_FONT).text('ABC');
    doc1.end();
    expect((await done).length).toBeGreaterThan(0);
    doc2.end();
  });

  test('PDF_FONT_PATH に存在しないファイルを指定しても、落ちずに切り替える', () => {
    process.env.PDF_FONT_PATH = '/no/such/font.ttc';
    expect(resolveJapaneseFonts()).toBeNull();
  });
});

describe('日本語フォントがある環境', () => {
  const found = resolveJapaneseFonts();
  resetJapaneseFontCache();
  const maybe = found ? test : test.skip;

  maybe('日本語フォントを登録し、日本語の文字をPDFに埋め込める', async () => {
    const doc = new PDFDocument();
    expect(registerJapaneseFonts(doc)).toBe(true);
    const done = collect(doc);
    doc.font(JP_FONT).text('権利確定日 レートの公示日 円換算額');
    doc.end();
    const pdf = (await done).toString('latin1');
    expect(pdf).toMatch(/\/FontFile2|\/FontFile3/); // フォントが埋め込まれている
    expect(pdf).not.toContain('/BaseFont /Helvetica'); // 標準フォントではない
  });

  maybe('PDF_FONT_PATH で指定したフォントを優先する', () => {
    process.env.PDF_FONT_PATH = found!.regular.path;
    process.env.PDF_FONT_FAMILY = found!.regular.family || '';
    expect(resolveJapaneseFonts()?.regular.path).toBe(found!.regular.path);
  });

  maybe('PDF_FONT_FAMILY が TTC の中にない書体なら、ほかの候補を探す', () => {
    process.env.PDF_FONT_PATH = found!.regular.path;
    process.env.PDF_FONT_FAMILY = 'No-Such-Family';
    const r = resolveJapaneseFonts();
    expect(r).not.toBeNull();
    expect(r!.regular.family).not.toBe('No-Such-Family');
  });
});
