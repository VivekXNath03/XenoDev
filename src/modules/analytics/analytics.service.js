const prisma = require('../../config/prisma');

async function getTopSellingProducts(organizationId, storeId, limit = 10) {
  const topProducts = await prisma.orderLineItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        organizationId,
        storeId,
      },
      productId: { not: null },
    },
    _sum: {
      quantity: true,
      total: true,
    },
    _count: {
      productId: true,
    },
    orderBy: {
      _sum: {
        total: 'desc',
      },
    },
    take: limit,
  });

  // Enrich with product details
  const productIds = topProducts.map(p => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productsMap = {};
  products.forEach(p => productsMap[p.id] = p);

  return topProducts.map(item => ({
    productId: item.productId,
    title: productsMap[item.productId]?.title || 'Unknown Product',
    handle: productsMap[item.productId]?.handle,
    totalQuantitySold: item._sum.quantity || 0,
    totalRevenue: item._sum.total || 0,
    orderCount: item._count.productId,
  }));
}

async function getTopCustomers(organizationId, storeId, limit = 10) {
  const topCustomers = await prisma.order.groupBy({
    by: ['customerId'],
    where: {
      organizationId,
      storeId,
      customerId: { not: null },
    },
    _sum: {
      totalPrice: true,
    },
    _count: {
      customerId: true,
    },
    orderBy: {
      _sum: {
        totalPrice: 'desc',
      },
    },
    take: limit,
  });

  // Enrich with customer details
  const customerIds = topCustomers.map(c => c.customerId);
  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
  });

  const customersMap = {};
  customers.forEach(c => customersMap[c.id] = c);

  return topCustomers.map(item => ({
    customerId: item.customerId,
    name: `${customersMap[item.customerId]?.firstName || ''} ${customersMap[item.customerId]?.lastName || ''}`.trim() || 'Unknown',
    email: customersMap[item.customerId]?.email || 'N/A',
    totalSpent: item._sum.totalPrice || 0,
    orderCount: item._count.customerId,
  }));
}

async function getCustomerLocationStats(organizationId, storeId) {
  // Get all customers with their addresses
  const customers = await prisma.customer.findMany({
    where: {
      organizationId,
      storeId,
      defaultAddress: { not: null },
    },
    select: {
      id: true,
      defaultAddress: true,
      ordersCount: true,
      totalSpent: true,
    },
  });

  // Parse location data (assuming defaultAddress contains city/country info)
  const locationMap = {};
  
  customers.forEach(customer => {
    if (customer.defaultAddress) {
      // Try to extract city or country from address string
      const location = customer.defaultAddress || 'Unknown';
      
      if (!locationMap[location]) {
        locationMap[location] = {
          location,
          customerCount: 0,
          totalOrders: 0,
          totalRevenue: 0,
        };
      }
      
      locationMap[location].customerCount += 1;
      locationMap[location].totalOrders += customer.ordersCount || 0;
      locationMap[location].totalRevenue += customer.totalSpent || 0;
    }
  });

  return Object.values(locationMap)
    .sort((a, b) => b.customerCount - a.customerCount)
    .slice(0, 10);
}

async function getBusinessInsights(organizationId, storeId) {
  const [topProducts, topCustomers, locations] = await Promise.all([
    getTopSellingProducts(organizationId, storeId, 5),
    getTopCustomers(organizationId, storeId, 5),
    getCustomerLocationStats(organizationId, storeId),
  ]);

  return {
    topProducts,
    topCustomers,
    locations,
  };
}

async function getCustomerSegments(organizationId, storeId) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Get all customers with their order stats
  const customers = await prisma.customer.findMany({
    where: { organizationId, storeId },
    include: {
      orders: {
        select: {
          id: true,
          totalPrice: true,
          createdAt: true,
        },
      },
    },
  });

  // Calculate total revenue for top 20% threshold
  const totalRevenue = customers.reduce((sum, c) => 
    sum + c.orders.reduce((orderSum, o) => orderSum + (o.totalPrice || 0), 0), 0
  );
  const revenueThreshold = totalRevenue * 0.2;

  const segments = {
    vip: [], // Top 20% by spend
    frequent: [], // 5+ orders
    new: [], // First order < 30 days
    atRisk: [], // No order in 90+ days
    oneTime: [], // Only 1 order
  };

  customers.forEach(customer => {
    const orderCount = customer.orders.length;
    const totalSpent = customer.orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const lastOrderDate = customer.orders.length > 0 
      ? new Date(Math.max(...customer.orders.map(o => new Date(o.createdAt))))
      : null;
    const firstOrderDate = customer.orders.length > 0
      ? new Date(Math.min(...customer.orders.map(o => new Date(o.createdAt))))
      : null;

    const customerData = {
      customerId: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown',
      email: customer.email,
      orderCount,
      totalSpent,
      lastOrderDate,
      firstOrderDate,
    };

    // VIP: Top spenders contributing to top 20% of revenue
    if (totalSpent >= revenueThreshold / customers.length * 5) {
      segments.vip.push(customerData);
    }

    // Frequent buyers: 5+ orders
    if (orderCount >= 5) {
      segments.frequent.push(customerData);
    }

    // New customers: First order within 30 days
    if (firstOrderDate && firstOrderDate >= thirtyDaysAgo) {
      segments.new.push(customerData);
    }

    // At-risk: Last order > 90 days ago
    if (lastOrderDate && lastOrderDate < ninetyDaysAgo && orderCount > 1) {
      segments.atRisk.push(customerData);
    }

    // One-time buyers
    if (orderCount === 1 && lastOrderDate && lastOrderDate < thirtyDaysAgo) {
      segments.oneTime.push(customerData);
    }
  });

  // Sort each segment by totalSpent desc
  Object.keys(segments).forEach(key => {
    segments[key].sort((a, b) => b.totalSpent - a.totalSpent);
  });

  return {
    vip: { count: segments.vip.length, customers: segments.vip.slice(0, 20) },
    frequent: { count: segments.frequent.length, customers: segments.frequent.slice(0, 20) },
    new: { count: segments.new.length, customers: segments.new.slice(0, 20) },
    atRisk: { count: segments.atRisk.length, customers: segments.atRisk.slice(0, 20) },
    oneTime: { count: segments.oneTime.length, customers: segments.oneTime.slice(0, 20) },
    totalCustomers: customers.length,
  };
}

async function getRevenueForecast(organizationId, storeId, months = 3) {
  // Use a dynamic history window for stability: at least 12 months, or 2x forecast horizon
  const historyWindowMonths = Math.max(12, months * 2);
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - historyWindowMonths);

  const orders = await prisma.order.findMany({
    where: {
      organizationId,
      storeId,
      createdAt: { gte: windowStart },
    },
    select: {
      totalPrice: true,
      createdAt: true,
    },
  });

  // Group by month
  const monthlyRevenue = {};
  orders.forEach(order => {
    const monthKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyRevenue[monthKey]) monthlyRevenue[monthKey] = 0;
    monthlyRevenue[monthKey] += order.totalPrice || 0;
  });

  // Ensure continuous months series (fill missing with 0)
  const series = [];
  const start = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1);
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    series.push({ month: key, revenue: monthlyRevenue[key] || 0 });
  }

  const historicalData = series;
  if (historicalData.length < 3) {
    return { historicalData, forecast: [], trend: 'insufficient_data', averageMonthlyRevenue: 0, growthRate: 0 };
  }

  // Exponential smoothing for level + implied growth (simple SES with drift approximation)
  const alpha = 0.4; // smoothing factor: 0<alpha<=1 (higher = more responsive)
  let level = historicalData[0].revenue;
  let prevLevel = level;
  const smoothed = [];
  for (let i = 0; i < historicalData.length; i++) {
    const y = historicalData[i].revenue;
    level = alpha * y + (1 - alpha) * level;
    smoothed.push({ month: historicalData[i].month, revenue: y, level });
  }

  // Estimate average month-over-month growth on smoothed series
  let totalGrowth = 0;
  let growthCount = 0;
  for (let i = 1; i < smoothed.length; i++) {
    const prev = smoothed[i - 1].level;
    const curr = smoothed[i].level;
    if (prev > 0) {
      totalGrowth += (curr - prev) / prev;
      growthCount++;
    }
  }
  const avgGrowthRate = growthCount > 0 ? totalGrowth / growthCount : 0;

  const sumRevenue = historicalData.reduce((a, b) => a + b.revenue, 0);
  const avgRevenue = sumRevenue / historicalData.length;
  const sortedRev = [...historicalData.map(d => d.revenue)].sort((a,b)=>a-b);
  const medianRevenue = sortedRev.length ? sortedRev[Math.floor(sortedRev.length/2)] : 0;

  // Forecast next N months using last smoothed level and avg growth with dampening
  // Clamp extreme growth when baselines are tiny to avoid absurd forecasts
  const baseline = Math.max(medianRevenue, avgRevenue, smoothed[smoothed.length - 1].level);
  const clampedGrowth = isFinite(avgGrowthRate) ? Math.max(-0.5, Math.min(avgGrowthRate, 0.5)) : 0; // +/-50% per month cap

  const forecast = [];
  let last = baseline;
  for (let i = 1; i <= months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dampening = Math.pow(0.92, i - 1); // stronger dampening for longer horizons
    last = last * (1 + clampedGrowth * dampening);
    forecast.push({ month: key, revenue: Math.max(0, last), confidence: Math.max(0.4, 1 - i * 0.18) });
  }

  return {
    historicalData,
    forecast,
    trend: clampedGrowth > 0.05 ? 'growing' : clampedGrowth < -0.05 ? 'declining' : 'stable',
    averageMonthlyRevenue: avgRevenue,
    growthRate: clampedGrowth,
    medianMonthlyRevenue: medianRevenue,
  };
}

async function getBusinessAlerts(organizationId, storeId) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const alerts = [];

  // Revenue drop alert
  const recentRevenue = await prisma.order.aggregate({
    where: { organizationId, storeId, createdAt: { gte: sevenDaysAgo } },
    _sum: { totalPrice: true },
  });

  const previousRevenue = await prisma.order.aggregate({
    where: { organizationId, storeId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    _sum: { totalPrice: true },
  });

  const recentTotal = recentRevenue._sum.totalPrice || 0;
  const previousTotal = previousRevenue._sum.totalPrice || 0;

  if (previousTotal > 0) {
    const revenueChange = ((recentTotal - previousTotal) / previousTotal) * 100;
    
    if (revenueChange < -20) {
      alerts.push({
        type: 'critical',
        category: 'revenue',
        title: 'Revenue Drop Alert',
        message: `Revenue decreased by ${Math.abs(revenueChange).toFixed(1)}% compared to last week`,
        value: revenueChange,
        action: 'Review recent orders and customer feedback',
      });
    } else if (revenueChange > 30) {
      alerts.push({
        type: 'success',
        category: 'revenue',
        title: 'Revenue Surge',
        message: `Revenue increased by ${revenueChange.toFixed(1)}% compared to last week`,
        value: revenueChange,
        action: 'Analyze what drove this growth',
      });
    }
  }

  // Product trending alert
  const trendingProducts = await prisma.orderLineItem.groupBy({
    by: ['productId'],
    where: {
      order: { organizationId, storeId, createdAt: { gte: sevenDaysAgo } },
      productId: { not: null },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 3,
  });

  if (trendingProducts.length > 0) {
    const productIds = trendingProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const topProduct = products.find(p => p.id === trendingProducts[0].productId);
    if (topProduct) {
      alerts.push({
        type: 'info',
        category: 'product',
        title: 'Trending Product',
        message: `"${topProduct.title}" sold ${trendingProducts[0]._sum.quantity} units this week`,
        value: trendingProducts[0]._sum.quantity,
        action: 'Consider promoting this product',
      });
    }
  }

  // At-risk customers alert
  const atRiskCustomers = await prisma.customer.findMany({
    where: {
      organizationId,
      storeId,
      orders: {
        some: {
          createdAt: { lt: thirtyDaysAgo },
        },
      },
    },
    include: {
      orders: {
        select: { createdAt: true, totalPrice: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const highValueAtRisk = atRiskCustomers.filter(c => 
    c.orders.length > 0 && c.orders[0].totalPrice > 100
  );

  if (highValueAtRisk.length > 5) {
    alerts.push({
      type: 'warning',
      category: 'customer',
      title: 'Customer Retention Alert',
      message: `${highValueAtRisk.length} high-value customers haven't ordered in 30+ days`,
      value: highValueAtRisk.length,
      action: 'Send re-engagement campaign',
    });
  }

  // Low inventory alert (products with no recent sales)
  const slowMovingProducts = await prisma.product.findMany({
    where: {
      organizationId,
      storeId,
      orderLineItems: {
        none: {
          order: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
    },
    take: 5,
  });

  if (slowMovingProducts.length > 0) {
    alerts.push({
      type: 'warning',
      category: 'inventory',
      title: 'Slow-Moving Inventory',
      message: `${slowMovingProducts.length} products had no sales in the past 30 days`,
      value: slowMovingProducts.length,
      action: 'Consider promotions or discontinuation',
    });
  }

  // Sort alerts by severity
  const severityOrder = { critical: 0, warning: 1, success: 2, info: 3 };
  alerts.sort((a, b) => severityOrder[a.type] - severityOrder[b.type]);

  return {
    alerts,
    alertCount: alerts.length,
    criticalCount: alerts.filter(a => a.type === 'critical').length,
  };
}

async function getProductPerformanceMatrix(organizationId, storeId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  // Get all products with recent sales data
  const products = await prisma.product.findMany({
    where: { organizationId, storeId },
    include: {
      orderLineItems: {
        where: {
          order: {
            createdAt: { gte: sixtyDaysAgo },
          },
        },
        include: {
          order: {
            select: { createdAt: true },
          },
        },
      },
    },
  });

  const matrix = {
    stars: [], // High revenue + High growth
    cashCows: [], // High revenue + Low/negative growth
    questionMarks: [], // Low revenue + High growth
    dogs: [], // Low revenue + Low growth
  };

  const productsWithMetrics = products.map(product => {
    const recentSales = product.orderLineItems.filter(li => 
      new Date(li.order.createdAt) >= thirtyDaysAgo
    );
    const olderSales = product.orderLineItems.filter(li => 
      new Date(li.order.createdAt) >= sixtyDaysAgo && 
      new Date(li.order.createdAt) < thirtyDaysAgo
    );

    const recentRevenue = recentSales.reduce((sum, li) => sum + (li.total || 0), 0);
    const olderRevenue = olderSales.reduce((sum, li) => sum + (li.total || 0), 0);

    const growthRate = olderRevenue > 0 
      ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 
      : recentRevenue > 0 ? 100 : 0;

    return {
      productId: product.id,
      title: product.title,
      handle: product.handle,
      recentRevenue,
      growthRate,
      unitsSold: recentSales.reduce((sum, li) => sum + (li.quantity || 0), 0),
    };
  });

  // Calculate medians for classification
  const revenues = productsWithMetrics.map(p => p.recentRevenue).filter(r => r > 0).sort((a, b) => a - b);
  const medianRevenue = revenues.length > 0 ? revenues[Math.floor(revenues.length / 2)] : 0;
  const medianGrowth = 10; // 10% growth threshold

  productsWithMetrics.forEach(product => {
    if (product.recentRevenue === 0 && product.growthRate === 0) return; // Skip products with no sales

    if (product.recentRevenue >= medianRevenue && product.growthRate >= medianGrowth) {
      matrix.stars.push(product);
    } else if (product.recentRevenue >= medianRevenue && product.growthRate < medianGrowth) {
      matrix.cashCows.push(product);
    } else if (product.recentRevenue < medianRevenue && product.growthRate >= medianGrowth) {
      matrix.questionMarks.push(product);
    } else {
      matrix.dogs.push(product);
    }
  });

  // Sort each category
  matrix.stars.sort((a, b) => b.recentRevenue - a.recentRevenue);
  matrix.cashCows.sort((a, b) => b.recentRevenue - a.recentRevenue);
  matrix.questionMarks.sort((a, b) => b.growthRate - a.growthRate);
  matrix.dogs.sort((a, b) => a.recentRevenue - b.recentRevenue);

  return {
    stars: { count: matrix.stars.length, products: matrix.stars.slice(0, 10) },
    cashCows: { count: matrix.cashCows.length, products: matrix.cashCows.slice(0, 10) },
    questionMarks: { count: matrix.questionMarks.length, products: matrix.questionMarks.slice(0, 10) },
    dogs: { count: matrix.dogs.length, products: matrix.dogs.slice(0, 10) },
    medianRevenue,
  };
}

module.exports = {
  getTopSellingProducts,
  getTopCustomers,
  getCustomerLocationStats,
  getBusinessInsights,
  getCustomerSegments,
  getRevenueForecast,
  getBusinessAlerts,
  getProductPerformanceMatrix,
};
