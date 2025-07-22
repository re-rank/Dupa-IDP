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
- Node.js 18+ (recommended: 20.x LTS)
- npm 9+ or yarn 3+
- Git 2.25+
- Redis 6+ (optional, for caching)
- Minimum 4GB RAM
- Minimum 2GB disk space

### System-specific Installation Guide

#### Windows
```bash
# Install Node.js (download from https://nodejs.org/)
# Install Git (download from https://git-scm.com/download/win)
# Install Redis (optional)
winget install Redis.Redis
```

#### macOS
```bash
# Using Homebrew
brew install node@20
brew install git
brew install redis # optional
```

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install git

# Install Redis (optional)
sudo apt-get install redis-server
```

### Installation Steps

#### 1. **Clone the repository**
```bash
git clone https://github.com/your-org/project-atlas.git
cd project-atlas
```

#### 2. **Configure environment**
```bash
# Create environment variables file
cp .env.example .env

# Edit .env file (if needed)
# BACKEND_PORT=3000
# FRONTEND_PORT=5173
# DATABASE_PATH=./data/atlas.db
# REDIS_URL=redis://localhost:6379
```

#### 3. **Install dependencies**
```bash
# Install all dependencies at once
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

#### 4. **Initialize database**
```bash
cd backend
npm run db:migrate
npm run db:seed # Add sample data (optional)
```

#### 5. **Start development servers**
```bash
# From project root
npm run dev

# Or run individually
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

#### 6. **Access verification**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

### Production Deployment

#### 1. **Build**
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

#### 2. **Run in production**
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js

# Or run directly
NODE_ENV=production node backend/dist/server.js
```

#### 3. **Docker deployment**
```bash
# Build Docker images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🎯 Usage Guide

### Basic Usage

#### 1. **Add Project and Analyze**

##### Single Repository Analysis
```bash
# Analyze via Git URL
1. Click "New Project" in the web interface
2. Enter Repository URL: https://github.com/user/repo.git
3. Select analysis options:
   - Branch: main (default)
   - Depth: Full analysis
   - Language filters: Select specific languages if needed
4. Click "Start Analysis"

# Local Repository Analysis
1. Select "Upload Local Repository"
2. Select folder or drag & drop
3. Start analysis
```

##### Multi-Repository Analysis (Microservices)
```bash
1. Enable "Multi-Repository Mode"
2. Add repository list:
   - Frontend: https://github.com/org/frontend.git
   - Backend: https://github.com/org/backend.git
   - Auth Service: https://github.com/org/auth.git
3. Click "Analyze All"
4. Automatically detect service connections
```

#### 2. **View Analysis Results**

##### Dashboard View
```
📊 Overview Dashboard
├── Technology Stack Summary
│   ├── Languages: JavaScript (45%), Python (30%), Go (25%)
│   ├── Frameworks: React, Express, Django
│   └── Databases: PostgreSQL, Redis, MongoDB
├── Project Structure
│   ├── Total Files: 1,234
│   ├── Lines of Code: 45,678
│   └── Test Coverage: 78%
└── Key Metrics
    ├── API Endpoints: 156
    ├── Database Tables: 45
    └── External Dependencies: 234
```

##### Dependency Graph
```
🔗 Interactive Dependency Graph
- Click node: Show detailed information
- Drag: Move graph
- Scroll: Zoom in/out
- Filter options:
  - By Service Type (Frontend/Backend/Database)
  - By Technology (React/Node/Python)
  - By Connection Type (API/Database/Message Queue)
```

##### API Endpoints List
```
📡 API Endpoints
├── /api/v1/users
│   ├── GET - Get user list
│   ├── POST - Create new user
│   └── Connected to: UserService, AuthService
├── /api/v1/products
│   ├── GET - Product list
│   ├── PUT - Update product info
│   └── Database: products_table (PostgreSQL)
```

#### 3. **Advanced Features**

##### Custom Filtering
```javascript
// Filter example
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

##### Real-time Monitoring
```bash
# Webhook Setup
1. Settings > Integrations > Webhooks
2. Add Webhook URL: https://your-domain.com/webhook
3. Select events:
   - Code Push
   - Pull Request
   - Branch Creation
4. Enable automatic re-analysis
```

##### Programmatic API Access
```javascript
// API usage example
const axios = require('axios');

// Start project analysis
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

// Get analysis results
const getResults = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/analysis`);
  return response.data;
};

// Get dependency graph data
const getDependencyGraph = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/dependencies`);
  return response.data;
};
```

##### Add Custom Analysis Rules
```yaml
# custom-rules.yaml
rules:
  - name: "Security Check"
    description: "Check for security vulnerabilities"
    patterns:
      - pattern: "eval\\("
        severity: "high"
        message: "Avoid using eval()"
      - pattern: "dangerouslySetInnerHTML"
        severity: "medium"
        message: "Be careful with dangerouslySetInnerHTML"
        
  - name: "Performance Check"
    description: "Check for performance issues"
    patterns:
      - pattern: "console\\.log"
        severity: "low"
        message: "Remove console.log in production"
```

#### 4. **Export Data**

##### Export Diagrams
```bash
# PNG/SVG format
1. Click "Export" button in top-right of diagram
2. Select format: PNG (high quality) / SVG (vector)
3. Options:
   - Include Legend
   - Transparent Background
   - Custom Size
```

##### Generate Reports
```bash
# PDF Reports
1. Reports > Generate Report
2. Select template:
   - Executive Summary
   - Technical Deep Dive
   - Architecture Overview
3. Select sections to include
4. Click "Generate PDF"

# JSON/CSV Data Export
1. Data Export > Select Format
2. Select data type:
   - Full Analysis Data
   - API Endpoints Only
   - Dependencies Matrix
3. Download
```

### CLI Usage

```bash
# Install CLI
npm install -g @project-atlas/cli

# Basic commands
atlas analyze <repo-url> [options]

# Example
atlas analyze https://github.com/user/repo.git \
  --branch main \
  --output ./analysis-results \
  --format json

# Multi-repository analysis
atlas analyze-multi repos.txt \
  --output ./results \
  --parallel 4

# Real-time watch mode
atlas watch ./my-project \
  --interval 60 \
  --notify slack
```

### Integration Guide

#### VS Code Extension
```bash
# Installation
1. Search for "Project Atlas" in VS Code Extensions
2. Click Install
3. Run "Atlas: Analyze Current Project" from command palette
```

#### CI/CD Pipeline Integration
```yaml
# GitHub Actions example
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

## 📡 API Documentation

### REST API Endpoints

#### Authentication
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

#### Project Management
```http
# Get project list
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

# Create new project
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

# Get project details
GET /api/v1/projects/{projectId}

# Delete project
DELETE /api/v1/projects/{projectId}
```

#### Analysis API
```http
# Start analysis
POST /api/v1/projects/{projectId}/analyze
Authorization: Bearer <token>

{
  "force": true,  // Ignore existing analysis results
  "options": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["React", "Django"]
  }
}

# Check analysis status
GET /api/v1/projects/{projectId}/analysis/status

Response:
{
  "status": "in_progress",
  "progress": 67,
  "currentStep": "Analyzing dependencies",
  "estimatedTime": "2 minutes"
}

# Get analysis results
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

#### Dependency Graph
```http
# Get dependency data
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

# Get specific service dependencies
GET /api/v1/projects/{projectId}/dependencies/{serviceId}
```

#### Report Generation
```http
# Generate PDF report
POST /api/v1/projects/{projectId}/reports
Content-Type: application/json

{
  "format": "pdf",
  "template": "technical",
  "sections": ["overview", "dependencies", "apis", "security"],
  "options": {
    "includeCharts": true,
    "language": "en"
  }
}

Response:
{
  "reportId": "report_456",
  "status": "generating",
  "downloadUrl": null
}

# Download report
GET /api/v1/reports/{reportId}/download
```

### WebSocket API

```javascript
// WebSocket connection
const ws = new WebSocket('ws://localhost:3000/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// Subscribe to real-time analysis progress
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'analysis',
  projectId: 'proj_123'
}));

// Receive messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'analysis:progress':
      console.log(`Progress: ${data.progress}%`);
      break;
    case 'analysis:complete':
      console.log('Analysis complete!', data.results);
      break;
    case 'analysis:error':
      console.error('Analysis failed:', data.error);
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

# Query example
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

# Mutation example
mutation StartAnalysis($projectId: ID!, $options: AnalysisOptions) {
  startAnalysis(projectId: $projectId, options: $options) {
    id
    status
    estimatedTime
  }
}
```

### SDK Usage Examples

#### JavaScript/TypeScript
```typescript
import { AtlasClient } from '@project-atlas/sdk';

const client = new AtlasClient({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// Analyze project
const project = await client.projects.create({
  name: 'My Project',
  repositoryUrl: 'https://github.com/user/repo.git'
});

const analysis = await client.analysis.start(project.id, {
  deepAnalysis: true
});

// Monitor progress
client.on('analysis:progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
});

// Get results
const results = await client.analysis.getResults(project.id);
```

#### Python
```python
from project_atlas import AtlasClient

client = AtlasClient(
    api_url='http://localhost:3000',
    api_key='your-api-key'
)

# Create project and analyze
project = client.projects.create(
    name='My Project',
    repository_url='https://github.com/user/repo.git'
)

analysis = client.analysis.start(
    project_id=project.id,
    options={'deep_analysis': True}
)

# Wait for results
results = client.analysis.wait_for_results(project.id)
print(f"Found {len(results['apis'])} API endpoints")
```

### Rate Limiting

API requests are limited as follows:

- Authenticated users: 1000 requests/hour
- Anonymous users: 60 requests/hour
- Analysis requests: 10 concurrent analyses

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642089600
```

## 🔧 Troubleshooting and FAQ

### Common Issues

#### Installation Related

**Q: Error during npm install**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If Python build tools needed (Windows)
npm install --global windows-build-tools
```

**Q: Redis connection error**
```bash
# Check Redis server status
redis-cli ping

# Start Redis server
# Linux/macOS
redis-server

# Windows
redis-server.exe
```

#### Analysis Related

**Q: Analysis takes too long**
- Use shallow clone for large repositories
- Exclude unnecessary directories (node_modules, vendor, etc.)
- Set filters to analyze specific languages/files only

**Q: Out of memory error**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" npm run dev

# Or set environment variable
export NODE_OPTIONS="--max-old-space-size=8192"
```

**Q: Git repository access permission error**
```bash
# Check SSH key setup
ssh -T git@github.com

# Save HTTPS credentials
git config --global credential.helper store

# For private repositories, use token
https://username:token@github.com/user/repo.git
```

#### Performance Optimization

**Q: Frontend is slow**
- Limit node count for large graphs
- Enable virtualization
- Configure web worker usage

**Q: API responses are slow**
- Enable Redis caching
- Optimize database indexes
- Use API response pagination

### Debugging Tips

#### Set Log Level
```bash
# Development environment
LOG_LEVEL=debug npm run dev

# Production environment
LOG_LEVEL=error npm start
```

#### Debug Analysis Engine
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

#### Network Issue Resolution
```bash
# CORS issues
# Add to .env file
CORS_ORIGIN=http://localhost:5173

# Proxy settings
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
```

### Known Issues

1. **File path issues on Windows**
   - Need to enable long path support
   - Git configuration: `git config --system core.longpaths true`

2. **File watch limit on macOS**
   - Increase system limit: `sudo sysctl -w kern.maxfiles=524288`

3. **Large monorepo analysis**
   - Partial analysis mode recommended
   - Memory and CPU limits required

### Getting Help

- 📧 Email: support@project-atlas.dev
- 💬 Discord: [Join our community](https://discord.gg/project-atlas)
- 🐛 Bug reports: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 Documentation: [docs.project-atlas.dev](https://docs.project-atlas.dev)

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