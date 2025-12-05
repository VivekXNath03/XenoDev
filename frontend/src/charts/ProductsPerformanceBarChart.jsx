import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';

const ProductsPerformanceBarChart = ({ data = [] }) => {
  // Transform data for chart - take top 10 products
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.title?.substring(0, 20) || item.name?.substring(0, 20) || 'Unknown',
    units: item.unitsSold || item.quantitySold || 0,
    revenue: parseFloat(item.revenue || item.totalRevenue || 0),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">{payload[0].payload.name}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Units Sold:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(payload[0].value)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Revenue:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(payload[1].value)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
        layout="horizontal"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: '11px' }}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          yAxisId="left"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickLine={false}
          label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          tickFormatter={(value) => formatNumber(value)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickLine={false}
          label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
          tickFormatter={(value) => `$${formatNumber(value)}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }} />
        <Legend
          wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
          iconType="circle"
        />
        <Bar
          yAxisId="left"
          dataKey="units"
          fill="#a855f7"
          radius={[8, 8, 0, 0]}
          name="Units Sold"
          maxBarSize={40}
        />
        <Bar
          yAxisId="right"
          dataKey="revenue"
          fill="#3b82f6"
          radius={[8, 8, 0, 0]}
          name="Revenue"
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductsPerformanceBarChart;
