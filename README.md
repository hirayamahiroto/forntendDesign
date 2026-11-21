# フロントエンド Atomic Design 設計ドキュメント

> **Note**
> 本ドキュメントはフロントエンド開発における基本的な方針・設計指針を示したものです。
> 実際の実装においては、プロジェクトの要件・規模・チーム構成に応じて方針や構造を最適化する必要があります。
> ここに記載された内容をベースラインとして、各プロジェクトで適切にカスタマイズしてください。

---

## ドキュメント一覧

### アーキテクチャ（Client / BFF / Backend）

| # | カテゴリ | 説明 |
|---|---------|------|
| 1 | [全体アーキテクチャ](./docs/architecture/index.md) | 3 層の責務・依存の方向・データフロー |
| 2 | [パッケージ構成](./docs/packages/index.md) | モノレポ構成、依存ルール、型契約の共有 |
| 3 | [Client 構成](./docs/client/index.md) | page.tsx / ClientAdapter / hooks / fetchers の責務分離、状態管理、テスト |
| 4 | [BFF 設計](./docs/bff/index.md) | read は厚く write は薄く、エラー契約、マルチクライアント展望 |
| 5 | [Backend 構成](./docs/backend/index.md) | api-server のレイヤーと BFF との契約 |

### UI

| # | カテゴリ | 説明 |
|---|---------|------|
| 6 | [環境構築](./docs/environment/index.md) | 技術スタック、Storybook、CI/CD、Linter設定 |
| 7 | [アプリケーション方針](./docs/application-policy/index.md) | SEO対策、SSR/CSRの選択基準 |
| 8 | [コンポーネント設計](./docs/component-design/index.md) | Atomic Design、UIコンポーネントの責務、Storybook、アクセシビリティ |
| 9 | [Tailwind CSS実装規約](./docs/tailwind/index.md) | スタイリング方針、クラス名の結合 |
| 10 | [レスポンシブ対応](./docs/responsive/index.md) | ブレイクポイント、コンテンツ幅、画像のアスペクト比 |
| 11 | [UIライブラリ選定](./docs/ui-library/index.md) | Headless UI、ShadCN/UI、スタイル付きライブラリの比較 |

動く最小構成: [`prototype/`](./prototype/README.md)

```bash
./setup.sh                 # 依存インストール・.env.local 作成・型チェック・テスト
cd prototype && pnpm dev   # http://localhost:3000/profile
```

---

## 参考資料
- [Atomic Design - Brad Frost](https://atomicdesign.bradfrost.com/table-of-contents/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/colors)
- [ShadCN/UI 公式ドキュメント](https://ui.shadcn.com/)
- [Radix UI 公式ドキュメント](https://www.radix-ui.com/)
