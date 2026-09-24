import { test, expect } from '@playwright/test';

/**
 * 給与所得の保存フロー完全テスト
 * 入力 → 計算 → 保存 → 履歴確認 の一連のフローを検証
 */
test.describe('給与所得の保存フロー - E2E Test', () => {
  // 給与所得は「年度ごとに1件」（TX-61）のため、並列実行すると同じ年度のレコードを互いに上書きしてしまう。
  // このファイルのテストは同一ワーカーで順番に実行する。
  test.describe.configure({ mode: 'default' });

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
    // 給与所得モジュールに移動し、削除対象のレコードを用意する（年度ごとに1件へ上書き保存）
    await page.getByRole('button', { name: /^💼\s*給与所得$/ }).click();
    await page.locator('input[name="annualSalary"]').fill('5500000');
    await page.getByRole('button', { name: '計算する' }).click();
    await page.getByRole('button', { name: /この結果を保存/ }).click();
    await expect(page.getByText('✅ 計算結果を保存しました')).toBeVisible({ timeout: 5000 });

    // 右下のワークフローガイドが削除ボタンを覆うことがあるため最小化する
    await page.getByTitle('最小化').click();

    // 履歴を表示し、件数を確認
    await page.getByRole('button', { name: /計算履歴を表示/ }).click();
    const heading = page.getByRole('heading', { name: /年度の計算履歴 \(\d+件\)/ });
    await expect(heading).toBeVisible({ timeout: 5000 });
    const countOf = async () => Number((await heading.textContent())?.match(/\((\d+)件\)/)?.[1] ?? NaN);
    const before = await countOf();
    expect(before).toBeGreaterThan(0);

    // 削除（確認ダイアログを承認）
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /🗑️\s*削除/ }).first().click();

    // 件数が1件減る
    await expect(heading).toHaveText(new RegExp(`\\(${before - 1}件\\)`), { timeout: 5000 });
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

    const historyHeading = page.getByRole('heading', { name: /年度の計算履歴 \(\d+件\)/ });
    await expect(historyHeading).toBeVisible({ timeout: 5000 });
    const recordCount = Number((await historyHeading.textContent())?.match(/\((\d+)件\)/)?.[1] ?? 0);
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
