import { defineConfig, devices } from '@playwright/test';
import { E2E_MONGODB_URI } from './e2e-env';

/**
 * E2E テストは実データから分離した専用DB（E2E_MONGODB_URI）で実行する。
 * バックエンドは毎回 E2E 用DBに接続して起動するため、開発用のバックエンドが
 * ポート5000で動いている場合は起動に失敗して止まる（実データへの書き込みを防ぐ）。
 */

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./global-setup'),
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        MONGODB_URI: E2E_MONGODB_URI,
        PORT: '5000',
        USE_SIMULATED_TTM: 'true',
      },
    },
    {
      // フロントエンドはデータを持たないため、起動済みのものを再利用してよい
      command: 'npx react-scripts start',
      cwd: '../frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 180 * 1000,
      env: { BROWSER: 'none', PORT: '3000' },
    },
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // webServer配置はローカルでは無効 - 別途サーバーを起動してテスト実行
  // webServer: {
  //   command: 'npm start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
