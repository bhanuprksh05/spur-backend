import 'dotenv/config';
import cluster from 'cluster';
import os from 'os';
import http from 'http';
import app from './app';

const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running in production mode`);

  // Fork workers for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    console.log('Starting a new worker...');
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = () => {
    console.log(`Worker ${process.pid} received kill signal, shutting down gracefully.`);
    server.close(() => {
      console.log(`Worker ${process.pid} closed out remaining connections.`);
      process.exit(0);
    });

    // If after 10 seconds, force shutdown
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (err: Error) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
}
