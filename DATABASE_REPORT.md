# 📊 MongoDB データベース状態レポート

**更新日**: 2026年2月27日  
**データベース名**: tax-filing-app  
**接続URI**: mongodb://127.0.0.1:27017/tax-filing-app

---

## 📋 コレクション一覧と件数

| コレクション名 | ドキュメント数 | 用途 |
|--------------|-------------|------|
| **capitalgainrecords** | 7件 | 譲渡所得（物件売却）記録 |
| **realestateincomes** | 1件 | 不動産所得記録（新モデル） |
| **salaryincomerecords** | 0件 | 給与所得記録 |
| **properties** | 3件 | 物件マスターデータ |
| **rsuincomerecords** | 1件 | RSU所得記録（新モデル） |
| **rsu_income_records** | 3件 | RSU所得記録（旧モデル） |
| **real_estate_income_records** | 9件 | 不動産所得記録（旧モデル） |

**総件数**: 24ドキュメント

---

## 🗂️ コレクション詳細

### 1. Properties（物件マスターデータ）- 3件

**スキーマ**: `Property.ts`  
**用途**: 不動産物件の基本情報を管理

#### 保存データ例
```json
{
  "_id": "6999a5d560f9306b95ee69ff",
  "propertyId": "PROP-001",
  "propertyName": "渋谷アパート",
  "address": "東京都渋谷区",
  "landValue": 20000000,
  "buildingValue": 30000000,
  "totalValue": 50000000,
  "acquisitionDate": "2015-06-15",
  "acquisitionCost": 45000000,
  "category": "residential",
  "acquisitionTax": 500000,
  "registrationTax": 200000,
  "brokerFee": 1500000,
  "outstandingLoan": 0,
  "annualInterest": 0,
  "buildingStructure": "rc",
  "constructionDate": "2015-05-01",
  "depreciationMethod": "straight-line",
  "isNewProperty": true,
  "saleStatus": "active",
  "renovationExpenses": [],
  "createdAt": "2026-02-21T12:32:21.154Z",
  "updatedAt": "2026-02-21T12:32:21.154Z"
}
```

#### フィールド詳細
- **物件基本情報**: propertyId, propertyName, address, category
- **資産価値**: landValue, buildingValue, totalValue
- **取得情報**: acquisitionDate, acquisitionCost
- **取得関連費用**: acquisitionTax, registrationTax, brokerFee
- **ローン情報**: outstandingLoan, annualInterest
- **減価償却情報**: buildingStructure, constructionDate, depreciationMethod, usefulLife
- **売却情報**: saleDate, salePrice, saleStatus
- **複数年対応**: insurancePaidAmount, loanGuaranteePaidAmount, renovationExpenses

---

### 2. RSUIncomeRecords（RSU所得記録）- 1件

**スキーマ**: `RSUIncomeRecord.ts`  
**用途**: RSU（制限付株式）の権利確定による所得を年度別に管理

#### 保存データ例
```json
{
  "_id": "69971375f24949ca5f706ba5",
  "userId": "demo-user",
  "year": 2025,
  "input": [
    {
      "companyName": "Default Company",
      "grantDate": "2025-02-13",
      "vestingDate": "2025-02-13",
      "shares": 26,
      "pricePerShareUSD": 316
    },
    {
      "companyName": "Default Company",
      "grantDate": "2025-02-18",
      "vestingDate": "2025-02-18",
      "shares": 4,
      "pricePerShareUSD": 315.44
    }
    // ... 他5件の権利確定記録
  ],
  "result": [
    {
      "companyName": "Default Company",
      "vestingDate": "2025-02-13",
      "shares": 26,
      "pricePerShareUSD": 316,
      "ttmRate": 143.746,
      "totalValueJPY": 1181017.14,
      "taxableIncome": 1181017.14
    }
    // ... 他6件の計算結果
  ],
  "totalRSUIncome": 3846683.33,
  "createdAt": "2026-02-19T13:43:17.405Z",
  "updatedAt": "2026-02-19T13:51:08.137Z"
}
```

#### フィールド詳細
- **ユーザー情報**: userId
- **年度**: year
- **入力データ（配列）**: companyName, grantDate, vestingDate, shares, pricePerShareUSD
- **計算結果（配列）**: ttmRate（TTM為替レート）, totalValueJPY, taxableIncome
- **年間合計**: totalRSUIncome

#### 特徴
- **複数回の権利確定対応**: 配列で7件の権利確定を管理
- **TTM為替レート**: 各権利確定日の為替レートを自動取得・保存
- **年間合計**: totalRSUIncome = ¥3,846,683

---

### 3. CapitalGainRecords（譲渡所得記録）- 7件

**スキーマ**: `CapitalGainRecord.ts`  
**用途**: 不動産売却による譲渡所得を記録

#### 保存データ例
```json
{
  "_id": "69971ee661fead75c12542b6",
  "userId": "demo-user",
  "propertyId": "PROP-001",
  "input": {
    "propertyId": "PROP-001",
    "saleDate": "2026-01-15",
    "salePrice": 55000000,
    "acquisitionCost": 51600000,
    "improvementCost": 0,
    "sellingExpenses": 2200000,
    "ownershipPeriod": 38
  },
  "result": {
    "salePrice": 55000000,
    "totalCost": 53800000,
    "capitalGain": 1200000,
    "taxRate": 0.20315,
    "estimatedTax": 243780,
    "taxType": "long-term"
  },
  "createdAt": "2026-02-19T14:32:06.688Z",
  "updatedAt": "2026-02-19T14:32:06.688Z"
}
```

#### フィールド詳細
- **入力データ**: saleDate, salePrice, acquisitionCost, improvementCost, sellingExpenses, ownershipPeriod
- **計算結果**: capitalGain（譲渡所得）, taxRate（税率）, estimatedTax（推定税額）, taxType（長期/短期区分）

#### 計算例
- 売却価格: ¥55,000,000
- 総費用: ¥53,800,000
- **譲渡所得**: ¥1,200,000
- 税率: 20.315%（長期譲渡）
- **推定税額**: ¥243,780

---

### 4. RealEstateIncomes（不動産所得記録）- 1件

**スキーマ**: `RealEstateIncome.ts`  
**用途**: 不動産賃貸による所得を年度・物件別に管理

#### 保存データ例
```json
{
  "_id": "69980a8d591cd8f6491059e8",
  "userId": "demo-user",
  "fiscalYear": 2026,
  "propertyId": "prop-001",
  "propertyName": "テスト物件A",
  "monthlyRent": 100000,
  "months": 12,
  "otherIncome": 50000,
  "totalIncome": 1250000,
  "managementFee": 50000,
  "repairCost": 30000,
  "propertyTax": 80000,
  "loanInterest": 200000,
  "insurance": 30000,
  "utilities": 30000,
  "otherExpenses": 20000,
  "depreciationExpense": 100000,
  "totalExpenses": 540000,
  "realEstateIncome": 710000,
  "createdAt": "2026-02-20T07:17:33.342Z",
  "updatedAt": "2026-02-20T07:17:33.342Z"
}
```

#### フィールド詳細
- **収入**: monthlyRent, months, otherIncome, totalIncome
- **経費**: managementFee, repairCost, propertyTax, loanInterest, insurance, utilities, otherExpenses, depreciationExpense, totalExpenses
- **所得**: realEstateIncome = totalIncome - totalExpenses

#### 計算例
- 総収入: ¥1,250,000（月額10万円 × 12ヶ月 + その他5万円）
- 総経費: ¥540,000
- **不動産所得**: ¥710,000

---

### 5. SalaryIncomeRecords（給与所得記録）- 0件

**スキーマ**: `SalaryIncomeRecord.ts`  
**用途**: 給与所得の計算結果を年度別に保存

#### スキーマ構造
```typescript
{
  userId: string;
  year: number;
  input: {
    annualSalary: number;
    withheldTax: number;
    socialInsurance: number;
    lifeInsurance?: number;
    dependents?: number;
    spouseDeduction?: boolean;
  };
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
}
```

**現在のデータ**: 0件（テストデータ未投入）

---

### 6. 旧モデルコレクション

#### rsu_income_records（旧RSU記録）- 3件
- 過去のRSU所得記録（2023年分）
- 新モデル（rsuincomerecords）への移行推奨

#### real_estate_income_records（旧不動産所得記録）- 9件
- 過去の不動産所得記録
- 新モデル（realestateincomes）への移行推奨

---

## 🔄 データフロー

### 1. 物件登録フロー
```
ユーザー入力
  ↓
Frontend (PropertyManagementPanel.tsx)
  ↓
POST /api/properties
  ↓
propertyController.ts
  ↓
propertyService.ts (createProperty)
  ↓
MongoDB: properties コレクション
```

### 2. RSU所得計算フロー
```
ユーザー入力（複数行）
  ↓
Frontend (RSUIncomeListModule.tsx)
  ↓
POST /api/rsu-income/calculate
  ↓
rsuIncomeController.ts
  ↓
rsuExchangeService.ts (batchCalculateRSU)
  ├─ TTM為替レート取得
  ├─ 課税所得計算
  └─ 年間合計計算
  ↓
MongoDB: rsuincomerecords コレクション
```

### 3. 不動産所得計算フロー
```
ユーザー入力
  ↓
Frontend (RealEstateIncomeModule.tsx)
  ↓
POST /api/real-estate-income/calculate
  ↓
realEstateIncomeController.ts
  ↓
realEstateIncomeService.ts
  ├─ 収入計算
  ├─ 経費計算
  └─ 所得計算
  ↓
MongoDB: realestateincomes コレクション
```

### 4. 譲渡所得計算フロー
```
ユーザー入力
  ↓
Frontend (CapitalGainModule.tsx)
  ↓
POST /api/capital-gain/calculate
  ↓
capitalGainController.ts
  ↓
capitalGainService.ts
  ├─ 譲渡所得計算
  ├─ 税率判定（長期/短期）
  └─ 税額計算
  ↓
MongoDB: capitalgainrecords コレクション
```

---

## 📊 データ統計

### 現在の保存データ
- **総ドキュメント数**: 24件
- **アクティブ物件数**: 3件
- **2025年度のRSU所得**: ¥3,846,683（7回の権利確定）
- **譲渡所得記録**: 7件
- **不動産所得記録**: 10件（新旧合計）

### データ品質
- ✅ **MongoDB接続**: 正常
- ✅ **データ整合性**: 正常
- ✅ **インデックス**: 設定済み（userId + year）
- ✅ **タイムスタンプ**: すべてのドキュメントに存在
- ⚠️ **旧モデルデータ**: 移行推奨（12件）

---

## 🔍 データ取得確認

### API経由でのデータ取得
```bash
# 物件一覧取得
curl http://localhost:5000/api/properties
# → 3件の物件データが正常に取得される

# RSU所得記録取得
curl http://localhost:5000/api/rsu-income/list?year=2025
# → 2025年度の1件が正常に取得される

# 譲渡所得記録取得
curl http://localhost:5000/api/capital-gain/records
# → 7件の譲渡所得記録が正常に取得される

# 不動産所得記録取得
curl http://localhost:5000/api/real-estate-income/records?year=2026
# → 2026年度の1件が正常に取得される
```

**結果**: ✅ すべてのAPIエンドポイントでデータが正常に取得できることを確認

---

## 📝 推奨事項

### 1. データ移行
**優先度**: 🟡 中  
**内容**: 旧モデルデータ（12件）を新モデルに移行
- `rsu_income_records` → `rsuincomerecords`
- `real_estate_income_records` → `realestateincomes`

### 2. 給与所得テストデータ作成
**優先度**: 🟢 低  
**内容**: `salaryincomerecords` にサンプルデータを投入してテスト

### 3. インデックス最適化
**優先度**: 🟢 低  
**内容**: クエリパフォーマンス向上のため追加インデックス検討
- `properties.saleStatus`
- `capitalgainrecords.year`
- `realestateincomes.fiscalYear`

### 4. データバックアップ
**優先度**: 🔴 高  
**内容**: 本番環境移行前に完全バックアップ取得
```bash
mongodump --db tax-filing-app --out ./backup/$(date +%Y%m%d)
```

---

## ✅ まとめ

### データベースの状態
- ✅ **正常稼働**: MongoDB接続は安定
- ✅ **データ整合性**: すべてのコレクションが正常
- ✅ **API連携**: Frontend-Backend-DBのデータフローが正常動作
- ✅ **実データ**: 24件のドキュメントが正しく保存・取得可能

### 収めるべきデータ
1. **物件マスターデータ** (properties)
2. **給与所得記録** (salaryincomerecords) - 年度別
3. **RSU所得記録** (rsuincomerecords) - 年度別・複数権利確定対応
4. **不動産所得記録** (realestateincomes) - 年度・物件別
5. **譲渡所得記録** (capitalgainrecords) - 売却ごと
6. **ユーザー情報** (users) - 認証・税務ID管理

### 次のアクション
1. ✅ データフロー確認完了
2. 📝 旧データ移行計画の策定
3. 🔒 本番環境用のバックアップ戦略確立

---

**最終更新**: 2026年2月27日  
**データベース接続**: ✅ 正常  
**総ドキュメント数**: 24件
