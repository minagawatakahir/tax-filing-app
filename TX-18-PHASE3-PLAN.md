# TX-18 Phase 3: デザインシステム統一実装計画

## 概要
Phase 1（タブグループ化）とPhase 2（Sidebarナビゲーション）で構築した基盤をベースに、アプリケーション全体のデザインシステムを統一し、一貫性のあるUXを提供します。

## 🎯 主要目標

### 1. 共通コンポーネントライブラリ構築（3日）
- ボタン、カード、フォーム要素の標準化
- 統一されたカラーパレットとタイポグラフィ
- 再利用可能なレイアウトコンポーネント

### 2. デザイントークン導入（1日）
- 色、スペーシング、フォントサイズの変数化
- CSS変数またはTailwind設定での管理
- ダークモード対応の準備

### 3. 既存コンポーネントのリファクタリング（2日）
- 全モジュールコンポーネントの統一
- 一貫したスペーシングとレイアウト
- アクセシビリティの改善

### 4. スタイルガイド・ドキュメント作成（1日）
- コンポーネント使用例
- デザインガイドライン
- 開発者向けドキュメント

## 📊 工数見積もり
- **共通コンポーネントライブラリ**: 3日
- **デザイントークン導入**: 1日
- **既存コンポーネントリファクタリング**: 2日
- **スタイルガイド作成**: 1日
- **テスト・調整**: 1日
- **合計**: **8日**

## 🎨 デザインシステム仕様

### カラーパレット

#### プライマリカラー（グループ別）
```css
/* 所得入力 - Blue */
--color-income-primary: #3B82F6;
--color-income-light: #EFF6FF;
--color-income-dark: #1E40AF;

/* 不動産・資産管理 - Green */
--color-property-primary: #10B981;
--color-property-light: #ECFDF5;
--color-property-dark: #047857;

/* レポート・一覧 - Purple */
--color-report-primary: #8B5CF6;
--color-report-light: #F5F3FF;
--color-report-dark: #6D28D9;

/* ダッシュボード - Yellow/Orange */
--color-dashboard-primary: #F59E0B;
--color-dashboard-light: #FEF3C7;
--color-dashboard-dark: #D97706;
```

#### セマンティックカラー
```css
/* Success */
--color-success: #10B981;
--color-success-light: #D1FAE5;
--color-success-dark: #047857;

/* Error */
--color-error: #EF4444;
--color-error-light: #FEE2E2;
--color-error-dark: #DC2626;

/* Warning */
--color-warning: #F59E0B;
--color-warning-light: #FEF3C7;
--color-warning-dark: #D97706;

/* Info */
--color-info: #3B82F6;
--color-info-light: #DBEAFE;
--color-info-dark: #1E40AF;
```

#### ニュートラルカラー
```css
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

### タイポグラフィ

```css
/* Headings */
--font-size-h1: 2.5rem;     /* 40px */
--font-size-h2: 2rem;       /* 32px */
--font-size-h3: 1.5rem;     /* 24px */
--font-size-h4: 1.25rem;    /* 20px */
--font-size-h5: 1.125rem;   /* 18px */
--font-size-h6: 1rem;       /* 16px */

/* Body */
--font-size-base: 1rem;     /* 16px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-xs: 0.75rem;    /* 12px */

/* Line Heights */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### スペーシング

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

### ボーダー・シャドウ

```css
/* Border Radius */
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## 📁 ファイル構成

### 新規ファイル

```
frontend/src/
├── components/
│   └── ui/                          ← 新規フォルダ
│       ├── Button.tsx               ← 統一ボタンコンポーネント
│       ├── Card.tsx                 ← 統一カードコンポーネント
│       ├── Input.tsx                ← 統一入力フィールド
│       ├── Select.tsx               ← 統一セレクトボックス
│       ├── Modal.tsx                ← 統一モーダル
│       ├── Alert.tsx                ← アラート・通知
│       ├── Badge.tsx                ← バッジ・ラベル
│       ├── Tooltip.tsx              ← ツールチップ
│       └── index.ts                 ← エクスポート
├── styles/
│   ├── design-tokens.css            ← デザイントークン定義
│   ├── components.css               ← 共通コンポーネントスタイル
│   └── utilities.css                ← ユーティリティクラス
└── constants/
    └── designSystem.ts              ← TypeScriptデザイントークン
```

### 修正ファイル

```
frontend/src/
├── components/
│   ├── IncomeExpenseForm.tsx        ← 共通コンポーネント使用
│   ├── SalaryIncomeModule.tsx       ← 共通コンポーネント使用
│   ├── RSUExchangeModule.tsx        ← 共通コンポーネント使用
│   ├── PropertyManagementPanel.tsx  ← 共通コンポーネント使用
│   ├── RealEstateIncomeModule.tsx   ← 共通コンポーネント使用
│   ├── CapitalGainModule.tsx        ← 共通コンポーネント使用
│   └── Dashboard.tsx                ← 共通コンポーネント使用
├── App.css                          ← デザイントークン導入
└── index.css                        ← グローバルスタイル整理
```

## 🛠️ 実装手順

### Step 1: デザイントークンの定義（Day 1）

1. **CSS変数の定義**
   - `styles/design-tokens.css` を作成
   - カラーパレット、タイポグラフィ、スペーシング定義

2. **TypeScript定数の作成**
   - `constants/designSystem.ts` を作成
   - JS/TSから参照可能な定数

3. **Tailwind設定の拡張**
   - `tailwind.config.js` にカスタムトークン追加

### Step 2: 共通UIコンポーネント作成（Day 2-4）

#### Day 2: 基本コンポーネント
```typescript
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  children: React.ReactNode;
}

// Input.tsx
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  // ... その他のprops
}
```

#### Day 3: フォーム・データ表示コンポーネント
```typescript
// Select.tsx
// Modal.tsx
// Alert.tsx
```

#### Day 4: 装飾・フィードバックコンポーネント
```typescript
// Badge.tsx
// Tooltip.tsx
// LoadingSpinner.tsx
// ProgressBar.tsx
```

### Step 3: 既存コンポーネントのリファクタリング（Day 5-6）

#### Day 5: モジュールコンポーネント（所得入力系）
- `IncomeExpenseForm.tsx`
- `SalaryIncomeModule.tsx`
- `RSUExchangeModule.tsx`

#### Day 6: モジュールコンポーネント（不動産・レポート系）
- `PropertyManagementPanel.tsx`
- `RealEstateIncomeModule.tsx`
- `CapitalGainModule.tsx`
- `Dashboard.tsx`

### Step 4: スタイルガイド・ドキュメント作成（Day 7）

1. **Storybookのセットアップ（オプション）**
   - 各コンポーネントのストーリー作成
   - インタラクティブなデモ

2. **Markdown ドキュメント**
   - `DESIGN_SYSTEM.md` 作成
   - コンポーネント使用例
   - デザインガイドライン

### Step 5: テスト・調整・最適化（Day 8）

1. **ビジュアルテスト**
   - 全画面の見た目確認
   - レスポンシブ確認

2. **アクセシビリティチェック**
   - キーボードナビゲーション
   - スクリーンリーダー対応

3. **パフォーマンス最適化**
   - React.memo 適用
   - 不要なレンダリング削減

## 📋 コンポーネント仕様例

### Button コンポーネント

```typescript
// components/ui/Button.tsx
import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  color = 'neutral',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const colorStyles = {
    income: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-blue-600 hover:bg-blue-50',
    },
    property: {
      primary: 'bg-green-600 text-white hover:bg-green-700',
      secondary: 'bg-green-100 text-green-700 hover:bg-green-200',
      outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50',
      ghost: 'text-green-600 hover:bg-green-50',
    },
    // ... 他のカラーバリエーション
  };

  const className = clsx(
    baseStyles,
    sizeStyles[size],
    colorStyles[color][variant],
    {
      'w-full': fullWidth,
      'opacity-50 cursor-not-allowed': disabled || loading,
    }
  );

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};
```

### Card コンポーネント

```typescript
// components/ui/Card.tsx
import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  variant?: 'default' | 'bordered' | 'elevated';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  footer,
  color = 'neutral',
  variant = 'default',
  children,
  className,
}) => {
  const colorStyles = {
    income: 'border-blue-200 bg-blue-50',
    property: 'border-green-200 bg-green-50',
    report: 'border-purple-200 bg-purple-50',
    dashboard: 'border-yellow-200 bg-yellow-50',
    neutral: 'border-gray-200 bg-white',
  };

  const variantStyles = {
    default: 'border',
    bordered: 'border-2',
    elevated: 'shadow-lg',
  };

  return (
    <div className={clsx('rounded-lg overflow-hidden', variantStyles[variant], colorStyles[color], className)}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
```

## ✅ チェックリスト

### 実装前
- [ ] Tailwind CSS 設定確認
- [ ] 既存スタイルの棚卸し
- [ ] デザイントークン確定

### Phase 3.1: デザイントークン（Day 1）
- [ ] `design-tokens.css` 作成
- [ ] `designSystem.ts` 作成
- [ ] `tailwind.config.js` 拡張

### Phase 3.2: 共通コンポーネント（Day 2-4）
- [ ] Button コンポーネント
- [ ] Card コンポーネント
- [ ] Input コンポーネント
- [ ] Select コンポーネント
- [ ] Modal コンポーネント
- [ ] Alert コンポーネント
- [ ] Badge コンポーネント
- [ ] Tooltip コンポーネント
- [ ] LoadingSpinner コンポーネント

### Phase 3.3: リファクタリング（Day 5-6）
- [ ] IncomeExpenseForm
- [ ] SalaryIncomeModule
- [ ] RSUExchangeModule
- [ ] PropertyManagementPanel
- [ ] RealEstateIncomeModule
- [ ] CapitalGainModule
- [ ] Dashboard

### Phase 3.4: ドキュメント（Day 7）
- [ ] DESIGN_SYSTEM.md 作成
- [ ] コンポーネント使用例
- [ ] デザインガイドライン

### Phase 3.5: テスト（Day 8）
- [ ] ビジュアルテスト
- [ ] レスポンシブ確認
- [ ] アクセシビリティチェック
- [ ] パフォーマンス最適化

### リリース
- [ ] コミット & プッシュ
- [ ] PR 作成
- [ ] レビュー & マージ

## 📌 重要な注意点

1. **段階的な移行**
   - 既存コンポーネントを一度に書き換えない
   - 新しいコンポーネントから徐々に共通コンポーネントを使用

2. **後方互換性**
   - 既存の機能を壊さないよう注意
   - 段階的にマイグレーション

3. **TypeScript型安全性**
   - すべての共通コンポーネントに適切な型定義
   - Propsインターフェースを明確に

4. **アクセシビリティ**
   - ARIA属性を適切に設定
   - キーボードナビゲーション対応
   - カラーコントラスト比の確保

5. **パフォーマンス**
   - React.memo で不要なレンダリング防止
   - useMemo/useCallback の適切な使用

## 🚀 Phase 4 への展望

Phase 3 完了後、以下の拡張を検討:

1. **ダークモード対応**
   - CSS変数でテーマ切り替え
   - localStorage でユーザー設定保存

2. **アニメーションライブラリ導入**
   - Framer Motion または React Spring
   - 滑らかなページ遷移

3. **多言語対応（i18n）**
   - react-i18next 導入
   - 日本語・英語対応

4. **モバイルアプリ化**
   - React Native 移植検討
   - PWA対応

## 📊 成功指標

- [ ] 全コンポーネントでデザイントークン使用
- [ ] 共通UIコンポーネント8種類以上作成
- [ ] 既存コンポーネント7つ以上リファクタリング
- [ ] ドキュメント作成完了
- [ ] ビルドエラーなし
- [ ] アクセシビリティチェック合格
