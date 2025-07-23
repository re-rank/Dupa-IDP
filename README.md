# Project Atlas

<div align="center">

**[English](README.md)** | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh.md) | [中文](README.zh-CN.md)

</div>

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

An open-source tool for automated code structure analysis and visualization of single or multi-repository codebases.

## 🚀 Features

- **🔍 Automated Analysis** - Automatically detects project structure, languages, and frameworks
- **📊 Interactive Visualizations** - Service dependency graphs, API flow diagrams, and architecture overviews
- **🏗️ Multi-Repository Support** - Analyze microservices and distributed architectures
- **📈 Comprehensive Reports** - Tech stack insights, API endpoints, and dependency analysis
- **🔄 Real-time Updates** - Live analysis progress and automatic re-analysis triggers
- **📤 Export Capabilities** - Export diagrams and reports in multiple formats

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type safety and better developer experience
- **SQLite** - Lightweight database for storing analysis results
- **Redis** (optional) - Caching and job queue management
- **Simple-Git** - Git repository operations

### Frontend
- **React** + **TypeScript** - Modern UI framework
- **D3.js** - Interactive data visualizations
- **Mermaid.js** - Diagram generation
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

### Analysis Engine
- **AST Parsing** - Static code analysis using Babel
- **Multi-language Support** - JavaScript, TypeScript, Python, Go, and more
- **Framework Detection** - Automatic detection of popular frameworks

## 📋 Prerequisites

- Node.js 18+ (recommended: 20.x LTS)
- npm 9+ or yarn 3+
- Git 2.25+
- Redis 6+ (optional, for caching and job queues)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/re-rank/Dupa-IDP.git
cd Dupa-IDP
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the .env file with your settings
# Key variables:
# - BACKEND_PORT=3001
# - DATABASE_PATH=./data/atlas.db
# - REDIS_ENABLED=false (set to true if Redis is installed)
```

### 4. Start development servers
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend dev server on http://localhost:5173

## 📖 Usage

### Analyzing a Repository

1. **Via Web Interface**
   - Navigate to http://localhost:5173
   - Click "New Project"
   - Enter a Git repository URL
   - Click "Start Analysis"

2. **Via API**
   ```bash
   curl -X POST http://localhost:3001/api/projects \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My Project",
       "repositoryUrl": "https://github.com/user/repo.git",
       "branch": "main"
     }'
   ```

### Viewing Results

The analysis results include:
- **Architecture Overview** - High-level system architecture
- **Dependency Graph** - Interactive visualization of module dependencies
- **API Documentation** - Automatically extracted API endpoints
- **Tech Stack Analysis** - Languages, frameworks, and libraries used
- **Code Metrics** - Lines of code, complexity, and other metrics

## 🏗️ Architecture

```
project-atlas/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data models
│   │   ├── middlewares/  # Express middlewares
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend tests
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── tests/            # Frontend tests
└── shared/               # Shared types and utilities
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_PATH=./data/atlas.db

# Redis Configuration (optional)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379

# Analysis Configuration
MAX_FILE_SIZE=52428800        # 50MB
MAX_ANALYSIS_TIME=600000      # 10 minutes
CONCURRENT_ANALYSES=3

# Security
JWT_SECRET=your-secret-key-change-this
SESSION_SECRET=your-session-secret-change-this
```

### Analysis Configuration

Configure analysis behavior in `backend/src/config/analysis.config.ts`:

```typescript
export const analysisConfig = {
  // File patterns to ignore
  ignoredPatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    '**/*.min.js',
    '**/*.map'
  ],
  
  // Supported file extensions
  supportedExtensions: [
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.go', '.java', '.rb',
    '.php', '.cs', '.cpp', '.c'
  ],
  
  // Framework detection patterns
  frameworkPatterns: {
    react: ['package.json:react', '*.jsx', 'React.'],
    vue: ['package.json:vue', '*.vue', 'Vue.'],
    angular: ['package.json:@angular/core', 'angular.json'],
    // ... more patterns
  }
};
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

### Writing Tests

Example backend test:
```typescript
import request from 'supertest';
import app from '../src/index';

describe('GET /api/projects', () => {
  it('should return list of projects', async () => {
    const response = await request(app)
      .get('/api/projects')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## 🚢 Deployment

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individually
docker build -t project-atlas-backend ./backend
docker build -t project-atlas-frontend ./frontend
```

### Manual Deployment

1. **Build the applications**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-production-secret
   # ... other production settings
   ```

3. **Start the servers**
   ```bash
   # Using PM2 (recommended)
   pm2 start ecosystem.config.js
   
   # Or directly
   node backend/dist/index.js
   ```

### Environment-Specific Configuration

- **Development**: Uses SQLite, optional Redis, relaxed security
- **Production**: Consider PostgreSQL/MySQL, enable Redis, strict security
- **Testing**: In-memory database, mocked external services

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Write tests for new features
- Update documentation as needed

## 📚 API Documentation

### Projects API

**Create Project**
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Project Name",
  "repositoryUrl": "https://github.com/user/repo.git",
  "branch": "main"
}
```

**Get Projects**
```http
GET /api/projects
```

**Get Project Details**
```http
GET /api/projects/:id
```

**Start Analysis**
```http
POST /api/projects/:id/analyze
```

### Analysis API

**Get Analysis Status**
```http
GET /api/analysis/:jobId/status
```

**Get Analysis Results**
```http
GET /api/analysis/:jobId/results
```

For full API documentation, visit http://localhost:3001/api-docs when running the server.

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change the port in .env
```

**Redis connection failed**
```bash
# Start Redis server
redis-server  # macOS/Linux
# Or disable Redis in .env
REDIS_ENABLED=false
```

**Database errors**
```bash
# Reset the database
rm backend/data/atlas.db
npm run dev  # Database will be recreated
```

**Memory issues during analysis**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" npm run dev
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [D3.js](https://d3js.org/) - Data visualization
- [Mermaid](https://mermaid.js.org/) - Diagram generation
- [Simple-Git](https://github.com/steveukx/git-js) - Git operations
- All our [contributors](https://github.com/re-rank/Dupa-IDP/contributors)

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/re-rank/Dupa-IDP/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/re-rank/Dupa-IDP/discussions)
- 📖 Wiki: [Project Wiki](https://github.com/re-rank/Dupa-IDP/wiki)

---

Made with ❤️ by the Project Atlas Team