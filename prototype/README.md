# prototype

[`docs/architecture`](../docs/architecture/index.md) の Client / BFF / Backend 構成を、動く最小のコードで示すモノレポ。
題材は「自分のプロフィール（表示名）を表示・更新する」1 画面だけ。

## 構成

```
prototype/
├── apps/
│   ├── web/          # Next.js。Client（app/**）+ BFF（app/api/[[...route]]）
│   └── api-server/   # Hono。domain / usecases / infrastructure（インメモリ repository）
└── packages/
    ├── ui/           # Atomic Design（atoms / molecules / organisms / templates）
    └── tsconfig/     # base / node / react-library / nextjs
```

## 1 リクエストの流れ

| 操作 | 経路 |
| --- | --- |
| 表示（read） | `app/profile/page.tsx` → `fetchers/profile/getProfileScreen` → `GET /api/profile`（BFF: name / email だけにそぎ落とし）→ `GET api-server /api/users/:userId` |
| 更新（write） | `ProfileEditorClientAdapter` → `hooks/useUpdateMyName` → `fetchers/users/updateMyName` → `PATCH /api/users/me/name`（BFF: zod 検証 → `me` を ID に解決 → 素通し）→ `PATCH api-server /api/users/:userId/name` |

## 起動

```bash
# リポジトリのルートで
./setup.sh          # Node/pnpm の確認 → pnpm install → .env.local 作成 → 型チェック・テスト
cd prototype && pnpm dev   # web: http://localhost:3000/profile / api-server: http://localhost:3001
```

`setup.sh` は何度実行しても安全（既存の `.env.local` は上書きしない）。

```bash
pnpm check-types    # 全パッケージの型チェック
pnpm test           # api-server: usecase / web: BFF route
```

## 意図的に省いているもの

| 省略                     | 本番で置き換えるもの                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| 認証                     | `shared/session/getDemoSession` を Auth0 等のセッション解決に置き換える |
| DB                       | `infrastructure/repositories/inMemoryUserRepository` を Drizzle 等の実装に置き換える（`packages/database` を追加） |
| Storybook / Lint / VRT   | [環境構築](../docs/environment/index.md) に従って追加する               |
| フォームライブラリ       | 入力項目が増えたら react-hook-form を organism 内に導入する             |
