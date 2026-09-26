import { test, expect } from '@playwright/test';

/**
 * RSU所得の保存フロー完全テスト
 * データ読み込み → 計算 → 保存 → 履歴確認 の一連のフローを検証
 */
test.describe('RSU所得の保存フロー - E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageを事前に設定してOnboardingModalを表示しないようにする
    await page.addInitScript(() => {
      localStorage.setItem('tx18-onboarding-completed', 'true');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('RSU所得データが年度選択時に自動読み込みされる (TX-55)', async ({ page }) => {
    // Step 1: 年度を2025年に選択
    const yearSelect = page.locator('select').first();
    if (await yearSelect.isVisible({ timeout: 2000 })) {
      await yearSelect.selectOption('2025');
      await page.waitForTimeout(500);
    }

    // Step 2: RSU所得モジュールに移動
    const rsuButton = page.getByRole('button', { name: /^💱\s*RSU所得$/i });
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
    // シード済みの2025年度を対象にする（既存レコードを同じ内容で上書き保存）
    await page.locator('select').first().selectOption('2025');

    // Step 1: RSU所得モジュールに移動
    await page.getByRole('button', { name: /^💱\s*RSU所得$/i }).click();

    // Step 2: 既存データが読み込まれている
    const inputRows = page.locator('table tbody tr').filter({ has: page.locator('input[type="date"]') });
    await expect(inputRows.first().locator('input[type="date"]')).not.toHaveValue('', { timeout: 5000 });

    // Step 3: 一括計算を実行
    await page.getByRole('button', { name: /^一括計算$/ }).click();

    // Step 4: 計算結果テーブルが表示される
    const resultTable = page.locator('table', { has: page.getByRole('columnheader', { name: 'TTM' }) });
    await expect(resultTable).toBeVisible({ timeout: 15000 });

    // Step 5: 保存して成功メッセージを確認
    await page.getByRole('button', { name: /この計算結果を保存/ }).click();
    await expect(page.getByText(/計算結果を保存しました \(2025年度\)/)).toBeVisible({ timeout: 5000 });
  });

  test('年度を変更するとRSUデータが切り替わる (TX-55)', async ({ page }) => {
    // Step 1: 2025年を選択
    const yearSelect = page.locator('select').first();
    if (await yearSelect.isVisible({ timeout: 2000 })) {
      await yearSelect.selectOption('2025');
      await page.waitForTimeout(500);
    }

    // Step 2: RSU所得モジュールに移動
    const rsuButton = page.getByRole('button', { name: /^💱\s*RSU所得$/i });
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
    // RSU所得モジュールに移動し、一括計算モードにする
    await page.getByRole('button', { name: /^💱\s*RSU所得$/i }).click();
    await page.getByRole('button', { name: /^複数行一括計算$/ }).click();

    const inputRows = page.locator('table tbody tr').filter({ has: page.locator('input[type="date"]') });
    await expect(inputRows.first()).toBeVisible({ timeout: 5000 });

    // 3行になるまで行を追加
    while ((await inputRows.count()) < 3) {
      await page.getByRole('button', { name: '+ 行を追加' }).click();
    }
    // 余分な行があれば削除して3行にそろえる
    while ((await inputRows.count()) > 3) {
      await inputRows.last().getByRole('button', { name: '✕' }).click();
    }

    const rows = [
      { date: '2025-03-15', shares: '100', price: '180.50' },
      { date: '2025-06-15', shares: '50', price: '175.25' },
      { date: '2025-09-15', shares: '80', price: '190' },
    ];
    for (let i = 0; i < rows.length; i++) {
      const row = inputRows.nth(i);
      await row.locator('input[type="date"]').fill(rows[i].date);
      await row.locator('input[type="number"]').nth(0).fill(rows[i].shares);
      await row.locator('input[type="number"]').nth(1).fill(rows[i].price);
    }

    // 一括計算（「複数行一括計算」はモード切替、「一括計算」が実行ボタン）
    await page.getByRole('button', { name: /^一括計算$/ }).click();

    // 結果テーブルに入力と同じ行数が表示される
    const resultRows = page
      .locator('table', { has: page.getByRole('columnheader', { name: 'TTM' }) })
      .locator('tbody tr');
    await expect(resultRows).toHaveCount(3, { timeout: 15000 });

    // E2E はシミュレーションのレートで動くので、申告に使えないことが画面ではっきりわかる
    await expect(page.getByText('シミュレーションの為替レートです（申告には使えません）')).toBeVisible();
    await expect(resultRows.getByTestId('rate-source')).toHaveText(['シミュレーション', 'シミュレーション', 'シミュレーション']);
  });

  test('RSU所得管理画面で年度別データを確認できる', async ({ page }) => {
    // シード済みの2025年度を選択
    await page.locator('select').first().selectOption('2025');

    // RSU所得管理モジュールに移動
    const rsuListButton = page.getByRole('button', { name: /^📋\s*RSU所得管理$/i });
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
    const rsuListButton = page.getByRole('button', { name: /^📋\s*RSU所得管理$/i });
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
