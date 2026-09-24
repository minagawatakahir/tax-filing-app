# 確定申告アプリケーション

高度な確定申告・資産管理システム

## 🎯 プロジェクト概要

日本の確定申告に必要な複雑な税務計算を自動化する Web アプリケーションです。
5つの高度なモジュールでRSU、不動産、減価償却などの計算を支援します。

## 📊 実装済みモジュール

### 1. RSU為替自動連携 💱
- 証券会社との自動連携（デモ実装）
- TTM（電信仲値）レートの自動取得
- RSU権利確定時の税務計算

### 2. 不動産LTV・利子判定 🏠
- LTV（Loan to Value）計算
- 土地・建物の借入金按分
- 利子の損金算入可否判定

### 3. 減価償却ライフサイクル 📉
- 定額法・定率法の両対応
- 減価償却スケジュール生成
- 将来の未償却残高予測

### 4. 特例併用シミュレーター 🔄
- 3,000万円控除のシミュレーション
- 住宅ローン控除のシミュレーション
- 両者の損得判定

### 5. 調書自動生成 📄
- 財産債務調書の自動生成
- PDF形式での出力

## 🛠 技術スタック

### バックエンド
- **言語**: TypeScript
- **フレームワーク**: Node.js + Express
- **データベース**: MongoDB（オプション）

### フロントエンド
- **言語**: TypeScript
- **フレームワーク**: React 19
- **スタイリング**: Tailwind CSS

## 🚀 クイックスタート

### 前提条件
- Node.js 16以上
- npm または yarn

### インストール

```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd frontend
npm install
```

### 起動

#### オプション1: 自動起動スクリプト
```bash
./start-dev.sh
```

#### オプション2: 個別起動

**ターミナル1 - バックエンド:**
```bash
cd backend
npm run dev
```

**ターミナル2 - フロントエンド:**
```bash
cd frontend
npm start
```

### アクセス
- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:5000

## 🧪 テスト

```bash
# 単体テスト
cd backend && npm test
cd frontend && npm test

# E2E テスト（MongoDB を起動しておく）
cd e2e && npx playwright test
```

E2E テストは **実データとは別の専用DB**（`tax-filing-app-e2e`）で実行します。

- Playwright がバックエンドを E2E 用DBに接続して起動し、実行のたびに DB を初期化してシードします（`backend/scripts/seed-e2e.ts`）。
- **開発用のバックエンドがポート5000で動いていると、E2E は起動に失敗して止まります。** 実データへの書き込みを防ぐための動作なので、開発用のバックエンドを止めてから実行してください。
- 接続先は環境変数 `E2E_MONGODB_URI` で変更できます（DB名は `-e2e` で終わる必要があります）。

## 🛠 データのメンテナンス

- `cd backend && npm run db:dedupe-salary` — 給与所得の年度ごとの重複を確認（`-- --apply` で整理し、一意インデックスを作成）

## 📚 ドキュメント

- [AGENTS.md](AGENTS.md) — 作業のルール（開発者・AIエージェント向け。**最初に読む**）
- [学びの記録](docs/LESSONS_LEARNED.md) — 起きた問題と原因・対策
- [テスト戦略](TEST_STRATEGY.md)
- [データベース](DATABASE_REPORT.md)
- [デザインシステム](DESIGN_SYSTEM.md)
- [残タスク](REMAINING_TASKS.md) / [バックログ](TASK_BACKLOG.md)

## 🔗 関連リンク

- **Jira プロジェクト**: [TX-1](https://atlas-one-yokohamademo-01.atlassian.net/browse/TX-1)
- **Confluence 仕様**: [モジュール要件](https://atlas-one-yokohamademo-01.atlassian.net/wiki/spaces/App/pages/196870571)

## 📝 ライセンス

このプロジェクトはプライベートプロジェクトです。

## 👤 作成者

Toshiro Minagawa (tminagawa@atlassian.com)
