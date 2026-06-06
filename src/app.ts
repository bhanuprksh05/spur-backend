import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import routes from './routes';

const app: Application = express();

// Security and utility Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress response bodies
app.use(morgan('combined')); // Request logging
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // URL encoded parser

// Application Routes
app.use('/', routes);

// Handle unknown routes
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // Note: Do not expose error stack in production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;
