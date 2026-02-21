/**
 * テストデータ投入スクリプト
 * 
 * 使用方法:
 * npm run seed-test-data
 * 
 * または:
 * ts-node backend/test-data/seed-test-data.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../src/models/Property';

// 環境変数読み込み
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tax-filing-app';

/**
 * テスト用物件データ
 */
const testProperties = [
  // アクティブな物件（賃貸中）
  {
    propertyId: 'prop-test-001',
    propertyName: '東京マンション A号室',
    address: '東京都渋谷区恵比寿1-1-1',
    propertyType: 'マンション',
    acquisitionDate: new Date('2018-04-01'),
    acquisitionCost: 30000000,
    acquisitionTax: 900000,
    registrationTax: 450000,
    brokerFee: 600000,
    otherAcquisitionCosts: 200000,
    monthlyRent: 150000,
    managementFee: 15000,
    annualPropertyTax: 120000,
    buildingArea: 65.5,
    landArea: 0,
    buildingStructure: 'RC造',
    buildingAge: 15,
    usefulLife: 47,
    depreciationMethod: '定額法',
    saleStatus: 'active',
  },
  {
    propertyId: 'prop-test-002',
    propertyName: '横浜戸建て B',
    address: '神奈川県横浜市西区みなとみらい2-2-2',
    propertyType: '戸建て',
    acquisitionDate: new Date('2020-06-15'),
    acquisitionCost: 45000000,
    acquisitionTax: 1350000,
    registrationTax: 675000,
    brokerFee: 900000,
    otherAcquisitionCosts: 300000,
    monthlyRent: 200000,
    managementFee: 0,
    annualPropertyTax: 180000,
    buildingArea: 95.0,
    landArea: 120.0,
    buildingStructure: '木造',
    buildingAge: 5,
    usefulLife: 22,
    depreciationMethod: '定額法',
    saleStatus: 'active',
  },
  {
    propertyId: 'prop-test-003',
    propertyName: '大阪アパート C棟',
    address: '大阪府大阪市中央区難波3-3-3',
    propertyType: 'アパート',
    acquisitionDate: new Date('2019-03-10'),
    acquisitionCost: 25000000,
    acquisitionTax: 750000,
    registrationTax: 375000,
    brokerFee: 500000,
    otherAcquisitionCosts: 150000,
    monthlyRent: 120000,
    managementFee: 12000,
    annualPropertyTax: 100000,
    buildingArea: 55.0,
    landArea: 0,
    buildingStructure: '軽量鉄骨造',
    buildingAge: 10,
    usefulLife: 27,
    depreciationMethod: '定額法',
    saleStatus: 'active',
  },
  // 売却済み物件
  {
    propertyId: 'prop-test-004',
    propertyName: '名古屋マンション D号室（売却済）',
    address: '愛知県名古屋市中村区名駅4-4-4',
    propertyType: 'マンション',
    acquisitionDate: new Date('2015-08-20'),
    acquisitionCost: 20000000,
    acquisitionTax: 600000,
    registrationTax: 300000,
    brokerFee: 400000,
    otherAcquisitionCosts: 100000,
    monthlyRent: 100000,
    managementFee: 10000,
    annualPropertyTax: 80000,
    buildingArea: 50.0,
    landArea: 0,
    buildingStructure: 'RC造',
    buildingAge: 20,
    usefulLife: 47,
    depreciationMethod: '定額法',
    saleStatus: 'sold',
    saleDate: new Date('2025-11-30'),
    salePrice: 28000000,
  },
  {
    propertyId: 'prop-test-005',
    propertyName: '福岡戸建て E（売却済）',
    address: '福岡県福岡市博多区博多駅前5-5-5',
    propertyType: '戸建て',
    acquisitionDate: new Date('2017-02-14'),
    acquisitionCost: 35000000,
    acquisitionTax: 1050000,
    registrationTax: 525000,
    brokerFee: 700000,
    otherAcquisitionCosts: 250000,
    monthlyRent: 180000,
    managementFee: 0,
    annualPropertyTax: 140000,
    buildingArea: 85.0,
    landArea: 100.0,
    buildingStructure: '木造',
    buildingAge: 12,
    usefulLife: 22,
    depreciationMethod: '定額法',
    saleStatus: 'sold',
    saleDate: new Date('2025-09-15'),
    salePrice: 42000000,
  },
];

/**
 * データベース接続
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB接続成功');
  } catch (error) {
    console.error('❌ MongoDB接続エラー:', error);
    process.exit(1);
  }
}

/**
 * 既存データのクリア
 */
async function clearExistingData() {
  try {
    await Property.deleteMany({});
    console.log('🗑️  既存の物件データをクリアしました');
  } catch (error) {
    console.error('❌ データクリアエラー:', error);
    throw error;
  }
}

/**
 * テストデータの投入
 */
async function seedTestData() {
  try {
    // 物件データ投入
    await Property.insertMany(testProperties);
    console.log(`✅ テスト物件データを ${testProperties.length} 件投入しました`);
    
    // 投入データのサマリー表示
    console.log('\n📊 投入データサマリー:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const activeProperties = testProperties.filter(p => p.saleStatus === 'active');
    const soldProperties = testProperties.filter(p => p.saleStatus === 'sold');
    
    console.log(`\n🏢 アクティブな物件: ${activeProperties.length} 件`);
    activeProperties.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.propertyName}`);
      console.log(`     - 取得日: ${p.acquisitionDate.toLocaleDateString('ja-JP')}`);
      console.log(`     - 取得価格: ¥${p.acquisitionCost.toLocaleString()}`);
      console.log(`     - 月額家賃: ¥${p.monthlyRent.toLocaleString()}`);
    });
    
    console.log(`\n💰 売却済み物件: ${soldProperties.length} 件`);
    soldProperties.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.propertyName}`);
      console.log(`     - 取得日: ${p.acquisitionDate.toLocaleDateString('ja-JP')}`);
      console.log(`     - 取得価格: ¥${p.acquisitionCost.toLocaleString()}`);
      console.log(`     - 売却日: ${p.saleDate?.toLocaleDateString('ja-JP')}`);
      console.log(`     - 売却価格: ¥${p.salePrice?.toLocaleString()}`);
      const gain = (p.salePrice || 0) - (p.acquisitionCost || 0);
      console.log(`     - 譲渡益: ¥${gain.toLocaleString()}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ テストデータの投入が完了しました！');
    
  } catch (error) {
    console.error('❌ テストデータ投入エラー:', error);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 テストデータ投入スクリプト開始\n');
  
  try {
    // DB接続
    await connectDB();
    
    // 既存データクリア
    await clearExistingData();
    
    // テストデータ投入
    await seedTestData();
    
    console.log('\n🎉 全処理が正常に完了しました！');
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    // DB切断
    await mongoose.disconnect();
    console.log('\n📡 MongoDB接続を切断しました');
  }
}

// スクリプト実行
main();
