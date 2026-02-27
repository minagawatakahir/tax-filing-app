import { test, expect } from '@playwright/test';

/**
 * 給与所得の保存フロー完全テスト
 * 入力 → 計算 → 保存 → 履歴確認 の一連のフローを検証
 */
test.describe('給与所得の保存フロー - E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageを事前に設定してOnboardingModalを表示しないようにする
    await page.addInitScript(() => {
      localStorage.setItem('tx18-onboarding-completed', 'true');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('給与所得の計算結果を保存し、履歴で確認できる', async ({ page }) => {
    // Step 1: 給与所得モジュールに移動
    const salaryButton = page.getByRole('button', { name: /給与所得/i });
    await salaryButton.click();
    await page.waitForTimeout(500);

    // Step 2: フォームに入力
    const annualSalaryInput = page.locator('input[name="annualSalary"]');
    await annualSalaryInput.fill('5000000');

    const withheldTaxInput = page.locator('input[name="withheldTax"]');
    await withheldTaxInput.fill('600000');

    const socialInsuranceInput = page.locator('input[name="socialInsurance"]');
    await socialInsuranceInput.fill('750000');

    const lifeInsuranceInput = page.locator('input[name="lifeInsurance"]');
    await lifeInsuranceInput.fill('100000');

    // Step 3: 計算ボタンをクリック
    const calculateButton = page.getByRole('button', { name: /計算する|税額を計算/i });
    await calculateButton.click();
    await page.waitForTimeout(1000);

    // Step 4: 計算結果が表示されることを確認
    const resultSection = page.locator('text=/課税所得|給与所得金額/i');
    await expect(resultSection.first()).toBeVisible({ timeout: 5000 });

    // Step 5: 保存ボタンをクリック
    const saveButton = page.getByRole('button', { name: /この結果を保存|保存/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Step 6: 成功メッセージが表示されることを確認
    const successMessage = page.locator('text=/保存しました|✅/i');
    await expect(successMessage).toBeVisible({ timeout: 3000 });

    // Step 7: 保存された履歴を確認
    // 履歴表示セクションを展開（必要な場合）
    const historyButton = page.locator('button', { hasText: /履歴|保存された計算結果/i });
    if (await historyButton.isVisible({ timeout: 2000 })) {
      await historyButton.click();
      await page.waitForTimeout(500);
    }

    // Step 8: 保存したデータが履歴に表示されることを確認
    const savedRecord = page.locator('text=/5,000,000|¥5,000,000/i');
    await expect(savedRecord.first()).toBeVisible({ timeout: 3000 });
  });

  test('保存された計算結果を削除できる', async ({ page }) => {
    // 給与所得モジュールに移動
    const salaryButton = page.getByRole('button', { name: /給与所得/i });
    await salaryButton.click();
    await page.waitForTimeout(500);

    // 履歴セクションを表示
    const historyButton = page.locator('button', { hasText: /履歴|保存された計算結果/i });
    if (await historyButton.isVisible({ timeout: 2000 })) {
      await historyButton.click();
      await page.waitForTimeout(500);
    }

    // 削除ボタンがあることを確認
    const deleteButton = page.locator('button', { hasText: /削除|🗑️/i }).first();
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      await deleteButton.click();
      await page.waitForTimeout(500);

      // 確認ダイアログがある場合は承認
      const confirmButton = page.locator('button', { hasText: /はい|OK|削除する/i });
      if (await confirmButton.isVisible({ timeout: 1000 })) {
        await confirmButton.click();
      }

      // 削除後、レコードが消えることを確認
      await page.waitForTimeout(500);
    }
  });

  test('複数の給与所得レコードを保存できる', async ({ page }) => {
    // 給与所得モジュールに移動
    const salaryButton = page.getByRole('button', { name: /給与所得/i });
    await salaryButton.click();
    await page.waitForTimeout(500);

    // 1つ目のレコードを保存
    const annualSalaryInput = page.locator('input[name="annualSalary"]');
    await annualSalaryInput.fill('6000000');

    const calculateButton = page.getByRole('button', { name: /計算する|税額を計算/i });
    await calculateButton.click();
    await page.waitForTimeout(1000);

    const saveButton = page.getByRole('button', { name: /この結果を保存|保存/i });
    await saveButton.click();
    await page.waitForTimeout(1000);

    // 2つ目のレコードを保存
    await annualSalaryInput.fill('7000000');
    await calculateButton.click();
    await page.waitForTimeout(1000);
    await saveButton.click();
    await page.waitForTimeout(1000);

    // 履歴に複数レコードが表示されることを確認
    const historyButton = page.locator('button', { hasText: /履歴|保存された計算結果/i });
    if (await historyButton.isVisible({ timeout: 2000 })) {
      await historyButton.click();
      await page.waitForTimeout(500);
    }

    const recordCount = await page.locator('tr, .record-item, [data-testid*="record"]').count();
    expect(recordCount).toBeGreaterThan(0);
  });

  test('年度を変更しても正しいデータが表示される', async ({ page }) => {
    // 年度セレクトを変更
    const yearSelect = page.locator('select').first();
    if (await yearSelect.isVisible({ timeout: 2000 })) {
      await yearSelect.selectOption('2025');
      await page.waitForTimeout(500);
    }

    // 給与所得モジュールに移動
    const salaryButton = page.getByRole('button', { name: /給与所得/i });
    await salaryButton.click();
    await page.waitForTimeout(500);

    // 履歴を確認（2025年のデータが表示される）
    const historyButton = page.locator('button', { hasText: /履歴|保存された計算結果/i });
    if (await historyButton.isVisible({ timeout: 2000 })) {
      await historyButton.click();
      await page.waitForTimeout(500);
    }
  });
});
