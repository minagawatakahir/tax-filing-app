# 確定申告アシスタント - スタートガイド

## プロジェクト概要

個人事業主向けの確定申告を簡単にするWebアプリケーションです。

- **フロントエンド**: React + TypeScript + Tailwind CSS
- **バックエンド**: Node.js + Express + TypeScript
- **主な機能**: 
  - 収支入力フォーム
  - 自動税務計算（所得税・住民税）
  - 節税アドバイス
  - 計算結果の自動保存
  - JSON形式でのエクスポート

## セットアップと起動

### 前提条件
- Node.js (v16以上推奨)
- npm または yarn

### バックエンドの起動

```bash
cd ~/Dev/tax-filing-app/backend
npm install
npm run dev
```

サーバーは `http://localhost:5000` で起動します。

### フロントエンドの起動（別のターミナル）

```bash
cd ~/Dev/tax-filing-app/frontend
npm install
npm start
```

アプリケーションは `http://localhost:3000` で起動します。

## 使用方法

1. **収入を入力**: 事業所得とその他所得を入力
2. **経費を入力**: 家賃、光熱費、消耗品費などの経費を入力
3. **計算ボタンをクリック**: 「税額を計算する」をクリック
4. **結果を確認**: 所得税、住民税、手取り額などが表示されます
5. **節税アドバイス**: 画面下部に節税提案が表示されます
6. **履歴確認**: 右下の「保存済み計算」で過去の計算結果を確認できます

## API仕様

### 1. 税務計算

**エンドポイント**: `POST /api/tax/calculate`

**リクエスト例**:
```json
{
  "income": {
    "businessIncome": 5000000,
    "otherIncome": 0
  },
  "expense": {
    "rentExpense": 600000,
    "utilityExpense": 120000,
    "suppliesExpense": 200000,
    "travelExpense": 300000,
    "communicationExpense": 150000,
    "otherExpense": 100000
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "calculation": {
      "totalIncome": 5000000,
      "totalExpense": 1470000,
      "netIncome": 3530000,
      "basicDeduction": 480000,
      "taxableIncome": 3050000,
      "incomeTax": 305000,
      "inhabTax": 350000,
      "totalTax": 655000
    },
    "suggestions": [
      "経費率が低い傾向です..."
    ]
  }
}
```

### 2. 簡易シミュレーション

**エンドポイント**: `POST /api/tax/quick-simulation`

**リクエスト例**:
```json
{
  "annualIncome": 5000000
}
```

## 計算ロジック

### 所得税の計算
- 2024年の税率テーブルに基づいて計算
- 基礎控除: 48万円
- 累進課税で計算

### 住民税の計算
- 全国一律の税率: 課税所得 × 10% + 5,000円
- 基礎控除: 43万円

### 節税提案
- 経費率が30%未満の場合、経費を増やすことを提案
- 家賃や消耗品費が計上されていない場合を検出

## ディレクトリ構造

```
tax-filing-app/
├── frontend/                  # React フロントエンド
│   ├── public/
│   ├── src/
│   │   ├── components/       # React コンポーネント
│   │   │   ├── IncomeExpenseForm.tsx
│   │   │   ├── TaxResultDisplay.tsx
│   │   │   └── SavedCalculations.tsx
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── api.ts        # API呼び出し
│   │   │   └── storage.ts    # ローカルストレージ管理
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/                   # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/      # リクエストハンドラー
│   │   ├── routes/          # API ルート定義
│   │   ├── services/        # ビジネスロジック
│   │   │   └── taxCalculator.ts
│   │   ├── middleware/      # ミドルウェア
│   │   └── server.ts        # メインサーバーファイル
│   ├── dist/                # コンパイル後のJavaScript
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # ドキュメント
└── README.md
```

## トラブルシューティング

### エラー: "Cannot GET /api/health"
- バックエンドが起動していません。`npm run dev` コマンドを実行してください。

### エラー: "CORS policy"
- バックエンドが起動していないか、ポート番号が異なります。
- フロントエンド側の `.env` ファイルで `REACT_APP_API_URL` を確認してください。

### 計算結果が表示されない
1. ブラウザの開発者ツール（F12）でコンソールを確認
2. ネットワークタブで API リクエストが成功しているか確認
3. バックエンドのログで エラー メッセージを確認

## 今後の拡張案

- [ ] ユーザー認証機能（ログイン）
- [ ] クラウドデータベースへの保存（MongoDB）
- [ ] 複数年度の比較機能
- [ ] PDFでのレポート出力
- [ ] より詳細な経費カテゴリー
- [ ] 青色申告・白色申告の切り替え
- [ ] モバイルアプリ版
- [ ] 税理士との連携機能

## ライセンス

MIT

## 免責事項

このツールは参考情報提供のためのものです。正確な税務申告については、税理士または税務署の専門家にご相談ください。
