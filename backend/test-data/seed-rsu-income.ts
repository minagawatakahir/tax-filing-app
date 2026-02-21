/**
 * RSU所得テストデータ投入スクリプト
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tax-filing-app';

/**
 * RSU所得レコードのインターフェース
 */
interface RSUIncomeRecord {
  year: number;
  result: Array<{
    companyName: string;
    vestingDate: Date;
    shares: number;
    pricePerShareUSD: number;
    ttmRate: number;
    incomeJPY: number;
    withholdingTaxUSD: number;
    netIncomeUSD: number;
  }>;
  totalIncomeJPY: number;
  totalWithholdingTaxJPY: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * テスト用RSU所得データ
 */
const testRSUIncomeData: RSUIncomeRecord[] = [
  {
    year: 2023,
    result: [
      {
        companyName: 'Tech Company A',
        vestingDate: new Date('2023-03-15'),
        shares: 100,
        pricePerShareUSD: 150.00,
        ttmRate: 135.50,
        incomeJPY: 2032500, // 100 * 150 * 135.50
        withholdingTaxUSD: 3750, // 15000 * 0.25
        netIncomeUSD: 11250,
      },
      {
        companyName: 'Tech Company A',
        vestingDate: new Date('2023-09-15'),
        shares: 100,
        pricePerShareUSD: 165.00,
        ttmRate: 138.20,
        incomeJPY: 2280300, // 100 * 165 * 138.20
        withholdingTaxUSD: 4125,
        netIncomeUSD: 12375,
      },
    ],
    totalIncomeJPY: 4312800,
    totalWithholdingTaxJPY: 1078200,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    year: 2024,
    result: [
      {
        companyName: 'Tech Company A',
        vestingDate: new Date('2024-03-15'),
        shares: 120,
        pricePerShareUSD: 180.00,
        ttmRate: 142.50,
        incomeJPY: 3078000, // 120 * 180 * 142.50
        withholdingTaxUSD: 5400,
        netIncomeUSD: 16200,
      },
      {
        companyName: 'Tech Company A',
        vestingDate: new Date('2024-09-15'),
        shares: 120,
        pricePerShareUSD: 195.00,
        ttmRate: 145.80,
        incomeJPY: 3411360,
        withholdingTaxUSD: 5850,
        netIncomeUSD: 17550,
      },
      {
        companyName: 'Tech Company B',
        vestingDate: new Date('2024-06-30'),
        shares: 50,
        pricePerShareUSD: 220.00,
        ttmRate: 144.00,
        incomeJPY: 1584000, // 50 * 220 * 144.00
        withholdingTaxUSD: 2750,
        netIncomeUSD: 8250,
      },
    ],
    totalIncomeJPY: 8073360,
    totalWithholdingTaxJPY: 2018340,
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    year: 2025,
    result: [
      {
        companyName: 'Tech Company A',
        vestingDate: new Date('2025-03-15'),
        shares: 150,
        pricePerShareUSD: 210.00,
        ttmRate: 150.00,
        incomeJPY: 4725000, // 150 * 210 * 150.00
        withholdingTaxUSD: 7875,
        netIncomeUSD: 23625,
      },
      {
        companyName: 'Tech Company A',
        vestingDate: new Date('2025-09-15'),
        shares: 150,
        pricePerShareUSD: 225.00,
        ttmRate: 152.50,
        incomeJPY: 5146875,
        withholdingTaxUSD: 8438,
        netIncomeUSD: 25313,
      },
      {
        companyName: 'Tech Company B',
        vestingDate: new Date('2025-06-30'),
        shares: 75,
        pricePerShareUSD: 240.00,
        ttmRate: 151.00,
        incomeJPY: 2718000,
        withholdingTaxUSD: 4500,
        netIncomeUSD: 13500,
      },
    ],
    totalIncomeJPY: 12589875,
    totalWithholdingTaxJPY: 3147469,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
];

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB接続成功');
  } catch (error) {
    console.error('❌ MongoDB接続エラー:', error);
    process.exit(1);
  }
}

async function seedRSUIncomeData() {
  try {
    const db = mongoose.connection;
    const collection = db.collection('rsu_income_records');
    
    // 既存データ削除
    await collection.deleteMany({});
    console.log('🗑️  既存のRSU所得データをクリアしました');
    
    // テストデータ投入
    const result = await collection.insertMany(testRSUIncomeData);
    console.log(`✅ テストRSU所得データを ${result.insertedCount} 件投入しました\n`);
    
    // サマリー表示
    console.log('📊 投入データサマリー:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testRSUIncomeData.forEach((record, i) => {
      console.log(`\n${i + 1}. 年度 ${record.year}`);
      console.log(`   権利確定回数: ${record.result.length} 回`);
      record.result.forEach((vesting, j) => {
        console.log(`\n   [${j + 1}] ${vesting.companyName}`);
        console.log(`       権利確定日: ${vesting.vestingDate.toLocaleDateString('ja-JP')}`);
        console.log(`       株数: ${vesting.shares} 株`);
        console.log(`       株価: $${vesting.pricePerShareUSD.toFixed(2)}`);
        console.log(`       TTMレート: ¥${vesting.ttmRate.toFixed(2)}`);
        console.log(`       所得額(JPY): ¥${vesting.incomeJPY.toLocaleString()}`);
        console.log(`       源泉徴収税(USD): $${vesting.withholdingTaxUSD.toFixed(2)}`);
      });
      console.log(`\n   --- 年間合計 ---`);
      console.log(`   総所得(JPY): ¥${record.totalIncomeJPY.toLocaleString()}`);
      console.log(`   総源泉徴収税(JPY): ¥${record.totalWithholdingTaxJPY.toLocaleString()}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ RSU所得テストデータの投入が完了しました！');
    
  } catch (error) {
    console.error('❌ テストデータ投入エラー:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 RSU所得テストデータ投入スクリプト開始\n');
  
  try {
    await connectDB();
    await seedRSUIncomeData();
    console.log('\n🎉 全処理が正常に完了しました！');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB接続を切断しました');
  }
}

main();
