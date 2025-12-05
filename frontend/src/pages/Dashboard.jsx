import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../stores/storeContext';
import { getSummary, getOrdersByDate } from '../services/metricsService';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import RevenueLineChart from '../charts/RevenueLineChart';
import DateRangePicker from '../components/DateRangePicker';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import { TrendingUp, ShoppingCart, Package, Users, Bell, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedStore } = useStoreContext();
  const selectedStoreId = selectedStore?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const fetchData = async () => {
    if (!selectedStoreId) {
      setError('Please select a store');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch summary metrics
      const summaryResponse = await getSummary(
        selectedStoreId, 
        dateRange.startDate, 
        dateRange.endDate
      );
      setSummary(summaryResponse.data);

      // Fetch orders by date for chart
      const ordersResponse = await getOrdersByDate(
        selectedStoreId, 
        dateRange.startDate, 
        dateRange.endDate
      );
      setOrdersData(ordersResponse.data);

      // Fetch business alerts
      try {
        const alertsResponse = await api.get(`/analytics/business-alerts?storeId=${selectedStoreId}`);
        setAlerts(alertsResponse.data.data.alerts.slice(0, 3)); // Top 3 alerts
      } catch (alertErr) {
        console.error('Failed to fetch alerts:', alertErr);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStoreId, dateRange]);

  const handleDateChange = (newRange) => {
    setDateRange(newRange);
  };

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

  if (!selectedStoreId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Store Selected</h2>
          <p className="text-gray-500">Please select a store from the dropdown to view dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your store performance</p>
        </div>
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(summary?.totalRevenue || 0)}
          icon={TrendingUp}
          trend={summary?.revenueTrend}
          color="blue"
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(summary?.totalOrders || 0)}
          icon={ShoppingCart}
          trend={summary?.ordersTrend}
          color="green"
        />
        <MetricCard
          title="Total Products"
          value={formatNumber(summary?.totalProducts || 0)}
          icon={Package}
          trend={summary?.productsTrend}
          color="purple"
        />
        <MetricCard
          title="Total Customers"
          value={formatNumber(summary?.totalCustomers || 0)}
          icon={Users}
          trend={summary?.customersTrend}
          color="orange"
        />
      </div>

      {/* Revenue Chart */}
      <ChartCard
        title="Revenue & Orders Over Time"
        action={
          <span className="text-sm text-gray-500">
            Last {Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24))} days
          </span>
        }
      >
        <RevenueLineChart data={ordersData} />
      </ChartCard>

      {/* Quick Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Order Value</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.avgOrderValue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Orders Per Customer</h3>
          <p className="text-2xl font-bold text-gray-900">
            {(summary?.ordersPerCustomer || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue Per Customer</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.revenuePerCustomer || 0)}
          </p>
        </div>
      </div>

      {/* Business Alerts Preview */}
      {alerts.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
            </div>
            <button
              onClick={() => navigate('/insights/alerts')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  alert.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    alert.type === 'critical' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'success' ? 'text-green-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
