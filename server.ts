import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './server/routes/authRoutes.ts';
import inventoryRoutes from './server/routes/inventoryRoutes.ts';
import salesRoutes from './server/routes/salesRoutes.ts';
import reportRoutes from './server/routes/reportRoutes.ts';
import { seedData } from './server/seed.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Seed database
  await seedData();

  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/reports', reportRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
