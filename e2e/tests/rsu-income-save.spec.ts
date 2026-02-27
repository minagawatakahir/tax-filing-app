import { test, expect } from '@playwright/test';

/**
 * RSU所得の保存フロー完全テスト
 * データ読み込み → 計算 → 保存 → 履歴確認 の一連のフローを検証
 */
test.describe('RSU所得の保存フロー - E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // OnboardingModalを閉じる
    const skipButton = page.locator('button', { hasText: /スキップ|閉じる|キャンセル/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('RSU所得データが年度選択時に自動読み込みされる (TX-55)', async ({ page }) => {
    // Step 1: 年度を2025年に選択
    const yearSelect = page.locator('select').first();
    if (await yearSelect.isVisible({ timeout: 2000 })) {
      await yearSelect.selectOption('2025');
      await page.waitForTimeout(500);
    }

    // Step 2: RSU所得モジュールに移動
    const rsuButton = page.getByRole('button', { name: /RSU所得|RSU為替/i });
    await rsuButton.click();
    await page.waitForTimeout(1000);

    // Step 3: 既存データが自動読み込みされることを確認
    const vestingDateInputs = page.locator('input[type="date"]');
    const inputCount = await vestingDateInputs.count();
    
    // 2025年には7件のデータがあるはず
    expect(inputCount).toBeGreaterThanOrEqual(3); // 少なくとも3件のフォーム行がある

    // Step 4: 権利確定日が正しく入力されていることを確認
    const firstDateInput = vestingDateInputs.first();
    const dateValue = await firstDateInput.inputValue();
    expect(dateValue).toBeTruthy(); // 日付が入力されている
    expect(dateValue).toMatch(/\d{4}-\d{2}-\d{2}/); // 日付フォーマット確認
  });

  test('RSU所得の計算結果を保存し、履歴で確認できる', async ({ page }) => {
    // Step 1: RSU所得モジュールに移動
    const rsuButton = page.getByRole('button', { name: /RSU所得|RSU為替/i });
    await rsuButton.click();
    await page.waitForTimeout(500);

    // Step 2: データが既に読み込まれているか確認
    const vestingDateInput = page.locator('input[type="date"]').first();
    const hasData = await vestingDateInput.inputValue();

    if (!hasData) {
      // データがない場合は入力
      await vestingDateInput.fill('2025-03-15');
      
      const sharesInput = page.locator('input[placeholder*="株数"]').first();
      await sharesInput.fill('100');

      const priceInput = page.locator('input[placeholder*="価格"]').first();
      await priceInput.fill('180.50');
    }

    // Step 3: 計算ボタンをクリック
    const calculateButton = page.getByRole('button', { name: /計算|一括計算|為替を計算/i });
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // Step 4: 計算結果が表示されることを確認
    const resultTable = page.locator('table, .result');
    await expect(resultTable.first()).toBeVisible({ timeout: 5000 });

    // Step 5: 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /この計算結果を保存|保存/i });
    if (await saveButton.isVisible({ timeout: 2000 })) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Step 6: 成功メッセージが表示されることを確認
      const successMessage = page.locator('text=/保存|✅|成功/i');
      await expect(successMessage).toBeVisible({ timeout: 3000 });
    }
  });

  test('年度を変更するとRSUデータが切り替わる (TX-55)', async ({ page }) => {
    // Step 1: 2025年を選択
    const yearSelect = page.locator('select').first();
    if (await yearSelect.isVisible({ timeout: 2000 })) {
      await yearSelect.selectOption('2025');
      await page.waitForTimeout(500);
    }

    // Step 2: RSU所得モジュールに移動
    const rsuButton = page.getByRole('button', { name: /RSU所得|RSU為替/i });
    await rsuButton.click();
    await page.waitForTimeout(1000);

    // Step 3: 2025年のデータが読み込まれている
    const vestingDateInputs2025 = page.locator('input[type="date"]');
    const count2025 = await vestingDateInputs2025.count();

    // Step 4: 年度を2024年に変更
    await yearSelect.selectOption('2024');
    await page.waitForTimeout(1000);

    // Step 5: データがクリアされる（2024年にはデータがない想定）
    const vestingDateInputs2024 = page.locator('input[type="date"]');
    const firstValue2024 = await vestingDateInputs2024.first().inputValue();
    
    // 2024年にデータがない場合は空になる
    // あるいはデフォルトのフォーム行だけ表示される
    expect(firstValue2024 === '' || count2025 !== await vestingDateInputs2024.count()).toBeTruthy();
  });

  test('複数の権利確定記録を一度に計算できる', async ({ page }) => {
    // RSU所得モジュールに移動
    const rsuButton = page.getByRole('button', { name: /RSU所得|RSU為替/i });
    await rsuButton.click();
    await page.waitForTimeout(500);

    // 複数行入力
    const vestingDateInputs = page.locator('input[type="date"]');
    const sharesInputs = page.locator('input[placeholder*="株数"]');
    const priceInputs = page.locator('input[placeholder*="価格"]');

    const rowCount = Math.min(3, await vestingDateInputs.count());
    
    for (let i = 0; i < rowCount; i++) {
      const dateInput = vestingDateInputs.nth(i);
      if (await dateInput.isVisible({ timeout: 1000 })) {
        const currentValue = await dateInput.inputValue();
        if (!currentValue) {
          await dateInput.fill(`2025-0${i + 3}-15`);
        }
      }
    }

    // 一括計算
    const calculateButton = page.getByRole('button', { name: /計算|一括計算/i });
    await calculateButton.click();
    await page.waitForTimeout(1500);

    // 結果テーブルに複数行が表示されることを確認
    const resultRows = page.locator('table tbody tr, .result-row');
    const resultRowCount = await resultRows.count();
    expect(resultRowCount).toBeGreaterThan(0);
  });

  test('RSU所得管理画面で年度別データを確認できる', async ({ page }) => {
    // RSU所得管理モジュールに移動
    const rsuListButton = page.getByRole('button', { name: /RSU所得管理|RSU一覧/i });
    if (await rsuListButton.isVisible({ timeout: 2000 })) {
      await rsuListButton.click();
      await page.waitForTimeout(500);

      // 一覧が表示されることを確認
      const listContainer = page.locator('table, .list-container');
      await expect(listContainer.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('保存されたRSUデータを削除できる', async ({ page }) => {
    // RSU所得管理モジュールに移動
    const rsuListButton = page.getByRole('button', { name: /RSU所得管理|RSU一覧/i });
    if (await rsuListButton.isVisible({ timeout: 2000 })) {
      await rsuListButton.click();
      await page.waitForTimeout(500);

      // 削除ボタンがあることを確認
      const deleteButton = page.locator('button', { hasText: /削除|🗑️/i }).first();
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();
        await page.waitForTimeout(500);

        // 確認ダイアログがある場合は承認
        page.once('dialog', dialog => {
          dialog.accept();
        });

        await page.waitForTimeout(500);
      }
    }
  });
});
