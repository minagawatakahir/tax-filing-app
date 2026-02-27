# 🐛 総合バグレポート: フロントエンド編集画面がDB既存データを読み込まない

**報告日**: 2026年2月27日  
**優先度**: 🔴 高  
**ステータス**: 🔍 確認中  
**影響範囲**: 複数モジュール（RSU, 不動産, 譲渡所得, 減価償却）

---

## 📋 概要

確定申告アシスタントアプリケーションの複数の**編集画面**において、MongoDB に保存されている既存データが自動読み込みされず、常に初期状態（空フォーム）で表示される問題が確認されました。

---

## 🔍 影響を受けるモジュール分析

### 1. RSUExchangeModule（RSU所得）- 🔴 **重大**

**ファイル**: `frontend/src/components/RSUExchangeModule.tsx`

| 項目 | ステータス |
|------|-----------|
| useEffect | ❌ 0件 |
| 既存データ読み込み | ❌ 未実装 |
| 複数年対応 | ❌ 未実装 |
| DB接続確認 | ✅ API正常 |

**問題点**:
- `useEffect` フックがない
- 年度選択時に既存データを取得する処理がない
- 常に空のフォームで初期化される

**DB状態**: ✅ 2025年度に7件の権利確定記録が保存されている

---

### 2. RealEstateIncomeModule（不動産所得）- 🟡 **中程度**

**ファイル**: `frontend/src/components/RealEstateIncomeModule.tsx`

| 項目 | ステータス |
|------|-----------|
| useEffect | ✅ 5件 |
| 既存データ読み込み | ⚠️ 部分的 |
| 複数年対応 | ⚠️ 確認必要 |
| DB接続確認 | ✅ API正常 |

**問題点**:
- useEffect は存在するが、複数年度のデータ読み込みロジックが完全でない可能性
- fiscalYear の変更時に正しくデータが更新されるか不確認

**DB状態**: ✅ 複数の不動産所得記録が保存されている

---

### 3. CapitalGainModule（譲渡所得）- 🟡 **中程度**

**ファイル**: `frontend/src/components/CapitalGainModule.tsx`

| 項目 | ステータス |
|------|-----------|
| useEffect | ✅ 5件 |
| 既存データ読み込み | ⚠️ 確認必要 |
| 複数年対応 | ⚠️ 確認必要 |
| DB接続確認 | ✅ API正常 |

**問題点**:
- useEffect は存在するが、年度別フィルタリングロジックが正しく機能するか不確認
- 複数の譲渡物件がある場合の表示が正確か不確認

**DB状態**: ✅ 7件の譲渡所得記録が保存されている

---

### 4. DepreciationModule（減価償却）- 🔴 **重大**

**ファイル**: `frontend/src/components/DepreciationModule.tsx`

| 項目 | ステータス |
|------|-----------|
| useEffect | ❌ 0件 |
| 既存データ読み込み | ❌ 未実装 |
| 資産マスター連携 | ❌ 未実装 |
| DB接続確認 | ✅ API正常 |

**問題点**:
- `useEffect` がない
- 既存の資産（物件）の減価償却データを読み込めない
- 物件選択時に対応する減価償却情報が自動読み込みされない

**DB状態**: ✅ 物件マスターに減価償却情報が保存されている

---

## 📊 問題の体系図

```
データベース層
  ↓
✅ MongoDB: データ正常に保存
  ├─ RSU所得: 7件
  ├─ 不動産所得: 10件
  ├─ 譲渡所得: 7件
  └─ 物件マスター: 3件
  ↓
✅ API層: データ正常に取得可能
  ├─ GET /api/rsu-income/list
  ├─ GET /api/real-estate-income
  ├─ GET /api/capital-gain
  └─ GET /api/properties
  ↓
❌ フロントエンド層: データ読み込み不完全
  ├─ RSUExchangeModule: 未実装 🔴
  ├─ RealEstateIncomeModule: 部分的 🟡
  ├─ CapitalGainModule: 部分的 🟡
  └─ DepreciationModule: 未実装 🔴
```

---

## 🔧 必要な修正内容

### 修正1: RSUExchangeModule - useEffect 追加

```typescript
// 現在の状態: useEffect なし
const [rsuEntries, setRsuEntries] = useState([]); // 常に空

// 必要な修正:
useEffect(() => {
  if (selectedYear) {
    fetchRSUData(selectedYear);
  }
}, [selectedYear]);

const fetchRSUData = async (year: number) => {
  const response = await fetch(`/api/rsu-income/list?year=${year}`);
  const data = await response.json();
  if (data?.length > 0 && data[0].input) {
    setRsuEntries(data[0].input);
  }
};
```

### 修正2: RealEstateIncomeModule - 複数年対応検証

```typescript
// useEffect 存在但、複数年対応を確認
useEffect(() => {
  if (selectedYear) {
    fetchRealEstateData(selectedYear); // 正しく機能しているか検証
  }
}, [selectedYear]); // selectedYear が依存配列に含まれているか確認
```

### 修正3: CapitalGainModule - 複数物件対応検証

```typescript
// useEffect 存在但、以下を検証
// - 年度変更時の再読み込み
// - 複数物件の表示
// - propertyId フィルタリング
```

### 修正4: DepreciationModule - useEffect + 資産連携追加

```typescript
// 現在の状態: useEffect なし、資産マスター未連携

// 必要な修正:
useEffect(() => {
  if (selectedPropertyId && selectedYear) {
    fetchDepreciationData(selectedPropertyId, selectedYear);
  }
}, [selectedPropertyId, selectedYear]);

const fetchDepreciationData = async (propertyId: string, year: number) => {
  const response = await fetch(`/api/depreciation?propertyId=${propertyId}&year=${year}`);
  const data = await response.json();
  if (data) {
    setFormData(prev => ({
      ...prev,
      assetId: data.assetId,
      assetName: data.assetName,
      acquisitionCost: data.acquisitionCost,
      // その他のフィールド
    }));
  }
};
```

---

## 📝 修正チェックリスト

### RSUExchangeModule
- [ ] useEffect フック追加
- [ ] fetchRSUData 関数実装
- [ ] 年度変更時のデータ再読み込み
- [ ] ローディング状態の表示
- [ ] エラーハンドリング
- [ ] テスト追加（TX-44）

### RealEstateIncomeModule
- [ ] useEffect の依存配列確認
- [ ] 複数年度データ読み込みの検証
- [ ] 複数物件表示の検証
- [ ] テスト追加または修正

### CapitalGainModule
- [ ] useEffect の依存配列確認
- [ ] 複数物件フィルタリングの検証
- [ ] 複数年度対応の検証
- [ ] テスト追加または修正

### DepreciationModule
- [ ] useEffect フック追加
- [ ] fetchDepreciationData 関数実装
- [ ] 資産マスター（properties）との連携
- [ ] 年度・物件変更時の再読み込み
- [ ] テスト追加

---

## 🔗 関連リソース

| リソース | 状態 |
|---------|------|
| API エンドポイント | ✅ 正常 |
| データベース | ✅ 正常 |
| フロントエンド編集画面 | ❌ 不具合 |
| テストケース（TX-44） | ⚠️ 更新必要 |

---

## 📌 Jira タスク化推奨

### Task 1: RSUExchangeModule データ読み込み実装
- 優先度: 🔴 高
- 工数: 2-3時間
- 関連: TX-44, TX-50

### Task 2: DepreciationModule データ読み込み実装
- 優先度: 🔴 高
- 工数: 2-3時間
- 関連: TX-44, TX-50

### Task 3: RealEstateIncomeModule 複数年対応検証
- 優先度: 🟡 中
- 工数: 1-2時間
- 関連: TX-44

### Task 4: CapitalGainModule 複数物件対応検証
- 優先度: 🟡 中
- 工数: 1-2時間
- 関連: TX-44

### Task 5: フロントエンドデータ読み込みパターン仕様書作成
- 優先度: 🟡 中
- 工数: 2-3時間
- 関連: TX-50（DB仕様書化）

**合計工数**: 8-13時間

---

## 次のアクション

1. ✅ 総合バグ確認（本レポート）
2. 📝 Jira タスク作成（5個）
3. 🔧 各モジュール修正実装
4. 🧪 テストケース追加/修正（TX-44）
5. 📄 仕様書更新（TX-50）
6. ✅ 動作確認

---

**最終更新**: 2026年2月27日  
**報告者**: Development Team
