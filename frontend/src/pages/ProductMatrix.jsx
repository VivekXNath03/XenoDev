import React, { useState, useEffect } from 'react';
import { useStoreContext } from '../stores/storeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import { Star, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const ProductMatrix = () => {
  const { selectedStore } = useStoreContext();
  const selectedStoreId = selectedStore?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [activeQuadrant, setActiveQuadrant] = useState('stars');

  const fetchMatrix = async () => {
    if (!selectedStoreId) {
      setError('Please select a store');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/analytics/product-matrix?storeId=${selectedStoreId}`);
      const fallback = {
        stars: { count: 0, products: [] },
        cashCows: { count: 0, products: [] },
        questionMarks: { count: 0, products: [] },
        dogs: { count: 0, products: [] },
      };
      const data = response?.data?.data || fallback;
      const safeData = {
        stars: data.stars || fallback.stars,
        cashCows: data.cashCows || fallback.cashCows,
        questionMarks: data.questionMarks || fallback.questionMarks,
        dogs: data.dogs || fallback.dogs,
      };
      setMatrix(safeData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch product matrix');
      console.error('Matrix fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [selectedStoreId]);

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

  if (!selectedStoreId || !matrix) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Store Selected</h2>
          <p className="text-gray-500">Please select a store to view product performance matrix</p>
        </div>
      </div>
    );
  }

  const quadrantConfig = {
    stars: {
      icon: Star,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      title: 'Stars ⭐',
      description: 'High revenue + High growth',
      recommendation: 'Invest heavily: These are your winners. Increase marketing budget and inventory.',
    },
    cashCows: {
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      title: 'Cash Cows 💰',
      description: 'High revenue + Low growth',
      recommendation: 'Maintain: Reliable revenue generators. Focus on efficiency and protecting market share.',
    },
    questionMarks: {
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      title: 'Question Marks ❓',
      description: 'Low revenue + High growth',
      recommendation: 'Evaluate carefully: High potential but uncertain. Test marketing strategies.',
    },
    dogs: {
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      title: 'Dogs 🐕',
      description: 'Low revenue + Low growth',
      recommendation: 'Consider discontinuing: Low performance. Evaluate if worth keeping in inventory.',
    },
  };

  const activeConfig = quadrantConfig[activeQuadrant];
  const activeData = matrix[activeQuadrant] || { count: 0, products: [] };
  const Icon = activeConfig.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Performance Matrix</h1>
        <p className="text-gray-600 mt-1">BCG Matrix analysis for strategic product management</p>
      </div>

      {/* 2x2 Matrix Grid */}
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(quadrantConfig).map(([key, config]) => {
          const QuadrantIcon = config.icon;
          const isActive = key === activeQuadrant;
          const data = matrix[key] || { count: 0, products: [] };
          return (
            <button
              key={key}
              onClick={() => setActiveQuadrant(key)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? `${config.borderColor} bg-white shadow-lg`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${config.bgColor} rounded-lg`}>
                  <QuadrantIcon className={`w-6 h-6 ${config.textColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor}`}>
                      {data.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Quadrant Details */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 ${activeConfig.bgColor} rounded-lg`}>
            <Icon className={`w-6 h-6 ${activeConfig.textColor}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{activeConfig.title}</h2>
            <p className="text-sm text-gray-600">{activeConfig.description}</p>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`p-4 ${activeConfig.bgColor} border-2 ${activeConfig.borderColor} rounded-lg mb-6`}>
          <h3 className={`font-semibold ${activeConfig.textColor} mb-2`}>📋 Strategy Recommendation</h3>
          <p className={`text-sm ${activeConfig.textColor}`}>{activeConfig.recommendation}</p>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue (30d)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Growth Rate</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeData.products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No products in this quadrant
                  </td>
                </tr>
              ) : (
                activeData.products.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product.title}</div>
                      {product.handle && (
                        <div className="text-sm text-gray-500">{product.handle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatCurrency(product.recentRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        product.growthRate > 0 ? 'text-green-600' : 
                        product.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {product.growthRate > 0 ? '+' : ''}{product.growthRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {product.unitsSold}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info Card */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">📊 About the BCG Matrix</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            The BCG (Boston Consulting Group) Matrix is a strategic framework for product portfolio analysis. 
            Products are classified based on two dimensions:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Revenue:</strong> Compared to median product revenue</li>
            <li><strong>Growth:</strong> 30-day vs 60-day sales comparison (10% threshold)</li>
          </ul>
          <p className="mt-3">
            Use this matrix to make informed decisions about inventory investment, marketing spend, and product lifecycle management.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProductMatrix;
