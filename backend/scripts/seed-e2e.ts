/**
 * E2E テスト用データベースの初期化とシード
 *
 * E2E テストは実データ（開発用DB）から分離した専用DBで実行する。
 * 安全のため、接続先のデータベース名が "-e2e" で終わらない場合は何もせずに終了する。
 *
 * 使い方: MONGODB_URI=mongodb://127.0.0.1:27017/tax-filing-app-e2e npm run db:seed-e2e
 *
 * 投入するデータ（すべて架空の値）:
 *   - テスト用物件 e2e-property-001（賃貸中）
 *   - 2025年度の RSU 所得レコード（権利確定3回分）
 */
import mongoose from 'mongoose';
import Property from '../src/models/Property';
import { RSUIncomeRecord } from '../src/models/RSUIncomeRecord';

export const E2E_PROPERTY_ID = 'e2e-property-001';

const MONGODB_URI = process.env.MONGODB_URI || '';

const databaseName = (uri: string): string => {
  const withoutQuery = uri.split('?')[0];
  return withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1);
};

async function main() {
  const dbName = databaseName(MONGODB_URI);
  if (!dbName.endsWith('-e2e')) {
    throw new Error(
      `E2E用のDB（名前が "-e2e" で終わるもの）以外には実行できません: "${dbName || '(未指定)'}"。` +
        'MONGODB_URI を指定してください。'
    );
  }

  mongoose.set('autoIndex', false);
  await mongoose.connect(MONGODB_URI);
  await mongoose.connection.dropDatabase();

  // インデックス（給与所得の年度ごとの一意制約など）を作成
  for (const model of Object.values(mongoose.models)) {
    await model.createIndexes();
  }

  await Property.create({
    propertyId: E2E_PROPERTY_ID,
    propertyName: 'E2Eテスト物件',
    address: '東京都テスト区テスト町1-1',
    landValue: 10000000,
    buildingValue: 20000000,
    totalValue: 30000000,
    acquisitionDate: new Date('2020-04-01'),
    acquisitionCost: 30000000,
    category: 'residential',
    usefulLife: 47,
    depreciationMethod: 'straight-line',
    saleStatus: 'active',
  });

  const grants = [
    { vestingDate: new Date('2025-03-15'), shares: 10, pricePerShareUSD: 200, ttmRate: 150 },
    { vestingDate: new Date('2025-06-15'), shares: 10, pricePerShareUSD: 210, ttmRate: 145 },
    { vestingDate: new Date('2025-09-15'), shares: 10, pricePerShareUSD: 220, ttmRate: 148 },
  ];
  const result = grants.map((g) => {
    const totalValueJPY = g.shares * g.pricePerShareUSD * g.ttmRate;
    return { companyName: 'E2E Test Corp', ...g, totalValueJPY, taxableIncome: totalValueJPY };
  });
  await RSUIncomeRecord.create({
    userId: 'demo-user',
    year: 2025,
    input: grants.map((g) => ({ companyName: 'E2E Test Corp', grantDate: new Date('2024-01-01'), ...g })),
    result,
    totalRSUIncome: result.reduce((sum, r) => sum + r.taxableIncome, 0),
  });

  console.log(`✅ E2E用DB "${dbName}" を初期化しました（物件1件、RSU 2025年度1件）`);
}

main()
  .catch((error) => {
    console.error('❌', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
