/**
 * 給与所得テストデータ投入スクリプト
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tax-filing-app';

// SalaryIncomeRecord スキーマを定義（モデルがなければ直接スキーマで操作）
interface SalaryIncomeRecord {
  year: number;
  result: {
    annualSalary: number;
    salaryIncomeDeduction: number;
    salaryIncome: number;
    socialInsurance: number;
    lifeInsurance: number;
    basicDeduction: number;
    dependentDeduction: number;
    spouseDeduction: number;
    totalDeduction: number;
    taxableIncome: number;
    estimatedTax: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * テスト用給与所得データ
 */
const testSalaryIncomeData: SalaryIncomeRecord[] = [
  {
    year: 2023,
    result: {
      annualSalary: 6000000,
      salaryIncomeDeduction: 1100000,
      salaryIncome: 4900000,
      socialInsurance: 800000,
      lifeInsurance: 100000,
      basicDeduction: 480000,
      dependentDeduction: 380000,
      spouseDeduction: 380000,
      totalDeduction: 2140000,
      taxableIncome: 2760000,
      estimatedTax: 276000,
    },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    year: 2024,
    result: {
      annualSalary: 7200000,
      salaryIncomeDeduction: 1200000,
      salaryIncome: 6000000,
      socialInsurance: 900000,
      lifeInsurance: 120000,
      basicDeduction: 480000,
      dependentDeduction: 380000,
      spouseDeduction: 380000,
      totalDeduction: 2260000,
      taxableIncome: 3740000,
      estimatedTax: 374000,
    },
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-02-15'),
  },
  {
    year: 2025,
    result: {
      annualSalary: 7800000,
      salaryIncomeDeduction: 1300000,
      salaryIncome: 6500000,
      socialInsurance: 950000,
      lifeInsurance: 150000,
      basicDeduction: 480000,
      dependentDeduction: 760000, // 2人扶養
      spouseDeduction: 380000,
      totalDeduction: 2720000,
      taxableIncome: 3780000,
      estimatedTax: 378000,
    },
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-15'),
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

async function seedSalaryIncomeData() {
  try {
    const db = mongoose.connection;
    const collection = db.collection('salary_income_records');
    
    // 既存データ削除
    await collection.deleteMany({});
    console.log('🗑️  既存の給与所得データをクリアしました');
    
    // テストデータ投入
    const result = await collection.insertMany(testSalaryIncomeData);
    console.log(`✅ テスト給与所得データを ${result.insertedIds.length} 件投入しました\n`);
    
    // サマリー表示
    console.log('📊 投入データサマリー:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testSalaryIncomeData.forEach((record, i) => {
      console.log(`\n${i + 1}. 年度 ${record.year}`);
      console.log(`   給与収入: ¥${record.result.annualSalary.toLocaleString()}`);
      console.log(`   給与所得控除: ¥${record.result.salaryIncomeDeduction.toLocaleString()}`);
      console.log(`   給与所得: ¥${record.result.salaryIncome.toLocaleString()}`);
      console.log(`   --- 控除額 ---`);
      console.log(`   社会保険料: ¥${record.result.socialInsurance.toLocaleString()}`);
      console.log(`   生命保険料: ¥${record.result.lifeInsurance.toLocaleString()}`);
      console.log(`   基礎控除: ¥${record.result.basicDeduction.toLocaleString()}`);\n      console.log(`   扶養控除: ¥${record.result.dependentDeduction.toLocaleString()}`);\n      console.log(`   配偶者控除: ¥${record.result.spouseDeduction.toLocaleString()}`);\n      console.log(`   控除額合計: ¥${record.result.totalDeduction.toLocaleString()}`);\n      console.log(`   --- 課税所得 ---`);\n      console.log(`   課税所得: ¥${record.result.taxableIncome.toLocaleString()}`);\n      console.log(`   推定税額: ¥${record.result.estimatedTax.toLocaleString()}`);\n    });\n    \n    console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');\n    console.log('\\n✅ 給与所得テストデータの投入が完了しました！');\n    \n  } catch (error) {\n    console.error('❌ テストデータ投入エラー:', error);\n    throw error;\n  }\n}\n\nasync function main() {\n  console.log('🚀 給与所得テストデータ投入スクリプト開始\\n');\n  \n  try {\n    await connectDB();\n    await seedSalaryIncomeData();\n    console.log('\\n🎉 全処理が正常に完了しました！');\n  } catch (error) {\n    console.error('\\n❌ エラーが発生しました:', error);\n    process.exit(1);\n  } finally {\n    await mongoose.disconnect();\n    console.log('\\n📡 MongoDB接続を切断しました');\n  }\n}\n\nmain();
