const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const { connectDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const { swaggerSpec } = require('./config/swagger');
require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isDatabaseConnected = false;

const connectDatabaseOnce = async () => {
  if (!isDatabaseConnected) {
    try {
      await connectDatabase();
      isDatabaseConnected = true;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
};

if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try {
      await connectDatabaseOnce();
      next();
    } catch (error) {
      console.error('Database connection error:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }
  });
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Ecommerce API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current server status and timestamp. Useful for monitoring and health checks.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-11-26T03:45:59.090Z"
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDatabase();
      
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;


