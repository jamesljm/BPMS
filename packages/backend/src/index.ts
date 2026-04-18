import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { prisma } from './prisma';
import { errorHandler } from './middleware/error';
import { authenticate } from './middleware/auth';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import placeRoutes from './routes/places';
import uomRoutes from './routes/uoms';
import dashboardRoutes from './routes/dashboard';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Global middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticate, userRoutes);
app.use('/api/v1/roles', authenticate, roleRoutes);
app.use('/api/v1/places', authenticate, placeRoutes);
app.use('/api/v1/uoms', authenticate, uomRoutes);
app.use('/api/v1/dashboard', authenticate, dashboardRoutes);

// Temporary seed endpoint (remove after initial deploy)
app.post('/api/v1/admin/seed', async (req, res) => {
  try {
    const { runSeed } = await import('./seed-fn');
    await runSeed();
    res.json({ message: 'Seed completed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Error handler
app.use(errorHandler);

// Start server
async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(config.PORT, () => {
      console.log(`BPMS backend running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
