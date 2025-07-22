import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

interface ValidationSchema {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema | Record<string, Joi.Schema>;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.params) {
      const paramsSchema = Joi.isSchema(schema.params)
        ? schema.params 
        : Joi.object(schema.params);
      
      const { error } = paramsSchema.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map((d: any) => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400);
    }

    next();
  };
};