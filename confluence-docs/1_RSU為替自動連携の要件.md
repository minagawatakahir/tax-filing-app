# RSU為替自動連携モジュール - 要件仕様書

## 概要

RSU（Restricted Stock Units：譲渡制限付株式）の為替換算と税務計算を自動化するモジュール。証券会社APIから為替レートを自動取得し、複雑な税務計算をサポートします。

## 目的

- 証券会社APIからの自動データ取得
- 権利確定日のTTM（電信仲値）レート自動取得
- 複雑なRSU税務計算の自動化
- ミス防止と業務効率化

## 主要機能

1. **TTM自動取得機能**
   - 証券会社APIとの統合連携
   - 権利確定日の正確な為替レートを自動取得
   - キャッシュ機能による効率化

2. **複数時期RSU統合管理**
   - 複数回の権利確定を一つのポートフォリオで管理
   - 年間税務申告に正確に反映

3. **税金計算自動化**
   - 給与所得税の算出
   - 地域税（住民税）の算出
   - 源泉徴収を考慮した計算

4. **年間集計機能**
   - 複数の権利確定を年間で集計
   - 税務申告書類の生成支援

## API仕様

### POST /api/rsu/calculate

RSU為替計算を実行します。

**リクエスト**:
```json
{
  "vestingDate": "2024-03-15",
  "shares": 100,
  "pricePerShare": 180.50,
  "currency": "USD",
  "tickerSymbol": "GOOGL"
}
```

**レスポンス**:
```json
{
  "status": "success",
  "data": {
    "rsuId": "rsu-001",
    "vestingDate": "2024-03-15",
    "shares": 100,
    "ttmRate": 149.85,
    "jpyValue": 26970000,
    "estimatedIncomeTax": 8091000,
    "estimatedResidencesTax": 2697000,
    "totalTaxEstimate": 10788000
  }
}
```

### POST /api/rsu/annual-aggregate

年間RSU収入を集計します。

**リクエスト**:
```json
{
  "fiscalYear": 2024,
  "rsuGrants": [
    {"vestingDate": "2024-03-15", "shares": 100, "pricePerShare": 180.50},
    {"vestingDate": "2024-06-15", "shares": 50, "pricePerShare": 185.20}
  ]
}
```

## テストケース

| テスト項目 | 予想結果 | 状態 |
|---|---|---|
| RSU計算正確性 | 正しいJPY換算値を算出 | ✅ 完了 |
| TTM自動取得 | APIから取得したレートを使用 | 🔄 実装中 |
| 複数時期統合 | 機械時期を正しく集計 | ✅ 完了 |
| 税金計算 | 控除後所得税を算出 | ✅ 完了 |

## 依存関係

- 基本税務計算モジュール
- MongoDB（ユーザー及びRSUデータ保存）

## 費用見積

- 開発時間: 40時間
- テスト時間: 10時間
- 保守管理: 5時間

---

**最終更新**: 2026年2月15日
