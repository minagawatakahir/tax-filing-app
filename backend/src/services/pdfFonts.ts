/**
 * PDF の日本語フォント
 *
 * pdfkit の標準フォント（Helvetica）は日本語を含まないため、日本語が文字化けする。
 * 日本語フォントを次の順に探して登録する:
 *   1. 環境変数 PDF_FONT_PATH（と PDF_FONT_FAMILY、太字は PDF_FONT_BOLD_PATH / PDF_FONT_BOLD_FAMILY）
 *   2. macOS: ヒラギノ角ゴシック
 *   3. Linux: Noto Sans CJK
 *   4. Windows: メイリオ
 * 見つからなければ Helvetica を使い、警告を1回だけ出す（日本語は文字化けする）。
 */
import fs from 'fs';

export const JP_FONT = 'JP';
export const JP_FONT_BOLD = 'JP-Bold';

interface FontFace {
  path: string;
  family?: string; // TTC（複数の書体を含むファイル）のときの PostScript 名
}

interface FontPair {
  regular: FontFace;
  bold: FontFace;
}

const CANDIDATES: FontPair[] = [
  {
    regular: { path: '/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc', family: 'HiraKakuProN-W3' },
    bold: { path: '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc', family: 'HiraKakuProN-W6' },
  },
  {
    regular: { path: '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', family: 'NotoSansCJKjp-Regular' },
    bold: { path: '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', family: 'NotoSansCJKjp-Bold' },
  },
  {
    regular: { path: 'C:\\Windows\\Fonts\\meiryo.ttc', family: 'Meiryo' },
    bold: { path: 'C:\\Windows\\Fonts\\meiryob.ttc', family: 'Meiryo-Bold' },
  },
];

const loadFontkit = (): any => {
  // pdfkit が使っている fontkit を使う（別の版を入れない）
  return require(require.resolve('fontkit', { paths: [require.resolve('pdfkit')] }));
};

/** ファイルがあり、指定の書体を含むか */
const isUsable = (face: FontFace): boolean => {
  try {
    if (!fs.existsSync(face.path)) return false;
    const opened = loadFontkit().openSync(face.path);
    const fonts: any[] = opened.fonts || [opened];
    return face.family ? fonts.some((f) => f.postscriptName === face.family) : fonts.length > 0;
  } catch {
    return false;
  }
};

let resolved: FontPair | null | undefined;
let warned = false;

/** 使える日本語フォントを探す（結果は覚えておく） */
export const resolveJapaneseFonts = (): FontPair | null => {
  if (resolved !== undefined) return resolved;
  const fromEnv: FontPair[] = process.env.PDF_FONT_PATH
    ? [
        {
          regular: { path: process.env.PDF_FONT_PATH, family: process.env.PDF_FONT_FAMILY || undefined },
          bold: {
            path: process.env.PDF_FONT_BOLD_PATH || process.env.PDF_FONT_PATH,
            family: process.env.PDF_FONT_BOLD_FAMILY || process.env.PDF_FONT_FAMILY || undefined,
          },
        },
      ]
    : [];
  for (const pair of [...fromEnv, ...CANDIDATES]) {
    if (isUsable(pair.regular)) {
      resolved = { regular: pair.regular, bold: isUsable(pair.bold) ? pair.bold : pair.regular };
      return resolved;
    }
  }
  resolved = null;
  return resolved;
};

/** テスト用: 探した結果を忘れる */
export const resetJapaneseFontCache = (): void => {
  resolved = undefined;
  warned = false;
};

/**
 * PDF に日本語フォントを JP_FONT / JP_FONT_BOLD の名前で登録する
 * @returns 日本語フォントを登録できたか（false なら Helvetica）
 */
export const registerJapaneseFonts = (doc: PDFKit.PDFDocument): boolean => {
  const fonts = resolveJapaneseFonts();
  if (fonts) {
    doc.registerFont(JP_FONT, fonts.regular.path, fonts.regular.family as any);
    doc.registerFont(JP_FONT_BOLD, fonts.bold.path, fonts.bold.family as any);
    return true;
  }
  if (!warned) {
    console.warn('⚠️  日本語フォントが見つかりません。PDF の日本語は文字化けします（PDF_FONT_PATH で指定できます）。');
    warned = true;
  }
  doc.registerFont(JP_FONT, 'Helvetica');
  doc.registerFont(JP_FONT_BOLD, 'Helvetica-Bold');
  return false;
};
