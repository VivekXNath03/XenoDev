const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./modules/auth/auth.routes');
const orgRoutes = require('./modules/organizations/organization.routes');
const userRoutes = require('./modules/users/user.routes');
const storeRoutes = require('./modules/stores/store.routes');
const shopifyRoutes = require('./modules/shopify/shopify.routes');
const shopifyWebhooks = require('./modules/shopify/shopify.webhooks');
const ingestionRoutes = require('./modules/ingestion/ingestion.routes');
const metricsRoutes = require('./modules/metrics/metrics.routes');
const productsRoutes = require('./modules/products/products.routes');
const customersRoutes = require('./modules/customers/customers.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const notFoundHandler = require('./common/middleware/notFoundHandler');
const errorHandler = require('./common/middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// Swagger docs (PUBLIC - must be before other routes)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

// Public / auth
app.use('/auth', authRoutes);

// Webhooks (PUBLIC - no auth) - must use specific paths
app.use('/shopify/webhooks', shopifyWebhooks);

// Root route - must come before other routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Xeno CRM Business Acceleration Platform 🚀', 
    version: '1.0.0',
    docs: '/docs',
    endpoints: {
      auth: '/auth',
      analytics: '/analytics',
      stores: '/stores',
      customers: '/customers',
      products: '/products',
      orders: '/metrics'
    }
  });
});

// Protected API routes
app.use('/organizations', orgRoutes);
app.use('/users', userRoutes);
app.use('/stores', storeRoutes);
app.use('/shopify', shopifyRoutes);
app.use('/ingestion', ingestionRoutes);
app.use('/metrics', metricsRoutes);
app.use('/products', productsRoutes);
app.use('/customers', customersRoutes);
app.use('/analytics', analyticsRoutes);

// 404
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;
