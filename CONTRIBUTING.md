# Contributing to Project Atlas

Thank you for your interest in contributing to Project Atlas! We welcome contributions from everyone.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20.x LTS)
- npm 9+ or yarn 3+
- Git 2.25+
- Basic knowledge of TypeScript, React, and Express.js

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/project-atlas.git
   cd project-atlas
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env file as needed
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Verify setup**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 📝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/your-org/project-atlas/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/your-org/project-atlas/issues) and [Discussions](https://github.com/your-org/project-atlas/discussions)
2. Create a new issue with:
   - Clear feature description
   - Use case and motivation
   - Possible implementation approach
   - Any relevant mockups or examples

### Code Contributions

#### 1. Choose an Issue
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to let others know you're working on it

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

#### 3. Make Changes
- Follow our coding standards (see below)
- Write tests for new functionality
- Update documentation if needed
- Ensure all tests pass

#### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new analysis feature"
# or
git commit -m "fix: resolve memory leak in analyzer"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

#### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request with:
- Clear title and description
- Link to related issues
- Screenshots/GIFs for UI changes
- Test results

## 🎯 Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components
- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Keep components small and focused
- Use TypeScript interfaces for props

### Backend Code
- Use async/await instead of callbacks
- Implement proper error handling
- Add input validation
- Write unit tests for services

### Testing
- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Mock external dependencies

### Documentation
- Update README.md for new features
- Add inline code comments
- Update API documentation
- Include examples in documentation

## 🏗️ Project Structure

```
project-atlas/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data models
│   │   ├── analyzers/    # Code analysis engine
│   │   ├── middlewares/  # Express middlewares
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend tests
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── tests/            # Frontend tests
└── docs/                 # Documentation
```

## 🧪 Testing

### Running Tests
```bash
# All tests
npm test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# Watch mode
npm run test:watch
```

### Writing Tests

#### Backend Tests
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

#### Frontend Tests
```typescript
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  it('renders project information', () => {
    const project = { id: '1', name: 'Test Project' };
    render(<ProjectCard project={project} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

## 📚 Development Guidelines

### Adding New Analyzers

1. Create analyzer in `backend/src/analyzers/`
2. Implement the `Analyzer` interface
3. Add language/framework detection
4. Write comprehensive tests
5. Update documentation

### Adding New Visualizations

1. Create component in `frontend/src/components/visualizations/`
2. Use D3.js for interactive charts
3. Ensure responsive design
4. Add accessibility features
5. Write component tests

### Database Changes

1. Create migration in `backend/src/database/migrations/`
2. Update models if needed
3. Test migration up and down
4. Update seed data if applicable

## 🔍 Code Review Process

### For Contributors
- Ensure CI passes
- Address review feedback promptly
- Keep PRs focused and small
- Update PR description if scope changes

### For Reviewers
- Be constructive and respectful
- Focus on code quality and maintainability
- Check for security issues
- Verify tests are adequate

## 🏷️ Release Process

1. **Version Bump**: Update version in package.json files
2. **Changelog**: Update CHANGELOG.md with new features and fixes
3. **Tag**: Create git tag with version number
4. **Release**: Create GitHub release with release notes
5. **Deploy**: Deploy to production environment

## 🤝 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat and support
- **Email**: conduct@project-atlas.dev for Code of Conduct issues

### Getting Help
- Check existing documentation
- Search closed issues
- Ask in GitHub Discussions
- Join our Discord community

## 📄 License

By contributing to Project Atlas, you agree that your contributions will be licensed under the Apache License 2.0.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor appreciation posts

Thank you for contributing to Project Atlas! 🚀