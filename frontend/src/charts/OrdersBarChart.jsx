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
import { formatNumber } from '../utils/formatCurrency';
import { format } from 'date-fns';

const OrdersBarChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date || item._id), 'MMM dd'),
    orders: item.orderCount || item.count || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">{payload[0].payload.date}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Orders:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatNumber(payload[0].value)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickLine={false}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickLine={false}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }} />
        <Legend
          wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
          iconType="circle"
        />
        <Bar
          dataKey="orders"
          fill="#22c55e"
          radius={[8, 8, 0, 0]}
          name="Orders"
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OrdersBarChart;
