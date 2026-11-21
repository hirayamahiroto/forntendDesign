# BFF（Backend For Frontend）設計

> BFF は **Client が api-server と対話するための仲介層**であり、フロントエンドアーキテクチャの一部。`apps/web/src/app/api/[[...route]]` に Hono app として同梱する。
> 全体像は [全体アーキテクチャ](../architecture/index.md)、実装例は [`prototype/apps/web`](../../prototype/apps/web)。

---

## 責務

**特定の画面に対して、その画面が必要とするデータを返す。**

- **画面単位で考える** — read route はリソース名（`getUser`）ではなく画面名（`getProfileScreen`）で切る。
- **そぎ落とす** — その画面で使わないフィールド・リレーションは返さない。
- **観点を緩和する** — api-server はドメインの形、UI は画面の形。変換は BFF で完結させる。
- **表示語彙を解決する** — `code → label` の変換は BFF が行い、UI には解決済みの値だけを渡す。フロントにラベル辞書を持たせない。

---

## read は厚く、write は薄い

| 種別  | 経路                                  | route の振る舞い                                            | 厚み   |
| ----- | ------------------------------------- | ----------------------------------------------------------- | ------ |
| read  | `page.tsx`（SSR）→ fetchers → `/api/{screen}` | api-server 呼び出し → **集約・整形・そぎ落とし**             | 厚い   |
| write | hook（CSR）→ fetchers → `/api/{resource}/me/*` | 境界バリデーション → api-server へ**素通し**                | 薄い   |

- write route にビジネスロジック・整形を書かない。
- write route は「操作主体 `me`」で切る。`me` → 実 ID の解決は BFF がセッションから行い、クライアントに ID を持たせない。

---

## route の構成

```
apps/web/src/app/api/[[...route]]/
├── route.ts                          # Next.js へのアダプタ（export const GET = handle(app) のみ）
├── app.ts                            # Hono app 本体。basePath("/api") + mount + onError。AppType を定義
├── {screen}/index.ts                 # read: マウントテーブル（例: profile/）
├── {screen}/{操作名}/index.ts        # read: 本体（例: profile/getProfileScreen/）
├── {resource}/index.ts               # write: マウントテーブル（例: users/）
├── {resource}/me/{操作名}/index.ts   # write: 本体（例: users/me/updateMyName/）
├── validators/validateJson/          # zod 検証失敗を型付きエラーの throw に統一
└── shared/                           # route 横断 helper（toUpstreamError / session 解決）
```

- ディレクトリを掘るのは **リソース（画面）の境目とミドルウェアが変わる境目だけ**。URL セグメントごとに掘らない。
- ユニットは `{操作名}/index.ts`。`get/` `post/` のような HTTP メソッド名のディレクトリは作らない。
- **BFF に usecase / domain 層は作らない**。`shared/` の小さな helper で足りる。
- Hono app を `app.ts`、Next.js への接続を `route.ts` に分ける。Next.js の route ファイルは export できる名前が制限されるため、`app` / `AppType` を `route.ts` から export できない。分けておくと、テストは `app.request()` で HTTP を立てずに検証でき、standalone 化も `app.ts` を別ホストに載せるだけで済む。

---

## クライアントの使い分け

| 生成関数                  | 叩く先                 | 使う場所                         |
| ------------------------- | ---------------------- | -------------------------------- |
| `createApiServerClient`   | サーバー → api-server   | BFF route のみ                   |
| `createBffClient`         | ブラウザ → BFF `/api/*` | `src/fetchers/`（write）のみ     |
| `createBffServerClient`   | SSR → BFF `/api/*`      | `src/fetchers/`（read）のみ。cookie を `headers()` から引き継ぐ |

- 名前の `ApiServer` / `Bff` は **叩く先** を表す。
- `createBffServerClient` は `next/headers` に依存するため `utils/client/server` に分ける（CSR バンドルに混ぜない）。

---

## fetchers 層（`src/fetchers/`）

UI（`page.tsx` / hooks）は hono client を直接生成しない。BFF への fetch は fetchers だけが行う。

- **構成**: BFF エンドポイント 1 つにつき 1 モジュール。`src/fetchers/{名前空間}/{操作名}/index.ts`
- **契約**: `Promise<Result<T, FetcherError>>` を返し、**throw しない**。
- `FetcherError = { kind: "rejected" | "unexpected"; message: string }`
  - `rejected`: ユーザー起因（400 / 404 / 409 / 422）。message をそのまま画面に出してよい
  - `unexpected`: それ以外。汎用メッセージを出す
- **型は BFF の `AppType` から導出する**（`InferRequestType` / `InferResponseType`）。手書きしない。

---

## バリデーションの役割分担

| 層                    | 役割                                                         |
| --------------------- | ------------------------------------------------------------ |
| BFF write route（zod） | **UX 契約**。形式不正を境界で弾き、即時に返せるエラー形にする |
| api-server（domain）  | **ドメイン不変条件**。Value Object / policy で守る           |

内容が重複しても責務が違うので許容する。

---

## エラー契約

**route は失敗系の HTTP ステータスを書かない。** 型付きエラーを throw し、`errorMap`（`apps/web/src/errorMap`）だけがステータスを決める。

| 上流の状態                          | 型付きエラー                  | BFF の応答                 |
| ----------------------------------- | ----------------------------- | -------------------------- |
| 到達できない（DNS / 接続拒否 / timeout） | `UpstreamUnavailable`       | 502                        |
| 5xx                                 | `UpstreamServer`              | 502                        |
| 4xx + ボディに `code` がある        | `UpstreamRejected`            | **上流のステータスとボディを透過** |
| 4xx だが `code` が無い / 解析不能   | `UpstreamContractViolation`   | 502                        |
| BFF の検証失敗                      | `InvalidRequest`              | 400                        |

- BFF は api-server の分類を**再分類・推定しない**。翻訳するのは（必要になれば）ユーザー向け文言だけ。
- 分類は `shared/toUpstreamError` の 1 箇所で行う。

---

## マルチクライアント展望

BFF が `apps/web` に同梱されているのは Next.js App Router の都合であり、**論理的には独立した層**。

```
Web (Next.js) ──▶ Web BFF ─┐
                           ├──▶ api-server（1 つを共有）
iOS (native)  ──▶ iOS BFF ─┘
```

- BFF はクライアント（画面の集合）ごとに分かれる。1 つの BFF で全クライアントを賄うと汎用 API ゲートウェイに化ける（anti-pattern）。
- 整形ロジックを `page.tsx` ではなく **Hono route に閉じておけば**、将来 Hono app をホストから外して standalone デプロイに載せるだけで切り出せる。
- いま守るべきは「切り出せる substrate を保つ」ことだけ。iOS 向け BFF を先回りして作らない。
