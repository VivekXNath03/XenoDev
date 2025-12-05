import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';

const COLORS = {
  high: '#22c55e',    // green - high value
  medium: '#3b82f6',  // blue - medium value
  low: '#f59e0b',     // orange - low value
  inactive: '#ef4444', // red - inactive
};

const CustomerPieChart = ({ data = [] }) => {
  const chartData = [
    {
      name: 'High Value',
      value: data.filter((c) => parseFloat(c.totalSpent || 0) > 1000).length,
      color: COLORS.high,
    },
    {
      name: 'Medium Value',
      value: data.filter(
        (c) => parseFloat(c.totalSpent || 0) > 100 && parseFloat(c.totalSpent || 0) <= 1000
      ).length,
      color: COLORS.medium,
    },
    {
      name: 'Low Value',
      value: data.filter(
        (c) => parseFloat(c.totalSpent || 0) > 0 && parseFloat(c.totalSpent || 0) <= 100
      ).length,
      color: COLORS.low,
    },
    {
      name: 'Inactive',
      value: data.filter((c) => parseFloat(c.totalSpent || 0) === 0).length,
      color: COLORS.inactive,
    },
  ].filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((payload[0].value / total) * 100).toFixed(1);

    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">{payload[0].name}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].payload.color }}
            ></div>
            <span className="text-sm text-gray-600">Customers:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(payload[0].value)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Percentage:</span>
            <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-gray-500">
        No customer data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
          iconType="circle"
          formatter={(value, entry) => `${value} (${entry.payload.value})`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomerPieChart;
