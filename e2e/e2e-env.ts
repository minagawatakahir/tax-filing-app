/** E2E 専用のデータベース（名前は "-e2e" で終わること。シードスクリプトがこれを確認する） */
export const E2E_MONGODB_URI =
  process.env.E2E_MONGODB_URI || 'mongodb://127.0.0.1:27017/tax-filing-app-e2e';

/** シードで作成されるテスト用物件（backend/scripts/seed-e2e.ts と一致させる） */
export const E2E_PROPERTY_ID = 'e2e-property-001';
