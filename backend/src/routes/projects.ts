import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/errorHandler';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validator';
import { ProjectModel } from '../models/Project';
import { AnalysisResultModel } from '../models/AnalysisResult';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  repositoryUrl: Joi.string().uri().required(),
  repositoryType: Joi.string().valid('single', 'multi').default('single'),
  branch: Joi.string().optional().default('main')
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional()
});

const projectIdSchema = Joi.object({
  id: Joi.string().required()
});

// GET /api/projects - List all projects
router.get('/', 
  asyncHandler(async (req: Request, res: Response) => {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let projects;
    if (status && typeof status === 'string') {
      if (!['pending', 'analyzing', 'completed', 'failed'].includes(status)) {
        throw new AppError('Invalid status filter', 400);
      }
      projects = await ProjectModel.findByStatus(status as any);
    } else {
      projects = await ProjectModel.findAll();
    }
    
    // Apply pagination
    const startIndex = parseInt(offset as string) || 0;
    const limitNum = parseInt(limit as string) || 50;
    const paginatedProjects = projects.slice(startIndex, startIndex + limitNum);
    
    res.json({
      success: true,
      data: {
        projects: paginatedProjects,
        pagination: {
          total: projects.length,
          limit: limitNum,
          offset: startIndex,
          hasMore: startIndex + limitNum < projects.length
        }
      },
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/projects/:id - Get specific project
router.get('/:id', 
  validate({ params: projectIdSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await ProjectModel.findById(id);
    
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get analysis metrics if available
    let metrics = null;
    try {
      metrics = await AnalysisResultModel.getProjectMetrics(id);
    } catch (error) {
      logger.warn(`Failed to fetch metrics for project ${id}:`, error);
    }

    res.json({
      success: true,
      data: {
        ...project,
        metrics
      },
      timestamp: new Date().toISOString()
    });
  })
);

// POST /api/projects - Create new project
router.post('/', 
  validate({ body: createProjectSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, repositoryUrl, repositoryType, branch } = req.body;

    // Check if project with same repository URL already exists
    const existingProjects = await ProjectModel.findAll();
    const duplicate = existingProjects.find(p => p.repositoryUrl === repositoryUrl);
    
    if (duplicate) {
      throw new AppError('Project with this repository URL already exists', 409);
    }

    // Validate repository URL format
    if (!repositoryUrl.match(/^https?:\/\/.+\.git$|^git@.+:.+\.git$/)) {
      throw new AppError('Invalid repository URL format. Must be a valid Git URL', 400);
    }

    // Create new project
    const newProject = await ProjectModel.create({
      name,
      repositoryUrl,
      repositoryType,
      branch
    });

    logger.info(`Created new project: ${name} (${repositoryUrl})`);

    res.status(201).json({
      success: true,
      data: newProject,
      message: 'Project created successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// PUT /api/projects/:id - Update project
router.put('/:id', 
  validate({ 
    params: projectIdSchema,
    body: updateProjectSchema 
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if project exists
    const existingProject = await ProjectModel.findById(id);
    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    // Update project
    const updatedProject = await ProjectModel.update(id, req.body);

    logger.info(`Updated project: ${id}`);

    res.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', 
  validate({ params: projectIdSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if project exists
    const existingProject = await ProjectModel.findById(id);
    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    // Delete project (this will cascade delete related records)
    const deleted = await ProjectModel.delete(id);
    
    if (!deleted) {
      throw new AppError('Failed to delete project', 500);
    }

    logger.info(`Deleted project: ${id}`);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// POST /api/projects/:id/analyze - Start project analysis
router.post('/:id/analyze',
  validate({ params: projectIdSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { force = false, options = {} } = req.body;

    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if analysis is already in progress
    if (project.status === 'analyzing' && !force) {
      throw new AppError('Analysis already in progress', 409);
    }

    // Update project status
    await ProjectModel.update(id, { status: 'analyzing' });

    // TODO: Start analysis job (will be implemented with queue system)
    logger.info(`Starting analysis for project: ${id}`);

    res.json({
      success: true,
      message: 'Analysis started successfully',
      data: {
        projectId: id,
        status: 'analyzing',
        startedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  })
);

export default router;