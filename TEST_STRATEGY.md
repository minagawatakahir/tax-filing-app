# 🧪 Tax Filing App - テスト戦略・計画書

**作成日**: 2026年2月24日  
**プロジェクト**: tax-filing-app (TX)  
**対象**: Frontend (React) + Backend (Node.js/TypeScript)

---

## 📊 現状分析

### テストカバレッジ

| レイヤー | テスト済み | テスト未済 | カバレッジ |
|---------|----------|---------|---------|
| **Frontend UI** | 4/4 (Button, Input, Card, Alert) | - | 100% |
| **Frontend ビジネスロジック** | 0件 | 13+ modules | 0% |
| **Backend Controllers** | 0件 | 11ファイル | 0% |
| **Backend Services** | 0件 | 13ファイル | 0% |
| **Backend Models** | 0件 | 11ファイル | 0% |
| **Backend Routes** | 0件 | 14ファイル | 0% |

### 現在のテスト環境

**Frontend:**
- ✅ Jest + React Testing Library セットアップ済み
- ✅ `npm test` で実行可能
- ✅ 基本UI コンポーネントテスト有り

**Backend:**
- ❌ テストフレームワーク未設定
- ❌ テストファイル 0件
- ✅ `package.json` に test script スタブあり

---

## 🎯 テスト戦略（全体方針）

### 優先度とアプローチ

#### フェーズ1: 基盤整備（1週間）
- **Priority 1**: Backend テストフレームワーク構築
- **Priority 2**: Frontend ビジネスロジック テストの追加
- **Priority 3**: E2E テスト基盤の構築

#### フェーズ2: 主要機能テスト（2週間）
- Controllers / Services のユニットテスト
- Frontend モジュールのコンポーネントテスト
- API 統合テスト

#### フェーズ3: カバレッジ拡大（継続的）
- 新機能追加時のテスト作成
- バグ修正時のテストケース追加
- パフォーマンステスト

---

## 🔧 テストフレームワーク構成

### Backend (Node.js)

**推奨スタック:**
```json
{
  "jest": "^29.x",           // テストランナー
  "ts-jest": "^29.x",        // TypeScript対応
  "@types/jest": "^29.x",    // TypeScript型定義
  "supertest": "^6.x",       // HTTP テストライブラリ
  "mongodb-memory-server": "^9.x"  // インメモリ MongoDB
}
```

**テスト分類:**
1. **Unit Tests** - Controllers, Services, Utils
2. **Integration Tests** - API Endpoints (supertest)
3. **Database Tests** - Model バリデーション

### Frontend (React)

**既存スタック:**
- ✅ Jest (react-scripts 内包)
- ✅ React Testing Library
- ✅ @testing-library/dom

**追加推奨:**
```json
{
  "msw": "^2.x",             // API モック
  "@testing-library/user-event": "^14.x",  // ユーザー操作シミュレーション
  "vitest": "^1.x"           // 代替テストランナー（オプション）
}
```

---

## 📝 テスト実装計画

### Phase 1.1: Backend テストセットアップ（3日）

#### Step 1: Jest 初期設定
- [ ] `jest.config.ts` 作成
- [ ] `tsconfig.json` にテスト用設定追加
- [ ] `package.json` に test script 設定
- [ ] テストファイル実行確認

#### Step 2: DB テストサンドボックス設定
- [ ] mongodb-memory-server セットアップ
- [ ] テスト用 DB 接続設定
- [ ] テストデータ seed スクリプト

#### Step 3: テスト環境サポート作成
- [ ] `test/setup.ts` - テスト初期化
- [ ] `test/fixtures/` - テストデータテンプレート
- [ ] `test/helpers.ts` - ユーティリティ関数

**対象ファイル:**
- `backend/src/server.ts`
- `backend/src/config/database.ts`

---

### Phase 1.2: Backend Models テスト（3日）

#### モデルテスト優先度

**Priority 1 (必須):**
- [ ] `User.ts` - 認証の基盤
- [ ] `TaxFiling.ts` - 中核データモデル
- [ ] `RealEstateProperty.ts` / `RealEstateIncome.ts`
- [ ] `RSUGrant.ts` / `RSUIncomeRecord.ts`

**Priority 2:**
- [ ] `SalaryIncomeRecord.ts`
- [ ] `CapitalGain.ts` / `CapitalGainRecord.ts`
- [ ] `Depreciation.ts`
- [ ] `Asset.ts`

**テスト項目（各モデル）:**
```typescript
describe('User Model', () => {
  test('should validate required fields')
  test('should hash password on save')
  test('should reject invalid email format')
  test('should handle password comparison')
})

describe('TaxFiling Model', () => {
  test('should create tax filing with valid data')
  test('should calculate total income')
  test('should validate fiscal year')
  test('should handle date ranges correctly')
})

// ... その他モデル
```

---

### Phase 1.3: Frontend モジュールテスト（4日）

#### モジュール優先度

**Priority 1 (ビジネスロジック):**
- [ ] `Dashboard.tsx` - ダッシュボード
- [ ] `SalaryIncomeModule.tsx` - 給与所得計算
- [ ] `RealEstateIncomeModule.tsx` - 不動産所得
- [ ] `RSUIncomeListModule.tsx` - RSU 管理

**Priority 2:**
- [ ] `DepreciationModule.tsx` - 減価償却
- [ ] `RealEstateLTVModule.tsx` - LTV 計算
- [ ] `PropertyManagementPanel.tsx` - 物件管理
- [ ] `TaxResultDisplay.tsx` - 税務結果表示

**Priority 3:**
- [ ] `RSUExchangeModule.tsx`
- [ ] `IncomeExpenseForm.tsx`
- [ ] `SavedCalculations.tsx`
- [ ] `WorkflowGuide.tsx`

**テスト項目パターン:**
```typescript
describe('SalaryIncomeModule', () => {
  test('should render form with required fields')
  test('should calculate tax on input change')
  test('should handle form submission')
  test('should display validation errors')
  test('should save calculation to backend')
})
```

---

### Phase 2: Controller & Service テスト（2週間）

#### Backend Controllers

**テスト対象:**
- `salaryIncomeController.ts`
- `realEstateIncomeController.ts`
- `rsuIncomeController.ts`
- `depreciationController.ts`
- `taxExemptionController.ts`
- `realEstateController.ts`

**テスト構成:**
```typescript
describe('SalaryIncomeController', () => {
  describe('POST /salary-income', () => {
    test('should create salary income record')
    test('should validate input data')
    test('should return 400 on invalid input')
  })
  
  describe('GET /salary-income/:id', () => {
    test('should retrieve salary income record')
    test('should return 404 for non-existent record')
  })
})
```

#### Backend Services

**テスト対象:** 対応するサービスレイヤー

**テスト構成:**
```typescript
describe('SalaryIncomeService', () => {
  test('should calculate tax correctly')
  test('should handle deductions')
  test('should validate fiscal year')
  test('should throw error on invalid input')
})
```

---

### Phase 3: E2E テスト（継続的）

#### E2E テストフレームワーク

**推奨:**
- Cypress (UI中心) または
- Playwright (スピード・スケール重視)

**主要ユーザーフロー:**
1. ユーザー登録・ログイン
2. 給与所得入力 → 計算 → 結果表示
3. 不動産物件追加 → 所得計算
4. RSU 管理 → 所得一覧表示
5. PDF エクスポート

---

## 📋 テスト実行コマンド

### 現在（Frontend のみ）
```bash
cd frontend
npm test                  # 全テスト実行
npm test -- --coverage   # カバレッジ表示
```

### Phase 1 実装後
```bash
# Backend テスト
cd backend
npm test
npm test -- --coverage
npm test -- salaryIncome  # 特定モジュール

# Frontend テスト
cd frontend
npm test

# 両方実行
npm run test:all
```

### Phase 3 実装後
```bash
# E2E テスト
npm run e2e              # Cypress
npm run e2e:ui           # UI モード
npm run e2e:headed       # ブラウザ表示
```

---

## 📊 テストカバレッジ目標

| フェーズ | Statements | Branches | Functions | Lines |
|---------|-----------|---------|----------|-------|
| **Phase 1** | 50% | 40% | 50% | 50% |
| **Phase 2** | 75% | 65% | 75% | 75% |
| **Phase 3** | 85%+ | 80%+ | 85%+ | 85%+ |

---

## 🔗 参考資料・関連ドキュメント

- `TX-18-PHASE1-PLAN.md` - Phase 1 実装計画
- `TX-18-PHASE2-PLAN.md` - Phase 2 実装計画
- `DESIGN_SYSTEM.md` - デザイン仕様

---

## ✅ 実装チェックリスト

### Phase 1.1: Backend テストセットアップ
- [ ] Jest 初期設定
- [ ] mongodb-memory-server セットアップ
- [ ] テスト環境ファイル作成

### Phase 1.2: Backend Models テスト
- [ ] User モデル
- [ ] TaxFiling モデル
- [ ] Income 関連モデル
- [ ] Asset / Property モデル

### Phase 1.3: Frontend モジュールテスト
- [ ] Dashboard テスト
- [ ] Income モジュール テスト
- [ ] 計算・結果表示 テスト

### Phase 2: Controller/Service テスト
- [ ] Controllers テスト
- [ ] Services テスト
- [ ] 統合テスト

### Phase 3: E2E テスト
- [ ] フレームワークセットアップ
- [ ] ユーザーフロー テスト
- [ ] クロスブラウザ テスト

---

## 📅 想定スケジュール

```
Week 1: Phase 1.1 + 1.2 (Backend 基盤)
Week 2: Phase 1.3 (Frontend モジュール)
Week 3-4: Phase 2 (Controllers/Services)
Week 5+: Phase 3 (E2E) - 継続的
```

---

## 🚀 次のステップ

1. **このドキュメントのレビュー** → チーム確認
2. **Backend Jest 設定開始** → Phase 1.1
3. **Jira チケット化** → TX プロジェクトで追跡
4. **Confluence 公開** → チーム共有

---

*最終更新: 2026-02-24*
