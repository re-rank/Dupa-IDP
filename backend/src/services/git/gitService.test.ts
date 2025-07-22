import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { GitService } from './gitService';
import { AppError } from '../../middlewares/errorHandler';

vi.mock('simple-git', () => ({
  default: () => ({
    clone: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
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
    vi.clearAllMocks();
  });

  describe('cloneRepository', () => {
    it('should clone repository successfully', async () => {
      const repoPath = await gitService.cloneRepository(testRepoUrl, testProjectId);
      
      expect(repoPath).toContain(testProjectId);
      expect(repoPath).toContain('temp');
      expect(repoPath).toContain('repos');
    });

    it('should handle clone options', async () => {
      const options = {
        depth: 1,
        branch: 'main',
        single: true
      };

      const repoPath = await gitService.cloneRepository(testRepoUrl, testProjectId, options);
      
      expect(repoPath).toContain(testProjectId);
    });

    it('should throw error on clone failure', async () => {
      const git = require('simple-git').default();
      git.clone.mockRejectedValueOnce(new Error('Clone failed'));

      await expect(
        gitService.cloneRepository(testRepoUrl, testProjectId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('scanRepository', () => {
    it('should scan repository and return file info', async () => {
      const mockFiles = [
        { name: 'index.js', isDirectory: () => false },
        { name: 'src', isDirectory: () => true }
      ];

      vi.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
      vi.spyOn(fs, 'stat').mockResolvedValue({ size: 1024 } as any);
      vi.spyOn(fs, 'readFile').mockResolvedValue('');

      const files = await gitService.scanRepository('/test/path');

      expect(files).toHaveLength(2);
      expect(files[0]).toMatchObject({
        name: 'index.js',
        isDirectory: false,
        extension: '.js'
      });
      expect(files[1]).toMatchObject({
        name: 'src',
        isDirectory: true
      });
    });

    it('should respect gitignore patterns', async () => {
      const mockFiles = [
        { name: 'index.js', isDirectory: () => false },
        { name: 'node_modules', isDirectory: () => true },
        { name: '.env', isDirectory: () => false }
      ];

      vi.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
      vi.spyOn(fs, 'stat').mockResolvedValue({ size: 1024 } as any);
      vi.spyOn(fs, 'readFile').mockResolvedValue('node_modules\n.env');

      const files = await gitService.scanRepository('/test/path');

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('index.js');
    });

    it('should skip large files', async () => {
      const mockFiles = [
        { name: 'small.js', isDirectory: () => false },
        { name: 'large.bin', isDirectory: () => false }
      ];

      vi.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
      vi.spyOn(fs, 'stat')
        .mockResolvedValueOnce({ size: 1024 } as any)
        .mockResolvedValueOnce({ size: 200 * 1024 * 1024 } as any);
      vi.spyOn(fs, 'readFile').mockResolvedValue('');

      const files = await gitService.scanRepository('/test/path');

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('small.js');
    });
  });

  describe('getFileContent', () => {
    it('should read file content successfully', async () => {
      const testContent = 'console.log("Hello World");';
      vi.spyOn(fs, 'readFile').mockResolvedValue(testContent);

      const content = await gitService.getFileContent('/test/file.js');

      expect(content).toBe(testContent);
    });

    it('should throw error on read failure', async () => {
      vi.spyOn(fs, 'readFile').mockRejectedValue(new Error('Read failed'));

      await expect(
        gitService.getFileContent('/test/file.js')
      ).rejects.toThrow(AppError);
    });
  });

  describe('cleanupRepository', () => {
    it('should cleanup repository directory', async () => {
      const rmSpy = vi.spyOn(fs, 'rm').mockResolvedValue(undefined);

      await gitService.cleanupRepository(testProjectId);

      expect(rmSpy).toHaveBeenCalledWith(
        expect.stringContaining(testProjectId),
        { recursive: true, force: true }
      );
    });

    it('should handle cleanup errors gracefully', async () => {
      vi.spyOn(fs, 'rm').mockRejectedValue(new Error('Cleanup failed'));

      await expect(
        gitService.cleanupRepository(testProjectId)
      ).resolves.not.toThrow();
    });
  });
});