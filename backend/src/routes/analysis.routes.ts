import { Router, Request, Response } from 'express';
import { validate } from '../middlewares/validator';
import Joi from 'joi';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ProjectModel } from '../models/Project';
import { AnalysisStatusModel } from '../models/AnalysisStatus';
import { AnalysisResultModel } from '../models/AnalysisResult';
import { performAnalysis, getJobStatus } from '../services/analysis/analysisService';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

const analyzeSchema = Joi.object({
  branch: Joi.string().optional(),
  depth: Joi.number().min(1).optional()
});

router.post(
  '/projects/:id/analyze',
  validate({ params: Joi.object({ id: Joi.string().required() }), body: analyzeSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { branch, depth } = req.body;

    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Start analysis
    const job = await performAnalysis(id, { branch, depth });

    res.json({
      message: 'Analysis started',
      projectId: id,
      jobId: job.id,
      status: job.status
    });
  })
);

router.get(
  '/projects/:id/status',
  validate({ params: Joi.object({ id: Joi.string().required() }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const status = await AnalysisStatusModel.findByProjectId(id);
    if (!status) {
      throw new AppError('Analysis status not found', 404);
    }

    res.json({
      projectId: id,
      status: status.status,
      progress: status.progress,
      error: status.error,
      startedAt: status.startedAt,
      completedAt: status.completedAt
    });
  })
);

router.get(
  '/projects/:id/results',
  validate({ params: Joi.object({ id: Joi.string().required() }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await AnalysisResultModel.findLatestByProjectId(id);

    if (!result) {
      throw new AppError('Analysis results not found', 404);
    }

    res.json(result.data);
  })
);

router.get(
  '/jobs/:jobId/status',
  validate({ params: Joi.object({ jobId: Joi.string().required() }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;

    const jobStatus = getJobStatus(jobId);
    if (!jobStatus) {
      throw new AppError('Job not found', 404);
    }
    res.json(jobStatus);
  })
);

router.get(
  '/projects/:id/graph',
  validate({ params: Joi.object({ id: Joi.string().required() }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await AnalysisResultModel.findLatestByProjectId(id);

    if (!result || !result.data.dependencyGraph) {
      throw new AppError('Dependency graph not found', 404);
    }

    res.json(result.data.dependencyGraph);
  })
);

router.get(
  '/projects/:id/apis',
  validate({ params: Joi.object({ id: Joi.string().required() }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await AnalysisResultModel.findLatestByProjectId(id);

    if (!result) {
      throw new AppError('Analysis results not found', 404);
    }

    res.json({
      apis: result.data.apiCalls || [],
      total: result.data.metrics?.totalAPICalls || 0
    });
  })
);

router.get(
  '/projects/:id/tech',
  validate({ params: Joi.object({ id: Joi.string().required() }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await AnalysisResultModel.findLatestByProjectId(id);

    if (!result) {
      throw new AppError('Analysis results not found', 404);
    }

    res.json({
      stack: result.data.projectStack || {},
      frameworks: result.data.frameworks || [],
      languages: result.data.structure?.languageDistribution || {}
    });
  })
);

export default router;