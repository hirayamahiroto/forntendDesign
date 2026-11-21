# 全体アーキテクチャ（Client / BFF / Backend）

> プロジェクト非依存のベースラインとしての構成指針。各プロジェクトの要件に応じてカスタマイズすること。
> 動く最小構成は [`prototype/`](../../prototype/README.md) にある。

---

## 3 つの層

```
┌──────────────────────────────┐
│ Client（apps/web の UI 部分）   │  page.tsx / ClientAdapter / hooks / packages/ui
└──────────────┬───────────────┘
               │ HTTP（fetchers 経由のみ）
┌──────────────▼───────────────┐
│ BFF（apps/web の /api/*）       │  画面単位の集約・整形・そぎ落とし / write はパススルー
└──────────────┬───────────────┘
               │ HTTP（hono client / 型は api-server から導出）
┌──────────────▼───────────────┐
│ Backend（apps/api-server）      │  ドメイン / usecase / repository（クリーンアーキテクチャ）
└──────────────────────────────┘
```

| 層      | 置き場                                      | 考える単位             | 責務                                                                 | 持たないもの                                   |
| ------- | ------------------------------------------- | ---------------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| Client  | `apps/web/src/app/**`（`api/` 以外）・`packages/ui` | **画面・操作**         | 描画、ユーザー操作の受け取り、UI 状態                                | データ整形、api-server の知識、ビジネスルール  |
| BFF     | `apps/web/src/app/api/[[...route]]`         | **画面**（read）/ **操作主体 `me`**（write） | 画面が必要とする形への変換、境界バリデーション（UX 契約）、上流エラーの分類 | usecase / domain 層、DB アクセス            |
| Backend | `apps/api-server`                           | **ドメイン・集約**     | ビジネスルール、不変条件、永続化、認可                               | 画面都合のフィールド、表示文言                 |

> **BFF はバックエンドとフロントエンドのどちらの都合も持ち込ませない緩衝地帯**。
> api-server はドメインとして正しい完全な形を返し、UI は受け取った形をそのまま表示する。そのズレ（インピーダンスミスマッチ）を BFF が吸収する。

---

## 依存の方向

```
packages/ui  ◀──  apps/web (Client)  ──▶  apps/web (BFF)  ──▶  apps/api-server
   (Next 非依存)       (Next 依存)            (Hono)             (Hono + Domain)
```

- 依存は常に **外側 → 内側**。逆向きの import は禁止。
- `packages/ui` は `next/*` に依存しない（[Client 構成](../client/index.md#状態管理)）。
- Client は api-server を **直接呼ばない**。必ず BFF を経由する。
- BFF → api-server の型は `@repo/api-server/client`（型のみの export）から導出し、手書きしない。詳細は [パッケージ構成](../packages/index.md#型契約の共有)。

---

## データフロー

```
取得（read）─ SSR
  page.tsx ──▶ fetchers ──HTTP──▶ /api/{screen}（BFF read）──▶ api-server
                                    集約・整形・そぎ落とし
  page.tsx は Result を見て redirect / エラー表示 / 初期レンダリング

更新（write）─ CSR
  ClientAdapter ──▶ hook（useXxx）──▶ fetchers ──HTTP──▶ /api/{resource}/me/*（BFF write）
                                                           検証（zod）→ api-server へ素通し
  hook は成功時に router.refresh() で SSR を再取得させる
```

- **read も write も BFF route（`/api/*`）を通る対称な経路**にする。`page.tsx` から api-server を直接叩くと、整形ロジックが `page.tsx` に漏れ、将来 BFF を独立サービスへ切り出せなくなる。
- 自己 HTTP hop（SSR → 自分の `/api/*`）はその対価として受け入れる。

---

## 各層のドキュメント

| 層 / 横断   | ドキュメント                                   |
| ----------- | ---------------------------------------------- |
| パッケージ  | [パッケージ構成](../packages/index.md)         |
| Client      | [Client 構成](../client/index.md)              |
| BFF         | [BFF 設計](../bff/index.md)                    |
| Backend     | [Backend（api-server）構成](../backend/index.md) |

---

## 構成上の設計判断

| 観点                   | 採用する形                                                             | 理由                                                                         |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| api-server の型参照    | `@repo/api-server` の `exports["./client"]` で**型だけ**を公開          | アプリ間の相対パス依存を無くし、公開面を 1 ファイルに固定する                |
| api-server のホスト    | Hono app（`src/app.ts`）とホスト（`src/server.ts`）を分離               | ホスト（Node / Vercel / Next）を差し替えても route・型が変わらないようにする |
| パッケージマネージャー | pnpm workspaces（[環境構築](../environment/index.md) に合わせる）       | `workspace:*` で内部依存を明示でき、幽霊依存を防げる                         |
| UI パッケージの公開面  | Atomic Design の層ごとに subpath export（`@repo/ui/atoms/Button`）       | 層をまたぐ import を import パスで可視化し、barrel による巻き込みを避ける   |
| 共有設定               | `packages/tsconfig` に切り出し                                         | アプリごとの差分（Next / ライブラリ / Node）を extends で表現する             |
