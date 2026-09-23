import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/appError';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      console.log("req.body------------------------vallidate ", req.body)
      next();
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })) || [{ message: 'Validation failed' }];
        console.log("req.body------------------------vallidate errors ", errors)
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
    }
  };
};
