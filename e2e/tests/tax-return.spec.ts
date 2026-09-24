import { test, expect } from '@playwright/test';

/**
 * 確定申告書（総合）の E2E（E2E用DBのシード: 2024年度の給与所得。数値はすべて架空）
 * 期待値は令和6年分の税制で手計算したもの。
 */
test.describe('確定申告書（総合）', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('tx18-onboarding-completed', 'true');
      localStorage.setItem('selectedFiscalYear', '2024');
    });
    await page.goto('/?module=tax-return');
    await expect(page.getByRole('heading', { name: /確定申告書（総合）- 2024年分/ })).toBeVisible();
  });

  test('保存済みの給与所得から税額を計算し、寄附を保存すると再計算される', async ({ page }) => {
    const amount = page.getByTestId('tax-return-amount');

    // 寄附を入れる前: 課税所得 8,030,000 → 所得税及び復興特別所得税 1,236,328 → 納付 236,300
    await expect(page.getByText('納める税金')).toBeVisible();
    await expect(amount).toHaveText('¥236,300');
    await expect(page.getByTestId('taxable-income')).toHaveText('¥8,030,000');

    // 寄附金控除 120,000 と 認定NPO法人等 30,000 を追加して保存
    await page.getByRole('button', { name: '+ 寄附を追加' }).click();
    await page.getByRole('button', { name: '+ 寄附を追加' }).click();
    const rows = page.getByTestId('donation-row');
    await expect(rows).toHaveCount(2);
    await rows.nth(0).getByLabel('金額（円）').fill('120000');
    await rows.nth(1).getByLabel('種類').selectOption('npo-credit');
    await rows.nth(1).getByLabel('金額（円）').fill('30000');

    const saveRequest = page.waitForRequest(
      (req) => req.method() === 'PUT' && req.url().endsWith('/api/tax-return/2024')
    );
    await page.getByRole('button', { name: '保存して再計算' }).click();
    const body = (await saveRequest).postDataJSON();
    expect(body.donations).toEqual([
      { kind: 'deduction', amount: 120000 },
      { kind: 'npo-credit', amount: 30000 },
    ]);

    // 保存後: 寄附金控除 118,000、税額控除 12,000 → 1,196,366 → 納付 196,300
    await expect(page.getByText('2024年分の申告データを保存しました')).toBeVisible();
    await expect(page.getByTestId('donation-deduction')).toHaveText('¥118,000');
    await expect(page.getByTestId('taxable-income')).toHaveText('¥7,912,000');
    await expect(amount).toHaveText('¥196,300');

    // 開き直しても保存した内容が残る（アプリは ?module= をURLから消すので、reload ではなく開き直す）
    await page.goto('/?module=tax-return');
    await expect(page.getByRole('heading', { name: /確定申告書（総合）- 2024年分/ })).toBeVisible();
    await expect(page.getByTestId('donation-row')).toHaveCount(2);
    await expect(page.getByTestId('tax-return-amount')).toHaveText('¥196,300');
  });
});
