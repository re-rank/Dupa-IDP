# Project Atlas

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**🌍 [English](README.md) | [日本語](README.ja.md) | [中文](README.zh.md)**

단일 또는 멀티 저장소 기반의 프론트엔드, 백엔드, DB, API 등의 구성을 자동으로 분석하고, 연동 구조 및 의존 관계를 시각화하여 개발자와 운영자가 한눈에 이해할 수 있는 오픈소스 도구입니다.

## 🚀 주요 기능

- **🔍 자동 분석**: 프로젝트 구조, 언어, 프레임워크 자동 감지
- **📊 대화형 시각화**: 서비스 의존성 그래프, API 흐름도, 아키텍처 개요
- **🏗️ 멀티 저장소 지원**: 마이크로서비스 및 분산 아키텍처 분석
- **📈 종합 리포트**: 기술 스택 통계, API 엔드포인트, 의존성 분석
- **🔄 실시간 업데이트**: 실시간 분석 진행 상황 및 자동 재분석
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
- **D3.js** - 대화형 시각화
- **Mermaid.js** - 다이어그램 생성
- **Tailwind CSS** - 스타일링
- **Vite** - 빌드 도구

### 분석 엔진
- **AST 파싱** - 정적 코드 분석
- **다중 언어 지원** - JavaScript, TypeScript, Python 등
- **프레임워크 감지** - React, Vue, Django, Express 등

## 📦 설치

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn
- Git

### 빠른 시작

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-org/project-atlas.git
   cd project-atlas
   ```

2. **의존성 설치**
   ```bash
   npm run install:all
   ```

3. **개발 서버 시작**
   ```bash
   npm run dev
   ```

4. **브라우저에서 열기**
   - 프론트엔드: http://localhost:5173
   - 백엔드 API: http://localhost:3000

## 🎯 사용법

### 기본 분석

1. **프로젝트 추가**
   - Git 저장소 URL 입력
   - 단일 또는 멀티 저장소 분석 선택
   - "분석" 클릭

2. **결과 확인**
   - 대화형 의존성 그래프
   - API 엔드포인트 목록
   - 기술 스택 개요
   - 데이터베이스 연결

3. **데이터 내보내기**
   - PNG/SVG로 다이어그램 다운로드
   - JSON/CSV/PDF로 리포트 내보내기

### 고급 기능

- **멀티 저장소 분석**: 전체 마이크로서비스 생태계 분석
- **사용자 정의 필터**: 특정 컴포넌트나 기술에 집중
- **웹훅 통합**: 코드 변경 시 자동 재분석
- **API 접근**: 분석 결과에 대한 프로그래밍 방식 접근

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

## 📄 라이선스

이 프로젝트는 Apache License 2.0 하에 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [D3.js](https://d3js.org/) - 강력한 데이터 시각화
- [Mermaid](https://mermaid.js.org/) - 다이어그램 생성
- [Simple-Git](https://github.com/steveukx/git-js) - Git 작업
- 모든 [기여자](https://github.com/your-org/project-atlas/contributors)들

## 📞 지원
- 📧 이메일: hojinpark@re-rank.com

---

Project Atlas 팀이 ❤️로 만들었습니다