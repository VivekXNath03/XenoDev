const axios = require('axios');
const env = require('../../config/env');

function buildGraphQLEndpoint(shopDomain, apiVersion = env.shopifyApiVersion) {
  return `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;
}

function createGraphQLClient({ shopDomain, accessToken, apiVersion = env.shopifyApiVersion }) {
  const url = buildGraphQLEndpoint(shopDomain, apiVersion);
  const instance = axios.create({
    baseURL: url,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    timeout: 30000,
  });

  async function graphql(query, variables = {}) {
    const resp = await instance.post('', { query, variables });
    if (resp.data && resp.data.errors) throw new Error(JSON.stringify(resp.data.errors));
    return resp.data.data;
  }

  return { graphql };
}

async function createClientForStoreConfig(storeConfig) {
  if (!storeConfig) {
    if (env.isDevDirectMode) {
      return createGraphQLClient({ shopDomain: env.devShopDomain, accessToken: env.devShopAdminAccessToken });
    }
    throw new Error('No store config available and not in dev direct mode');
  }
  const shopDomain = storeConfig.store ? storeConfig.store.shopDomain : storeConfig.shopDomain;
  const accessToken = storeConfig.accessToken || env.devShopAdminAccessToken;
  const apiVersion = storeConfig.apiVersion || env.shopifyApiVersion;
  return createGraphQLClient({ shopDomain, accessToken, apiVersion });
}

module.exports = { createGraphQLClient, createClientForStoreConfig };
