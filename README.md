# フロントエンド設計ベースライン

Next.js（App Router）+ BFF + API サーバー構成のフロントエンドを作るときの、**設計指針**と**それを実装した最小構成**をまとめたリポジトリ。

> **Note**
> ここに書いた内容はベースラインです。プロジェクトの要件・規模・チーム構成に応じてカスタマイズしてください。

---

## 全体像

```
Client（page.tsx / ClientAdapter / packages/ui）
   │  fetchers 経由でのみ HTTP
   ▼
BFF（apps/web の /api/*）     画面単位で集約・整形・そぎ落とし。write はパススルー
   │  hono client（型は api-server から導出）
   ▼
Backend（apps/api-server）    ドメイン / usecase / repository
```

| 層      | 置き場                               | 責務                                   |
| ------- | ------------------------------------ | -------------------------------------- |
| Client  | `apps/web/src/app/**`・`packages/ui` | 描画とユーザー操作の受け取り           |
| BFF     | `apps/web/src/app/api/[[...route]]`  | 画面が必要とする形への変換、境界の検証 |
| Backend | `apps/api-server`                    | ビジネスルール、不変条件、永続化       |

詳しくは [全体アーキテクチャ](./docs/architecture/index.md)。

---

## クイックスタート

Node.js 22 以上が必要。pnpm が無い場合は corepack で入る。

```bash
./setup.sh                 # 依存インストール → .env.local 作成 → 型チェック・テスト
cd prototype && pnpm dev
```

| URL                                 | 内容                       |
| ----------------------------------- | -------------------------- |
| http://localhost:3000/profile       | 画面（表示名の表示・更新） |
| http://localhost:3000/api/profile   | BFF read route             |
| http://localhost:3001/api/users/u_1 | api-server                 |

```bash
pnpm check-types   # 全パッケージの型チェック
pnpm test          # api-server: usecase / web: BFF route
```

プロトタイプの詳細（リクエストの流れ・省いているもの）は [`prototype/README.md`](./prototype/README.md)。

---

## リポジトリ構成

```
.
├── docs/                  # 設計ドキュメント（下の一覧）
├── prototype/             # docs の構成を実装した最小モノレポ（pnpm + Turborepo）
│   ├── apps/web/          #   Next.js：Client + BFF
│   ├── apps/api-server/   #   Hono：domain / usecases / infrastructure
│   ├── packages/ui/       #   Atomic Design のコンポーネント
│   └── packages/tsconfig/ #   共有 tsconfig
└── setup.sh               # prototype のセットアップ
```

---

## ドキュメント一覧

### アーキテクチャ（Client / BFF / Backend）

| ドキュメント                                       | 内容                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| [全体アーキテクチャ](./docs/architecture/index.md) | 3 層の責務・依存の方向・データフロー・構成上の設計判断                   |
| [パッケージ構成](./docs/packages/index.md)         | モノレポ構成、依存ルール、型契約の共有                                   |
| [Client 構成](./docs/client/index.md)              | page.tsx / ClientAdapter / hooks / fetchers の責務分離、状態管理、テスト |
| [BFF 設計](./docs/bff/index.md)                    | read は厚く write は薄く、エラー契約、マルチクライアント展望             |
| [Backend 構成](./docs/backend/index.md)            | api-server のレイヤーと BFF との契約                                     |

### UI

| ドキュメント                                               | 内容                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| [環境構築](./docs/environment/index.md)                    | 技術スタック、Storybook、CI/CD、Linter 設定                         |
| [アプリケーション方針](./docs/application-policy/index.md) | SEO 対策、SSR / CSR の選択基準                                      |
| [コンポーネント設計](./docs/component-design/index.md)     | Atomic Design、UI コンポーネントの責務、Storybook、アクセシビリティ |
| [Tailwind CSS 実装規約](./docs/tailwind/index.md)          | スタイリング方針、クラス名の結合                                    |
| [レスポンシブ対応](./docs/responsive/index.md)             | ブレイクポイント、コンテンツ幅、画像のアスペクト比                  |
| [UI ライブラリ選定](./docs/ui-library/index.md)            | Headless UI、shadcn/ui、スタイル付きライブラリの比較                |

### 読む順番

1. 初めて読む：全体アーキテクチャ → パッケージ構成
2. 画面を作る：Client 構成 → コンポーネント設計 → Tailwind CSS 実装規約
3. データの取得・更新を作る：BFF 設計 → Backend 構成

---

## 参考資料

- [Atomic Design - Brad Frost](https://atomicdesign.bradfrost.com/table-of-contents/)
- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [Turborepo](https://turborepo.com/docs)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/colors)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
