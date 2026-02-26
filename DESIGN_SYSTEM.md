# Design System Guide

## 概要

このドキュメントは、Tax Filing Appのデザインシステムを説明します。デザインシステムは、アプリケーション全体で一貫性のある視覚的経験を提供するために設計されています。

---

## 📚 目次

1. [色彩体系](#色彩体系)
2. [タイポグラフィ](#タイポグラフィ)
3. [スペーシング](#スペーシング)
4. [共通UIコンポーネント](#共通UIコンポーネント)
5. [使用方法](#使用方法)
6. [ベストプラクティス](#ベストプラクティス)

---

## 色彩体系

### グループ別カラーパレット

アプリケーションは4つのグループに分類され、各グループに専用のカラーが割り当てられています。

#### 💼 所得入力 - ブルー
```css
Primary: #3B82F6
Light: #EFF6FF
Dark: #1E40AF
```
- 給与所得、RSU所得、基本計算など、所得情報の入力に関連するモジュール

#### 🏠 不動産・資産管理 - グリーン
```css
Primary: #10B981
Light: #ECFDF5
Dark: #047857
```
- 物件管理、不動産所得、売却所得など、資産管理に関連するモジュール

#### 📊 レポート・一覧 - パープル
```css
Primary: #8B5CF6
Light: #F5F3FF
Dark: #6D28D9
```
- RSU所得管理、不動産所得一覧、売却所得一覧など、レポート・分析に関連するモジュール

#### 📈 ダッシュボード - オレンジ
```css
Primary: #F59E0B
Light: #FEF3C7
Dark: #D97706
```
- メインダッシュボードと概要ページ

### セマンティック色

意図や状態を示す色：

| 用途 | 色コード | 用例 |
|------|---------|------|
| Success | #22C55E | 成功メッセージ、完了状態 |
| Error | #EF4444 | エラーメッセージ、警告 |
| Warning | #F59E0B | 注意メッセージ |
| Info | #3B82F6 | 情報メッセージ |

---

## タイポグラフィ

### フォントファミリー

```typescript
// sans-serif (デフォルト)
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...

// monospace (コード表示等)
font-family: 'SF Mono', 'Monaco', 'Inconsolata', ...
```

### フォントサイズ

| サイズ | 値 | 用途 |
|--------|-----|------|
| xs | 12px (0.75rem) | キャプション |
| sm | 14px (0.875rem) | ボタン、ラベル |
| base | 16px (1rem) | 本文 |
| lg | 18px (1.125rem) | サブタイトル |
| xl | 20px (1.25rem) | セクションタイトル |
| 2xl | 24px (1.5rem) | ページタイトル |
| 3xl | 30px (1.875rem) | 大タイトル |

### フォントウェイト

| Weight | 値 | 用途 |
|--------|-----|------|
| Normal | 400 | 本文 |
| Medium | 500 | ボタン、ラベル |
| Semibold | 600 | サブタイトル |
| Bold | 700 | タイトル |

### 行高

| 値 | 用途 |
|----|------|
| 1.25 (tight) | 短いテキスト |
| 1.5 (normal) | 標準テキスト |
| 1.75 (relaxed) | 長いテキスト |

---

## スペーシング

一貫したスペーシング体系を使用しています：

```typescript
4px = 1 unit
8px = 2 units
12px = 3 units
16px = 4 units (base)
...
```

| Spacing | ピクセル | 用途 |
|---------|----------|------|
| xs | 4px | 細部 |
| sm | 8px | 小さい間隔 |
| md | 16px | 標準間隔 |
| lg | 24px | 大きい間隔 |
| xl | 32px | セクション間隔 |

---

## 共通UIコンポーネント

### Button

ボタンコンポーネントは複数のバリエーションをサポートしています。

**Props:**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**使用例:**

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary" color="income">
  登録する
</Button>

// Secondary button with icon
<Button variant="secondary" color="property" leftIcon={<SaveIcon />}>
  保存
</Button>

// Outline button
<Button variant="outline" color="report">
  キャンセル
</Button>

// Large button
<Button size="lg" color="dashboard">
  ダッシュボード
</Button>

// Loading state
<Button loading>
  処理中...
</Button>
```

### Card

カード状のコンテナコンポーネント。

**Props:**

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  variant?: 'default' | 'bordered' | 'elevated';
}
```

**使用例:**

```tsx
import { Card } from '@/components/ui';

// Basic card
<Card title="給与所得" color="income">
  <p>給与情報の詳細</p>
</Card>

// Card with footer
<Card
  title="物件情報"
  color="property"
  footer={<Button>編集</Button>}
>
  <p>物件の詳細情報</p>
</Card>

// Elevated card
<Card variant="elevated" color="report">
  <p>レポート内容</p>
</Card>
```

### Input

入力フィールドコンポーネント。

**Props:**

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**使用例:**

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input
  label="給与額"
  type="number"
  placeholder="500万円"
/>

// Input with error
<Input
  label="メールアドレス"
  type="email"
  error="無効なメールアドレスです"
/>

// Input with icon
<Input
  label="金額"
  leftIcon={<DollarIcon />}
  placeholder="1000000"
/>
```

### Select

セレクトボックスコンポーネント。

**Props:**

```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}
```

**使用例:**

```tsx
import { Select } from '@/components/ui';

<Select
  label="年度"
  options={[
    { value: '2024', label: '2024年' },
    { value: '2025', label: '2025年' },
  ]}
  placeholder="選択してください"
/>
```

### Modal

モーダルダイアログコンポーネント。

**Props:**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
}
```

**使用例:**

```tsx
import { Modal, Button } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>開く</Button>
  
  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="確認"
    size="md"
    footer={
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          キャンセル
        </Button>
        <Button color="income">確認</Button>
      </div>
    }
  >
    <p>本当に削除しますか？</p>
  </Modal>
</>
```

### Alert

アラート・通知コンポーネント。

**Props:**

```typescript
type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
}
```

**使用例:**

```tsx
import { Alert } from '@/components/ui';

// Success alert
<Alert
  variant="success"
  title="成功"
  message="データが正常に保存されました"
/>

// Error alert
<Alert
  variant="error"
  message="エラーが発生しました"
  closable
  onClose={handleClose}
/>

// Info alert
<Alert
  variant="info"
  title="情報"
  message="これは重要な情報です"
/>
```

### Badge

バッジ・ラベルコンポーネント。

**Props:**

```typescript
interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}
```

**使用例:**

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">完了</Badge>
<Badge variant="warning" size="lg">注意</Badge>
<Badge variant="error" size="sm">エラー</Badge>
```

---

## 使用方法

### インポート

```typescript
// 個別インポート
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';

// 一括インポート
import { Button, Card, Input, Select, Modal, Alert, Badge } from '@/components/ui';
```

### デザイントークンの使用

**CSS変数:**

```css
/* 色 */
color: var(--color-income-500);
background: var(--color-property-100);

/* スペーシング */
padding: var(--spacing-4);
margin: var(--spacing-lg);

/* 他 */
font-size: var(--font-size-lg);
border-radius: var(--radius-md);
box-shadow: var(--shadow-lg);
```

**TypeScript定数:**

```typescript
import { colors, spacing, fontSize } from '@/constants/designSystem';

const buttonStyle = {
  backgroundColor: colors.income[500],
  padding: spacing[4],
  fontSize: fontSize.lg,
};
```

---

## ベストプラクティス

### 1. 一貫性を保つ

- デザイントークンを使用して、カラーやスペーシングを一貫させる
- 新しい色やサイズを定義する前に、既存のトークンで対応できないか確認

### 2. アクセシビリティを考慮

- カラーコントラスト比は最低 4.5:1 を保つ
- テキストサイズは最低 12px
- フォーカス状態を適切に実装する

### 3. レスポンシブデザイン

```tsx
<div className="
  px-4 py-2        // mobile
  md:px-6 md:py-4  // tablet
  lg:px-8 lg:py-6  // desktop
">
  ...
</div>
```

### 4. コンポーネントの再利用

新しい要素を追加する前に、既存の共通コンポーネントで対応できるか検討してください。

### 5. 型安全性

```typescript
// Good: 型定義を使用
<Button variant="primary" color="income" />

// Avoid: 文字列リテラル
<Button variant={"primary"} color={"income"} />
```

---

## 拡張とカスタマイズ

### 新しい色の追加

1. `design-tokens.css` に CSS変数を追加
2. `designSystem.ts` にTypeScript定数を追加
3. 必要に応じてコンポーネントのバリアントを拡張

### 新しいコンポーネントの作成

1. `components/ui/` に新しいコンポーネントファイルを作成
2. `components/ui/index.ts` にエクスポート追加
3. このドキュメントに使用例を追加

---

## ダークモード対応（将来の実装）

CSS変数を使用しているため、ダークモード対応は以下のように実装可能：

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #ffffff;
    --color-bg-primary: #1a1a1a;
    /* ... other dark mode variables ... */
  }
}
```

---

## 参考資料

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens Community](https://design-tokens.github.io/community-group/)

---

**最終更新**: 2026年2月23日
**バージョン**: Phase 3 (TX-18)
