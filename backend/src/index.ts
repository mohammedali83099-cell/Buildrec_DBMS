import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, isDbConnected } from './config/db.js';
import projectsRouter from './routes/projects.js';
import procurementRouter from './routes/procurement.js';
import materialsRouter from './routes/materials.js';
import progressRouter from './routes/progress.js';
import billingRouter from './routes/billing.js';
import reportsRouter from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// System health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'BUILDREC - Construction Site Management System API',
    dbConnected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// Mount modular routers
app.use('/api', projectsRouter);
app.use('/api', procurementRouter);
app.use('/api', materialsRouter);
app.use('/api', progressRouter);
app.use('/api', billingRouter);
app.use('/api', reportsRouter);

// Start server and initialize database connection
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 BUILDREC API server is running at http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
  });
}

startServer();
