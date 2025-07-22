# Project Atlas

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**🌍 [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)**

一个开源工具，可自动分析单个或多个代码仓库的前端、后端、数据库和API结构，并可视化它们的依赖关系和互连，帮助开发者和运维人员快速理解复杂的项目架构。

## 🚀 主要功能

- **🔍 自动分析**: 自动检测项目结构、语言和框架
- **📊 交互式可视化**: 服务依赖图、API流程图和架构概览
- **🏗️ 多仓库支持**: 分析微服务和分布式架构
- **📈 综合报告**: 技术栈统计、API端点和依赖分析
- **🔄 实时更新**: 实时分析进度和自动重新分析触发器
- **📤 导出功能**: 以多种格式导出图表和报告

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express.js** - API服务器
- **TypeScript** - 类型安全
- **SQLite** - 数据存储
- **Redis** - 缓存和作业队列
- **Simple-Git** - Git仓库分析

### 前端
- **React** + **TypeScript** - 用户界面
- **D3.js** - 交互式可视化
- **Mermaid.js** - 图表生成
- **Tailwind CSS** - 样式
- **Vite** - 构建工具

### 分析引擎
- **AST解析** - 静态代码分析
- **多语言支持** - JavaScript、TypeScript、Python等
- **框架检测** - React、Vue、Django、Express等

## 📦 安装

### 前置要求
- Node.js 18+ (推荐: 20.x LTS)
- npm 9+ 或 yarn 3+
- Git 2.25+
- Redis 6+ (可选，用于缓存)
- 最少4GB RAM
- 最少2GB磁盘空间

### 系统特定安装指南

#### Windows
```bash
# 安装Node.js (从 https://nodejs.org/ 下载)
# 安装Git (从 https://git-scm.com/download/win 下载)
# 安装Redis (可选)
winget install Redis.Redis
```

#### macOS
```bash
# 使用Homebrew
brew install node@20
brew install git
brew install redis # 可选
```

#### Linux (Ubuntu/Debian)
```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Git
sudo apt-get install git

# 安装Redis (可选)
sudo apt-get install redis-server
```

### 安装步骤

#### 1. **克隆仓库**
```bash
git clone https://github.com/your-org/project-atlas.git
cd project-atlas
```

#### 2. **环境配置**
```bash
# 创建环境变量文件
cp .env.example .env

# 编辑.env文件 (如需要)
# BACKEND_PORT=3000
# FRONTEND_PORT=5173
# DATABASE_PATH=./data/atlas.db
# REDIS_URL=redis://localhost:6379
```

#### 3. **安装依赖**
```bash
# 一次性安装所有依赖
npm run install:all

# 或单独安装
cd backend && npm install
cd ../frontend && npm install
```

#### 4. **初始化数据库**
```bash
cd backend
npm run db:migrate
npm run db:seed # 添加示例数据 (可选)
```

#### 5. **启动开发服务器**
```bash
# 在项目根目录
npm run dev

# 或单独运行
# 终端1: Backend
cd backend && npm run dev

# 终端2: Frontend
cd frontend && npm run dev
```

#### 6. **访问确认**
- 前端: http://localhost:5173
- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api-docs

### 生产环境部署

#### 1. **构建**
```bash
# 构建前端
cd frontend && npm run build

# 构建后端
cd backend && npm run build
```

#### 2. **生产环境运行**
```bash
# 使用PM2 (推荐)
npm install -g pm2
pm2 start ecosystem.config.js

# 或直接运行
NODE_ENV=production node backend/dist/server.js
```

#### 3. **Docker部署**
```bash
# 构建Docker镜像
docker-compose build

# 运行容器
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 🎯 使用指南

### 基本使用

#### 1. **添加项目并分析**

##### 单仓库分析
```bash
# 通过Git URL分析
1. 在Web界面点击"New Project"
2. 输入Repository URL: https://github.com/user/repo.git
3. 选择分析选项:
   - Branch: main (默认)
   - Depth: Full analysis (完整分析)
   - Language filters: 如需要可选择特定语言
4. 点击"Start Analysis"

# 本地仓库分析
1. 选择"Upload Local Repository"
2. 选择文件夹或拖拽
3. 开始分析
```

##### 多仓库分析 (微服务)
```bash
1. 启用"Multi-Repository Mode"
2. 添加仓库列表:
   - Frontend: https://github.com/org/frontend.git
   - Backend: https://github.com/org/backend.git
   - Auth Service: https://github.com/org/auth.git
3. 点击"Analyze All"
4. 自动检测服务间连接关系
```

#### 2. **查看分析结果**

##### 仪表板视图
```
📊 Overview Dashboard
├── 技术栈摘要
│   ├── Languages: JavaScript (45%), Python (30%), Go (25%)
│   ├── Frameworks: React, Express, Django
│   └── Databases: PostgreSQL, Redis, MongoDB
├── 项目结构
│   ├── Total Files: 1,234
│   ├── Lines of Code: 45,678
│   └── Test Coverage: 78%
└── 关键指标
    ├── API Endpoints: 156
    ├── Database Tables: 45
    └── External Dependencies: 234
```

##### 依赖关系图
```
🔗 Interactive Dependency Graph
- 点击节点: 显示详细信息
- 拖拽: 移动图形
- 滚动: 缩放
- 过滤选项:
  - By Service Type (Frontend/Backend/Database)
  - By Technology (React/Node/Python)
  - By Connection Type (API/Database/Message Queue)
```

##### API端点列表
```
📡 API Endpoints
├── /api/v1/users
│   ├── GET - 获取用户列表
│   ├── POST - 创建新用户
│   └── Connected to: UserService, AuthService
├── /api/v1/products
│   ├── GET - 产品列表
│   ├── PUT - 更新产品信息
│   └── Database: products_table (PostgreSQL)
```

#### 3. **高级功能使用**

##### 自定义过滤
```javascript
// 过滤示例
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

##### 实时监控
```bash
# Webhook设置
1. Settings > Integrations > Webhooks
2. Add Webhook URL: https://your-domain.com/webhook
3. 选择事件:
   - Code Push
   - Pull Request
   - Branch Creation
4. 启用自动重新分析
```

##### API编程访问
```javascript
// API使用示例
const axios = require('axios');

// 开始项目分析
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

// 获取分析结果
const getResults = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/analysis`);
  return response.data;
};

// 获取依赖关系图数据
const getDependencyGraph = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/dependencies`);
  return response.data;
};
```

##### 添加自定义分析规则
```yaml
# custom-rules.yaml
rules:
  - name: "Security Check"
    description: "检查安全漏洞"
    patterns:
      - pattern: "eval\\("
        severity: "high"
        message: "避免使用eval()"
      - pattern: "dangerouslySetInnerHTML"
        severity: "medium"
        message: "谨慎使用dangerouslySetInnerHTML"
        
  - name: "Performance Check"
    description: "检查性能问题"
    patterns:
      - pattern: "console\\.log"
        severity: "low"
        message: "在生产环境中删除console.log"
```

#### 4. **数据导出**

##### 导出图表
```bash
# PNG/SVG格式
1. 图表右上角"Export"按钮
2. 选择格式: PNG (高质量) / SVG (矢量)
3. 选项:
   - Include Legend: 包含图例
   - Transparent Background: 透明背景
   - Custom Size: 自定义尺寸
```

##### 生成报告
```bash
# PDF报告
1. Reports > Generate Report
2. 选择模板:
   - Executive Summary (管理层总结)
   - Technical Deep Dive (技术深度分析)
   - Architecture Overview (架构概览)
3. 选择要包含的部分
4. 点击"Generate PDF"

# JSON/CSV数据导出
1. Data Export > Select Format
2. 选择数据类型:
   - Full Analysis Data (完整分析数据)
   - API Endpoints Only (仅API列表)
   - Dependencies Matrix (依赖关系矩阵)
3. Download
```

### CLI使用

```bash
# 安装CLI
npm install -g @project-atlas/cli

# 基本命令
atlas analyze <repo-url> [options]

# 示例
atlas analyze https://github.com/user/repo.git \
  --branch main \
  --output ./analysis-results \
  --format json

# 多仓库分析
atlas analyze-multi repos.txt \
  --output ./results \
  --parallel 4

# 实时监控模式
atlas watch ./my-project \
  --interval 60 \
  --notify slack
```

### 集成指南

#### VS Code扩展
```bash
# 安装
1. 在VS Code扩展中搜索"Project Atlas"
2. 点击Install
3. 在命令面板运行"Atlas: Analyze Current Project"
```

#### CI/CD管道集成
```yaml
# GitHub Actions示例
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

## 📡 API文档

### REST API端点

#### 认证
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

#### 项目管理
```http
# 获取项目列表
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

# 创建新项目
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

# 获取项目详情
GET /api/v1/projects/{projectId}

# 删除项目
DELETE /api/v1/projects/{projectId}
```

#### 分析API
```http
# 开始分析
POST /api/v1/projects/{projectId}/analyze
Authorization: Bearer <token>

{
  "force": true,  // 忽略现有分析结果
  "options": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["React", "Django"]
  }
}

# 检查分析状态
GET /api/v1/projects/{projectId}/analysis/status

Response:
{
  "status": "in_progress",
  "progress": 67,
  "currentStep": "分析依赖关系",
  "estimatedTime": "2分钟"
}

# 获取分析结果
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

#### 依赖关系图
```http
# 获取依赖数据
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

# 获取特定服务的依赖关系
GET /api/v1/projects/{projectId}/dependencies/{serviceId}
```

#### 报告生成
```http
# 生成PDF报告
POST /api/v1/projects/{projectId}/reports
Content-Type: application/json

{
  "format": "pdf",
  "template": "technical",
  "sections": ["overview", "dependencies", "apis", "security"],
  "options": {
    "includeCharts": true,
    "language": "zh"
  }
}

Response:
{
  "reportId": "report_456",
  "status": "generating",
  "downloadUrl": null
}

# 下载报告
GET /api/v1/reports/{reportId}/download
```

### WebSocket API

```javascript
// WebSocket连接
const ws = new WebSocket('ws://localhost:3000/ws');

// 认证
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// 订阅实时分析进度
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'analysis',
  projectId: 'proj_123'
}));

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'analysis:progress':
      console.log(`进度: ${data.progress}%`);
      break;
    case 'analysis:complete':
      console.log('分析完成！', data.results);
      break;
    case 'analysis:error':
      console.error('分析失败:', data.error);
      break;
  }
};
```

### GraphQL API (Beta)

```graphql
# Schema
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

# Query示例
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

# Mutation示例
mutation StartAnalysis($projectId: ID!, $options: AnalysisOptions) {
  startAnalysis(projectId: $projectId, options: $options) {
    id
    status
    estimatedTime
  }
}
```

### SDK使用示例

#### JavaScript/TypeScript
```typescript
import { AtlasClient } from '@project-atlas/sdk';

const client = new AtlasClient({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// 项目分析
const project = await client.projects.create({
  name: 'My Project',
  repositoryUrl: 'https://github.com/user/repo.git'
});

const analysis = await client.analysis.start(project.id, {
  deepAnalysis: true
});

// 监控进度
client.on('analysis:progress', (data) => {
  console.log(`进度: ${data.progress}%`);
});

// 获取结果
const results = await client.analysis.getResults(project.id);
```

#### Python
```python
from project_atlas import AtlasClient

client = AtlasClient(
    api_url='http://localhost:3000',
    api_key='your-api-key'
)

# 创建项目并分析
project = client.projects.create(
    name='My Project',
    repository_url='https://github.com/user/repo.git'
)

analysis = client.analysis.start(
    project_id=project.id,
    options={'deep_analysis': True}
)

# 等待结果
results = client.analysis.wait_for_results(project.id)
print(f"找到 {len(results['apis'])} 个API端点")
```

### 速率限制

API请求受以下限制：

- 认证用户: 1000请求/小时
- 匿名用户: 60请求/小时
- 分析请求: 10个并发分析

速率限制信息包含在响应头中：
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642089600
```

## 🏗️ 架构

```
project-atlas/
├── backend/           # Express.js API服务器
│   ├── src/
│   │   ├── controllers/   # API路由处理器
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   └── analyzers/     # 代码分析引擎
├── frontend/          # React应用程序
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义钩子
│   │   └── utils/         # 工具函数
├── shared/            # 共享TypeScript类型
└── docs/              # 文档
```

## 🤝 贡献

我们欢迎贡献！详情请参阅我们的[贡献指南](CONTRIBUTING.md)。

### 开发环境设置

1. Fork仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 进行更改
4. 运行测试: `npm test`
5. 提交更改: `git commit -m 'Add amazing feature'`
6. 推送到分支: `git push origin feature/amazing-feature`
7. 打开Pull Request

### 代码风格

- 所有新代码使用TypeScript
- 遵循ESLint配置
- 为新功能编写测试
- 根据需要更新文档

## 📊 支持的技术

### 语言
- JavaScript/TypeScript
- Python
- Java
- Go
- Rust
- PHP

### 框架
- **前端**: React、Vue、Angular、Svelte
- **后端**: Express、Fastify、Django、Flask、FastAPI
- **数据库**: MySQL、PostgreSQL、MongoDB、Redis

### 构建工具
- Webpack、Vite、Rollup
- Docker、Docker Compose
- GitHub Actions、GitLab CI

## 🔧 故障排除和FAQ

### 常见问题

#### 安装相关

**Q: npm install时出错**
```bash
# 删除node_modules后重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Windows需要Python构建工具时
npm install --global windows-build-tools
```

**Q: Redis连接错误**
```bash
# 检查Redis服务器状态
redis-cli ping

# 启动Redis服务器
# Linux/macOS
redis-server

# Windows
redis-server.exe
```

#### 分析相关

**Q: 分析耗时太长**
- 大型仓库使用shallow clone
- 排除不必要的目录 (node_modules、vendor等)
- 设置过滤器仅分析特定语言/文件

**Q: 内存不足错误**
```bash
# 增加Node.js内存限制
NODE_OPTIONS="--max-old-space-size=8192" npm run dev

# 或设置环境变量
export NODE_OPTIONS="--max-old-space-size=8192"
```

**Q: Git仓库访问权限错误**
```bash
# 检查SSH密钥设置
ssh -T git@github.com

# 保存HTTPS认证信息
git config --global credential.helper store

# 私有仓库使用token
https://username:token@github.com/user/repo.git
```

#### 性能优化

**Q: 前端运行缓慢**
- 大型图表限制节点数量
- 启用虚拟化(virtualization)
- 设置使用Web Worker

**Q: API响应缓慢**
- 启用Redis缓存
- 优化数据库索引
- 使用API响应分页

### 调试技巧

#### 设置日志级别
```bash
# 开发环境
LOG_LEVEL=debug npm run dev

# 生产环境
LOG_LEVEL=error npm start
```

#### 分析引擎调试
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

#### 解决网络问题
```bash
# CORS问题
# 在.env文件中添加
CORS_ORIGIN=http://localhost:5173

# 代理设置
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
```

### 已知问题

1. **Windows文件路径问题**
   - 需要启用长路径名支持
   - Git设置: `git config --system core.longpaths true`

2. **macOS文件监视限制**
   - 增加系统限制: `sudo sysctl -w kern.maxfiles=524288`

3. **大型monorepo分析**
   - 建议使用部分分析模式
   - 需要设置内存和CPU限制

### 获取帮助

- 📧 邮箱: support@project-atlas.dev
- 💬 Discord: [加入社区](https://discord.gg/project-atlas)
- 🐛 Bug报告: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 详细文档: [docs.project-atlas.dev](https://docs.project-atlas.dev)

## 📄 许可证

该项目在Apache License 2.0下获得许可 - 详情请参阅[LICENSE](LICENSE)文件。

## 🙏 致谢

- [D3.js](https://d3js.org/) - 强大的数据可视化
- [Mermaid](https://mermaid.js.org/) - 图表生成
- [Simple-Git](https://github.com/steveukx/git-js) - Git操作
- 所有我们的[贡献者](https://github.com/your-org/project-atlas/contributors)

## 📞 支持

- 📧 邮箱: support@project-atlas.dev
- 💬 Discord: [加入我们的社区](https://discord.gg/project-atlas)
- 🐛 问题: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 文档: [docs.project-atlas.dev](https://docs.project-atlas.dev)

---

由Project Atlas团队用❤️制作