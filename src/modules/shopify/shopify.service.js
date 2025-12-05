const prisma = require('../../config/prisma');
const env = require('../../config/env');
const shopifyClient = require('./shopify.client');

async function getStoreConfigForStore(storeId) {
  return prisma.shopifyStoreConfig.findUnique({ where: { storeId }, include: { store: true } });
}

async function getClientForStore(storeId) {
  const config = await getStoreConfigForStore(storeId);
  return shopifyClient.createClientForStoreConfig(config || (env.isDevDirectMode ? { shopDomain: env.devShopDomain, accessToken: env.devShopAdminAccessToken } : null));
}

async function connectStoreWithOAuth(storeId, accessToken, scope, apiVersion) {
  // Save or update ShopifyStoreConfig
  const existing = await prisma.shopifyStoreConfig.findUnique({ where: { storeId } });
  if (existing) {
    return prisma.shopifyStoreConfig.update({ where: { storeId }, data: { accessToken, scope, apiVersion } });
  }
  return prisma.shopifyStoreConfig.create({ data: { storeId, accessToken, scope, apiVersion } });
}

// Fetch customers from Shopify
async function fetchCustomers(client) {
  const CUSTOMERS_QUERY = `
    query ($cursor: String) {
      customers(first: 250, after: $cursor) {
        edges {
          node {
            id
            email
            firstName
            lastName
            createdAt
            updatedAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const allCustomers = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const data = await client.graphql(CUSTOMERS_QUERY, { cursor });
    const edges = data.customers.edges || [];
    
    for (const edge of edges) {
      const node = edge.node;
      // Extract numeric ID from Shopify GID (e.g., "gid://shopify/Customer/123" -> "123")
      const numericId = node.id.split('/').pop();
      allCustomers.push({
        id: numericId,
        email: node.email,
        firstName: node.firstName,
        lastName: node.lastName,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      });
    }

    hasNextPage = data.customers.pageInfo.hasNextPage;
    cursor = data.customers.pageInfo.endCursor;
  }

  return allCustomers;
}

// Fetch products from Shopify
async function fetchProducts(client) {
  const PRODUCTS_QUERY = `
    query ($cursor: String) {
      products(first: 250, after: $cursor) {
        edges {
          node {
            id
            title
            handle
            status
            tags
            createdAt
            updatedAt
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                  sku
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const data = await client.graphql(PRODUCTS_QUERY, { cursor });
    const edges = data.products.edges || [];
    
    for (const edge of edges) {
      const node = edge.node;
      const numericId = node.id.split('/').pop();
      const firstVariant = node.variants.edges[0]?.node;
      
      allProducts.push({
        id: numericId,
        title: node.title,
        handle: node.handle,
        status: node.status,
        tags: node.tags.join(','),
        price: firstVariant ? parseFloat(firstVariant.price) : null,
        sku: firstVariant?.sku || null,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        variants: node.variants.edges.map(v => ({
          id: v.node.id.split('/').pop(),
          price: v.node.price,
          sku: v.node.sku,
        })),
      });
    }

    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return allProducts;
}

// Fetch orders from Shopify
async function fetchOrders(client) {
  const ORDERS_QUERY = `
    query ($cursor: String) {
      orders(first: 250, after: $cursor) {
        edges {
          node {
            id
            name
            createdAt
            updatedAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
              }
            }
            totalTaxSet {
              shopMoney {
                amount
              }
            }
            displayFinancialStatus
            displayFulfillmentStatus
            customer {
              id
            }
            lineItems(first: 250) {
              edges {
                node {
                  id
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                  product {
                    id
                  }
                  variant {
                    id
                    sku
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const allOrders = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const data = await client.graphql(ORDERS_QUERY, { cursor });
    const edges = data.orders.edges || [];
    
    for (const edge of edges) {
      const node = edge.node;
      const numericId = node.id.split('/').pop();
      const customerId = node.customer?.id ? node.customer.id.split('/').pop() : null;
      
      const lineItems = node.lineItems.edges.map(li => {
        const lineNode = li.node;
        return {
          id: lineNode.id.split('/').pop(),
          title: lineNode.title,
          quantity: lineNode.quantity,
          price: parseFloat(lineNode.originalUnitPriceSet.shopMoney.amount),
          total: lineNode.quantity * parseFloat(lineNode.originalUnitPriceSet.shopMoney.amount),
          productId: lineNode.product?.id ? lineNode.product.id.split('/').pop() : null,
          variantId: lineNode.variant?.id ? lineNode.variant.id.split('/').pop() : null,
          sku: lineNode.variant?.sku || null,
        };
      });
      
      allOrders.push({
        id: numericId,
        customerId,
        totalPrice: parseFloat(node.totalPriceSet.shopMoney.amount),
        subtotalPrice: parseFloat(node.subtotalPriceSet.shopMoney.amount),
        totalTax: parseFloat(node.totalTaxSet.shopMoney.amount),
        currency: node.totalPriceSet.shopMoney.currencyCode,
        financialStatus: node.displayFinancialStatus,
        fulfillmentStatus: node.displayFulfillmentStatus,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        lineItems,
      });
    }

    hasNextPage = data.orders.pageInfo.hasNextPage;
    cursor = data.orders.pageInfo.endCursor;
  }

  return allOrders;
}

module.exports = { 
  getClientForStore, 
  connectStoreWithOAuth, 
  getStoreConfigForStore,
  fetchCustomers,
  fetchProducts,
  fetchOrders,
};
