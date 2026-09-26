/**
 * TTM（公示相場）取得のテスト
 * HTML は公示相場ページの構造だけをまねた最小限のもの（ネットワークには接続しない）。
 */
jest.mock('axios');
jest.mock('fs');

import axios from 'axios';
import fs from 'fs';
import {
  getOfficialTTM,
  getSimulatedTTM,
  getTTM,
  OFFICIAL_TTM_SOURCE,
  parseMurcUsdRate,
  resetTTMCache,
  SIMULATED_TTM_SOURCE,
  toTTM,
  TTMUnavailableError,
} from '../ttmRateService';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFs = fs as jest.Mocked<typeof fs>;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 公示相場ページ（米ドルの行つき） */
const page = (isoDate: string, tts = 155.51, ttb = 153.51) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `<html><body><h2>${y}年${m}月${d}日の為替相場　As of ${MONTHS[m - 1]} ${d}, ${y} </h2>
  <table><tr><td>US Dollar</td><td>米ドル</td><td class="t_center">USD</td><td class="t_right">${tts} </td><td class="t_right">${ttb} </td><td class="t_center"></td></tr>
  <tr><td>Euro</td><td>ユーロ</td><td class="t_center">EUR</td><td class="t_right">163.00 </td><td class="t_right">160.00 </td><td></td></tr></table></body></html>`;
};

/** リクエストされた id（yymmdd）に応じてページを返す */
const serve = (pages: Record<string, string>) =>
  mockedAxios.get.mockImplementation(async (_url: string, config?: any) => {
    const id = config?.params?.id as string;
    return { data: pages[id] ?? page('2026-09-25') }; // 公示がない日は「今日」のページが返る（実際の挙動）
  });

const TODAY = new Date(2026, 8, 25);

beforeEach(() => {
  jest.resetAllMocks();
  resetTTMCache();
  mockedFs.existsSync.mockReturnValue(false);
  delete process.env.USE_SIMULATED_TTM;
});

describe('parseMurcUsdRate', () => {
  test('公示日と米ドルの TTS/TTB を取り出す', () => {
    expect(parseMurcUsdRate(page('2025-02-13'))).toEqual({ rateDate: '2025-02-13', tts: 155.51, ttb: 153.51 });
  });

  test('米ドルの行がなければ null', () => {
    expect(parseMurcUsdRate('<h2>As of February 13, 2025</h2><table></table>')).toBeNull();
  });

  test('TTS が TTB より小さいなど、不自然な値なら null', () => {
    expect(parseMurcUsdRate(page('2025-02-13', 150, 152))).toBeNull();
  });

  test('公示日が読めなければ null', () => {
    expect(parseMurcUsdRate(page('2025-02-13').replace(/As of [^<]+/, ''))).toBeNull();
  });
});

describe('toTTM', () => {
  test('TTS と TTB の中間（銭単位）', () => {
    expect(toTTM(155.51, 153.51)).toBe(154.51);
    expect(toTTM(152.67, 150.67)).toBe(151.67);
    expect(toTTM(145.555, 144.0)).toBe(144.78);
  });
});

describe('getOfficialTTM', () => {
  test('その日の公示TTMを返す（出どころと公示日つき）', async () => {
    serve({ '250213': page('2025-02-13') });
    const r = await getOfficialTTM(new Date(2025, 1, 13), TODAY);
    expect(r).toEqual({
      requestedDate: '2025-02-13',
      rateDate: '2025-02-13',
      rate: 154.51,
      tts: 155.51,
      ttb: 153.51,
      source: OFFICIAL_TTM_SOURCE,
      isSimulated: false,
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ params: { id: '250213' } }));
  });

  test('休日は「今日」のページが返るので、直前の公示日にさかのぼる', async () => {
    // 2025-05-18（日）と 05-17（土）は公示なし → 05-16（金）の値
    serve({ '250516': page('2025-05-16', 146.08, 144.08) });
    const r = await getOfficialTTM(new Date(2025, 4, 18), TODAY);
    expect(r.requestedDate).toBe('2025-05-18');
    expect(r.rateDate).toBe('2025-05-16');
    expect(r.rate).toBe(145.08);
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });

  test('7日前までさかのぼっても見つからなければエラー（代わりの値を使わない）', async () => {
    serve({});
    await expect(getOfficialTTM(new Date(2025, 4, 18), TODAY)).rejects.toThrow(TTMUnavailableError);
    expect(mockedAxios.get).toHaveBeenCalledTimes(8); // 当日 + 7日分
  });

  test('通信エラーならエラー（代わりの値を使わない）', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network down'));
    await expect(getOfficialTTM(new Date(2025, 1, 13), TODAY)).rejects.toThrow(/公示相場のページを取得できませんでした/);
  });

  test('未来の日付は取得しに行かずにエラー', async () => {
    await expect(getOfficialTTM(new Date(2026, 9, 1), TODAY)).rejects.toThrow(/まだ公示されていない/);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('取得した公示TTMはキャッシュし、2回目は取得しに行かない', async () => {
    serve({ '250213': page('2025-02-13') });
    await getOfficialTTM(new Date(2025, 1, 13), TODAY);
    const again = await getOfficialTTM(new Date(2025, 1, 13), TODAY);
    expect(again.rate).toBe(154.51);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    const written = JSON.parse(String(mockedFs.writeFileSync.mock.calls[0][1]));
    expect(written['2025-02-13']).toMatchObject({ rate: 154.51, source: OFFICIAL_TTM_SOURCE, isSimulated: false });
  });

  test('キャッシュファイルのうち、公示TTM以外（出どころ不明・シミュレーション）は読み込まない', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        '2025-02-13': { rate: 155.09 }, // 出どころ不明（古い形式）
        '2025-02-18': { rate: 143.756, source: SIMULATED_TTM_SOURCE, isSimulated: true },
        '2025-05-13': { requestedDate: '2025-05-13', rateDate: '2025-05-13', rate: 147.9, source: OFFICIAL_TTM_SOURCE, isSimulated: false },
      })
    );
    serve({ '250213': page('2025-02-13'), '250218': page('2025-02-18', 152.67, 150.67) });

    expect((await getOfficialTTM(new Date(2025, 1, 13), TODAY)).rate).toBe(154.51);
    expect((await getOfficialTTM(new Date(2025, 1, 18), TODAY)).rate).toBe(151.67);
    expect((await getOfficialTTM(new Date(2025, 4, 13), TODAY)).rate).toBe(147.9); // キャッシュから
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});

describe('getTTM（シミュレーションの切り替え）', () => {
  test('既定では公示TTMを使う', async () => {
    serve({ '250213': page('2025-02-13') });
    jest.useFakeTimers().setSystemTime(TODAY);
    try {
      const r = await getTTM(new Date(2025, 1, 13));
      expect(r.isSimulated).toBe(false);
      expect(r.source).toBe(OFFICIAL_TTM_SOURCE);
    } finally {
      jest.useRealTimers();
    }
  });

  test('USE_SIMULATED_TTM=true のときだけシミュレーションを使い、必ず目印を付ける', async () => {
    process.env.USE_SIMULATED_TTM = 'true';
    const r = await getTTM(new Date(2025, 1, 13));
    expect(r).toMatchObject({ isSimulated: true, source: SIMULATED_TTM_SOURCE, rateDate: '2025-02-13' });
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled(); // シミュレーションはキャッシュしない
  });

  test('シミュレーションの値は日付で決まり、140〜160円の範囲', () => {
    const a = getSimulatedTTM(new Date(2025, 1, 13));
    expect(a.rate).toBe(143.746); // 以前のアプリがDBに保存していた値と同じ（架空の値だったことの確認）
    expect(getSimulatedTTM(new Date(2025, 1, 13)).rate).toBe(a.rate);
    expect(a.rate).toBeGreaterThanOrEqual(140);
    expect(a.rate).toBeLessThan(160);
  });
});
