# フロントエンド Atomic Design 設計ドキュメント

> **Note**
> 本ドキュメントはフロントエンド開発における基本的な方針・設計指針を示したものです。
> 実際の実装においては、プロジェクトの要件・規模・チーム構成に応じて方針や構造を最適化する必要があります。
> ここに記載された内容をベースラインとして、各プロジェクトで適切にカスタマイズしてください。

## 目次

0. [環境構築](#0-環境構築)
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

## 0. 環境構築

### 技術スタック

| カテゴリ | ツール |
|---------|--------|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| UIプリミティブ | shadcn/ui |
| バリアント管理 | tailwind-variants |
| パッケージマネージャー | pnpm |
| モノレポ管理 | Turborepo |

### Storybook

コンポーネントのカタログ化・開発・テストに使用

#### セットアップ

```bash
pnpm add -D storybook @storybook/react-vite
pnpm dlx storybook init
```

#### 設定ファイル

```
.storybook/
├── main.ts          # Storybook設定
├── preview.ts       # グローバルデコレーター
└── preview-head.html # カスタムhead要素
```

#### 運用方針

- 各コンポーネントに`*.stories.tsx`を作成
- Atoms/Moleculesは必須、Organisms以上は任意
- インタラクションテストを活用

### CI/CD

#### リグレッションテスト

**ビジュアルリグレッションテスト（VRT）**

| ツール | 用途 |
|--------|------|
| Chromatic | Storybookベースのビジュアル差分検出 |
| Percy | スナップショット比較 |
| Playwright | E2Eでのスクリーンショット比較 |

```yaml
# GitHub Actions例
- name: Visual Regression Test
  run: pnpm chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

**コンポーネントテスト**

```yaml
- name: Storybook Test
  run: |
    pnpm build-storybook
    pnpm test-storybook
```

#### CI パイプライン構成

```
PR作成時:
├── Lint (ESLint, Prettier)
├── Type Check (tsc)
├── Unit Test (Vitest)
├── Storybook Build
└── Visual Regression Test

マージ時:
├── Production Build
└── Storybook Deploy
```

### Linter / Formatter

| ツール | 用途 |
|--------|------|
| ESLint | コード品質チェック |
| Prettier | コードフォーマット |
| stylelint | CSSリント（任意） |

#### 推奨ESLint設定

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:storybook/recommended"
  ]
}
```

### 開発環境セットアップ手順

```bash
# 1. リポジトリクローン
git clone <repository-url>

# 2. 依存関係インストール
pnpm install

# 3. 開発サーバー起動
pnpm dev

# 4. Storybook起動
pnpm storybook
```

### 推奨VSCode拡張

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

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

> 参考: [Atomic Design - Brad Frost](https://atomicdesign.bradfrost.com/table-of-contents/)

#### Atoms（原子）

> "If atoms are the basic building blocks of matter, then the atoms of our interfaces serve as the foundational building blocks that comprise all our user interfaces."

- UIを構成する最小単位のパーツ
- 自分が何に使われるかは知らない
- UIとしての姿があるなしは関係ない（container/provider的なものも含む）
- `atoms/structure`という構造を置く場所を用意する

**例:** Button, Input, Label, Icon, Typography

#### Molecules（分子）

> "In interfaces, molecules are relatively simple groups of UI elements functioning together as a unit. For example, a form label, search input, and button can join together to create a search form molecule."

- いくつかのAtom（またはMolecule）を組み合わせて構成
- Web UIの知識や機能を持つが、特定のプロダクトについての知識を持たない
- 自分は何ができるのかは知っている（表示しているもの、ボタンを押した時の挙動など）
- 自分が何に使われているのかは知らない
  - 表示しているものが何を構成しているのかは知らない
  - ボタンを押すとどうするかはわかるが、その結果がどうなるかは知らない
- いくらかの複雑性はもつが、これ単体では成立しない
- **ここまでは共通パーツとして使いまわせる**

**例:** FormField, SearchBox, Card, MenuItem

#### Organisms（有機体）

> "Organisms are relatively complex UI components composed of groups of molecules and/or atoms and/or other organisms. These organisms form distinct sections of an interface."

- 特定のプロダクトについての知識を持つ
- **プロダクト間では使いまわせない**
- それ単体でWebサイト内で存在できる
- 何をするものかが一目でわかる（プロダクト的な意味で）

**例:** Header, Footer, Navigation, Form, List

#### Templates（テンプレート）

- レイアウトの骨組み
- ヘッダーやサイドバーの組み合わせを配置
- スケルトンはここに配置
- 中身はchildrenとして受け取る

**例:** PageLayout, AuthLayout, DashboardLayout

#### Pages（ページ）

- 完成品
- Templateとページ固有のOrganismを配置
- Templateにchildrenとしてそのページのorganismsを配置して完成

#### レイヤー間の関係図

```
Pages
  └── Templates (レイアウト)
        └── Organisms (プロダクト固有)
              └── Molecules (汎用・組み合わせ)
                    └── Atoms (最小単位)
```

**重要:** 設計に関しては都度認識合わせをすることを基本とする

### 構造（Structure）とは

空間の並び・配置・流れ・骨格を定義し、DOM構造に影響を与えるもの

#### atoms/structureに該当するもの

- DOM構造や要素の空間的配置に直接影響を与える
- Flex/Grid/Flow/Positionの概念に基づいている
- レイアウト上の並び方を定義している

#### structureではないもの

- スタイリング（見た目の微調整）にとどまっている
- 特定のコンポーネント内でしか使われない

#### Storybookでデザインを作るもの/作らないもの

| 分類 | Storybookでデザインあり | Storybookでデザインなし |
|------|------------------------|------------------------|
| 説明 | 見た目のコンポーネント、structureのコンポーネント | プロバイダーなどのコンポーネント、スタイリング優先のコンポーネント |
| 例 | Button, Card, Grid | ThemeProvider, DialogFooter, BreadcrumbList |

**デザインがない対象:**
- プロバイダーなどのコンポーネント
- スタイリング（見た目）を優先したコンポーネント
- 構造を持っているが特定のコンポーネント下でしか使われないもの

### ディレクトリ構造

```
packages/ui/src/
├── components/
│   ├── atoms/
│   │   └── structure/    # 構造を定義するatoms
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── pages/
└── primitives/           # shadcn/ui コンポーネント
```

### Primitivesディレクトリ

#### 基本原則

1. **primitives配下は改造しない** - 提供されている状態を保持
2. **コマンド実行のみでアップデート可能な状態を維持** - shadcnのアップデートコマンドで更新できる状態とする
3. 依存関係に手を加えずに対応
4. primitives配下での分解は行わない

#### shadcnインストール後のコード運用

- React上で非推奨になっているAPIの対応について、基本的に編集しない
- ただし、以下の場合に限り対応を検討:
  - 警告は許容しつつ、アップデートで対応されるタイミングを待つ
  - 将来的にRadix UIの更新で破壊的変更が発生した際にビルドが落ちるリスクがある
  - shadcn/ui側の更新を定期的に確認し、必要に応じて再生成・差分適用する運用とする

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

### UIコンポーネントの責務

#### 基本原則

**UIコンポーネントは「propsで受け取った値を表示する」ことに専念する**

```tsx
// ✅ 良い例: propsを受け取って表示するだけ
function UserCard({ name, email, avatarUrl }: UserCardProps) {
  return (
    <div className="card">
      <img src={avatarUrl} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// ❌ 避けるべき: コンポーネント内でデータ取得
function UserCard({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(res => res.json()).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

#### UIコンポーネントで避けるべきこと

| 避けるべき | 理由 |
|-----------|------|
| `useEffect`でのデータ取得 | SSRで動作しない、テストが困難 |
| `useEffect`での副作用実行 | 責務が不明確になる |
| グローバル状態への直接アクセス | 再利用性が低下 |
| API呼び出し | UIとデータ層の結合 |
| 複雑なビジネスロジック | テスト・保守が困難 |

#### 責務の分離パターン

```
┌─────────────────────────────────────────────────────┐
│ Page (SSR)                                          │
│  - データ取得                                        │
│  - 初期状態の決定                                    │
└─────────────────────────────────────────────────────┘
                        ↓ props
┌─────────────────────────────────────────────────────┐
│ ClientAdapter ("use client")                        │
│  - インタラクティブな状態管理                         │
│  - イベントハンドラの定義                            │
│  - useEffect（必要最小限）                           │
└─────────────────────────────────────────────────────┘
                        ↓ props
┌─────────────────────────────────────────────────────┐
│ UI Component (純粋なReactコンポーネント)             │
│  - propsを受け取って表示                             │
│  - イベントをコールバックで通知                       │
│  - 状態を持たない or UIのみの状態(hover等)           │
└─────────────────────────────────────────────────────┘
```

#### useEffectの使用指針

**原則: UIコンポーネントではuseEffectを使用しない**

許可されるケース:
- フォーカス管理（アクセシビリティ対応）
- スクロール位置の制御
- アニメーションのトリガー
- サードパーティライブラリとの連携

```tsx
// ✅ 許可される例: フォーカス管理
function Dialog({ isOpen, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  return <div ref={dialogRef} tabIndex={-1}>{children}</div>;
}
```

### Hooksの切り出しルール

- `useXxx`で始まるカスタムフックは、必ずUIコンポーネント本体から分離して配置
- **責務分離**: 描画（JSX）とロジック（状態・副作用）を物理的に切り分け
- **テスト容易性**: UIを描画せずにロジックだけをユニットテスト可能
- JSXが並ぶファイルにロジックを直書きしない
- フックに型・テスト・モックが必要な場合は、フックと同じディレクトリに近接配置する
- 配置形式（`index.hooks.ts`か`hooks/useXxx/index.ts`）は検討中

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
- [UIライブラリ選定について](./docs/ui-library/index.md)
