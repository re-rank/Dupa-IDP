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
- Node.js 18+ (권장: 20.x LTS)
- npm 9+ 또는 yarn 3+
- Git 2.25+
- Redis 6+ (선택사항, 캐싱용)
- 최소 4GB RAM
- 최소 2GB 디스크 공간

### 시스템별 설치 가이드

#### Windows
```bash
# Node.js 설치 (https://nodejs.org/ 에서 다운로드)
# Git 설치 (https://git-scm.com/download/win 에서 다운로드)
# Redis 설치 (선택사항)
winget install Redis.Redis
```

#### macOS
```bash
# Homebrew 사용
brew install node@20
brew install git
brew install redis # 선택사항
```

#### Linux (Ubuntu/Debian)
```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git 설치
sudo apt-get install git

# Redis 설치 (선택사항)
sudo apt-get install redis-server
```

### 설치 방법

#### 1. **저장소 클론**
```bash
git clone https://github.com/your-org/project-atlas.git
cd project-atlas
```

#### 2. **환경 설정**
```bash
# 환경 변수 파일 생성
cp .env.example .env

# .env 파일 편집 (필요시)
# BACKEND_PORT=3000
# FRONTEND_PORT=5173
# DATABASE_PATH=./data/atlas.db
# REDIS_URL=redis://localhost:6379
```

#### 3. **의존성 설치**
```bash
# 모든 의존성 한번에 설치
npm run install:all

# 또는 개별 설치
cd backend && npm install
cd ../frontend && npm install
```

#### 4. **데이터베이스 초기화**
```bash
cd backend
npm run db:migrate
npm run db:seed # 샘플 데이터 추가 (선택사항)
```

#### 5. **개발 서버 실행**
```bash
# 프로젝트 루트에서
npm run dev

# 또는 개별 실행
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

#### 6. **접속 확인**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API 문서: http://localhost:3000/api-docs

### 프로덕션 배포

#### 1. **빌드**
```bash
# 프론트엔드 빌드
cd frontend && npm run build

# 백엔드 빌드
cd backend && npm run build
```

#### 2. **프로덕션 실행**
```bash
# PM2 사용 (권장)
npm install -g pm2
pm2 start ecosystem.config.js

# 또는 직접 실행
NODE_ENV=production node backend/dist/server.js
```

#### 3. **Docker 배포**
```bash
# Docker 이미지 빌드
docker-compose build

# 컨테이너 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 🎯 사용 가이드

### 기본 사용법

#### 1. **프로젝트 추가 및 분석**

##### 단일 저장소 분석
```bash
# Git URL로 분석
1. 웹 인터페이스에서 "New Project" 클릭
2. Repository URL 입력: https://github.com/user/repo.git
3. 분석 옵션 선택:
   - Branch: main (기본값)
   - Depth: Full analysis (전체 분석)
   - Language filters: 필요시 특정 언어만 선택
4. "Start Analysis" 클릭

# 로컬 저장소 분석
1. "Upload Local Repository" 선택
2. 폴더 선택 또는 드래그 앤 드롭
3. 분석 시작
```

##### 멀티 저장소 분석 (마이크로서비스)
```bash
1. "Multi-Repository Mode" 활성화
2. 저장소 목록 추가:
   - Frontend: https://github.com/org/frontend.git
   - Backend: https://github.com/org/backend.git
   - Auth Service: https://github.com/org/auth.git
3. "Analyze All" 클릭
4. 서비스 간 연결 관계 자동 탐지
```

#### 2. **분석 결과 확인**

##### 대시보드 뷰
```
📊 Overview Dashboard
├── 기술 스택 요약
│   ├── Languages: JavaScript (45%), Python (30%), Go (25%)
│   ├── Frameworks: React, Express, Django
│   └── Databases: PostgreSQL, Redis, MongoDB
├── 프로젝트 구조
│   ├── Total Files: 1,234
│   ├── Lines of Code: 45,678
│   └── Test Coverage: 78%
└── 주요 지표
    ├── API Endpoints: 156
    ├── Database Tables: 45
    └── External Dependencies: 234
```

##### 의존성 그래프
```
🔗 Interactive Dependency Graph
- 노드 클릭: 상세 정보 표시
- 드래그: 그래프 이동
- 스크롤: 확대/축소
- 필터 옵션:
  - By Service Type (Frontend/Backend/Database)
  - By Technology (React/Node/Python)
  - By Connection Type (API/Database/Message Queue)
```

##### API 엔드포인트 목록
```
📡 API Endpoints
├── /api/v1/users
│   ├── GET - 사용자 목록 조회
│   ├── POST - 새 사용자 생성
│   └── Connected to: UserService, AuthService
├── /api/v1/products
│   ├── GET - 상품 목록
│   ├── PUT - 상품 정보 수정
│   └── Database: products_table (PostgreSQL)
```

#### 3. **고급 기능 활용**

##### 커스텀 필터링
```javascript
// 필터 예시
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

##### 실시간 모니터링
```bash
# Webhook 설정
1. Settings > Integrations > Webhooks
2. Add Webhook URL: https://your-domain.com/webhook
3. Events 선택:
   - Code Push
   - Pull Request
   - Branch Creation
4. 자동 재분석 활성화
```

##### API를 통한 프로그래밍 방식 접근
```javascript
// API 사용 예시
const axios = require('axios');

// 프로젝트 분석 시작
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

// 분석 결과 조회
const getResults = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/analysis`);
  return response.data;
};

// 의존성 그래프 데이터 가져오기
const getDependencyGraph = async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}/dependencies`);
  return response.data;
};
```

##### 커스텀 분석 규칙 추가
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

#### 4. **데이터 내보내기**

##### 다이어그램 내보내기
```bash
# PNG/SVG 형식
1. 다이어그램 우측 상단 "Export" 버튼
2. 형식 선택: PNG (고화질) / SVG (벡터)
3. 옵션:
   - Include Legend: 범례 포함
   - Transparent Background: 투명 배경
   - Custom Size: 사용자 정의 크기
```

##### 보고서 생성
```bash
# PDF 보고서
1. Reports > Generate Report
2. 템플릿 선택:
   - Executive Summary (경영진용)
   - Technical Deep Dive (개발팀용)
   - Architecture Overview (아키텍처 문서)
3. 포함할 섹션 선택
4. "Generate PDF" 클릭

# JSON/CSV 데이터 내보내기
1. Data Export > Select Format
2. 데이터 유형 선택:
   - Full Analysis Data (전체 분석 데이터)
   - API Endpoints Only (API 목록만)
   - Dependencies Matrix (의존성 매트릭스)
3. Download
```

### CLI 사용법

```bash
# CLI 설치
npm install -g @project-atlas/cli

# 기본 명령어
atlas analyze <repo-url> [options]

# 예시
atlas analyze https://github.com/user/repo.git \
  --branch main \
  --output ./analysis-results \
  --format json

# 멀티 저장소 분석
atlas analyze-multi repos.txt \
  --output ./results \
  --parallel 4

# 실시간 감시 모드
atlas watch ./my-project \
  --interval 60 \
  --notify slack
```

### 통합 가이드

#### VS Code Extension
```bash
# 설치
1. VS Code Extensions에서 "Project Atlas" 검색
2. Install 클릭
3. 명령 팔레트에서 "Atlas: Analyze Current Project" 실행
```

#### CI/CD 파이프라인 통합
```yaml
# GitHub Actions 예시
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

## 📡 API 문서

### REST API 엔드포인트

#### 인증
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

#### 프로젝트 관리
```http
# 프로젝트 목록 조회
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

# 새 프로젝트 생성
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

# 프로젝트 상세 조회
GET /api/v1/projects/{projectId}

# 프로젝트 삭제
DELETE /api/v1/projects/{projectId}
```

#### 분석 API
```http
# 분석 시작
POST /api/v1/projects/{projectId}/analyze
Authorization: Bearer <token>

{
  "force": true,  // 기존 분석 결과 무시
  "options": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["React", "Django"]
  }
}

# 분석 상태 확인
GET /api/v1/projects/{projectId}/analysis/status

Response:
{
  "status": "in_progress",
  "progress": 67,
  "currentStep": "Analyzing dependencies",
  "estimatedTime": "2 minutes"
}

# 분석 결과 조회
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

#### 의존성 그래프
```http
# 의존성 데이터 조회
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

# 특정 서비스의 의존성
GET /api/v1/projects/{projectId}/dependencies/{serviceId}
```

#### 보고서 생성
```http
# PDF 보고서 생성
POST /api/v1/projects/{projectId}/reports
Content-Type: application/json

{
  "format": "pdf",
  "template": "technical",
  "sections": ["overview", "dependencies", "apis", "security"],
  "options": {
    "includeCharts": true,
    "language": "ko"
  }
}

Response:
{
  "reportId": "report_456",
  "status": "generating",
  "downloadUrl": null
}

# 보고서 다운로드
GET /api/v1/reports/{reportId}/download
```

### WebSocket API

```javascript
// WebSocket 연결
const ws = new WebSocket('ws://localhost:3000/ws');

// 인증
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// 실시간 분석 진행 상황 구독
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'analysis',
  projectId: 'proj_123'
}));

// 메시지 수신
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

# Query 예시
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

# Mutation 예시
mutation StartAnalysis($projectId: ID!, $options: AnalysisOptions) {
  startAnalysis(projectId: $projectId, options: $options) {
    id
    status
    estimatedTime
  }
}
```

### SDK 사용 예시

#### JavaScript/TypeScript
```typescript
import { AtlasClient } from '@project-atlas/sdk';

const client = new AtlasClient({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// 프로젝트 분석
const project = await client.projects.create({
  name: 'My Project',
  repositoryUrl: 'https://github.com/user/repo.git'
});

const analysis = await client.analysis.start(project.id, {
  deepAnalysis: true
});

// 진행 상황 모니터링
client.on('analysis:progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
});

// 결과 조회
const results = await client.analysis.getResults(project.id);
```

#### Python
```python
from project_atlas import AtlasClient

client = AtlasClient(
    api_url='http://localhost:3000',
    api_key='your-api-key'
)

# 프로젝트 생성 및 분석
project = client.projects.create(
    name='My Project',
    repository_url='https://github.com/user/repo.git'
)

analysis = client.analysis.start(
    project_id=project.id,
    options={'deep_analysis': True}
)

# 결과 대기
results = client.analysis.wait_for_results(project.id)
print(f"Found {len(results['apis'])} API endpoints")
```

### Rate Limiting

API 요청은 다음과 같이 제한됩니다:

- 인증된 사용자: 1000 requests/hour
- 익명 사용자: 60 requests/hour
- 분석 요청: 10 concurrent analyses

Rate limit 정보는 응답 헤더에 포함됩니다:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642089600
```

## 🔧 문제 해결 및 FAQ

### 자주 발생하는 문제

#### 설치 관련

**Q: npm install 중 에러가 발생합니다**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Python 빌드 도구 필요시 (Windows)
npm install --global windows-build-tools
```

**Q: Redis 연결 오류가 발생합니다**
```bash
# Redis 서버 상태 확인
redis-cli ping

# Redis 서버 시작
# Linux/macOS
redis-server

# Windows
redis-server.exe
```

#### 분석 관련

**Q: 분석이 너무 오래 걸립니다**
- 대용량 저장소의 경우 shallow clone 사용
- 불필요한 디렉토리 제외 (node_modules, vendor 등)
- 특정 언어/파일만 분석하도록 필터 설정

**Q: 메모리 부족 오류가 발생합니다**
```bash
# Node.js 메모리 제한 증가
NODE_OPTIONS="--max-old-space-size=8192" npm run dev

# 또는 환경 변수 설정
export NODE_OPTIONS="--max-old-space-size=8192"
```

**Q: Git 저장소 접근 권한 오류**
```bash
# SSH 키 설정 확인
ssh -T git@github.com

# HTTPS 인증 정보 저장
git config --global credential.helper store

# 프라이빗 저장소의 경우 토큰 사용
https://username:token@github.com/user/repo.git
```

#### 성능 최적화

**Q: 프론트엔드가 느립니다**
- 대용량 그래프의 경우 노드 수 제한
- 가상화(virtualization) 활성화
- 웹 워커 사용 설정

**Q: API 응답이 느립니다**
- Redis 캐싱 활성화
- 데이터베이스 인덱스 최적화
- API 응답 페이지네이션 사용

### 디버깅 팁

#### 로그 레벨 설정
```bash
# 개발 환경
LOG_LEVEL=debug npm run dev

# 프로덕션 환경
LOG_LEVEL=error npm start
```

#### 분석 엔진 디버그
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

#### 네트워크 문제 해결
```bash
# CORS 문제
# .env 파일에 추가
CORS_ORIGIN=http://localhost:5173

# 프록시 설정
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
```

### 알려진 이슈

1. **Windows에서 파일 경로 문제**
   - 긴 경로명 지원 활성화 필요
   - Git 설정: `git config --system core.longpaths true`

2. **macOS에서 파일 감시 제한**
   - 시스템 제한 증가: `sudo sysctl -w kern.maxfiles=524288`

3. **대용량 모노레포 분석**
   - 부분 분석 모드 사용 권장
   - 메모리 및 CPU 제한 설정 필요

### 도움 받기

- 📧 이메일: support@project-atlas.dev
- 💬 Discord: [커뮤니티 참여](https://discord.gg/project-atlas)
- 🐛 버그 리포트: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 상세 문서: [docs.project-atlas.dev](https://docs.project-atlas.dev)

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