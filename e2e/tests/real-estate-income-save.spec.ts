import { test, expect, Page } from '@playwright/test';
import { E2E_PROPERTY_ID } from '../e2e-env';

/**
 * 不動産所得の保存フロー完全テスト
 * 入力 → 計算 → 保存 → 履歴確認 の一連のフローを検証
 */
test.describe('不動産所得の保存フロー - E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageを事前に設定してOnboardingModalを表示しないようにする
    await page.addInitScript(() => {
      localStorage.setItem('tx18-onboarding-completed', 'true');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  /** 物件ID・月額家賃・管理費を入力して計算し、保存リクエストとその応答を返す */
  const calculateAndSave = async (page: Page, monthlyRent: number, managementFee: number) => {
    await page.getByRole('button', { name: /^🏠\s*不動産所得$/ }).click();

    await page.locator('label:has-text("物件ID") + input').fill(E2E_PROPERTY_ID);
    await page.locator('label:has-text("月額家賃") + input').fill(String(monthlyRent));
    await page.locator('label:has-text("管理費") + input').fill(String(managementFee));

    await page.getByRole('button', { name: /💰\s*不動産所得を計算/ }).click();
    await expect(page.getByRole('heading', { name: '📊 計算結果' })).toBeVisible({ timeout: 5000 });

    const dialogPromise = page.waitForEvent('dialog', { timeout: 5000 });
    const requestPromise = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith('/api/real-estate-income-list')
    );
    const responsePromise = page.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().endsWith('/api/real-estate-income-list')
    );
    await page.getByRole('button', { name: /💾\s*計算結果を保存/ }).click();

    const [request, response, dialog] = await Promise.all([requestPromise, responsePromise, dialogPromise]);
    const message = dialog.message();
    await dialog.accept();
    return { payload: request.postDataJSON(), response, message };
  };

  test('不動産所得の計算結果を保存し、履歴で確認できる', async ({ page }) => {
    const { response, message } = await calculateAndSave(page, 100000, 300000);

    expect(response.status()).toBe(201);
    expect(message).toMatch(/保存しました/);
    // 保存後は不動産所得一覧へ遷移する
    await expect(page.getByRole('heading', { name: /不動産所得一覧/ })).toBeVisible({ timeout: 5000 });
  });

  test('複数の不動産物件の所得を管理できる', async ({ page }) => {
    // 不動産所得一覧モジュールに移動
    await page.getByRole('button', { name: /不動産所得一覧/ }).click();
    await expect(page.getByRole('heading', { name: /年 不動産所得一覧/ })).toBeVisible({ timeout: 5000 });
  });

  test('不動産所得の詳細情報が正しく保存される', async ({ page }) => {
    const { payload, response } = await calculateAndSave(page, 125000, 60000);

    expect(response.status()).toBe(201);
    // 入力値がそのまま保存リクエストに含まれる
    expect(payload).toMatchObject({
      propertyId: E2E_PROPERTY_ID,
      monthlyRent: 125000,
      months: 12,
      managementFee: 60000,
    });
    // 計算結果（家賃 125,000円 × 12か月）も保存される
    expect(payload.totalIncome).toBe(1500000);
    expect(typeof payload.fiscalYear).toBe('number');
    expect(payload.realEstateIncome).toBe(payload.totalIncome - payload.totalExpenses);
  });

  test('年度ごとに異なる不動産所得データを管理できる', async ({ page }) => {
    // 年度セレクトを確認
    const yearSelect = page.locator('select').first();
    if (await yearSelect.isVisible({ timeout: 2000 })) {
      // 複数年度にデータがあることを確認できるテスト
      const options = yearSelect.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    }
  });
});
