import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// GET / — executive dashboard
router.get('/', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPlaces,
    totalProjects,
    totalStockCodes,
    totalPiles,
    totalMovements,
    totalWos,
    recentMovements,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.place.count({ where: { isActive: true } }),
    prisma.project.count(),
    prisma.stockCode.count({ where: { isActive: true } }),
    prisma.pile.count(),
    prisma.movement.count(),
    prisma.maintenanceWo.count(),
    prisma.movement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, movementNo: true, intent: true, status: true, createdAt: true,
        sourcePlace: { select: { code: true, name: true } },
        destPlace: { select: { code: true, name: true } },
      },
    }),
  ]);

  res.json({
    counts: {
      users: totalUsers,
      places: totalPlaces,
      projects: totalProjects,
      stockCodes: totalStockCodes,
      piles: totalPiles,
      movements: totalMovements,
      workOrders: totalWos,
    },
    recentMovements,
  });
}));

export default router;
