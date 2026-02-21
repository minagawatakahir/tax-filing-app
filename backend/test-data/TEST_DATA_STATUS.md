# テストデータ投入状況レポート

**作成日**: 2026年2月21日  
**最終更新**: 2026年2月21日 14:30 JST

---

## 📊 現在の状況

### ✅ 成功したデータ投入

| データ種別 | 件数 | 状態 | 投入結果 |
|-----------|------|------|---------|
| RSU所得 | 3年度分 | ✅ 成功 | `rsu_income_records`: 3件 |
| 不動産所得 | 9件 | ✅ 成功 | `real_estate_income_records`: 9件 |

### ⚠️ 失敗または未完了

| データ種別 | 件数 | 状態 | 原因 |
|-----------|------|------|------|
| 不動産物件 | 5件 | ❌ スキーマエラー | Property モデルに必須フィールドがある |
| 給与所得 | 3年度分 | ❌ スクリプトエラー | TypeScript コンパイルエラー（改行問題） |
| 譲渡所得 | 2件 | ❌ スクリプトエラー | TypeScript コンパイルエラー（改行問題） |

---

## 🔴 エラー内容と対応策

### 1. 不動産物件マスタ投入エラー

**エラーメッセージ**:
```
ValidationError: Property validation failed: 
- category: Path `category` is required.
- totalValue: Path `totalValue` is required.
- buildingStructure: `RC造` is not a valid enum value
- depreciationMethod: `定額法` is not a valid enum value
```

**原因**:
Property モデルのスキーマに以下の必須フィールドがある：
- `category` (必須)
- `totalValue` (必須)
- `buildingStructure` (enum値が異なる)
- `depreciationMethod` (enum値が異なる)

**対応策（次回実施）**:
1. `backend/src/models/Property.ts` を確認
2. seed-test-data.ts のテストデータに不足フィールドを追加
3. enum値を正確な値に修正
4. 再度投入実行

---

### 2. TypeScript コンパイルエラー

**影響を受けたスクリプト**:
- `seed-salary-income.ts`
- `seed-capital-gain.ts`
- `seed-all.ts`

**エラー種別**:
- 改行文字の処理エラー（`\n` が正しく処理されていない）
- ファイル作成時の文字列エスケープ問題

**対応策（次回実施）**:
1. 各スクリプトの改行をクリーンアップ
2. 文字列リテラルを正確に定義し直す
3. `seed-all.ts` は個別スクリプトの呼び出しに変更検討

---

## 📋 現在のテストデータベース状態

```
MongoDB Collections:
├── rsu_income_records (3件)
│   ├── 2023年度: 2回の権利確定
│   ├── 2024年度: 3回の権利確定
│   └── 2025年度: 3回の権利確定
│
├── real_estate_income_records (9件)
│   ├── 2023年度: 3物件
│   ├── 2024年度: 3物件
│   └── 2025年度: 3物件
│
├── properties (0件 - 投入失敗)
├── salary_income_records (0件 - 投入失敗)
└── capital_gain_records (0件 - 投入失敗)
```

---

## 🔧 投入可能なデータと投入方法

### 現在投入可能な機能（テスト検証可能）

✅ **RSU所得モジュール**
```bash
npm run seed:rsu
# または
ts-node test-data/seed-rsu-income.ts
```
- 3年度分（2023～2025）
- 複数企業からの権利確定
- TTM為替レート適用済み

✅ **不動産所得モジュール**
```bash
npm run seed:real-estate
# または
ts-node test-data/seed-real-estate-income.ts
```
- 3物件 × 3年度 = 9件
- 家賃、経費、減価償却、純利益を含む

---

## 📝 次回実施項目（優先度順）

### 優先度 🔴 高

1. **不動産物件マスタデータの修正**
   - Property モデルスキーマ確認
   - seed-test-data.ts に必須フィールド追加
   - enum値を正確に設定
   - 再度投入テスト

2. **TypeScript エラー修正**
   - seed-salary-income.ts 修正
   - seed-capital-gain.ts 修正
   - seed-all.ts 修正または再実装

### 優先度 🟡 中

3. **給与所得データ投入**
   - スクリプト修正後に実行
   - 3年度分のテストデータ投入確認

4. **譲渡所得データ投入**
   - スクリプト修正後に実行
   - 2件の売却記録投入確認

### 優先度 🟢 低

5. **統合テスト**
   - 全5つのデータセットが投入できることを確認
   - アプリケーション UI で全機能がテスト可能なことを確認

---

## 🧪 検証チェックリスト（次回用）

テストデータ投入後、以下を確認してください：

### RSU所得（既投入 ✅）
- [ ] App.tsx で「RSU所得一覧」タブを開く
- [ ] 3年度分のデータが表示される
- [ ] 複数企業からの権利確定が正しく集計されている
- [ ] TTMレートが適用されている

### 不動産所得（既投入 ✅）
- [ ] App.tsx で「不動産所得一覧」タブを開く
- [ ] 3物件 × 3年度 = 9件が表示される
- [ ] 年度別フィルタリングが機能する
- [ ] CSV出力ボタンが動作する

### 次回投入予定
- [ ] 不動産物件（5件）を投入
- [ ] 給与所得（3年度）を投入
- [ ] 譲渡所得（2件）を投入

---

## 📞 備考

- MongoDB は起動しているか確認してください
- `.env` の MONGODB_URI が正しく設定されているか確認してください
- 各スクリプト実行前に既存データはクリアされます

---

**次回作業予定日**: スプリント N+4 開始時

お疲れ様でした！次回の投入まで、このドキュメントを参考にしてください。
