# Client 構成（apps/web）

> `apps/web` のうち BFF（`src/app/api/`）以外の部分。UI コンポーネントそのものの設計は [コンポーネント設計](../component-design/index.md) を参照。

---

## ディレクトリ

```
apps/web/src/
├── app/
│   ├── {page}/
│   │   ├── page.tsx                         # SSR: read fetcher → 分岐 → 初期レンダリング
│   │   └── {Name}ClientAdapter/
│   │       ├── index.tsx                    # "use client": hook と organism を結合するだけ
│   │       └── hooks/use{Action}/index.ts   # 状態管理 + write fetcher 呼び出し + 写像
│   └── api/[[...route]]/                    # BFF（→ docs/bff）
├── fetchers/{名前空間}/{操作名}/index.ts     # BFF への唯一の呼び出し面
├── errorMap/                                # BFF エラー → HTTP
└── utils/
    ├── client/                              # hono client 生成（server は分離）
    ├── config/                              # 環境変数の読み出し（欠落は throw）
    └── result/                              # Result<T, E>
```

---

## 責務の分離

```
page.tsx（Server Component）
  - read fetcher を呼ぶ
  - Result を見て redirect / notFound / エラー表示
  - template と organism を配置
        │ props（整形済みの値）
        ▼
{Name}ClientAdapter（"use client"）
  - hook を呼び、戻り値を organism に渡すだけ
  - 写像・ラップ・分岐を書かない
        │ props（値 / callback）
        ▼
packages/ui の organism
  - props を表示し、操作を callback で通知する
  - next/* に依存しない
```

| 置き場          | 書いてよいこと                                       | 書かないこと                                         |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `page.tsx`      | 認証・redirect・初期描画・fetcher 呼び出し            | 整形（BFF の責務）、hono client の生成                |
| ClientAdapter   | hook と organism の結合                              | `async (v) => save(toRequest(v))` のようなラップ      |
| hook            | `isSaving` / `errorMessage` 等の状態、UI 値 → リクエスト写像、`router.refresh()` | 表示、エラー文言の決定（fetcher の責務）             |
| fetcher         | client 生成、レスポンス解釈、`Result` への正規化      | 状態管理                                             |

---

## hook と organism の型を一致させる

hook が公開する関数の型は、結合先 organism の callback props の型に一致させる。

```tsx
// packages/ui: organism は自分の値型だけを知る
type ProfileEditorProps = {
  onSubmit: (values: ProfileEditorValues) => Promise<void> | void;
};

// apps/web: hook が UI 値 → BFF リクエストを写像する
const useUpdateMyName = () => {
  const save = async (values: ProfileEditorValues): Promise<void> => { /* ... */ };
  return { save, isSaving, errorMessage };
};

// ClientAdapter: 渡すだけ。型が合わなければコンパイルエラーになる
<ProfileEditor onSubmit={save} isSaving={isSaving} errorMessage={errorMessage} />;
```

- organism が BFF リクエスト型を受け取る設計は禁止（`packages/ui` が BFF に依存する）。
- organism は非同期 callback を `await` する。ClientAdapter に `void fn()` を書かせない。

---

## 非同期状態の初期値

- hook の取得系状態は `null` で初期化し、「未取得」と「取得済みで空」を型で区別する。
- エラーメッセージは `string | null`。`""` で「エラー無し」を表さない。

---

## SSR と CSR の選択

[アプリケーション方針](../application-policy/index.md) に従う。

| 画面の種類            | 初期データ             | 更新後の再取得          |
| --------------------- | ---------------------- | ----------------------- |
| SEO が必要 / 公開画面 | `page.tsx` で read fetcher | —                   |
| ログイン後の編集画面  | `page.tsx` で read fetcher | hook で `router.refresh()` |

クライアント側でのデータ取得ライブラリ（SWR / TanStack Query）は導入しない。導入を検討する条件は「SSR を経由しない取得（無限スクロール・ポーリング）が複数画面で必要になったとき」。
