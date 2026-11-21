# パッケージ構成（モノレポ）

> pnpm workspaces + Turborepo。実体は [`prototype/`](../../prototype/README.md)。

---

## ディレクトリ

```
.
├── apps/
│   ├── web/              # Next.js（App Router）。Client と BFF（/api/*）を同梱
│   └── api-server/       # Hono。ドメイン / usecase / repository
├── packages/
│   ├── ui/               # デザインシステム（Atomic Design）。Next.js 非依存
│   └── tsconfig/         # 共有 tsconfig（base / nextjs / react-library / node）
├── package.json          # ルート。turbo のタスクだけを持つ
├── pnpm-workspace.yaml
└── turbo.json
```

将来追加しうるパッケージ:

| パッケージ             | 追加する契機                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `packages/database`    | DB スキーマ・マイグレーションを api-server 以外（seed スクリプト等）からも使うとき |
| `packages/eslint-config` | アプリが 3 つ以上になり、lint 設定の重複が目立ったとき       |
| `apps/bff-ios` 等      | Web 以外のクライアントが増えたとき（[BFF 設計](../bff/index.md#マルチクライアント展望)） |

---

## apps と packages の違い

|                | apps                              | packages                                  |
| -------------- | --------------------------------- | ----------------------------------------- |
| デプロイ単位か | ○                                 | ×                                         |
| 環境変数       | 持つ                              | 持たない（必要な値は引数で受け取る）      |
| 他から依存されるか | 原則されない（例外: 型のみの公開） | される                                    |

---

## 依存ルール

```
apps/web ──▶ packages/ui
apps/web ──▶ @repo/api-server/client（型のみ・devDependency）
apps/api-server ──▶ （packages/database）
packages/ui ──▶ 外部ライブラリのみ
```

- 内部依存は `"workspace:*"` で宣言する。
- **packages → apps の依存は禁止**。
- **apps → apps の依存は「型のみ」に限る**。値の import はビルド成果物にサーバーコードを混入させる。
- `packages/ui` は `next`・`hono`・BFF の型に依存しない。UI は自分の値型（例: `ProfileEditorValues`）だけを公開し、BFF リクエスト型への写像は `apps/web` の hook が持つ。

---

## 型契約の共有

BFF が api-server を呼ぶときの型は、api-server の Hono app 型（`AppType`）から `hc<AppType>` で導出する。

```jsonc
// apps/api-server/package.json
{
  "name": "@repo/api-server",
  "exports": {
    "./client": { "types": "./src/client.ts" }
  }
}
```

```ts
// apps/api-server/src/client.ts
export type { AppType } from "./app";
```

```ts
// apps/web/src/utils/client/index.ts
import type { AppType as ApiServerAppType } from "@repo/api-server/client";
```

- 公開面は `src/client.ts` の 1 ファイル。ここに無いものは web から見えない。
- `import type` だけを許可する（`exports` に `default` 条件を書かないことで値 import を解決不能にする）。
- BFF 自身の型（`apps/web/src/app/api/[[...route]]/app.ts` の `AppType`）は fetchers だけが使う。

---

## packages/ui の公開面

Atomic Design の層ごとに subpath export する。

```jsonc
{
  "exports": {
    "./atoms/*": "./src/components/atoms/*/index.tsx",
    "./molecules/*": "./src/components/molecules/*/index.tsx",
    "./organisms/*": "./src/components/organisms/*/index.tsx",
    "./templates/*": "./src/components/templates/*/index.tsx",
    "./styles.css": "./src/styles.css"
  }
}
```

```ts
import { Button } from "@repo/ui/atoms/Button";
import { ProfileEditor } from "@repo/ui/organisms/ProfileEditor";
```

- ビルドせずソースのまま配布し、`next.config.ts` の `transpilePackages` で web 側がトランスパイルする（内部パッケージ = Just-in-Time パッケージ）。
- `pages` 層は `packages/ui` に置かない。ページの組み立ては `apps/web` の `page.tsx` が担う（[Client 構成](../client/index.md)）。

---

## Turborepo タスク

| タスク        | 依存            | 備考                                   |
| ------------- | --------------- | -------------------------------------- |
| `build`       | `^build`        | `.next/**`・`dist/**` をキャッシュ      |
| `check-types` | `^check-types`  | 各パッケージで `tsc --noEmit`           |
| `test`        | なし            | vitest                                 |
| `dev`         | なし            | `persistent: true`・`cache: false`     |

アプリ固有の環境変数は `turbo.json` の `tasks["{app}#build"].env` に列挙する（キャッシュキーに含めるため）。
