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
- Node.js 18+ (推奨: 20.x LTS)
- npm 9+ または yarn 3+
- Git 2.25+
- Redis 6+ (オプション、キャッシング用)
- 最小4GB RAM
- 最小2GBディスク容量

### システム別インストールガイド

#### Windows
```bash
# Node.jsのインストール (https://nodejs.org/ からダウンロード)
# Gitのインストール (https://git-scm.com/download/win からダウンロード)
# Redisのインストール (オプション)
winget install Redis.Redis
```

#### macOS
```bash
# Homebrewを使用
brew install node@20
brew install git
brew install redis # オプション
```

#### Linux (Ubuntu/Debian)
```bash
# Node.jsのインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Gitのインストール
sudo apt-get install git

# Redisのインストール (オプション)
sudo apt-get install redis-server
```

### インストール手順

#### 1. **リポジトリのクローン**
```bash
git clone https://github.com/your-org/project-atlas.git
cd project-atlas
```

#### 2. **環境設定**
```bash
# 環境変数ファイルの作成
cp .env.example .env

# .envファイルの編集 (必要に応じて)
# BACKEND_PORT=3000
# FRONTEND_PORT=5173
# DATABASE_PATH=./data/atlas.db
# REDIS_URL=redis://localhost:6379
```

#### 3. **依存関係のインストール**
```bash
# すべての依存関係を一度にインストール
npm run install:all

# または個別にインストール
cd backend && npm install
cd ../frontend && npm install
```

#### 4. **データベースの初期化**
```bash
cd backend
npm run db:migrate
npm run db:seed # サンプルデータの追加 (オプション)
```

#### 5. **開発サーバーの起動**
```bash
# プロジェクトルートで
npm run dev

# または個別に実行
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

#### 6. **アクセス確認**
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3000
- APIドキュメント: http://localhost:3000/api-docs

### プロダクションデプロイ

#### 1. **ビルド**
```bash
# フロントエンドのビルド
cd frontend && npm run build

# バックエンドのビルド
cd backend && npm run build
```

#### 2. **プロダクション実行**
```bash
# PM2の使用 (推奨)
npm install -g pm2
pm2 start ecosystem.config.js

# または直接実行
NODE_ENV=production node backend/dist/server.js
```

#### 3. **Dockerデプロイ**
```bash
# Dockerイメージのビルド
docker-compose build

# コンテナの実行
docker-compose up -d

# ログの確認
docker-compose logs -f
```

## 🎯 使用ガイド

### 基本的な使用方法

#### 1. **プロジェクトの追加と分析**

##### 単一リポジトリ分析
```bash
# Git URLで分析
1. Webインターフェースで「New Project」をクリック
2. Repository URLを入力: https://github.com/user/repo.git
3. 分析オプションを選択:
   - Branch: main (デフォルト)
   - Depth: Full analysis (完全分析)
   - Language filters: 必要に応じて特定の言語のみ選択
4. 「Start Analysis」をクリック

# ローカルリポジトリの分析
1. 「Upload Local Repository」を選択
2. フォルダを選択またはドラッグ＆ドロップ
3. 分析開始
```

##### マルチリポジトリ分析 (マイクロサービス)
```bash
1. 「Multi-Repository Mode」を有効化
2. リポジトリリストを追加:
   - Frontend: https://github.com/org/frontend.git
   - Backend: https://github.com/org/backend.git
   - Auth Service: https://github.com/org/auth.git
3. 「Analyze All」をクリック
4. サービス間の接続関係を自動検出
```

#### 2. **分析結果の確認**

##### ダッシュボードビュー
```
📊 Overview Dashboard
├── 技術スタックサマリー
│   ├── Languages: JavaScript (45%), Python (30%), Go (25%)
│   ├── Frameworks: React, Express, Django
│   └── Databases: PostgreSQL, Redis, MongoDB
├── プロジェクト構造
│   ├── Total Files: 1,234
│   ├── Lines of Code: 45,678
│   └── Test Coverage: 78%
└── 主要指標
    ├── API Endpoints: 156
    ├── Database Tables: 45
    └── External Dependencies: 234
```

##### 依存関係グラフ
```
🔗 Interactive Dependency Graph
- ノードクリック: 詳細情報表示
- ドラッグ: グラフ移動
- スクロール: 拡大/縮小
- フィルターオプション:
  - By Service Type (Frontend/Backend/Database)
  - By Technology (React/Node/Python)
  - By Connection Type (API/Database/Message Queue)
```

##### APIエンドポイントリスト
```
📡 API Endpoints
├── /api/v1/users
│   ├── GET - ユーザーリスト取得
│   ├── POST - 新規ユーザー作成
│   └── Connected to: UserService, AuthService
├── /api/v1/products
│   ├── GET - 商品リスト
│   ├── PUT - 商品情報更新
│   └── Database: products_table (PostgreSQL)
```

#### 3. **高度な機能の活用**

##### カスタムフィルタリング
```javascript
// フィルター例
{
  "include": {
    "languages": ["JavaScript", "TypeScript"],
    "frameworks": ["React", "Next.js"],
    "filePatterns": ["*.tsx", "*.jsx"]
  },
  "exclude": {
    "directories": ["node_modules", "dist", "build"],
    "files": ["*.test.js", "*.spec.ts"]
  }
}
```

##### リアルタイムモニタリング
```bash
# Webhook設定
1. Settings > Integrations > Webhooks
2. Add Webhook URL: https://your-domain.com/webhook
3. イベント選択:
   - Code Push
   - Pull Request
   - Branch Creation
4. 自動再分析を有効化
```

##### APIによるプログラマティックアクセス
```javascript
// API使用例
const axios = require('axios');

// プロジェクト分析の開始
const startAnalysis = async () => {
  const response = await axios.post('http://localhost:3000/api/v1/projects', {
    repositoryUrl: 'https://github.com/user/repo.git',
    branch: 'main',
    options: {
      deepAnalysis: true,
      includeTests: false
    }
  });
  
  return response.data.projectId;
};

// 分析結果の取得
const getResults = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/analysis`);
  return response.data;
};

// 依存関係グラフデータの取得
const getDependencyGraph = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/dependencies`);
  return response.data;
};
```

##### カスタム分析ルールの追加
```yaml
# custom-rules.yaml
rules:
  - name: "Security Check"
    description: "セキュリティ脆弱性のチェック"
    patterns:
      - pattern: "eval\\("
        severity: "high"
        message: "eval()の使用を避けてください"
      - pattern: "dangerouslySetInnerHTML"
        severity: "medium"
        message: "dangerouslySetInnerHTMLに注意してください"
        
  - name: "Performance Check"
    description: "パフォーマンス問題のチェック"
    patterns:
      - pattern: "console\\.log"
        severity: "low"
        message: "本番環境でconsole.logを削除してください"
```

#### 4. **データのエクスポート**

##### ダイアグラムのエクスポート
```bash
# PNG/SVG形式
1. ダイアグラム右上の「Export」ボタン
2. 形式選択: PNG (高画質) / SVG (ベクター)
3. オプション:
   - Include Legend: 凡例を含む
   - Transparent Background: 透明背景
   - Custom Size: カスタムサイズ
```

##### レポート生成
```bash
# PDFレポート
1. Reports > Generate Report
2. テンプレート選択:
   - Executive Summary (経営陣向け)
   - Technical Deep Dive (開発チーム向け)
   - Architecture Overview (アーキテクチャドキュメント)
3. 含めるセクションを選択
4. 「Generate PDF」をクリック

# JSON/CSVデータエクスポート
1. Data Export > Select Format
2. データタイプ選択:
   - Full Analysis Data (完全な分析データ)
   - API Endpoints Only (APIリストのみ)
   - Dependencies Matrix (依存関係マトリックス)
3. Download
```

### CLI使用方法

```bash
# CLIのインストール
npm install -g @project-atlas/cli

# 基本コマンド
atlas analyze <repo-url> [options]

# 例
atlas analyze https://github.com/user/repo.git \
  --branch main \
  --output ./analysis-results \
  --format json

# マルチリポジトリ分析
atlas analyze-multi repos.txt \
  --output ./results \
  --parallel 4

# リアルタイム監視モード
atlas watch ./my-project \
  --interval 60 \
  --notify slack
```

### 統合ガイド

#### VS Code Extension
```bash
# インストール
1. VS Code Extensionsで「Project Atlas」を検索
2. Installをクリック
3. コマンドパレットで「Atlas: Analyze Current Project」を実行
```

#### CI/CDパイプライン統合
```yaml
# GitHub Actions例
name: Code Analysis
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Project Atlas
        uses: project-atlas/action@v1
        with:
          api-endpoint: ${{ secrets.ATLAS_API }}
          api-key: ${{ secrets.ATLAS_KEY }}
          fail-on-issues: true
```

## 📡 APIドキュメント

### REST APIエンドポイント

#### 認証
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

#### プロジェクト管理
```http
# プロジェクトリストの取得
GET /api/v1/projects
Authorization: Bearer <token>

Response:
{
  "projects": [
    {
      "id": "proj_123",
      "name": "My Project",
      "repositoryUrl": "https://github.com/user/repo",
      "status": "analyzed",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}

# 新規プロジェクトの作成
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Project",
  "repositoryUrl": "https://github.com/user/repo.git",
  "branch": "main",
  "options": {
    "deepAnalysis": true,
    "includeTests": false,
    "maxDepth": 5
  }
}

# プロジェクト詳細の取得
GET /api/v1/projects/{projectId}

# プロジェクトの削除
DELETE /api/v1/projects/{projectId}
```

#### 分析API
```http
# 分析の開始
POST /api/v1/projects/{projectId}/analyze
Authorization: Bearer <token>

{
  "force": true,  // 既存の分析結果を無視
  "options": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["React", "Django"]
  }
}

# 分析ステータスの確認
GET /api/v1/projects/{projectId}/analysis/status

Response:
{
  "status": "in_progress",
  "progress": 67,
  "currentStep": "依存関係の分析中",
  "estimatedTime": "2分"
}

# 分析結果の取得
GET /api/v1/projects/{projectId}/analysis

Response:
{
  "summary": {
    "languages": {
      "JavaScript": 45.2,
      "Python": 30.1,
      "Go": 24.7
    },
    "totalFiles": 1234,
    "totalLines": 45678,
    "complexity": "medium"
  },
  "technologies": [...],
  "dependencies": [...],
  "apis": [...]
}
```

#### 依存関係グラフ
```http
# 依存関係データの取得
GET /api/v1/projects/{projectId}/dependencies

Response:
{
  "nodes": [
    {
      "id": "frontend",
      "type": "service",
      "technology": "React",
      "connections": ["backend", "auth-service"]
    }
  ],
  "edges": [
    {
      "source": "frontend",
      "target": "backend",
      "type": "REST API",
      "endpoints": ["/api/v1/users", "/api/v1/products"]
    }
  ]
}

# 特定サービスの依存関係
GET /api/v1/projects/{projectId}/dependencies/{serviceId}
```

#### レポート生成
```http
# PDFレポートの生成
POST /api/v1/projects/{projectId}/reports
Content-Type: application/json

{
  "format": "pdf",
  "template": "technical",
  "sections": ["overview", "dependencies", "apis", "security"],
  "options": {
    "includeCharts": true,
    "language": "ja"
  }
}

Response:
{
  "reportId": "report_456",
  "status": "generating",
  "downloadUrl": null
}

# レポートのダウンロード
GET /api/v1/reports/{reportId}/download
```

### WebSocket API

```javascript
// WebSocket接続
const ws = new WebSocket('ws://localhost:3000/ws');

// 認証
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// リアルタイム分析進行状況の購読
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'analysis',
  projectId: 'proj_123'
}));

// メッセージ受信
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'analysis:progress':
      console.log(`進行状況: ${data.progress}%`);
      break;
    case 'analysis:complete':
      console.log('分析完了！', data.results);
      break;
    case 'analysis:error':
      console.error('分析失敗:', data.error);
      break;
  }
};
```

### GraphQL API (ベータ版)

```graphql
# スキーマ
type Project {
  id: ID!
  name: String!
  repositoryUrl: String!
  analysis: Analysis
  dependencies: [Dependency!]!
}

type Analysis {
  id: ID!
  status: AnalysisStatus!
  summary: AnalysisSummary!
  technologies: [Technology!]!
}

# クエリ例
query GetProjectDetails($projectId: ID!) {
  project(id: $projectId) {
    id
    name
    analysis {
      status
      summary {
        totalFiles
        totalLines
        languages {
          name
          percentage
        }
      }
    }
    dependencies {
      source
      target
      type
    }
  }
}

# ミューテーション例
mutation StartAnalysis($projectId: ID!, $options: AnalysisOptions) {
  startAnalysis(projectId: $projectId, options: $options) {
    id
    status
    estimatedTime
  }
}
```

### SDK使用例

#### JavaScript/TypeScript
```typescript
import { AtlasClient } from '@project-atlas/sdk';

const client = new AtlasClient({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// プロジェクト分析
const project = await client.projects.create({
  name: 'My Project',
  repositoryUrl: 'https://github.com/user/repo.git'
});

const analysis = await client.analysis.start(project.id, {
  deepAnalysis: true
});

// 進行状況のモニタリング
client.on('analysis:progress', (data) => {
  console.log(`進行状況: ${data.progress}%`);
});

// 結果の取得
const results = await client.analysis.getResults(project.id);
```

#### Python
```python
from project_atlas import AtlasClient

client = AtlasClient(
    api_url='http://localhost:3000',
    api_key='your-api-key'
)

# プロジェクトの作成と分析
project = client.projects.create(
    name='My Project',
    repository_url='https://github.com/user/repo.git'
)

analysis = client.analysis.start(
    project_id=project.id,
    options={'deep_analysis': True}
)

# 結果の待機
results = client.analysis.wait_for_results(project.id)
print(f"{len(results['apis'])}個のAPIエンドポイントが見つかりました")
```

### レート制限

APIリクエストは以下のように制限されます：

- 認証済みユーザー: 1000リクエスト/時間
- 匿名ユーザー: 60リクエスト/時間
- 分析リクエスト: 10同時分析

レート制限情報はレスポンスヘッダーに含まれます：
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642089600
```

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

## 🔧 トラブルシューティングとFAQ

### よくある問題

#### インストール関連

**Q: npm install中にエラーが発生します**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Pythonビルドツールが必要な場合 (Windows)
npm install --global windows-build-tools
```

**Q: Redis接続エラーが発生します**
```bash
# Redisサーバーのステータス確認
redis-cli ping

# Redisサーバーの起動
# Linux/macOS
redis-server

# Windows
redis-server.exe
```

#### 分析関連

**Q: 分析に時間がかかりすぎます**
- 大規模なリポジトリの場合はshallow cloneを使用
- 不要なディレクトリを除外 (node_modules、vendorなど)
- 特定の言語/ファイルのみを分析するようにフィルター設定

**Q: メモリ不足エラーが発生します**
```bash
# Node.jsメモリ制限の増加
NODE_OPTIONS="--max-old-space-size=8192" npm run dev

# または環境変数の設定
export NODE_OPTIONS="--max-old-space-size=8192"
```

**Q: Gitリポジトリアクセス権限エラー**
```bash
# SSHキー設定の確認
ssh -T git@github.com

# HTTPS認証情報の保存
git config --global credential.helper store

# プライベートリポジトリの場合はトークンを使用
https://username:token@github.com/user/repo.git
```

#### パフォーマンス最適化

**Q: フロントエンドが遅いです**
- 大規模なグラフの場合はノード数を制限
- 仮想化(virtualization)を有効化
- ウェブワーカーの使用を設定

**Q: APIレスポンスが遅いです**
- Redisキャッシングを有効化
- データベースインデックスを最適化
- APIレスポンスのページネーションを使用

### デバッグのヒント

#### ログレベルの設定
```bash
# 開発環境
LOG_LEVEL=debug npm run dev

# プロダクション環境
LOG_LEVEL=error npm start
```

#### 分析エンジンのデバッグ
```javascript
// backend/src/config/debug.js
module.exports = {
  analysis: {
    verbose: true,
    saveIntermediateResults: true,
    logPath: './logs/analysis'
  }
};
```

#### ネットワーク問題の解決
```bash
# CORS問題
# .envファイルに追加
CORS_ORIGIN=http://localhost:5173

# プロキシ設定
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
```

### 既知の問題

1. **Windowsでのファイルパス問題**
   - 長いパス名のサポートを有効化する必要があります
   - Git設定: `git config --system core.longpaths true`

2. **macOSでのファイル監視制限**
   - システム制限を増やす: `sudo sysctl -w kern.maxfiles=524288`

3. **大規模モノレポの分析**
   - 部分分析モードの使用を推奨
   - メモリとCPU制限の設定が必要

### サポートを受ける

- 📧 メール: support@project-atlas.dev
- 💬 Discord: [コミュニティに参加](https://discord.gg/project-atlas)
- 🐛 バグレポート: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 詳細ドキュメント: [docs.project-atlas.dev](https://docs.project-atlas.dev)

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