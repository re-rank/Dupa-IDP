import { describe, it, expect } from '@jest/globals';
import { FrameworkDetector } from './frameworkDetector';
import { FileInfo } from '../git/gitService';
import fs from 'fs/promises';

jest.mock('fs/promises');
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('FrameworkDetector', () => {
  const mockFiles: FileInfo[] = [
    {
      path: '/test/package.json',
      name: 'package.json',
      size: 1024,
      extension: '.json',
      isDirectory: false,
      relativePath: 'package.json',
      lastModified: new Date('2023-01-01')
    },
    {
      path: '/test/src/App.tsx',
      name: 'App.tsx',
      size: 2048,
      extension: '.tsx',
      isDirectory: false,
      relativePath: 'src/App.tsx',
      lastModified: new Date('2023-01-01')
    },
    {
      path: '/test/src',
      name: 'src',
      size: 0,
      extension: '',
      isDirectory: true,
      relativePath: 'src',
      lastModified: new Date('2023-01-01')
    }
  ];

  describe('detectFrameworks', () => {
    it('should detect React framework from package.json', async () => {
      const packageJsonContent = JSON.stringify({
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0'
        }
      });

      jest.mocked(fs.readFile).mockResolvedValueOnce(packageJsonContent);

      const frameworks = await FrameworkDetector.detectFrameworks('/test', mockFiles);

      // React가 가장 높은 confidence를 가져야 함
      const reactFramework = frameworks.find(f => f.name === 'React');
      expect(reactFramework).toBeDefined();
      expect(reactFramework!.confidence).toBeGreaterThanOrEqual(0.9);
      if (reactFramework!.version) {
        expect(reactFramework!.version).toBe('18.2.0');
      }
      
      // confidence가 0.8 이상인 프레임워크만 확인
      const highConfidenceFrameworks = frameworks.filter(f => f.confidence >= 0.8);
      expect(highConfidenceFrameworks.length).toBeGreaterThanOrEqual(1);
      expect(highConfidenceFrameworks.some(f => f.name === 'React')).toBeTruthy();
    });

    it('should detect Vue.js framework', async () => {
      const vueFiles: FileInfo[] = [
        ...mockFiles,
        {
          path: '/test/src/App.vue',
          name: 'App.vue',
          size: 1000,
          extension: '.vue',
          isDirectory: false,
          relativePath: 'src/App.vue',
          lastModified: new Date('2023-01-01')
        }
      ];

      const packageJsonContent = JSON.stringify({
        dependencies: {
          'vue': '^3.3.0'
        }
      });

      jest.mocked(fs.readFile).mockResolvedValueOnce(packageJsonContent);

      const frameworks = await FrameworkDetector.detectFrameworks('/test', vueFiles);

      expect(frameworks.find(f => f.name === 'Vue.js')).toBeDefined();
    });

    it('should detect multiple frameworks', async () => {
      const expressFiles: FileInfo[] = [
        ...mockFiles,
        {
          path: '/test/server.js',
          name: 'server.js',
          size: 1000,
          extension: '.js',
          isDirectory: false,
          relativePath: 'server.js',
          lastModified: new Date('2023-01-01')
        }
      ];

      const packageJsonContent = JSON.stringify({
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'express': '^4.18.2'
        }
      });

      jest.mocked(fs.readFile).mockResolvedValue(packageJsonContent);

      const frameworks = await FrameworkDetector.detectFrameworks('/test', expressFiles);

      expect(frameworks.length).toBeGreaterThanOrEqual(2);
      expect(frameworks.find(f => f.name === 'React')).toBeDefined();
      expect(frameworks.find(f => f.name === 'Express.js')).toBeDefined();
    });

    it('should detect Python frameworks from requirements.txt', async () => {
      const pythonFiles: FileInfo[] = [
        {
          path: '/test/requirements.txt',
          name: 'requirements.txt',
          size: 100,
          extension: '.txt',
          isDirectory: false,
          relativePath: 'requirements.txt',
          lastModified: new Date('2023-01-01')
        },
        {
          path: '/test/manage.py',
          name: 'manage.py',
          size: 500,
          extension: '.py',
          isDirectory: false,
          relativePath: 'manage.py',
          lastModified: new Date('2023-01-01')
        }
      ];

      const requirementsContent = `django==4.2.0
djangorestframework==3.14.0
psycopg2==2.9.6`;

      jest.mocked(fs.readFile).mockResolvedValueOnce(requirementsContent);

      const frameworks = await FrameworkDetector.detectFrameworks('/test', pythonFiles);

      expect(frameworks.find(f => f.name === 'Django')).toBeDefined();
      expect(frameworks[0].type).toBe('fullstack');
    });
  });

  describe('detectProjectStack', () => {
    it('should detect fullstack project', async () => {
      const frameworks = [
        {
          name: 'React',
          type: 'frontend' as const,
          confidence: 0.8,
          configFiles: ['package.json'],
          indicators: []
        },
        {
          name: 'Express.js',
          type: 'backend' as const,
          confidence: 0.8,
          configFiles: ['package.json'],
          indicators: []
        }
      ];

      const stack = await FrameworkDetector.detectProjectStack('/test', mockFiles, frameworks);

      expect(stack.stack).toBe('fullstack');
      expect(stack.frameworks).toContain('React');
      expect(stack.frameworks).toContain('Express.js');
    });

    it('should detect frontend-only project', async () => {
      const frameworks = [
        {
          name: 'React',
          type: 'frontend' as const,
          confidence: 0.8,
          configFiles: ['package.json'],
          indicators: []
        }
      ];

      const stack = await FrameworkDetector.detectProjectStack('/test', mockFiles, frameworks);

      expect(stack.stack).toBe('frontend');
    });

    it('should detect primary language', async () => {
      const jsFiles: FileInfo[] = [
        ...mockFiles,
        {
          path: '/test/index.js',
          name: 'index.js',
          size: 1000,
          extension: '.js',
          isDirectory: false,
          relativePath: 'index.js',
          lastModified: new Date('2023-01-01')
        },
        {
          path: '/test/utils.js',
          name: 'utils.js',
          size: 500,
          extension: '.js',
          isDirectory: false,
          relativePath: 'utils.js',
          lastModified: new Date('2023-01-01')
        }
      ];

      const stack = await FrameworkDetector.detectProjectStack('/test', jsFiles, []);

      expect(stack.primaryLanguage).toBe('JavaScript');
    });
  });
});