# 実装の前提

## Next.js App Router準拠

- 各`page.tsx`では**Server Side Rendering (SSR)**を基本とする
- クライアントサイド処理が必要な場合は、adapterを用いて`"use client"`ディレクティブを明示的に記述

---

## 実装パターン

### SSRのみの場合

```tsx
import ComponentPage from "@ui/design-system/components/pages/ComponentPage";

export default function Page() {
  return <ComponentPage />;
}
```

### SSR + CSR（動的な動きが必要な場合）

> データ取得は `fetch` を直接書かず、`src/fetchers/` 経由で BFF を呼ぶ。詳細は [Client 構成](../client/index.md) / [BFF 設計](../bff/index.md)。

```tsx
// page.tsx
import { ClientAdapter } from "./ClientAdapter";
import { getScreen } from "@/fetchers/screen/getScreen";

export default async function Page() {
  const result = await getScreen();
  if (!result.ok) return <ErrorView message={result.error.message} />;
  return <ClientAdapter initialData={result.value} />;
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
