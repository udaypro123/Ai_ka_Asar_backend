import { Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { RoleType } from '../models/Role';

export const authorize = (...allowedRoles: RoleType[]) => {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const userRole = req.user.roles?.[0] || 'USER';
    if (!allowedRoles.includes(userRole)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};

export const requireAdmin = authorize('ADMIN', 'SUPER_ADMIN', 'HR');
export const requireSuperAdmin = authorize('SUPER_ADMIN');
