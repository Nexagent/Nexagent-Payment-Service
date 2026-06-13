import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import paymentRoutes from './routes/routes';
import { errorMiddleware } from './middleware/error';
import { swaggerSpec } from './config/swagger';
import config from './config/config';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/payments', paymentRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'NotFound', message: 'Route not found' });
});

// Global error handler — must be last
app.use(errorMiddleware);

export default app;
