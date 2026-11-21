# Backend 構成（apps/api-server）

> フロントエンド視点で知っておくべき api-server の構成と契約。ドメイン設計の詳細はプロジェクトごとのサーバー設計ドキュメントで定める。
> 実装例は [`prototype/apps/api-server`](../../prototype/apps/api-server)。

---

## 位置づけ

- **画面を知らない**。ドメインとして正しい完全な形を返す。画面都合の整形は BFF が行う。
- **クライアントが何個あっても 1 つ**。Web / iOS 等の BFF から共有される。
- Hono app（`src/app.ts`）とホスト（`src/server.ts`）を分ける。Node / Vercel Functions / Next.js Route Handler のどれに載せても route と型は変わらない。

---

## ディレクトリ

```
apps/api-server/src/
├── app.ts                    # Hono app。basePath + mount + onError。AppType を定義
├── client.ts                 # 型のみの公開面（export type { AppType }）
├── server.ts                 # ホスト（@hono/node-server）
├── routes/{resource}/
│   ├── index.ts              # マウントテーブル
│   └── {操作名}/index.ts     # 検証 → usecase 呼び出し → 応答
├── usecases/{resource}/{操作名}/index.ts   # 業務処理。依存（repository）を引数で受ける
├── domain/{resource}/
│   ├── entities/             # エンティティ型
│   ├── policies/             # 不変条件の判定（純粋関数）
│   ├── repositories/         # Reader / Writer インターフェース
│   └── errors/               # ドメインエラー型 + factory
├── infrastructure/
│   ├── repositories/         # Reader / Writer の実装
│   └── container/            # 依存の合成（Composition Root）
├── errorMap/                 # AppError → HTTP ステータス + ボディ
└── utils/result/             # Result<T, E>
```

依存は常に内側（domain）へ向かう。

```
routes ──▶ usecases ──▶ domain（repositories interface / entities / policies）
   └──▶ infrastructure/container ──▶ infrastructure/repositories ──▶ domain
```

---

## BFF との契約

| 項目           | 契約                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| 成功応答       | route が返す JSON。型は `AppType` から導出される                               |
| 失敗応答       | `{ error: string; code: string }` + 適切な 4xx。`code` は AppError の `type`   |
| 5xx            | ボディの形を保証しない（BFF は読まずに 502 に畳む）                            |
| 失敗の表現     | usecase は `Result` を返し、route は失敗を `throwAppError` で投げる。ステータスは `errorMap` だけが決める |

route が失敗系ステータスを書かない（= 成功応答だけが route の型に乗る）ことで、`hc<AppType>` の推論が成功形に絞られ、BFF 側の型が単純になる。

---

## URL 設計

- リソース単位で切る（`/api/users/:userId`、`/api/users/:userId/name`）。画面名を URL に入れない。
- 取得は集約単位で 1 本、更新は構造（変更単位）ごとに切る。
- 「誰の」を表す `me` は api-server では使わない。`me` → ID の解決は BFF の責務。
