require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    logger.info('Starting server...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Debug environment variables (without exposing sensitive data)
    logger.info('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING',
      DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING'
    });
    
    // Try database connection with timeout
    let dbConnected = false;
    try {
      const connectionTimeout = setTimeout(() => {
        logger.error('Database connection timeout - continuing without database');
      }, 5000); // 5 seconds timeout

      await sequelize.authenticate();
      clearTimeout(connectionTimeout);
      logger.info('Database connection established successfully');
      
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
      dbConnected = true;
      
    } catch (dbError) {
      logger.error('Database connection failed:', { 
        error: dbError.message,
        stack: dbError.stack
      });
    }

    // Start server regardless of database connection
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Database: ${dbConnected ? 'CONNECTED' : 'DISCONNECTED (running in fallback mode)'}`);
    });

  } catch (error) {
    logger.error('Failed to start server', { 
      error: error.message, 
      stack: error.stack,
      env: process.env.NODE_ENV,
      dbHost: process.env.DB_HOST ? 'configured' : 'missing',
      dbName: process.env.DB_NAME ? 'configured' : 'missing'
    });
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
