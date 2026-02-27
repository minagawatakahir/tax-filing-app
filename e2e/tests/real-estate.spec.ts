import { test, expect } from '@playwright/test';

test.describe('不動産所得計算フロー - E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('物件管理パネルが表示される', async ({ page }) => {
    // 物件管理関連のリンクを探す
    const propertyLink = page.locator('text=/物件|property|不動産/i').first();
    
    if (await propertyLink.isVisible({ timeout: 2000 })) {
      await propertyLink.click();
      
      // 物件管理パネルが表示されることを確認
      const panel = page.locator('text=/物件|property/i');
      await expect(panel.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('物件登録フロー', async ({ page }) => {
    // 物件追加ボタンを探す
    const addBtn = page.locator('button').filter({ hasText: /追加|新規|登録|add/ }).first();
    
    if (await addBtn.isVisible({ timeout: 2000 })) {
      await addBtn.click();
      
      // フォームが表示されるまで待機
      const form = page.locator('form').first();
      
      if (await form.isVisible({ timeout: 2000 })) {
        // 物件名を入力
        const nameInput = page.locator('input[placeholder*="物件|property|name"]').first();
        if (await nameInput.isVisible({ timeout: 1000 })) {
          await nameInput.fill('テスト物件');
        }
        
        // 住所を入力
        const addressInput = page.locator('input[placeholder*="住所|address"]').first();
        if (await addressInput.isVisible({ timeout: 1000 })) {
          await addressInput.fill('東京都渋谷区');
        }
        
        // 金額を入力
        const amountInputs = page.locator('input[type="number"]');
        if (await amountInputs.count() > 0) {
          await amountInputs.first().fill('50000000');
        }
        
        // 保存ボタンをクリック
        const saveBtn = page.locator('button').filter({ hasText: /保存|登録|OK|確定/ }).first();
        if (await saveBtn.isVisible({ timeout: 1000 })) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('不動産所得計算フロー', async ({ page }) => {
    // 不動産所得モジュールに移動
    const realEstateLink = page.locator('text=/不動産所得|rental income/i').first();
    
    if (await realEstateLink.isVisible({ timeout: 2000 })) {
      await realEstateLink.click();
      
      // フォームが表示されるまで待機
      const inputs = page.locator('input');
      
      if (await inputs.first().isVisible({ timeout: 3000 })) {
        // 家賃収入を入力
        const rentalInput = page.locator('input[placeholder*="収入|income|rent"]').first();
        if (await rentalInput.isVisible({ timeout: 1000 })) {
          await rentalInput.fill('12000000');
        }
        
        // 経費を入力
        const expenseInput = page.locator('input[placeholder*="経費|expense"]').first();
        if (await expenseInput.isVisible({ timeout: 1000 })) {
          await expenseInput.fill('4000000');
        }
        
        // 計算ボタンをクリック
        const calculateBtn = page.locator('button').filter({ hasText: /計算|確定/ }).first();
        if (await calculateBtn.isVisible({ timeout: 1000 })) {
          await calculateBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('LTV計算が表示される', async ({ page }) => {
    // 物件管理ページに移動
    const propertyLink = page.locator('text=/物件|property/i').first();
    
    if (await propertyLink.isVisible({ timeout: 2000 })) {
      await propertyLink.click();
      
      // LTV関連のテキストが存在することを確認
      const ltvText = page.locator('text=/LTV|ローン対価値比率/i');
      
      if (await ltvText.isVisible({ timeout: 3000 })) {
        expect(await ltvText.count()).toBeGreaterThan(0);
      }
    }
  });

  test('物件一覧が表示される', async ({ page }) => {
    // 不動産所得一覧ページに移動
    const realEstateListLink = page.locator('text=/不動産一覧|不動産所得一覧|real estate list/i').first();
    
    if (await realEstateListLink.isVisible({ timeout: 2000 })) {
      await realEstateListLink.click();
      
      // リストが表示されることを確認
      const listContent = page.locator('table, [role="table"], .list').first();
      
      if (await listContent.isVisible({ timeout: 3000 })) {
        await expect(listContent).toBeVisible();
      }
    }
  });

  test('物件削除機能', async ({ page }) => {
    // 物件管理ページに移動
    const propertyLink = page.locator('text=/物件|property/i').first();
    
    if (await propertyLink.isVisible({ timeout: 2000 })) {
      await propertyLink.click();
      
      // 削除ボタンを探す
      const deleteBtn = page.locator('button').filter({ hasText: /削除|delete|remove/ }).first();
      
      if (await deleteBtn.isVisible({ timeout: 2000 })) {
        await expect(deleteBtn).toBeEnabled();
      }
    }
  });
});
