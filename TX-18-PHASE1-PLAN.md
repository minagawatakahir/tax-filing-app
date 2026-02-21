# TX-18 Phase 1 実装計画（タブUIの初期改善）

**作成日**: 2026年2月21日  
**対象**: App.tsx のタブ構造を改善  
**推定工数**: 2.5-3日  
**難易度**: 低（既存機能を壊さない）  

---

## 📋 概要

現在の App.tsx のタブ構造（9タブが平坦に並ぶ）を改善し、ユーザーが「どのタブを使うべきか」を直感的に理解できるようにします。

### 現状の問題点

```tsx
const tabs = [
  { id: 'basic', name: '基本計算', icon: '🧮' },
  { id: 'salary', name: '給与所得', icon: '💼' },
  { id: 'rsu', name: 'RSU所得', icon: '💱' },
  { id: 'rsu-income-list', name: 'RSU所得一覧', icon: '📋' },    // ← "RSU所得"との使い分けが不明確
  { id: 'properties', name: '不動産管理', icon: '🏢' },
  { id: 'real-estate-income', name: '不動産所得', icon: '🏠' },
  { id: 'real-estate-income-list', name: '不動産所得一覧', icon: '📊' }, // ← "不動産所得"との使い分けが不明確
  { id: 'capital-gain', name: '譲渡所得', icon: '💰' },
  { id: 'capital-gain-list', name: '譲渡所得一覧', icon: '📈' },  // ← 「物件売却」の方がわかりやすい
];
```

### Phase 1 で達成すること

- ✅ タブを視覚的にグループ化（色分け・セクション分け）
- ✅ ラベルを初心者向けに改善（例：「譲渡所得」→「物件売却」）
- ✅ 簡単なチュートリアル/ガイダンスを追加
- ✅ 各タブの役割を明確にするアイコン・テキスト調整

---

## 🎯 実装内容

### 1. タブグループ化の実装（1日）

**目標**: タブを3つのグループに分け、視覚的に区別する

```tsx
// 新しい tabs 構造
const tabGroups = [
  {
    group: '所得入力',
    color: 'blue',
    tabs: [
      { id: 'basic', name: '基本計算', icon: '🧮', help: '簡単に税額を計算' },
      { id: 'salary', name: '給与所得', icon: '💼', help: '給与収入を管理' },
      { id: 'rsu', name: 'RSU所得', icon: '💱', help: '権利確定の計算' },
    ]
  },
  {
    group: '不動産・資産管理',
    color: 'green',
    tabs: [
      { id: 'properties', name: '物件管理', icon: '🏢', help: '物件の情報を登録・管理' },
      { id: 'real-estate-income', name: '不動産所得', icon: '🏠', help: '物件の所得を計算' },
      { id: 'capital-gain', name: '物件売却', icon: '💰', help: '売却時の譲渡所得を計算' }, // ← ラベル改善
    ]
  },
  {
    group: 'レポート・一覧',
    color: 'purple',
    tabs: [
      { id: 'rsu-income-list', name: 'RSU所得管理', icon: '📋', help: '複数年度の管理・保存' },
      { id: 'real-estate-income-list', name: '不動産所得一覧', icon: '📊', help: '年度全体のレポート' },
      { id: 'capital-gain-list', name: '売却所得一覧', icon: '📈', help: '売却結果の一覧・CSV出力' },
    ]
  }
];
```

**実装手順**:

1. `types/TabGroup.ts` を作成（型定義）
2. `App.tsx` の tabs 配列を tabGroups に置き換え
3. `components/TabNavigation.tsx` を新規作成（グループ表示ロジック）
4. CSS を追加（グループ間の区切り線、背景色など）

**変更の影響**:

- `activeTab` の型は変わらない（互換性維持）
- 既存の各モジュールコンポーネント（SalaryIncomeModule など）は変更なし
- UIのみの変更

---

### 2. ラベルと説明文の改善（0.5日）

**変更箇所**:

| 現在 | 改善後 | 理由 |
|------|--------|------|
| 譲渡所得 | 物件売却 | 初心者にわかりやすい |
| 譲渡所得一覧 | 売却所得一覧 | 統一性 |
| RSU所得一覧 | RSU所得管理 | 「管理」は機能をより正確に表現 |
| 不動産所得一覧 | 不動産所得一覧（変更なし） | わかりやすい |

**実装**:

```tsx
// App.tsx で実装
const tabGroups = [
  {
    group: '所得入力',
    description: '収入を入力して税額を計算します',
    tabs: [
      { id: 'basic', name: '基本計算', icon: '🧮' },
      { id: 'salary', name: '給与所得', icon: '💼' },
      { id: 'rsu', name: 'RSU所得', icon: '💱' },
    ]
  },
  // ... 以下同様
];
```

---

### 3. チュートリアル/ガイダンス追加（1day）

**機能内容**:

#### 3.1 初回訪問時のガイダンス（モーダル）

```tsx
// components/OnboardingModal.tsx
// 初回訪問時に表示するモーダル
export const OnboardingModal: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">📚 確定申告アシスタントへようこそ！</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <span className="text-3xl">🧮</span>
            <div>
              <h3 className="font-bold">所得入力</h3>
              <p>給与、RSU、不動産などの収入を入力します</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-3xl">🏢</span>
            <div>
              <h3 className="font-bold">資産管理</h3>
              <p>不動産物件を登録・管理し、売却時の計算をします</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="font-bold">レポート</h3>
              <p>計算結果を一覧で確認し、CSV/PDFで出力します</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 3.2 タブの役割説明（ツールチップ）

```tsx
// 各タブにホバー時にツールチップを表示
<button
  title="給与所得：給与収入や源泉徴収税をこのタブで管理します"
  className="..."
>
  💼 給与所得
</button>
```

#### 3.3 ワークフローガイド（サイドバー）

```tsx
// components/WorkflowGuide.tsx
// 右サイドバーに「次のステップ」を提示
export const WorkflowGuide: React.FC = () => {
  return (
    <aside className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-bold mb-3">🎯 次のステップ</h3>
      <ol className="space-y-2 text-sm">
        <li>1️⃣ <strong>物件管理</strong>: 不動産物件を登録</li>
        <li>2️⃣ <strong>所得入力</strong>: 給与やRSUの所得を入力</li>
        <li>3️⃣ <strong>不動産所得</strong>: 物件ごとの所得を計算</li>
        <li>4️⃣ <strong>レポート</strong>: 結果をエクスポート</li>
      </ol>
    </aside>
  );
};
```

---

## 📐 技術的な実装詳細

### 新規ファイル

```
frontend/src/
├── components/
│   ├── TabNavigation.tsx (新規) - グループ化されたタブナビゲーション
│   ├── OnboardingModal.tsx (新規) - 初回訪問ガイダンス
│   ├── WorkflowGuide.tsx (新規) - ワークフローガイド
│   └── ... 既存コンポーネント
├── types/
│   └── TabGroup.ts (新規) - タブグループの型定義
└── App.tsx (修正) - タブ構造を改善
```

### 修正対象ファイル

```
frontend/src/App.tsx
- const tabs = [...] を const tabGroups = [...] に置き換え
- タブナビゲーション部分を <TabNavigation /> コンポーネントに置き換え
- localStorage を使った初回訪問フラグ管理を追加
```

---

## ✅ 実装チェックリスト

### Phase 1-1: タブグループ化

- [ ] `types/TabGroup.ts` を作成
- [ ] `components/TabNavigation.tsx` を実装
- [ ] `App.tsx` を修正（tabs → tabGroups）
- [ ] CSS を追加（グループ間の区切り線、背景色）
- [ ] ローカルでテスト（全9タブが正常に動作するか）

### Phase 1-2: ラベル改善

- [ ] ラベルを変更（譲渡所得 → 物件売却、等）
- [ ] help/description フィールドを各タブに追加
- [ ] ツールチップを実装
- [ ] 各モジュールのリンク先を確認（URL パラメータ互換性）

### Phase 1-3: ガイダンス追加

- [ ] `components/OnboardingModal.tsx` を実装
- [ ] localStorage に「初回訪問フラグ」を保存
- [ ] `components/WorkflowGuide.tsx` を実装
- [ ] モーダルが正常に表示・閉じるかテスト

### テストと検証

- [ ] 全9タブのクリック動作確認
- [ ] URL パラメータでのタブ遷移確認（propertyId など）
- [ ] ブラウザコンソールでエラーがないか確認
- [ ] レスポンシブデザインをテスト（タブレット・モバイル）
- [ ] 既存モジュール（SalaryIncomeModule など）が正常に動作

### コミット・PR

- [ ] feature/tx-18-phase1-ui-improvement ブランチを作成
- [ ] コミット：feat: TX-18 Phase 1 - Tab grouping and UX improvement
- [ ] GitHub に PR を作成
- [ ] Jira に PR リンクを追加

---

## 📊 工数見積もり

| タスク | 工数 | 難易度 | 備考 |
|--------|------|--------|------|
| タブグループ化実装 | 1日 | 低 | コンポーネント分割がメイン |
| ラベル改善 | 0.5日 | 低 | テキスト修正 + CSS調整 |
| ガイダンス実装 | 1日 | 低 | モーダル + localStorage |
| テスト・調整 | 0.5日 | 低 | 各タブの動作確認 |
| PR・ドキュメント | 0.5日 | 低 | GitHub, Jira 更新 |
| **合計** | **3.5日** | - | **バッファ含む** |

---

## 🚀 実装開始前の確認

- [ ] Git の現在のブランチを確認（main か）
- [ ] 最新のコードをプル（git pull origin main）
- [ ] ローカル開発サーバーを起動（npm run dev）
- [ ] 現在のタブ機能が正常に動作するか確認

---

## 📝 関連するチケット・ドキュメント

- **Jira**: TX-18
- **Confluence**: [TX-18: モジュール要件見直しと再設計 - 詳細分析](https://atlas-one-yokohamademo-01.atlassian.net/wiki/spaces/App/pages/198508547)
- **GitHub**: tax-filing-app

---

## 🎯 Phase 1 終了後の次ステップ

### Phase 2（1週間）:中期改善
- Sidebar ナビゲーションへの移行
- ダッシュボード画面の追加
- 未使用モジュールの整理

### Phase 3（2-3週間）: 長期改善
- デザインシステムの統一
- モバイル対応
- 複数年度比較機能

---

**作成日**: 2026年2月21日  
**最終更新**: 2026年2月21日  
**ステータス**: 実装開始待ち ⏳
