import React, { useState, useEffect } from 'react';
import { useStoreContext } from '../stores/storeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const RevenueForecast = () => {
  const { selectedStore } = useStoreContext();
  const selectedStoreId = selectedStore?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [forecastMonths, setForecastMonths] = useState(3);

  const fetchForecast = async () => {
    if (!selectedStoreId) {
      setError('Please select a store');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/analytics/revenue-forecast?storeId=${selectedStoreId}&months=${forecastMonths}`);
      setForecast(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch revenue forecast');
      console.error('Forecast fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedStoreId, forecastMonths]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onClose={() => setError(null)} />
      </div>
    );
  }

  if (!selectedStoreId || !forecast) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Store Selected</h2>
          <p className="text-gray-500">Please select a store to view revenue forecast</p>
        </div>
      </div>
    );
  }

  // Combine historical and forecast data for chart
  const chartData = [
    ...forecast.historicalData.map(d => ({
      month: d.month,
      revenue: d.revenue,
      type: 'historical',
    })),
    ...forecast.forecast.map(d => ({
      month: d.month,
      revenue: d.revenue,
      confidence: d.confidence,
      type: 'forecast',
    })),
  ];

  const getTrendIcon = () => {
    if (forecast.trend === 'growing') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (forecast.trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (forecast.trend === 'growing') return 'text-green-600 bg-green-100';
    if (forecast.trend === 'declining') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const totalForecastRevenue = forecast.forecast.reduce((sum, f) => sum + f.revenue, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Forecast</h1>
          <p className="text-gray-600 mt-1">AI-powered predictive analytics</p>
        </div>
        <select
          value={forecastMonths}
          onChange={(e) => setForecastMonths(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={1}>1 Month</option>
          <option value={3}>3 Months</option>
          <option value={6}>6 Months</option>
          <option value={12}>12 Months</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Monthly Revenue</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(forecast.averageMonthlyRevenue)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${getTrendColor()}`}>
              {getTrendIcon()}
            </div>
            <div>
              <div className="text-sm text-gray-600">Trend</div>
              <div className="text-xl font-bold text-gray-900 capitalize">{forecast.trend}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Growth Rate</div>
              <div className="text-xl font-bold text-gray-900">
                {forecast.growthRate ? `${(forecast.growthRate * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Forecast Total</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(totalForecastRevenue)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Projection</h2>
        {forecast.trend === 'insufficient_data' ? (
          <div className="py-12 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>Insufficient data for forecasting. Need at least 2 months of historical data.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : name]}
                labelStyle={{ color: '#374151' }}
              />
              <Legend />
              <ReferenceLine
                x={forecast.historicalData[forecast.historicalData.length - 1]?.month}
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                label={{ value: 'Forecast Start', position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Forecast Table */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Forecast</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Projected Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forecast.forecast.map((item, index) => {
                const previousRevenue = index === 0
                  ? forecast.historicalData[forecast.historicalData.length - 1]?.revenue
                  : forecast.forecast[index - 1]?.revenue;
                const change = previousRevenue
                  ? ((item.revenue - previousRevenue) / previousRevenue) * 100
                  : 0;

                return (
                  <tr key={item.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.month}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                        item.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`flex items-center justify-end gap-1 ${
                        change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {change > 0 ? <TrendingUp className="w-4 h-4" /> : change < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {Math.abs(change).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">📊 Key Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {forecast.trend === 'growing' && (
            <li>✅ Your business is on a positive growth trajectory with {((forecast.growthRate || 0) * 100).toFixed(1)}% average monthly growth</li>
          )}
          {forecast.trend === 'declining' && (
            <li>⚠️ Revenue is trending downward. Consider reviewing marketing strategies and customer retention programs</li>
          )}
          {forecast.trend === 'stable' && (
            <li>📊 Revenue is stable. Look for growth opportunities through new products or market expansion</li>
          )}
          <li>💡 Forecast confidence decreases over time. Use near-term predictions for operational planning</li>
          <li>🎯 Set monthly targets based on forecast to track performance against predictions</li>
        </ul>
      </Card>
    </div>
  );
};

export default RevenueForecast;
