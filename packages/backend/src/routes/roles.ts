import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/rbac';
import { createRoleSchema, updateRoleSchema, setPermissionsSchema } from 'shared';
import { AppError } from '../middleware/error';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// GET / — list roles
router.get('/', asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { userRoles: true } },
    },
    orderBy: { name: 'asc' },
  });
  res.json(roles);
}));

// GET /:id
router.get('/:id', asyncHandler(async (req, res) => {
  const role = await prisma.role.findUnique({
    where: { id: req.params.id },
    include: {
      permissions: true,
      _count: { select: { userRoles: true } },
    },
  });
  if (!role) throw new AppError(404, 'Role not found');
  res.json(role);
}));

// POST / — create role
router.post('/', requirePermission('ROLES', 'CREATE'), validate(createRoleSchema), asyncHandler(async (req, res) => {
  const role = await prisma.role.create({
    data: req.body,
    include: { permissions: true },
  });
  res.status(201).json(role);
}));

// PATCH /:id — update role
router.patch('/:id', requirePermission('ROLES', 'UPDATE'), validate(updateRoleSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.role.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, 'Role not found');
  if (existing.isSystem) throw new AppError(403, 'Cannot modify system roles');

  const role = await prisma.role.update({
    where: { id: req.params.id },
    data: req.body,
    include: { permissions: true },
  });
  res.json(role);
}));

// DELETE /:id
router.delete('/:id', requirePermission('ROLES', 'DELETE'), asyncHandler(async (req, res) => {
  const existing = await prisma.role.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, 'Role not found');
  if (existing.isSystem) throw new AppError(403, 'Cannot delete system roles');

  await prisma.role.delete({ where: { id: req.params.id } });
  res.json({ message: 'Role deleted' });
}));

// PUT /:id/permissions — set permissions (replace all)
router.put('/:id/permissions', requirePermission('ROLES', 'UPDATE'), validate(setPermissionsSchema), asyncHandler(async (req, res) => {
  const { permissions } = req.body;

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: req.params.id } }),
    ...permissions.map((p: any) =>
      prisma.rolePermission.create({
        data: { roleId: req.params.id, resource: p.resource, action: p.action, scope: p.scope },
      }),
    ),
  ]);

  const role = await prisma.role.findUnique({
    where: { id: req.params.id },
    include: { permissions: true },
  });
  res.json(role);
}));

export default router;
