import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthUser } from './auth';
import { AppError } from './error';

/**
 * Check if a user has a specific permission.
 * Checks all roles assigned to the user (global + project-scoped).
 */
export async function checkPermission(
  userId: string,
  resource: string,
  action: string,
  projectId?: string,
): Promise<{ allowed: boolean; scope: string }> {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      OR: [
        { projectId: null }, // Global roles
        ...(projectId ? [{ projectId }] : []),
      ],
    },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });

  for (const ur of userRoles) {
    const perm = ur.role.permissions.find(
      p => p.resource === resource && p.action === action,
    );
    if (perm) {
      // If role is project-scoped and permission scope is OWN_PROJECT, it's allowed within that project
      if (perm.scope === 'ALL') return { allowed: true, scope: 'ALL' };
      if (perm.scope === 'OWN_PROJECT' && (ur.projectId || projectId)) {
        return { allowed: true, scope: 'OWN_PROJECT' };
      }
      if (perm.scope === 'OWN') return { allowed: true, scope: 'OWN' };
    }
  }

  return { allowed: false, scope: '' };
}

/**
 * Express middleware: require a specific permission.
 */
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const projectId = (req.params.projectId || req.body?.projectId) as string | undefined;
    const { allowed } = await checkPermission(req.user.id, resource, action, projectId);

    if (!allowed) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Get Prisma WHERE filter scoped to user's allowed projects.
 */
export async function getScopedProjectFilter(userId: string): Promise<any> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: true } } },
  });

  // Check if user has any ALL-scoped permission
  const hasGlobalAccess = userRoles.some(ur =>
    ur.projectId === null && ur.role.permissions.some(p => p.scope === 'ALL'),
  );

  if (hasGlobalAccess) return {}; // No filter needed

  // Otherwise, restrict to assigned projects
  const projectIds = userRoles
    .filter(ur => ur.projectId !== null)
    .map(ur => ur.projectId!);

  return { projectId: { in: projectIds } };
}
