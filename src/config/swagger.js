const swaggerJSDoc = require('swagger-jsdoc');
const env = require('./env');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Shopify Multi-tenant Analytics API',
    version: '1.0.0',
    description: 'API for ingesting and analyzing Shopify data (multi-tenant). Most endpoints require Bearer token authentication.',
  },
  servers: [
    { url: env.appUrl || `http://localhost:${env.port}` },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from /auth/login or /auth/signup',
      },
    },
  },
  // Don't set global security - let each route specify its own
};

const options = {
  swaggerDefinition,
  apis: [
    './src/modules/**/**/*.routes.js',
    './src/modules/**/**/*.controller.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
