/**
 * 為替レートの出どころ表示のテスト
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { provenanceOf, RateProvenanceWarning, RateSourceBadge } from './RateProvenance';
import { readApiErrorMessage } from '../utils/apiError';

const OFFICIAL = '三菱UFJ銀行 公示相場（三菱UFJリサーチ&コンサルティング）';

describe('provenanceOf', () => {
  test('公示TTM・シミュレーション・出どころ不明を見分ける', () => {
    expect(provenanceOf({ ttmSource: OFFICIAL, ttmRateDate: '2025-02-13', isSimulated: false })).toBe('official');
    expect(provenanceOf({ ttmSource: OFFICIAL, ttmRateDate: '2025-02-13', isSimulated: true })).toBe('simulated');
    expect(provenanceOf({})).toBe('unknown');
    expect(provenanceOf({ ttmSource: OFFICIAL })).toBe('unknown'); // 公示日がない
  });
});

describe('RateSourceBadge', () => {
  test('公示TTMなら公示日を表示する', () => {
    render(<RateSourceBadge calc={{ vestingDate: '2025-02-13T00:00:00', ttmSource: OFFICIAL, ttmRateDate: '2025-02-13' }} />);
    expect(screen.getByTestId('rate-source')).toHaveTextContent('公示日 2025-02-13');
    expect(screen.queryByText('（直前の公示日）')).not.toBeInTheDocument();
  });

  test('休日の権利確定なら「直前の公示日」と添える', () => {
    render(<RateSourceBadge calc={{ vestingDate: '2025-05-18T00:00:00', ttmSource: OFFICIAL, ttmRateDate: '2025-05-16' }} />);
    expect(screen.getByTestId('rate-source')).toHaveTextContent('公示日 2025-05-16（直前の公示日）');
  });

  test('シミュレーション・出どころ不明はバッジで示す', () => {
    const { rerender } = render(<RateSourceBadge calc={{ vestingDate: '2025-02-13', isSimulated: true }} />);
    expect(screen.getByTestId('rate-source')).toHaveTextContent('シミュレーション');
    rerender(<RateSourceBadge calc={{ vestingDate: '2025-02-13' }} />);
    expect(screen.getByTestId('rate-source')).toHaveTextContent('出どころ不明');
  });
});

describe('RateProvenanceWarning', () => {
  test('すべて公示TTMなら何も表示しない', () => {
    const { container } = render(
      <RateProvenanceWarning calculations={[{ vestingDate: '2025-02-13', ttmSource: OFFICIAL, ttmRateDate: '2025-02-13' }]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('シミュレーションと出どころ不明の件数を知らせる', () => {
    render(
      <RateProvenanceWarning
        calculations={[
          { vestingDate: '2025-02-13', isSimulated: true },
          { vestingDate: '2025-05-13', isSimulated: true },
          { vestingDate: '2025-08-13' },
        ]}
      />
    );
    expect(screen.getByText('シミュレーションの為替レートです（申告には使えません）')).toBeInTheDocument();
    expect(screen.getByText(/2件の権利確定に、架空の為替レート/)).toBeInTheDocument();
    expect(screen.getByText('為替レートの出どころが確認できません')).toBeInTheDocument();
    expect(screen.getByText(/1件の権利確定に、出どころの記録がない/)).toBeInTheDocument();
  });
});

describe('readApiErrorMessage', () => {
  test('Blob で返ったエラー本文（JSON）からメッセージを取り出す', async () => {
    const blob = { text: async () => JSON.stringify({ error: '申告用のPDFを出力できません' }) };
    expect(await readApiErrorMessage({ response: { data: blob } }, '既定')).toBe('申告用のPDFを出力できません');
  });

  test('JSON でなければ既定のメッセージ', async () => {
    const blob = { text: async () => '<html>error</html>' };
    expect(await readApiErrorMessage({ response: { data: blob } }, '既定')).toBe('既定');
  });

  test('通常の JSON エラーにも対応する', async () => {
    expect(await readApiErrorMessage({ response: { data: { error: 'サーバーエラー' } } }, '既定')).toBe('サーバーエラー');
  });
});
