# フロントエンド Atomic Design 設計ドキュメント

> **Note**
> 本ドキュメントはフロントエンド開発における基本的な方針・設計指針を示したものです。
> 実際の実装においては、プロジェクトの要件・規模・チーム構成に応じて方針や構造を最適化する必要があります。
> ここに記載された内容をベースラインとして、各プロジェクトで適切にカスタマイズしてください。

---

## ドキュメント一覧

| # | カテゴリ | 説明 |
|---|---------|------|
| 0 | [環境構築](./docs/environment/index.md) | 技術スタック、Storybook、CI/CD、Linter設定 |
| 1 | [アプリケーション方針](./docs/application-policy/index.md) | SEO対策、SSR/CSRの選択基準 |
| 2 | [実装の前提](./docs/implementation/index.md) | Next.js App Router、実装パターン |
| 3 | [Tailwind CSS実装規約](./docs/tailwind/index.md) | スタイリング方針、クラス名の結合 |
| 4 | [レスポンシブ対応](./docs/responsive/index.md) | ブレイクポイント、コンテンツ幅、画像のアスペクト比 |
| 5 | [コンポーネント設計](./docs/component-design/index.md) | Atomic Design、UIコンポーネントの責務、Storybook |
| 6 | [状態管理](./docs/state-management/index.md) | クライアント状態、サーバー状態 |
| 7 | [パフォーマンス最適化](./docs/performance/index.md) | 画像最適化、バンドル最適化 |
| 8 | [アクセシビリティ](./docs/accessibility/index.md) | ARIA属性、セマンティックHTML |
| 9 | [開発・運用規約](./docs/development-rules/index.md) | TypeScript、テスト |
| 10 | [禁止事項](./docs/prohibited/index.md) | 技術的制約、実装制約 |

---

## 参考資料

- [UIライブラリ選定について](./docs/ui-library/index.md)
- [Atomic Design - Brad Frost](https://atomicdesign.bradfrost.com/table-of-contents/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/colors)
- [ShadCN/UI 公式ドキュメント](https://ui.shadcn.com/)
- [Radix UI 公式ドキュメント](https://www.radix-ui.com/)
