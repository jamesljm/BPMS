import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/rbac';
import { createPlaceSchema, updatePlaceSchema, paginationSchema } from 'shared';
import { AppError } from '../middleware/error';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// GET / — list places
router.get('/', validate(paginationSchema, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query as any;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [places, total] = await Promise.all([
    prisma.place.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.place.count({ where }),
  ]);

  res.json({ data: places, total, page, limit });
}));

// GET /:id
router.get('/:id', asyncHandler(async (req, res) => {
  const place = await prisma.place.findUnique({
    where: { id: req.params.id },
    include: {
      projects: { select: { id: true, code: true, name: true, status: true } },
    },
  });
  if (!place) throw new AppError(404, 'Place not found');
  res.json(place);
}));

// POST /
router.post('/', requirePermission('PLACES', 'CREATE'), validate(createPlaceSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.place.findUnique({ where: { code: req.body.code } });
  if (existing) throw new AppError(409, 'Place code already exists');

  const place = await prisma.place.create({ data: req.body });
  res.status(201).json(place);
}));

// PATCH /:id
router.patch('/:id', requirePermission('PLACES', 'UPDATE'), validate(updatePlaceSchema), asyncHandler(async (req, res) => {
  const place = await prisma.place.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(place);
}));

// DELETE /:id
router.delete('/:id', requirePermission('PLACES', 'DELETE'), asyncHandler(async (req, res) => {
  await prisma.place.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ message: 'Place deactivated' });
}));

// GET /:id/inventory — stock at this place
router.get('/:id/inventory', asyncHandler(async (req, res) => {
  const inventory = await prisma.stockCodeCurrentPlace.findMany({
    where: { placeId: req.params.id, qty: { gt: 0 } },
    include: {
      stockCode: { select: { id: true, code: true, description: true, category: true, uom: { select: { code: true } } } },
    },
    orderBy: { stockCode: { code: 'asc' } },
  });
  res.json(inventory);
}));

export default router;
