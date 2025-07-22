# Project Atlas

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**🌍 [English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md)**

単一または複数のリポジトリベースのフロントエンド、バックエンド、DB、APIなどの構成を自動的に分析し、連携構造と依存関係を可視化して、開発者とオペレーターが一目で理解できるオープンソースツールです。

## 🚀 主な機能

- **🔍 自動分析**: プロジェクト構造、言語、フレームワークの自動検出
- **📊 インタラクティブな可視化**: サービス依存関係グラフ、APIフロー図、アーキテクチャ概要
- **🏗️ マルチリポジトリサポート**: マイクロサービスと分散アーキテクチャの分析
- **📈 包括的なレポート**: 技術スタック統計、APIエンドポイント、依存関係分析
- **🔄 リアルタイム更新**: ライブ分析進行状況と自動再分析トリガー
- **📤 エクスポート機能**: 複数の形式でダイアグラムとレポートをエクスポート

## 🛠️ 技術スタック

### バックエンド
- **Node.js** + **Express.js** - APIサーバー
- **TypeScript** - 型安全性
- **SQLite** - データストレージ
- **Redis** - キャッシングとジョブキュー
- **Simple-Git** - Gitリポジトリ分析

### フロントエンド
- **React** + **TypeScript** - ユーザーインターフェース
- **D3.js** - インタラクティブな可視化
- **Mermaid.js** - ダイアグラム生成
- **Tailwind CSS** - スタイリング
- **Vite** - ビルドツール

### 分析エンジン
- **AST解析** - 静的コード分析
- **多言語サポート** - JavaScript、TypeScript、Pythonなど
- **フレームワーク検出** - React、Vue、Django、Expressなど

## 📦 インストール

### 前提条件
- Node.js 18+
- npm または yarn
- Git

### クイックスタート

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/your-org/project-atlas.git
   cd project-atlas
   ```

2. **依存関係のインストール**
   ```bash
   npm run install:all
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザで開く**
   - フロントエンド: http://localhost:5173
   - バックエンドAPI: http://localhost:3000

## 🎯 使用方法

### 基本的な分析

1. **プロジェクトの追加**
   - GitリポジトリのURLを入力
   - 単一または複数リポジトリ分析を選択
   - 「分析」をクリック

2. **結果の表示**
   - インタラクティブな依存関係グラフ
   - APIエンドポイントリスト
   - 技術スタック概要
   - データベース接続

3. **データのエクスポート**
   - PNG/SVGでダイアグラムをダウンロード
   - JSON/CSV/PDFでレポートをエクスポート

### 高度な機能

- **マルチリポジトリ分析**: 完全なマイクロサービスエコシステムの分析
- **カスタムフィルター**: 特定のコンポーネントや技術に焦点を当てる
- **Webhook統合**: コード変更時の自動再分析
- **APIアクセス**: 分析結果へのプログラマティックアクセス

## 🏗️ アーキテクチャ

```
project-atlas/
├── backend/           # Express.js APIサーバー
│   ├── src/
│   │   ├── controllers/   # APIルートハンドラー
│   │   ├── services/      # ビジネスロジック
│   │   ├── models/        # データモデル
│   │   └── analyzers/     # コード分析エンジン
├── frontend/          # Reactアプリケーション
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   └── utils/         # ユーティリティ関数
├── shared/            # 共有TypeScript型
└── docs/              # ドキュメント
```

## 🤝 貢献

貢献を歓迎します！詳細については[貢献ガイド](CONTRIBUTING.md)をご覧ください。

### 開発環境のセットアップ

1. リポジトリをフォーク
2. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更を加える
4. テストを実行: `npm test`
5. 変更をコミット: `git commit -m 'Add amazing feature'`
6. ブランチにプッシュ: `git push origin feature/amazing-feature`
7. プルリクエストを開く

### コードスタイル

- すべての新しいコードにTypeScriptを使用
- ESLint設定に従う
- 新機能のテストを書く
- 必要に応じてドキュメントを更新

## 📊 サポートされている技術

### 言語
- JavaScript/TypeScript
- Python
- Java
- Go
- Rust
- PHP

### フレームワーク
- **フロントエンド**: React、Vue、Angular、Svelte
- **バックエンド**: Express、Fastify、Django、Flask、FastAPI
- **データベース**: MySQL、PostgreSQL、MongoDB、Redis

### ビルドツール
- Webpack、Vite、Rollup
- Docker、Docker Compose
- GitHub Actions、GitLab CI

## 📄 ライセンス

このプロジェクトはApache License 2.0の下でライセンスされています。詳細については[LICENSE](LICENSE)ファイルをご覧ください。

## 🙏 謝辞

- [D3.js](https://d3js.org/) - 強力なデータ可視化
- [Mermaid](https://mermaid.js.org/) - ダイアグラム生成
- [Simple-Git](https://github.com/steveukx/git-js) - Git操作
- すべての[貢献者](https://github.com/your-org/project-atlas/contributors)

## 📞 サポート

- 📧 メール: support@project-atlas.dev
- 💬 Discord: [コミュニティに参加](https://discord.gg/project-atlas)
- 🐛 問題: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 ドキュメント: [docs.project-atlas.dev](https://docs.project-atlas.dev)

---

Project Atlasチームが❤️で作りました