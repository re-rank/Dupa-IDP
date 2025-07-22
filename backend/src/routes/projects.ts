import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { ProjectModel } from '../models/Project';
import { AnalysisResultModel } from '../models/AnalysisResult';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  repositoryUrl: Joi.string().uri().required(),
  repositoryType: Joi.string().valid('single', 'multi').default('single')
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional()
});

// GET /api/projects - List all projects
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    
    let projects;
    if (status && typeof status === 'string') {
      if (!['pending', 'analyzing', 'completed', 'failed'].includes(status)) {
        return next(createError('Invalid status filter', 400));
      }
      projects = await ProjectModel.findByStatus(status as any);
    } else {
      projects = await ProjectModel.findAll();
    }
    
    res.json({
      success: true,
      data: projects,
      count: projects.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch projects:', error);
    next(createError('Failed to fetch projects', 500));
  }
});

// GET /api/projects/:id - Get specific project
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createError('Project ID is required', 400));
    }

    const project = await ProjectModel.findById(id);
    
    if (!project) {
      return next(createError('Project not found', 404));
    }

    // Get analysis metrics if available
    const metrics = await AnalysisResultModel.getProjectMetrics(id);

    res.json({
      success: true,
      data: {
        ...project,
        metrics
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to fetch project ${req.params.id}:`, error);
    next(createError('Failed to fetch project', 500));
  }
});

// POST /api/projects - Create new project
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return next(createError(error.details[0].message, 400));
    }

    const { name, repositoryUrl, repositoryType } = value;

    // Check if project with same repository URL already exists
    const existingProjects = await ProjectModel.findAll();
    const duplicate = existingProjects.find(p => p.repositoryUrl === repositoryUrl);
    
    if (duplicate) {
      return next(createError('Project with this repository URL already exists', 409));
    }

    // Create new project
    const newProject = await ProjectModel.create({
      name,
      repositoryUrl,
      repositoryType
    });

    logger.info(`Created new project: ${name} (${repositoryUrl})`);

    res.status(201).json({
      success: true,
      data: newProject,
      message: 'Project created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to create project:', error);
    next(createError('Failed to create project', 500));
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createError('Project ID is required', 400));
    }

    // Validate request body
    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) {
      return next(createError(error.details[0].message, 400));
    }

    // Check if project exists
    const existingProject = await ProjectModel.findById(id);
    if (!existingProject) {
      return next(createError('Project not found', 404));
    }

    // Update project
    const updatedProject = await ProjectModel.update(id, value);

    res.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to update project ${req.params.id}:`, error);
    next(createError('Failed to update project', 500));
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createError('Project ID is required', 400));
    }

    // Check if project exists
    const existingProject = await ProjectModel.findById(id);
    if (!existingProject) {
      return next(createError('Project not found', 404));
    }

    // Delete project (this will cascade delete related records)
    const deleted = await ProjectModel.delete(id);
    
    if (!deleted) {
      return next(createError('Failed to delete project', 500));
    }

    logger.info(`Deleted project: ${id}`);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to delete project ${req.params.id}:`, error);
    next(createError('Failed to delete project', 500));
  }
});

export default router;