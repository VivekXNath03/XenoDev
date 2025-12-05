const prisma = require('../../config/prisma');
const shopifyService = require('../shopify/shopify.service');
const logger = require('../../config/logger');

async function upsertCustomers(organizationId, storeId, customers) {
  for (const c of customers) {
    const id = String(c.id || c.node?.id || c.id);
    const createdAt = c.createdAt ? new Date(c.createdAt) : new Date();
    await prisma.customer.upsert({
      where: { id },
      update: {
        email: c.email || null,
        firstName: c.first_name || c.firstName || null,
        lastName: c.last_name || c.lastName || null,
        updatedAt: new Date(),
      },
      create: {
        id,
        organizationId,
        storeId,
        email: c.email || null,
        firstName: c.first_name || c.firstName || null,
        lastName: c.last_name || c.lastName || null,
        createdAt,
      },
    });
  }
}

async function upsertProducts(organizationId, storeId, products) {
  for (const p of products) {
    const id = String(p.id || p.node?.id || p.id);
    const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
    await prisma.product.upsert({
      where: { id },
      update: {
        title: p.title || p.title,
        handle: p.handle || null,
        price: p.variants && p.variants[0] ? parseFloat(p.variants[0].price || 0) : undefined,
        updatedAt: new Date(),
      },
      create: {
        id,
        organizationId,
        storeId,
        title: p.title || '',
        handle: p.handle || null,
        price: p.variants && p.variants[0] ? parseFloat(p.variants[0].price || 0) : null,
        createdAt,
      },
    });
  }
}

async function upsertOrders(organizationId, storeId, orders) {
  for (const o of orders) {
    const id = String(o.id || o.node?.id || o.id);
    const createdAt = o.createdAt ? new Date(o.createdAt) : new Date();
    await prisma.order.upsert({
      where: { id },
      update: {
        totalPrice: parseFloat(o.totalPrice || o.total_price || 0),
        subtotalPrice: parseFloat(o.subtotalPrice || o.subtotal_price || 0) || undefined,
        totalTax: parseFloat(o.totalTax || o.total_tax || 0) || undefined,
        currency: o.currency || null,
        updatedAt: new Date(),
      },
      create: {
        id,
        organizationId,
        storeId,
        customerId: o.customerId || null,
        totalPrice: parseFloat(o.totalPrice || o.total_price || 0),
        subtotalPrice: parseFloat(o.subtotalPrice || o.subtotal_price || 0) || null,
        totalTax: parseFloat(o.totalTax || o.total_tax || 0) || null,
        currency: o.currency || null,
        createdAt,
      },
    });

    if (o.lineItems && Array.isArray(o.lineItems)) {
      for (const li of o.lineItems) {
        const liId = li.id || `${id}-${li.variantId || li.sku || Math.random()}`;
        await prisma.orderLineItem.upsert({
          where: { id: liId },
          update: {
            quantity: li.quantity || 1,
            price: parseFloat(li.price || 0) || 0,
            total: parseFloat(li.total || (li.quantity * (li.price || 0))) || undefined,
          },
          create: {
            id: liId,
            orderId: id,
            productId: li.productId || null,
            variantId: li.variantId || null,
            title: li.title || null,
            sku: li.sku || null,
            quantity: li.quantity || 1,
            price: parseFloat(li.price || 0) || 0,
            total: parseFloat(li.total || (li.quantity * (li.price || 0))) || null,
          },
        });
      }
    }
  }
}

async function syncStore(storeId, options = {}) {
  // options: { organizationId }
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error('Store not found');

  const client = await shopifyService.getClientForStore(storeId);

  try {
    logger.info({ storeId }, 'Starting Shopify data sync');

    logger.info({ storeId }, 'Fetching customers...');
    const customers = await shopifyService.fetchCustomers(client);
    logger.info({ storeId, count: customers.length }, 'Fetched customers');
    await upsertCustomers(store.organizationId, storeId, customers);

    logger.info({ storeId }, 'Fetching products...');
    const products = await shopifyService.fetchProducts(client);
    logger.info({ storeId, count: products.length }, 'Fetched products');
    await upsertProducts(store.organizationId, storeId, products);

    logger.info({ storeId }, 'Fetching orders...');
    const orders = await shopifyService.fetchOrders(client);
    logger.info({ storeId, count: orders.length }, 'Fetched orders');
    await upsertOrders(store.organizationId, storeId, orders);

    await prisma.store.update({ where: { id: storeId }, data: { lastSyncedAt: new Date() } });
    await prisma.storeSyncStatus.upsert({ 
      where: { storeId }, 
      update: { 
        lastCustomersSyncAt: new Date(),
        lastProductsSyncAt: new Date(),
        lastOrdersSyncAt: new Date(),
        lastError: null, 
        updatedAt: new Date() 
      }, 
      create: { 
        storeId,
        lastCustomersSyncAt: new Date(),
        lastProductsSyncAt: new Date(),
        lastOrdersSyncAt: new Date(),
      } 
    });
    
    logger.info({ storeId, customerCount: customers.length, productCount: products.length, orderCount: orders.length }, 'Sync completed successfully');
    return { 
      success: true, 
      synced: {
        customers: customers.length,
        products: products.length,
        orders: orders.length,
      }
    };
  } catch (err) {
    logger.error({ err, storeId }, 'Sync failed');
    await prisma.storeSyncStatus.upsert({ 
      where: { storeId }, 
      update: { lastError: String(err.message || err), updatedAt: new Date() }, 
      create: { storeId, lastError: String(err.message || err) } 
    });
    throw err;
  }
}

module.exports = { syncStore };
