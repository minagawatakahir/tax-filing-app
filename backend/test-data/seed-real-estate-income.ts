/**
 * 不動産所得テストデータ投入スクリプト
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tax-filing-app';

/**
 * 不動産所得レコードのインターフェース
 */
interface RealEstateIncomeRecord {
  fiscalYear: number;
  propertyId: string;
  propertyName: string;
  monthlyRent: number;
  contractMonths: number;
  otherIncome: number;
  totalIncome: number;
  managementFee: number;
  repairCost: number;
  propertyTax: number;
  loanInterest: number;
  insurance: number;
  utilities: number;
  otherExpenses: number;
  depreciation: number;
  totalExpenses: number;
  netIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * テスト用不動産所得データ
 */
const testRealEstateIncomeData: RealEstateIncomeRecord[] = [
  // 2023年度
  {
    fiscalYear: 2023,
    propertyId: 'prop-test-001',
    propertyName: '東京マンション A号室',
    monthlyRent: 150000,
    contractMonths: 12,
    otherIncome: 50000, // 更新料など
    totalIncome: 1850000,
    managementFee: 180000,
    repairCost: 80000,
    propertyTax: 120000,
    loanInterest: 250000,
    insurance: 35000,
    utilities: 40000,
    otherExpenses: 25000,
    depreciation: 120000,
    totalExpenses: 850000,
    netIncome: 1000000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    fiscalYear: 2023,
    propertyId: 'prop-test-002',
    propertyName: '横浜戸建て B',
    monthlyRent: 200000,
    contractMonths: 12,
    otherIncome: 0,
    totalIncome: 2400000,
    managementFee: 0,
    repairCost: 150000,
    propertyTax: 180000,
    loanInterest: 350000,
    insurance: 45000,
    utilities: 60000,
    otherExpenses: 35000,
    depreciation: 180000,
    totalExpenses: 1000000,
    netIncome: 1400000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    fiscalYear: 2023,
    propertyId: 'prop-test-003',
    propertyName: '大阪アパート C棟',
    monthlyRent: 120000,
    contractMonths: 12,
    otherIncome: 30000,
    totalIncome: 1470000,
    managementFee: 144000,
    repairCost: 60000,
    propertyTax: 100000,
    loanInterest: 200000,
    insurance: 28000,
    utilities: 32000,
    otherExpenses: 20000,
    depreciation: 100000,
    totalExpenses: 684000,
    netIncome: 786000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  
  // 2024年度
  {
    fiscalYear: 2024,
    propertyId: 'prop-test-001',
    propertyName: '東京マンション A号室',
    monthlyRent: 150000,
    contractMonths: 12,
    otherIncome: 0,
    totalIncome: 1800000,
    managementFee: 180000,
    repairCost: 120000,
    propertyTax: 120000,
    loanInterest: 240000,
    insurance: 35000,
    utilities: 40000,
    otherExpenses: 25000,
    depreciation: 120000,
    totalExpenses: 880000,
    netIncome: 920000,
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    fiscalYear: 2024,
    propertyId: 'prop-test-002',
    propertyName: '横浜戸建て B',
    monthlyRent: 200000,
    contractMonths: 12,
    otherIncome: 100000,
    totalIncome: 2500000,
    managementFee: 0,
    repairCost: 200000,
    propertyTax: 180000,
    loanInterest: 330000,
    insurance: 45000,
    utilities: 60000,
    otherExpenses: 40000,
    depreciation: 180000,
    totalExpenses: 1035000,
    netIncome: 1465000,
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    fiscalYear: 2024,
    propertyId: 'prop-test-003',
    propertyName: '大阪アパート C棟',
    monthlyRent: 120000,
    contractMonths: 12,
    otherIncome: 0,
    totalIncome: 1440000,
    managementFee: 144000,
    repairCost: 80000,
    propertyTax: 100000,
    loanInterest: 190000,
    insurance: 28000,
    utilities: 32000,
    otherExpenses: 20000,
    depreciation: 100000,
    totalExpenses: 694000,
    netIncome: 746000,
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
  
  // 2025年度
  {
    fiscalYear: 2025,
    propertyId: 'prop-test-001',
    propertyName: '東京マンション A号室',
    monthlyRent: 150000,
    contractMonths: 12,
    otherIncome: 50000,
    totalIncome: 1850000,
    managementFee: 180000,
    repairCost: 100000,
    propertyTax: 120000,
    loanInterest: 230000,
    insurance: 35000,
    utilities: 40000,
    otherExpenses: 25000,
    depreciation: 120000,
    totalExpenses: 850000,
    netIncome: 1000000,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    fiscalYear: 2025,
    propertyId: 'prop-test-002',
    propertyName: '横浜戸建て B',
    monthlyRent: 200000,
    contractMonths: 12,
    otherIncome: 0,
    totalIncome: 2400000,
    managementFee: 0,
    repairCost: 180000,
    propertyTax: 180000,
    loanInterest: 320000,
    insurance: 45000,
    utilities: 60000,
    otherExpenses: 35000,
    depreciation: 180000,
    totalExpenses: 1000000,
    netIncome: 1400000,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    fiscalYear: 2025,
    propertyId: 'prop-test-003',
    propertyName: '大阪アパート C棟',
    monthlyRent: 120000,
    contractMonths: 12,
    otherIncome: 30000,
    totalIncome: 1470000,
    managementFee: 144000,
    repairCost: 70000,
    propertyTax: 100000,
    loanInterest: 180000,
    insurance: 28000,
    utilities: 32000,
    otherExpenses: 20000,
    depreciation: 100000,
    totalExpenses: 674000,
    netIncome: 796000,
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

async function seedRealEstateIncomeData() {
  try {
    const db = mongoose.connection;
    const collection = db.collection('real_estate_income_records');
    
    // 既存データ削除
    await collection.deleteMany({});
    console.log('🗑️  既存の不動産所得データをクリアしました');
    
    // テストデータ投入
    const result = await collection.insertMany(testRealEstateIncomeData);
    console.log(`✅ テスト不動産所得データを ${result.insertedCount} 件投入しました\n`);
    
    // サマリー表示
    console.log('📊 投入データサマリー:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    [2023, 2024, 2025].forEach(year => {
      const yearRecords = testRealEstateIncomeData.filter(r => r.fiscalYear === year);
      console.log(`\n【${year}年度】`);
      yearRecords.forEach((record, i) => {
        console.log(`\n  ${i + 1}. ${record.propertyName}`);
        console.log(`     月額家賃: ¥${record.monthlyRent.toLocaleString()}`);
        console.log(`     契約月数: ${record.contractMonths}ヶ月`);
        console.log(`     総収入: ¥${record.totalIncome.toLocaleString()}`);
        console.log(`     総経費: ¥${record.totalExpenses.toLocaleString()}`);
        console.log(`     不動産所得: ¥${record.netIncome.toLocaleString()}`);
      });
      
      const totalIncome = yearRecords.reduce((sum, r) => sum + r.totalIncome, 0);
      const totalExpenses = yearRecords.reduce((sum, r) => sum + r.totalExpenses, 0);
      const totalNetIncome = yearRecords.reduce((sum, r) => sum + r.netIncome, 0);
      
      console.log(`\n  --- 年度合計 ---`);
      console.log(`  総収入: ¥${totalIncome.toLocaleString()}`);
      console.log(`  総経費: ¥${totalExpenses.toLocaleString()}`);
      console.log(`  純利益: ¥${totalNetIncome.toLocaleString()}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ 不動産所得テストデータの投入が完了しました！');
    
  } catch (error) {
    console.error('❌ テストデータ投入エラー:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 不動産所得テストデータ投入スクリプト開始\n');
  
  try {
    await connectDB();
    await seedRealEstateIncomeData();
    console.log('\n🎉 全処理が正常に完了しました!');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB接続を切断しました');
  }
}

main();
