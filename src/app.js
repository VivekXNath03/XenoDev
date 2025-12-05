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

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/shopify/webhooks', shopifyWebhooks);

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

app.use('/organizations', orgRoutes);
app.use('/users', userRoutes);
app.use('/stores', storeRoutes);
app.use('/shopify', shopifyRoutes);
app.use('/ingestion', ingestionRoutes);
app.use('/metrics', metricsRoutes);
app.use('/products', productsRoutes);
app.use('/customers', customersRoutes);
app.use('/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
