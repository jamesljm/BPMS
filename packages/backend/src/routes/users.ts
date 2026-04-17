import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/rbac';
import { createUserSchema, updateUserSchema, assignRoleSchema, paginationSchema } from 'shared';
import { AppError } from '../middleware/error';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// GET / — list users
router.get('/', validate(paginationSchema, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query as any;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, phone: true, isActive: true, createdAt: true,
        userRoles: {
          include: {
            role: { select: { id: true, name: true } },
            project: { select: { id: true, code: true, name: true } },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ data: users, total, page, limit });
}));

// GET /:id
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, email: true, name: true, phone: true, isActive: true, createdAt: true,
      userRoles: {
        include: {
          role: { select: { id: true, name: true } },
          project: { select: { id: true, code: true, name: true } },
        },
      },
    },
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json(user);
}));

// POST / — create user
router.post('/', requirePermission('USERS', 'CREATE'), validate(createUserSchema), asyncHandler(async (req, res) => {
  const { email, name, password, phone, isActive } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, phone, isActive },
    select: { id: true, email: true, name: true, phone: true, isActive: true, createdAt: true },
  });

  res.status(201).json(user);
}));

// PATCH /:id — update user
router.patch('/:id', requirePermission('USERS', 'UPDATE'), validate(updateUserSchema), asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
    select: { id: true, email: true, name: true, phone: true, isActive: true, createdAt: true },
  });
  res.json(user);
}));

// DELETE /:id — soft delete (deactivate)
router.delete('/:id', requirePermission('USERS', 'DELETE'), asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ message: 'User deactivated' });
}));

// POST /:id/roles — assign role
router.post('/:id/roles', requirePermission('ROLES', 'UPDATE'), validate(assignRoleSchema), asyncHandler(async (req, res) => {
  const { roleId, projectId } = req.body;

  const userRole = await prisma.userRole.create({
    data: { userId: req.params.id, roleId, projectId },
    include: {
      role: { select: { id: true, name: true } },
      project: { select: { id: true, code: true, name: true } },
    },
  });
  res.status(201).json(userRole);
}));

// DELETE /:id/roles/:userRoleId — revoke role
router.delete('/:id/roles/:userRoleId', requirePermission('ROLES', 'UPDATE'), asyncHandler(async (req, res) => {
  await prisma.userRole.delete({ where: { id: req.params.userRoleId } });
  res.json({ message: 'Role revoked' });
}));

export default router;
