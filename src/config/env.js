const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const nodeEnv = process.env.NODE_ENV || 'development';
const port = parseInt(process.env.PORT, 10) || 3000;
const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET || 'changeme-in-prod';
const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

const shopifyApiVersion = process.env.SHOPIFY_API_VERSION || '2025-10';
const shopifyScopes = process.env.SHOPIFY_SCOPES || process.env.SHOPIFY_APP_SCOPES || '';
const appUrl = process.env.APP_URL || process.env.SHOPIFY_APP_URL || `http://localhost:${port}`;

const devShopDomain = process.env.DEV_SHOP_DOMAIN || null;
const devShopAdminAccessToken = process.env.DEV_SHOP_ADMIN_ACCESS_TOKEN || null;

const shopifyApiKey = process.env.SHOPIFY_API_KEY || null;
const shopifyApiSecret = process.env.SHOPIFY_API_SECRET || null;
const shopifyAppScopes = process.env.SHOPIFY_APP_SCOPES || process.env.SHOPIFY_SCOPES || '';
const shopifyAppUrl = process.env.SHOPIFY_APP_URL || appUrl;
const shopifyAppRedirectUri = process.env.SHOPIFY_APP_REDIRECT_URI || `${shopifyAppUrl}/shopify/callback`;

const isOAuthAppMode = !!(shopifyApiKey && shopifyApiSecret);
const isDevDirectMode = !!(devShopDomain && devShopAdminAccessToken) && !isOAuthAppMode;

module.exports = {
  nodeEnv,
  port,
  databaseUrl,
  jwtSecret,
  bcryptRounds,
  shopifyApiVersion,
  shopifyScopes: shopifyScopes.split(',').map(s => s.trim()).filter(Boolean),
  appUrl,
  devShopDomain,
  devShopAdminAccessToken,
  shopifyApiKey,
  shopifyApiSecret,
  shopifyAppScopes,
  shopifyAppUrl,
  shopifyAppRedirectUri,
  isDevDirectMode,
  isOAuthAppMode,
};
