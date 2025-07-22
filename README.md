# Project Atlas

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**🌍 [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md)**

An open-source tool that automatically analyzes single or multi-repository codebases to visualize frontend, backend, database, and API structures along with their dependencies and interconnections.

## 🚀 Features

- **🔍 Automated Analysis**: Automatically detect project structure, languages, and frameworks
- **📊 Interactive Visualization**: Service dependency graphs, API flow diagrams, and architecture overviews
- **🏗️ Multi-Repository Support**: Analyze microservices and distributed architectures
- **📈 Comprehensive Reports**: Technology stack statistics, API endpoints, and dependency analysis
- **🔄 Real-time Updates**: Live analysis progress and automatic re-analysis triggers
- **📤 Export Capabilities**: Export diagrams and reports in multiple formats

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js** - API server
- **TypeScript** - Type safety
- **SQLite** - Data storage
- **Redis** - Caching and job queue
- **Simple-Git** - Git repository analysis

### Frontend
- **React** + **TypeScript** - User interface
- **D3.js** - Interactive visualizations
- **Mermaid.js** - Diagram generation
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Analysis Engine
- **AST Parsing** - Static code analysis
- **Multi-language Support** - JavaScript, TypeScript, Python, and more
- **Framework Detection** - React, Vue, Django, Express, etc.

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/project-atlas.git
   cd project-atlas
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🎯 Usage

### Basic Analysis

1. **Add a Project**
   - Enter your Git repository URL
   - Choose single or multi-repository analysis
   - Click "Analyze"

2. **View Results**
   - Interactive dependency graph
   - API endpoint listings
   - Technology stack overview
   - Database connections

3. **Export Data**
   - Download diagrams as PNG/SVG
   - Export reports as JSON/CSV/PDF

### Advanced Features

- **Multi-Repository Analysis**: Analyze entire microservices ecosystems
- **Custom Filters**: Focus on specific components or technologies
- **Webhook Integration**: Automatic re-analysis on code changes
- **API Access**: Programmatic access to analysis results

## 🏗️ Architecture

```
project-atlas/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── analyzers/     # Code analysis engines
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
├── shared/            # Shared TypeScript types
└── docs/              # Documentation
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation as needed

## 📊 Supported Technologies

### Languages
- JavaScript/TypeScript
- Python
- Java
- Go
- Rust
- PHP

### Frameworks
- **Frontend**: React, Vue, Angular, Svelte
- **Backend**: Express, Fastify, Django, Flask, FastAPI
- **Database**: MySQL, PostgreSQL, MongoDB, Redis

### Build Tools
- Webpack, Vite, Rollup
- Docker, Docker Compose
- GitHub Actions, GitLab CI

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [D3.js](https://d3js.org/) for powerful data visualization
- [Mermaid](https://mermaid.js.org/) for diagram generation
- [Simple-Git](https://github.com/steveukx/git-js) for Git operations
- All our [contributors](https://github.com/your-org/project-atlas/contributors)

## 📞 Support

- 📧 Email: support@project-atlas.dev
- 💬 Discord: [Join our community](https://discord.gg/project-atlas)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 Documentation: [docs.project-atlas.dev](https://docs.project-atlas.dev)

---

Made with ❤️ by the Project Atlas team