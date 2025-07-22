# Project Atlas

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**🌍 [English](README.md) | [日本語](README.ja.md) | [中文](README.zh.md)**

단일 또는 다중 저장소 코드베이스를 자동으로 분석하여 프론트엔드, 백엔드, 데이터베이스, API 구조와 의존성 및 상호 연결을 시각화하는 오픈소스 도구입니다.

## 🚀 주요 기능

- **🔍 자동 분석**: 프로젝트 구조, 언어, 프레임워크 자동 감지
- **📊 인터랙티브 시각화**: 서비스 의존성 그래프, API 플로우 다이어그램, 아키텍처 개요
- **🏗️ 다중 저장소 지원**: 마이크로서비스 및 분산 아키텍처 분석
- **📈 종합 리포트**: 기술 스택 통계, API 엔드포인트, 의존성 분석
- **🔄 실시간 업데이트**: 실시간 분석 진행 상황 및 자동 재분석 트리거
- **📤 내보내기 기능**: 다양한 형식으로 다이어그램 및 리포트 내보내기

## 🛠️ 기술 스택

### 백엔드
- **Node.js** + **Express.js** - API 서버
- **TypeScript** - 타입 안전성
- **SQLite** - 데이터 저장
- **Redis** - 캐싱 및 작업 큐
- **Simple-Git** - Git 저장소 분석

### 프론트엔드
- **React** + **TypeScript** - 사용자 인터페이스
- **D3.js** - 인터랙티브 시각화
- **Mermaid.js** - 다이어그램 생성
- **Tailwind CSS** - 스타일링
- **Vite** - 빌드 도구

### 분석 엔진
- **AST 파싱** - 정적 코드 분석
- **다중 언어 지원** - JavaScript, TypeScript, Python 등
- **프레임워크 감지** - React, Vue, Django, Express 등

## 📦 설치

### 사전 요구사항
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

### 설치 단계

#### 1. **저장소 클론**
```bash
git clone https://github.com/your-org/project-atlas.git
cd project-atlas
```

#### 2. **환경 설정**
```bash
# 환경 변수 파일 생성
cp backend/.env.example backend/.env

# .env 파일 편집 (필요시)
# BACKEND_PORT=3001
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

#### 4. **개발 서버 시작**
```bash
# 프로젝트 루트에서
npm run dev

# 또는 개별 실행
# 터미널 1: 백엔드
cd backend && npm run dev

# 터미널 2: 프론트엔드
cd frontend && npm run dev
```

#### 5. **접속 확인**
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3001
- API 문서: http://localhost:3001/api-docs

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
NODE_ENV=production node backend/dist/index.js
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
# Git URL을 통한 분석
1. 웹 인터페이스에서 "새 프로젝트" 클릭
2. 저장소 URL 입력: https://github.com/user/repo.git
3. 분석 옵션 선택:
   - 브랜치: main (기본값)
   - 깊이: 전체 분석
   - 언어 필터: 필요시 특정 언어 선택
4. "분석 시작" 클릭

# 로컬 저장소 분석
1. "로컬 저장소 업로드" 선택
2. 폴더 선택 또는 드래그 앤 드롭
3. 분석 시작
```

##### 다중 저장소 분석 (마이크로서비스)
```bash
1. "다중 저장소 모드" 활성화
2. 저장소 목록 추가:
   - 프론트엔드: https://github.com/org/frontend.git
   - 백엔드: https://github.com/org/backend.git
   - 인증 서비스: https://github.com/org/auth.git
3. "모두 분석" 클릭
4. 서비스 연결 자동 감지
```

#### 2. **분석 결과 보기**

##### 대시보드 뷰
```
📊 개요 대시보드
├── 기술 스택 요약
│   ├── 언어: JavaScript (45%), Python (30%), Go (25%)
│   ├── 프레임워크: React, Express, Django
│   └── 데이터베이스: PostgreSQL, Redis, MongoDB
├── 프로젝트 구조
│   ├── 총 파일 수: 1,234
│   ├── 코드 라인 수: 45,678
│   └── 테스트 커버리지: 78%
└── 주요 지표
    ├── API 엔드포인트: 156
    ├── 데이터베이스 테이블: 45
    └── 외부 의존성: 234
```

## 🏗️ 아키텍처

```
project-atlas/
├── backend/           # Express.js API 서버
│   ├── src/
│   │   ├── controllers/   # API 라우트 핸들러
│   │   ├── services/      # 비즈니스 로직
│   │   ├── models/        # 데이터 모델
│   │   └── analyzers/     # 코드 분석 엔진
├── frontend/          # React 애플리케이션
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   └── utils/         # 유틸리티 함수
├── shared/            # 공유 TypeScript 타입
└── docs/              # 문서
```

## 🤝 기여하기

기여를 환영합니다! 자세한 내용은 [기여 가이드](CONTRIBUTING.md)를 참조하세요.

### 개발 환경 설정

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature/amazing-feature`
3. 변경사항 작성
4. 테스트 실행: `npm test`
5. 변경사항 커밋: `git commit -m 'Add amazing feature'`
6. 브랜치에 푸시: `git push origin feature/amazing-feature`
7. Pull Request 생성

### 코드 스타일

- 모든 새 코드에 TypeScript 사용
- ESLint 설정 준수
- 새 기능에 대한 테스트 작성
- 필요에 따라 문서 업데이트

## 📊 지원 기술

### 언어
- JavaScript/TypeScript
- Python
- Java
- Go
- Rust
- PHP

### 프레임워크
- **프론트엔드**: React, Vue, Angular, Svelte
- **백엔드**: Express, Fastify, Django, Flask, FastAPI
- **데이터베이스**: MySQL, PostgreSQL, MongoDB, Redis

### 빌드 도구
- Webpack, Vite, Rollup
- Docker, Docker Compose
- GitHub Actions, GitLab CI

## 🔧 문제 해결 및 FAQ

### 일반적인 문제

#### 설치 관련

**Q: npm install 중 오류**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Python 빌드 도구 필요시 (Windows)
npm install --global windows-build-tools
```

**Q: Redis 연결 오류**
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

**Q: 분석이 너무 오래 걸림**
- 대용량 저장소의 경우 shallow clone 사용
- 불필요한 디렉토리 제외 (node_modules, vendor 등)
- 특정 언어/파일만 분석하도록 필터 설정

**Q: 메모리 부족 오류**
```bash
# Node.js 메모리 제한 증가
NODE_OPTIONS="--max-old-space-size=8192" npm run dev

# 또는 환경 변수 설정
export NODE_OPTIONS="--max-old-space-size=8192"
```

## 📄 라이선스

이 프로젝트는 Apache License 2.0 하에 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [D3.js](https://d3js.org/) - 강력한 데이터 시각화
- [Mermaid](https://mermaid.js.org/) - 다이어그램 생성
- [Simple-Git](https://github.com/steveukx/git-js) - Git 작업
- 모든 [기여자](https://github.com/your-org/project-atlas/contributors)들

## 📞 지원

- 📧 이메일: support@project-atlas.dev
- 💬 Discord: [커뮤니티 참여](https://discord.gg/project-atlas)
- 🐛 이슈: [GitHub Issues](https://github.com/your-org/project-atlas/issues)
- 📖 문서: [docs.project-atlas.dev](https://docs.project-atlas.dev)

---

❤️로 만든 Project Atlas 팀