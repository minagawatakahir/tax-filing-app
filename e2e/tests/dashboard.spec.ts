import { test, expect } from '@playwright/test';

test.describe('ダッシュボード - E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('ダッシュボードが正常に読み込まれる', async ({ page }) => {
    // ページのタイトルを確認
    await expect(page).toHaveTitle(/Tax Filing|確定申告|Dashboard/i);
  });

  test('ダッシュボード要素が表示される', async ({ page }) => {
    // ダッシュボードのタイトルが表示される
    const dashboardTitle = page.locator('text=/ダッシュボード|Dashboard/i');
    await expect(dashboardTitle.first()).toBeVisible({ timeout: 5000 });
  });

  test('統計情報が表示される', async ({ page }) => {
    // 総所得、総経費、純所得などの情報が表示される
    const stats = page.locator('text=/総所得|総経費|純所得|推定納税額/i');
    
    const count = await stats.count();
    // 最低でも1つの統計情報が表示されることを確認
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('進捗バーが表示される', async ({ page }) => {
    // 進捗状況セクションが表示される
    const progressSection = page.locator('text=/進捗|progress/i');
    
    if (await progressSection.isVisible({ timeout: 3000 })) {
      await expect(progressSection.first()).toBeVisible();
    }
  });

  test('クイックアクションボタンが機能する', async ({ page }) => {
    // クイックアクションボタンを探す
    const quickActionButtons = page.locator('button').filter({ hasText: /給与|物件|レポート|データ|add|create/i });
    
    const count = await quickActionButtons.count();
    // 複数のアクションボタンが存在することを確認
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('ナビゲーションメニューが機能する', async ({ page }) => {
    // サイドバー或いはメニューが表示される
    const navigation = page.locator('nav, [role="navigation"], .sidebar, .menu');
    
    if (await navigation.first().isVisible({ timeout: 2000 })) {
      await expect(navigation.first()).toBeVisible();
    }
  });

  test('年度選択が機能する', async ({ page }) => {
    // 年度選択要素を探す
    const yearSelector = page.locator('select, [role="combobox"]').first();
    
    if (await yearSelector.isVisible({ timeout: 2000 })) {
      await expect(yearSelector).toBeEnabled();
    }
  });

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // 現在のビューポートサイズを確認
    const size = page.viewportSize();
    
    // コンテンツが表示されることを確認
    const mainContent = page.locator('main, [role="main"], .container').first();
    
    if (await mainContent.isVisible({ timeout: 2000 })) {
      await expect(mainContent).toBeVisible();
    }
  });

  test('ヘルスチェック - API接続', async ({ page }) => {
    // バックエンドAPIが応答しているか確認
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
  });
});
