import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed/seedData.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import productRoutes from './routes/productRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();

// Comprehensive CORS & Preflight handling for Vercel
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  );

  // Immediately respond to preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Date',
      'X-Api-Version',
    ],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware (essential for Vercel serverless functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGO_URI is set properly.',
    });
  }
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'IDURAR ERP-CRM Lite',
    timestamp: new Date().toISOString(),
  });
});

// Also provide top-level /api/health for direct Vercel checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'IDURAR ERP-CRM Lite',
    timestamp: new Date().toISOString(),
  });
});

// Root ping
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'IDURAR ERP-CRM Backend API is running on Vercel',
  });
});

// Mount modular API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Start server function (used in local development)
export const startServer = async (customPort) => {
  const listenPort = customPort || PORT;
  await connectDB();
  await seedDatabase();

  return new Promise((resolve) => {
    const server = app.listen(listenPort, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${listenPort}`);
      resolve(server);
    });
  });
};

// Auto start if run directly with node src/server.js (not on Vercel serverless)
if (process.argv[1]?.endsWith('server.js') && !process.env.VERCEL) {
  startServer();
}

export default app;
