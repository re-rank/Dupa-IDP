import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

// simple-git 모킹을 GitService import 전에 설정
jest.mock('simple-git', () => {
  const mockGit = {
    clone: jest.fn().mockResolvedValue(undefined),
    checkout: jest.fn().mockResolvedValue(undefined),
    pull: jest.fn().mockResolvedValue(undefined),
    log: jest.fn().mockResolvedValue({ latest: { hash: 'abc123' } }),
    raw: jest.fn().mockResolvedValue('')
  };
  
  return {
    simpleGit: jest.fn(() => mockGit),
    SimpleGit: jest.fn(),
    CleanOptions: {}
  };
});

import { GitService } from './gitService';

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('GitService', () => {
  let gitService: GitService;
  const testRepoUrl = 'https://github.com/test/repo.git';
  const testProjectId = 'test-project-123';

  beforeEach(() => {
    gitService = new GitService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cloneRepository', () => {
    it('should clone repository successfully', async () => {
      const targetPath = path.join(process.cwd(), 'temp', 'repos', testProjectId);
      const repoPath = await gitService.cloneRepository(testRepoUrl, targetPath);
      
      expect(repoPath).toBe(targetPath);
      expect(repoPath).toContain(testProjectId);
      expect(repoPath).toContain('temp');
      expect(repoPath).toContain('repos');
    });

    it('should handle clone options', async () => {
      const options = {
        depth: 1,
        branch: 'main'
      };

      const targetPath = path.join(process.cwd(), 'temp', 'repos', testProjectId);
      const repoPath = await gitService.cloneRepository(testRepoUrl, targetPath, options);
      
      expect(repoPath).toBe(targetPath);
      expect(repoPath).toContain(testProjectId);
    });

    it('should throw error on clone failure', async () => {
      const { simpleGit } = await import('simple-git');
      const git = simpleGit();
      git.clone.mockRejectedValueOnce(new Error('Clone failed'));

      const targetPath = path.join(process.cwd(), 'temp', 'repos', testProjectId);
      await expect(
        gitService.cloneRepository(testRepoUrl, targetPath)
      ).rejects.toThrow(Error);
    });
  });

  describe('scanRepository', () => {
    it('should scan repository and return file info', async () => {
      const mockFiles = [
        { name: 'index.js', isDirectory: () => false },
        { name: 'src', isDirectory: () => true }
      ];

      jest.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
      jest.spyOn(fs, 'stat').mockResolvedValue({ size: 1024, mtime: new Date() } as any);
      jest.spyOn(fs, 'readFile').mockResolvedValue('');

      const files = await gitService.scanRepository('/test/path');

      expect(files).toHaveLength(2);
      expect(files[0]).toMatchObject({
        name: 'index.js',
        isDirectory: false,
        extension: '.js',
        lastModified: expect.any(Date)
      });
      expect(files[1]).toMatchObject({
        name: 'src',
        isDirectory: true,
        lastModified: expect.any(Date)
      });
    });

    it('should respect gitignore patterns', async () => {
      const mockFiles = [
        { name: 'index.js', isDirectory: () => false },
        { name: 'node_modules', isDirectory: () => true },
        { name: '.env', isDirectory: () => false }
      ];

      jest.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
      jest.spyOn(fs, 'stat').mockResolvedValue({ size: 1024, mtime: new Date() } as any);
      jest.spyOn(fs, 'readFile').mockResolvedValue('node_modules\n.env');

      const files = await gitService.scanRepository('/test/path');

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('index.js');
    });

    it('should skip large files', async () => {
      const mockFiles = [
        { name: 'small.js', isDirectory: () => false },
        { name: 'large.bin', isDirectory: () => false }
      ];

      jest.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
      jest.spyOn(fs, 'stat')
        .mockResolvedValueOnce({ size: 1024, mtime: new Date() } as any)
        .mockResolvedValueOnce({ size: 200 * 1024 * 1024, mtime: new Date() } as any);
      jest.spyOn(fs, 'readFile').mockResolvedValue('');

      const files = await gitService.scanRepository('/test/path');

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('small.js');
    });
  });

  describe('getFileContent', () => {
    it('should read file content successfully', async () => {
      const testContent = 'console.log("Hello World");';
      jest.spyOn(fs, 'readFile').mockResolvedValue(testContent);

      const content = await gitService.getFileContent('/test/file.js');

      expect(content).toBe(testContent);
    });

    it('should throw error on read failure', async () => {
      jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('Read failed'));

      await expect(
        gitService.getFileContent('/test/file.js')
      ).rejects.toThrow(Error);
    });
  });

  describe('cleanupRepository', () => {
    it('should cleanup repository directory', async () => {
      const rmSpy = jest.spyOn(fs, 'rm').mockResolvedValue(undefined);

      await gitService.cleanupRepository(testProjectId);

      expect(rmSpy).toHaveBeenCalledWith(
        expect.stringContaining(testProjectId),
        { recursive: true, force: true }
      );
    });

    it('should handle cleanup errors gracefully', async () => {
      jest.spyOn(fs, 'rm').mockRejectedValue(new Error('Cleanup failed'));

      await expect(
        gitService.cleanupRepository(testProjectId)
      ).resolves.not.toThrow();
    });
  });
});