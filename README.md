# フロントエンド Atomic Design 設計ドキュメント

## 目次

1. [アプリケーション方針](#1-アプリケーション方針)
2. [実装の前提](#2-実装の前提)
3. [Tailwind CSS実装規約](#3-tailwind-css実装規約)
4. [レスポンシブ対応](#4-レスポンシブ対応)
5. [コンポーネント設計](#5-コンポーネント設計)
6. [状態管理](#6-状態管理)
7. [パフォーマンス最適化](#7-パフォーマンス最適化)
8. [アクセシビリティ](#8-アクセシビリティ)
9. [開発・運用規約](#9-開発運用規約)
10. [禁止事項](#10-禁止事項)

---

## 1. アプリケーション方針

### SEO対策が必要なアプリケーション

- **SSRでの実装を前提**とする
- **モバイルファースト**: レスポンシブ実装
- **パフォーマンス重視**: 初回表示速度とSEOスコアの最適化

### 管理画面・内部ツール

- **SEO不要**: ログイン後に使用するためSEO対策は不要
- **CSR可能**: ユーザビリティと開発効率を重視したクライアントサイドレンダリングも選択可能
- **デスクトップ最適化**: 主にPC環境での使用を想定

---

## 2. 実装の前提

### Next.js App Router準拠

- 各`page.tsx`では**Server Side Rendering (SSR)**を基本とする
- クライアントサイド処理が必要な場合は、adapterを用いて`"use client"`ディレクティブを明示的に記述

### 実装パターン

#### SSRのみの場合

```tsx
import ComponentPage from "@ui/design-system/components/pages/ComponentPage";

export default function Page() {
  return <ComponentPage />;
}
```

#### SSR + CSR（動的な動きが必要な場合）

```tsx
// page.tsx
import { ClientAdapter } from "./ClientAdapter";

export default async function Page() {
  const data = await fetch('/api/data');
  const initialData = await data.json();
  return <ClientAdapter initialData={initialData} />;
}

// ClientAdapter/index.tsx
"use client";
import { useState } from "react";
import ComponentPage from "@ui/design-system/components/pages/ComponentPage";

export function ClientAdapter({ initialData }: ClientAdapterProps) {
  const [data, setData] = useState(initialData);
  return (
    <ComponentPage
      data={data}
      onDataUpdate={setData}
    />
  );
}
```

---

## 3. Tailwind CSS実装規約

### 基本方針

- **カスタム定義は使用禁止** - Tailwindの標準クラスのみ使用
- `tailwind.config.ts`でのカスタマイズは最小限に留める
- カラー定義: https://tailwindcss.com/docs/colors

### 許可されるスタイリング方法

```tsx
// ✅ 良い例
className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-lg"

// ❌ 避けるべき
className="custom-button-style"           // カスタムクラス
className="text-[#カラーコード]"           // 任意値指定
style={{ backgroundColor: '#custom' }}   // インラインスタイル
```

### クラス名の結合

- `cn()`ユーティリティ関数を使用してクラス名を結合

---

## 4. レスポンシブ対応

### ブレイクポイント体系

```tsx
md: 768px   // SP・PC切り替え
```

- このブレイクポイントでUIの動きが不自然な場合はデザイナーと協議すること

### メインコンテンツ領域

- **最大表示幅**: 1280px

### コンテンツ幅の指定

- `w-◯◯/1280`形式で設定（◯◯はそのコンテンツの幅）
- 例: `w-956/1280`

**従来の課題:**
- `%`指定（例: `w-[74.6875%]`）では手動計算が必要で非効率
- 記述の一貫性が保ちづらい

**対応方針:**
- `w-(<幅>/<ベース幅>)`形式で直感的に表現
- 親幅に対する比率が明示的かつ再利用しやすい

### 画像のアスペクト比

Tailwind CSSの`aspect-ratio`ユーティリティを使用:

```html
<div class="aspect-16/9">
  <img src="..." alt="..." class="w-full h-full object-cover" />
</div>
```

**メリット:**
- 読み込み前でも高さが確保され、レイアウトのズレを防止
- アスペクト比を保ったままレスポンシブ対応が可能
- 複数画像の高さが揃い、見た目の一貫性が保たれる

---

## 5. コンポーネント設計

### Atomic Designの定義

#### Atoms（原子）

- UIを構成する最小単位のパーツ
- 自分が何に使われるかは知らない
- UIとしての姿があるなしは関係ない（container/provider的なものも含む）
- `atoms/structure`という構造を置く場所を用意する

#### Molecules（分子）

- いくつかのAtom（またはMolecule）を組み合わせて構成
- Web UIの知識や機能を持つが、特定のプロダクトについての知識を持たない
- 自分は何ができるのかは知っている
- 自分が何に使われているのかは知らない
- **ここまでは共通パーツとして使いまわせる**

#### Organisms（有機体）

- 特定のプロダクトについての知識を持つ
- **プロダクト間では使いまわせない**
- それ単体でWebサイト内で存在できる

#### Templates（テンプレート）

- レイアウトの骨組み
- ヘッダーやサイドバーの組み合わせを配置
- スケルトンはここに配置

#### Pages（ページ）

- 完成品
- Templateとページ固有のOrganismを配置

### 構造（Structure）とは

空間の並び・配置・流れ・骨格を定義し、DOM構造に影響を与えるもの

#### atoms/structureに該当するもの

- DOM構造や要素の空間的配置に直接影響を与える
- Flex/Grid/Flow/Positionの概念に基づいている
- レイアウト上の並び方を定義している

#### structureではないもの

- スタイリング（見た目の微調整）にとどまっている
- 特定のコンポーネント内でしか使われない

### ディレクトリ構造

```
packages/ui/src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── pages/
└── primitives/
```

### Primitivesディレクトリ

#### 基本原則

1. **primitives配下は改造しない** - 提供されている状態を保持
2. **コマンド実行のみでアップデート可能な状態を維持** - shadcnのアップデートコマンドで更新できる状態とする
3. 依存関係に手を加えずに対応

### デザイントークン

#### カラー定義

**基本方針:**
- 色はCSS変数で定義
- OKLCH形式を採用

**globals.css:**
```css
:root {
  --primary: oklch(0.21 0.006 285.885);
}

@theme inline {
  --color-primary: var(--primary);
}
```

**tailwind.config.js:**
```js
colors: {
  primary: "var(--color-primary)",
}
```

### 命名規則

- **コンポーネント**: PascalCase（例: `PlayerCard`）
- **ファイル構成**: 関連するものは同一ディレクトリ内に配置
  - `index.tsx`
  - `index.stories.ts(tsx)`
  - `index.variants.ts`

### バリアント管理

#### Atoms / Molecules

```tsx
import { tv } from "tailwind-variants";

export const cardVariants = tv({
  base: "rounded-lg border bg-card text-card-foreground shadow-sm",
  variants: {
    variant: {
      default: "bg-white/5 border-white/10",
      elevated: "bg-white/10 border-white/20 shadow-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
```

#### Organisms / Templates / Pages

- classNameに直接記述
- スタイリング管理が必要な場合のみvariantsを定義

### Hooksの切り出しルール

- `useXxx`で始まるカスタムフックは、必ずUIコンポーネント本体から分離して配置
- **責務分離**: 描画（JSX）とロジック（状態・副作用）を物理的に切り分け
- **テスト容易性**: UIを描画せずにロジックだけをユニットテスト可能
- JSXが並ぶファイルにロジックを直書きしない

### Storybookの役割分類

#### ユーザーに見えるもの

- ユーザーが実際に見る・操作する要素
- **サンプル内容あり**でStorybookに表示
- 単体で意味を持つ

**レビューポイント:**
- デザインシステムやFigma通りか
- ホバー・フォーカスなど状態は適切か
- サンプル内容が実際の使用を想定できるか

#### レイアウト・連携コンポーネント

- 状態管理やラッパーなど、枠組みを提供する要素
- **内容なし（空）**でStorybookに表示
- 子要素を置いて初めて意味を持つ

**レビューポイント:**
- 何も表示されないことが正しいか
- エラーなく動作しているか
- 依存するコンポーネントとの連携が正しく組まれているか

### Storybook設計方針

- **Moleculeのストーリーでは使い方を表現する**
- ただし、Input系はその限りではない:
  - **DropdownMenu / Dialog / AlertDialog**: 構造・レイアウトを定義 → 組み合わせパターンを見せる
  - **Select / RadioGroup / Input**: データを入れる器 → 器の形を見せれば十分

### コンポーネント設計原則

- コンポーネントのあり方は議論するが、デザインの是非は議論しない
- **Moleculeまでは汎用コンポーネントを目指す**
  - プロダクト特有のデザインは当てない
  - 特有のデザインを当てる場合は、外側で当てるかpropsとして渡せるようにする

---

## 6. 状態管理

### クライアント状態

- React標準hooks（`useState`, `useReducer`）を使用
- Next.jsに依存しないこと
- `use client`や`next/~~~~`を用いた実装を行わない

### サーバー状態

- page.tsx（SSR）で初期データ取得を行う

### グローバル状態

- （未定義）

### 既存実装の課題

- インタラクティブなコンポーネントは`use client`を用いて実装
  - CSRのインターフェースを介する検討が必要
- `next/Link`、`next/Image`などが使用できないため最適化されていない
  - Reactベースでの代替実装が必要

---

## 7. パフォーマンス最適化

### 画像最適化

- （未定義）

### バンドル最適化

- （未定義）

---

## 8. アクセシビリティ

### ARIA属性

- セマンティックHTML要素の優先使用

---

## 9. 開発・運用規約

### TypeScript

- 厳格な型定義を必須とする
- Props interfaceの適切な定義

### テスト

- Storybookでのコンポーネント単体テスト
- 主要機能の結合テスト

### パフォーマンス監視

- （未定義）

---

## 10. 禁止事項

### 技術的制約

- カスタムCSS定義の追加
- Tailwindの標準クラス外の使用

### 実装制約

- 過度に複雑なコンポーネント構造
- 不適切なuseEffectの使用

---

## 参考資料

- [Atomic Design - Brad Frost](https://atomicdesign.bradfrost.com/table-of-contents/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/colors)
