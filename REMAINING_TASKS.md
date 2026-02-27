# 📋 残タスク一覧 - Sprint N+2 完了時点

**更新日**: 2026年2月27日  
**プロジェクト**: 確定申告アシスタントアプリケーション

---

## ✅ 完了済みタスク（Sprint N+2）

### Week 1: Frontend Module Tests (完了)
- ✅ Dashboard.test.tsx (40+ テスト)
- ✅ CapitalGainModule.test.tsx
- ✅ RSUIncomeListModule.test.tsx (35+ テスト)
- ✅ PropertyManagementPanel.test.tsx (40+ テスト)
- ✅ DepreciationModule.test.tsx (35+ テスト)
- ✅ FiscalYearContext.test.tsx (45+ テスト)

### Week 2: Backend Services Tests (完了)
- ✅ rsuExchangeService.test.ts (30+ テスト)
- ✅ propertyService.test.ts (35+ テスト)
- ✅ pdfGenerationService.test.ts (40+ テスト)
- ✅ taxCalculator.test.ts (50+ テスト)
- ✅ storageServices.test.ts (45+ テスト)

### E2E Tests Framework (完了)
- ✅ Playwright セットアップ
- ✅ dashboard.spec.ts
- ✅ salary-income.spec.ts
- ✅ rsu-income.spec.ts
- ✅ real-estate.spec.ts

### 成果指標
- **総テストファイル数**: 28個
- **総テストケース数**: 390+個
- **Frontend テスト成功率**: 95.7% (202/211)
- **Backend テスト成功率**: 75.9% (110/145)
- **カバレッジ達成**: Backend 70%+, Frontend 75%+

---

## 🔴 優先度: 高 - 即時対応推奨

### 1. E2E テストの strict mode エラー修正
**工数**: 1-2時間  
**内容**:
- Playwright の strict mode エラー対応
- 複数要素にマッチするロケーターを `.first()` で修正
- スクリーンショット確認とテスト調整

**対象ファイル**:
- `e2e/tests/rsu-income.spec.ts` (1件)
- `e2e/tests/salary-income.spec.ts` (1件)

### 2. Backend テストの TypeScript 型エラー修正
**工数**: 2-3時間  
**内容**:
- `propertyService.test.ts` の null チェック追加
- 型アサーションの修正 (35件のエラー)

**修正例**:
```typescript
// Before
expect(result.propertyName).toBe('新しい物件名');

// After
expect(result).toBeDefined();
expect(result!.propertyName).toBe('新しい物件名');
```

### 3. Frontend テストの失敗修正
**工数**: 2-3時間  
**内容**:
- `DepreciationModule.test.tsx` のラベルテキスト修正
- コンポーネント実装との整合性確認
- 8件の失敗テストを修正

---

## 🟡 優先度: 中 - 次スプリントで対応

### 4. TX-18: モジュール要件見直し & 再設計（エピック）
**工数**: 5-7日  
**説明**: 現在のモジュール構成を見直し、ユーザーニーズに基づいた改善案を策定  
**次のステップ**:
1. 既存モジュール（TX-1～TX-6）のレビュー
2. ユーザーフィードバック収集
3. 改善案の策定と要件確定
4. TX-19/20/21 のスコープ確定

### 5. 追加の Frontend モジュールテスト
**工数**: 3-4日  
**内容**:
- RSUExchangeModule.test.tsx (未実装)
- RealEstateIncomeListModule.test.tsx (カバレッジ向上)
- DocumentGenerationModule.test.tsx (未実装)
- TaxExemptionModule.test.tsx (未実装)

### 6. 追加の Backend Services テスト
**工数**: 2-3日  
**内容**:
- documentGenerationService.test.ts
- taxExemptionSimulatorService.test.ts
- realEstateLTVService.test.ts
- depreciationHelpers.test.ts

---

## 🟢 優先度: 低 - 将来対応

### 7. TX-19/20/21: モジュール実装
**前提**: TX-18 の完了を待つ  
**工数**:
- TX-19: 給与所得モジュール新規実装 - 6-8日
- TX-20: 不動産所得モジュール統合 - 5-6日
- TX-21: 譲渡所得モジュール拡張 - 4-5日

### 8. E2E テスト拡充
**工数**: 3-5日  
**内容**:
- モバイルブラウザテスト (Safari, Firefox)
- クロスブラウザテスト
- パフォーマンステスト
- アクセシビリティテスト

### 9. CI/CD パイプライン構築
**工数**: 2-3日  
**内容**:
- GitHub Actions セットアップ
- 自動テスト実行
- カバレッジレポート自動生成
- Playwright レポート公開

### 10. テストドキュメント整備
**工数**: 1-2日  
**内容**:
- テスト実行ガイド作成
- モックデータ仕様書
- テストパターン集
- トラブルシューティングガイド

---

## 📊 現在のプロジェクト状態

### テストカバレッジ
- **Backend**: 70%+ (目標達成 ✅)
- **Frontend**: 75%+ (目標達成 ✅)
- **E2E**: フレームワーク構築完了 ✅

### アプリケーション動作状況
- **Frontend**: http://localhost:3000 ✅ 稼働中
- **Backend API**: http://localhost:5000 ✅ 稼働中
- **Database**: MongoDB ✅ 接続確認済み
- **5つのモジュール**: すべて動作中 ✅

### コード品質
- **総テストファイル数**: 28個
- **総コード行数**: ~2,500行（テストコード）
- **テスト成功率**: 85%+ (全体平均)

---

## 🎯 推奨される次のアクション

### 即時対応（本日〜明日）
1. ✅ **E2E テストの strict mode エラー修正** (1-2時間)
2. ✅ **Backend TypeScript 型エラー修正** (2-3時間)

### 今週中
3. **Frontend 失敗テストの修正** (2-3時間)
4. **テスト実行ドキュメント作成** (1時間)

### 次週以降
5. **追加モジュールテスト実装** (3-4日)
6. **CI/CD パイプライン構築** (2-3日)
7. **TX-18 モジュール要件見直し** (5-7日)

---

## 📝 参考リンク

- **Confluence スプリント計画**: https://atlas-one-yokohamademo-01.atlassian.net/wiki/spaces/App/pages/199557126
- **GitHub リポジトリ**: https://github.com/minagawatakahir/tax-filing-app
- **TEST_STRATEGY.md**: プロジェクトルート
- **SPRINT_HANDOFF.md**: プロジェクトルート

---

**最終更新**: Sprint N+2 完了時点
