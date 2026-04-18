import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/rbac';
import { createStockCodeSchema, updateStockCodeSchema, paginationSchema } from 'shared';
import { AppError } from '../middleware/error';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// GET / — list stock codes
router.get('/', validate(paginationSchema, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query as any;
  const category = req.query.category as string | undefined;

  const where: any = { isActive: true };
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const [stockCodes, total] = await Promise.all([
    prisma.stockCode.findMany({
      where,
      include: { uom: { select: { id: true, code: true, name: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockCode.count({ where }),
  ]);

  res.json({ data: stockCodes, total, page, limit });
}));

// GET /:id — single stock code with relations
router.get('/:id', asyncHandler(async (req, res) => {
  const stockCode = await prisma.stockCode.findUnique({
    where: { id: req.params.id },
    include: {
      uom: { select: { id: true, code: true, name: true } },
      currentPlaces: {
        where: { qty: { gt: 0 } },
        include: { place: { select: { id: true, code: true, name: true, type: true } } },
      },
      safetyStockRules: {
        where: { isActive: true },
        include: { place: { select: { id: true, code: true, name: true } } },
      },
    },
  });
  if (!stockCode) throw new AppError(404, 'Stock code not found');
  res.json(stockCode);
}));

// POST / — create stock code
router.post('/', requirePermission('STOCK_CODES', 'CREATE'), validate(createStockCodeSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.stockCode.findUnique({ where: { code: req.body.code } });
  if (existing) throw new AppError(409, 'Stock code already exists');

  const stockCode = await prisma.stockCode.create({
    data: req.body,
    include: { uom: { select: { id: true, code: true, name: true } } },
  });
  res.status(201).json(stockCode);
}));

// PATCH /:id — update stock code
router.patch('/:id', requirePermission('STOCK_CODES', 'UPDATE'), validate(updateStockCodeSchema), asyncHandler(async (req, res) => {
  const stockCode = await prisma.stockCode.update({
    where: { id: req.params.id },
    data: req.body,
    include: { uom: { select: { id: true, code: true, name: true } } },
  });
  res.json(stockCode);
}));

// DELETE /:id — soft delete
router.delete('/:id', requirePermission('STOCK_CODES', 'DELETE'), asyncHandler(async (req, res) => {
  await prisma.stockCode.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ message: 'Stock code deactivated' });
}));

export default router;
