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
- Node.js 18+
- npm 或 yarn
- Git

### 快速开始

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-org/project-atlas.git
   cd project-atlas
   ```

2. **安装依赖**
   ```bash
   npm run install:all
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **在浏览器中打开**
   - 前端: http://localhost:5173
   - 后端API: http://localhost:3000

## 🎯 使用方法

### 基本分析

1. **添加项目**
   - 输入Git仓库URL
   - 选择单个或多个仓库分析
   - 点击"分析"

2. **查看结果**
   - 交互式依赖图
   - API端点列表
   - 技术栈概览
   - 数据库连接

3. **导出数据**
   - 下载PNG/SVG格式的图表
   - 导出JSON/CSV/PDF格式的报告

### 高级功能

- **多仓库分析**: 分析整个微服务生态系统
- **自定义过滤器**: 专注于特定组件或技术
- **Webhook集成**: 代码更改时自动重新分析
- **API访问**: 对分析结果的编程访问

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