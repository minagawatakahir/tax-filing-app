# クイックスタートガイド

## 📦 インストール

### 1. バックエンドのセットアップ
\`\`\`bash
cd ~/Dev/tax-filing-app/backend
npm install
\`\`\`

### 2. フロントエンドのセットアップ
\`\`\`bash
cd ~/Dev/tax-filing-app/frontend
npm install
\`\`\`

## 🚀 起動方法

### オプション1: 自動起動スクリプト
\`\`\`bash
cd ~/Dev/tax-filing-app
./start-dev.sh
\`\`\`

### オプション2: 個別起動

**ターミナル1 - バックエンド:**
\`\`\`bash
cd ~/Dev/tax-filing-app/backend
npm run dev
\`\`\`

**ターミナル2 - フロントエンド:**
\`\`\`bash
cd ~/Dev/tax-filing-app/frontend
npm start
\`\`\`

## 🧪 APIテスト例

### RSU為替計算
\`\`\`bash
curl -X POST http://localhost:5000/api/rsu/calculate \\
  -H "Content-Type: application/json" \\
  -d '{
    "vestingDate": "2024-03-15",
    "shares": 100,
    "pricePerShare": 180.50,
    "currency": "USD"
  }'
\`\`\`

### 不動産LTV計算
\`\`\`bash
curl -X POST http://localhost:5000/api/real-estate/ltv \\
  -H "Content-Type: application/json" \\
  -d '{
    "property": {
      "propertyId": "prop-001",
      "landValue": 50000000,
      "buildingValue": 30000000,
      "totalValue": 80000000,
      "acquisitionDate": "2020-01-15"
    },
    "loans": [{
      "loanId": "loan-001",
      "propertyId": "prop-001",
      "totalAmount": 40000000,
      "outstandingBalance": 35000000,
      "annualInterest": 700000,
      "purpose": "building"
    }]
  }'
\`\`\`

### 減価償却スケジュール
\`\`\`bash
curl -X POST http://localhost:5000/api/depreciation/schedule \\
  -H "Content-Type: application/json" \\
  -d '{
    "assetId": "asset-001",
    "assetName": "オフィスビル",
    "acquisitionDate": "2020-01-01",
    "acquisitionCost": 50000000,
    "category": "concrete_building",
    "usefulLife": 47,
    "depreciationMethod": "straight"
  }'
\`\`\`

### 特例シミュレーター
\`\`\`bash
curl -X POST http://localhost:5000/api/tax-exemption/simulate \\
  -H "Content-Type: application/json" \\
  -d '{
    "propertyId": "prop-001",
    "sellingPrice": 50000000,
    "acquisitionCost": 30000000,
    "acquisitionDate": "2015-01-01",
    "sellingDate": "2024-12-31",
    "ownershipYears": 9,
    "mortgageBalance": 15000000,
    "annualMortgagePayment": 1500000,
    "remainingMortgageYears": 10
  }'
\`\`\`

## 📚 ドキュメント

- [README.md](README.md) - プロジェクト概要
- [API_REFERENCE.md](API_REFERENCE.md) - API詳細リファレンス
- [docs/MODULES.md](docs/MODULES.md) - モジュール詳細説明
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - アーキテクチャ設計
- [USAGE.md](USAGE.md) - 使用方法ガイド

## 🔧 トラブルシューティング

### ポートが使用中の場合
\`\`\`bash
# ポート5000を解放
lsof -ti:5000 | xargs kill -9

# ポート3000を解放
lsof -ti:3000 | xargs kill -9
\`\`\`

### MongoDB接続エラー
MongoDBは現在オプションです。環境変数`MONGODB_URI`が設定されていない場合、データベースなしで動作します。

\`\`\`bash
# .envファイルにMongoDB URIを追加（オプション）
echo "MONGODB_URI=mongodb://localhost:27017/tax-filing-app" >> backend/.env
\`\`\`
