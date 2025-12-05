import React, { useState, useEffect } from 'react';
import { useStoreContext } from '../stores/storeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import { Users, Award, TrendingUp, AlertCircle, ShoppingBag, Crown } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

const CustomerSegments = () => {
  const { selectedStore } = useStoreContext();
  const selectedStoreId = selectedStore?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segments, setSegments] = useState(null);
  const [activeSegment, setActiveSegment] = useState('vip');

  const fetchSegments = async () => {
    if (!selectedStoreId) {
      setError('Please select a store');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/analytics/customer-segments?storeId=${selectedStoreId}`);
      setSegments(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch customer segments');
      console.error('Segments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
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

  if (!selectedStoreId || !segments) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Store Selected</h2>
          <p className="text-gray-500">Please select a store to view customer segments</p>
        </div>
      </div>
    );
  }

  const segmentConfig = {
    vip: {
      icon: Crown,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      title: 'VIP Customers',
      description: 'Top 20% revenue contributors',
    },
    frequent: {
      icon: Award,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      title: 'Frequent Buyers',
      description: '5+ orders placed',
    },
    new: {
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      title: 'New Customers',
      description: 'First order within 30 days',
    },
    atRisk: {
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      title: 'At-Risk Customers',
      description: 'No order in 90+ days',
    },
    oneTime: {
      icon: ShoppingBag,
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300',
      title: 'One-Time Buyers',
      description: 'Only 1 order placed',
    },
  };

  const activeConfig = segmentConfig[activeSegment];
  const activeData = segments[activeSegment];
  const Icon = activeConfig.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Segments</h1>
        <p className="text-gray-600 mt-1">Scientific segmentation for precision marketing</p>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(segmentConfig).map(([key, config]) => {
          const SegmentIcon = config.icon;
          const isActive = key === activeSegment;
          return (
            <button
              key={key}
              onClick={() => setActiveSegment(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? `${config.borderColor} bg-white shadow-lg`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`p-3 ${config.bgColor} rounded-lg w-fit mb-3`}>
                <SegmentIcon className={`w-6 h-6 ${config.textColor}`} />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">{segments[key].count}</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{config.title}</div>
                <div className="text-xs text-gray-500 mt-1">{config.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Segment Details */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 ${activeConfig.bgColor} rounded-lg`}>
            <Icon className={`w-6 h-6 ${activeConfig.textColor}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activeConfig.title}</h2>
            <p className="text-sm text-gray-600">{activeConfig.description}</p>
          </div>
          <div className="ml-auto">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${activeConfig.bgColor} ${activeConfig.textColor}`}>
              {activeData.count} customers
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeData.customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No customers in this segment
                  </td>
                </tr>
              ) : (
                activeData.customers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{customer.orderCount}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Recommendations */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Recommended Actions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {activeSegment === 'vip' && (
              <>
                <li>• Offer exclusive perks and early access to new products</li>
                <li>• Create a VIP loyalty program with personalized rewards</li>
                <li>• Send personalized thank-you messages</li>
              </>
            )}
            {activeSegment === 'frequent' && (
              <>
                <li>• Reward loyalty with discount codes or points</li>
                <li>• Send product recommendations based on purchase history</li>
                <li>• Invite to beta test new features</li>
              </>
            )}
            {activeSegment === 'new' && (
              <>
                <li>• Send welcome series emails with product tips</li>
                <li>• Offer second purchase discount to encourage retention</li>
                <li>• Request feedback on their first experience</li>
              </>
            )}
            {activeSegment === 'atRisk' && (
              <>
                <li>• Send win-back campaign with special offers</li>
                <li>• Request feedback on why they stopped purchasing</li>
                <li>• Highlight new products since their last visit</li>
              </>
            )}
            {activeSegment === 'oneTime' && (
              <>
                <li>• Send targeted offers based on their first purchase</li>
                <li>• Highlight product bundles and complementary items</li>
                <li>• Request product review to re-engage</li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default CustomerSegments;
