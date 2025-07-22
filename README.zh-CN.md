# Project Atlas

![许可证](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![版本](https://img.shields.io/badge/version-0.1.0-green.svg)

> 自动分析和可视化代码库结构和依赖关系的开源工具

*其他语言版本: [한국어](README.ko.md), [English](README.md), [简体中文](README.zh-CN.md)*

## 🌟 概述

Project Atlas 是一个开源工具，可自动分析单个或多个代码库，以可视化前端、后端、数据库和API结构及其依赖关系和互连。该工具旨在通过自动分析和直观的可视化，帮助开发人员和运营人员快速理解复杂的项目架构。

### 主要功能

- 📊 **基于Git的项目分析**：文件夹结构和文件类型识别，自动语言和框架检测
- 🔄 **服务依赖提取**：API调用跟踪，数据库连接识别，环境变量和端口信息收集
- 📈 **可视化界面**：服务互连图，API流程图，数据库访问可视化
- 📋 **组件报告**：自动API提取，框架/语言统计，服务所有权信息

## 🚀 快速开始

### 前提条件

- Node.js 18.x 或更高版本
- Git
- Docker（可选）

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/project-atlas.git
cd project-atlas

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

### 使用Docker安装

```bash
# 构建Docker镜像
docker build -t project-atlas .

# 运行容器
docker run -p 3000:3000 -p 8080:8080 project-atlas
```

## 📖 使用方法

1. 访问Web界面（默认：http://localhost:3000）
2. 输入要分析的Git仓库URL
3. 分析完成后，将自动显示可视化结果
4. 使用各种视图和过滤器探索项目结构

## 🛠️ 技术栈

- **前端**：React.js, TypeScript, D3.js, Mermaid.js
- **后端**：Express.js, Node.js
- **分析引擎**：基于AST的静态分析
- **数据库**：SQLite, Redis（缓存）
- **部署**：Docker, GitHub Actions

## 🤝 贡献

Project Atlas 是一个开源项目，我们欢迎各种形式的贡献：

1. Fork 这个仓库
2. 创建新分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

更多详情，请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📜 许可证

本项目在Apache 2.0许可证下分发。有关更多信息，请参阅 [LICENSE](LICENSE) 文件。

## 📞 联系方式

- 项目维护者：[姓名](mailto:email@example.com)
- 网站：[https://project-atlas.io](https://project-atlas.io)
- 社区：[Discord](https://discord.gg/project-atlas)