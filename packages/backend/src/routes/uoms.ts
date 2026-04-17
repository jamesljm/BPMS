import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/rbac';
import { createUomSchema, updateUomSchema } from 'shared';
import { AppError } from '../middleware/error';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// GET /
router.get('/', asyncHandler(async (req, res) => {
  const uoms = await prisma.uom.findMany({ orderBy: { code: 'asc' } });
  res.json(uoms);
}));

// POST /
router.post('/', requirePermission('UOMS', 'CREATE'), validate(createUomSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.uom.findUnique({ where: { code: req.body.code } });
  if (existing) throw new AppError(409, 'UOM code already exists');

  const uom = await prisma.uom.create({ data: req.body });
  res.status(201).json(uom);
}));

// PATCH /:id
router.patch('/:id', requirePermission('UOMS', 'UPDATE'), validate(updateUomSchema), asyncHandler(async (req, res) => {
  const uom = await prisma.uom.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(uom);
}));

export default router;
