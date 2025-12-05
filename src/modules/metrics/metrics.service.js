const prisma = require('../../config/prisma');

async function getSummary(organizationId, allowedStoreIds = [], { from, to } = {}) {
  const where = { organizationId };
  if (allowedStoreIds && allowedStoreIds.length) where.storeId = { in: allowedStoreIds };
  if (from || to) where.createdAt = {};
  if (from) where.createdAt.gte = new Date(from);
  if (to) where.createdAt.lte = new Date(to);

  const totalCustomers = await prisma.customer.count({ where });
  const totalOrders = await prisma.order.count({ where });
  
  const productWhere = { organizationId };
  if (allowedStoreIds && allowedStoreIds.length) productWhere.storeId = { in: allowedStoreIds };
  const totalProducts = await prisma.product.count({ where: productWhere });
  
  const revenueAgg = await prisma.order.aggregate({ where, _sum: { totalPrice: true } });
  const totalRevenue = parseFloat(revenueAgg._sum.totalPrice || 0);
  
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const ordersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;
  const revenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return { 
    totalCustomers, 
    totalOrders, 
    totalProducts,
    totalRevenue, 
    avgOrderValue,
    ordersPerCustomer,
    revenuePerCustomer
  };
}

async function getOrdersByDate(organizationId, allowedStoreIds = [], { from, to } = {}) {
  const where = { organizationId };
  if (allowedStoreIds && allowedStoreIds.length) where.storeId = { in: allowedStoreIds };
  if (from || to) where.createdAt = {};
  if (from) where.createdAt.gte = new Date(from);
  if (to) where.createdAt.lte = new Date(to);

  const grouped = await prisma.order.groupBy({
    by: ['createdAt'],
    where,
    _count: { id: true },
    _sum: { totalPrice: true },
    orderBy: { createdAt: 'asc' },
  });

  return grouped.map(g => ({ date: g.createdAt.toISOString().slice(0, 10), ordersCount: g._count.id, totalRevenue: g._sum.totalPrice || 0 }));
}

async function getTopCustomers(organizationId, allowedStoreIds = [], { from, to, limit = 5 } = {}) {
  const where = { organizationId };
  if (allowedStoreIds && allowedStoreIds.length) where.storeId = { in: allowedStoreIds };
  if (from || to) where.createdAt = {};
  if (from) where.createdAt.gte = new Date(from);
  if (to) where.createdAt.lte = new Date(to);

  const grouped = await prisma.order.groupBy({
    by: ['customerId'],
    where,
    _sum: { totalPrice: true },
    _count: { id: true },
    orderBy: { _sum: { totalPrice: 'desc' } },
    take: limit,
  });

  const customerIds = grouped.map(g => g.customerId).filter(Boolean);
  const customers = customerIds.length ? await prisma.customer.findMany({ where: { id: { in: customerIds } } }) : [];
  const customerById = customers.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  return grouped.map(g => ({
    customerId: g.customerId,
    email: customerById[g.customerId] ? customerById[g.customerId].email : null,
    totalSpent: g._sum.totalPrice || 0,
    ordersCount: g._count.id || 0,
  }));
}


module.exports = { getSummary, getOrdersByDate, getTopCustomers };
