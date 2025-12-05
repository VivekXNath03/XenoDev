import React, { useState, useEffect } from 'react';
import { useStoreContext } from '../stores/storeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import { AlertTriangle, CheckCircle, Info, AlertCircle, Bell } from 'lucide-react';

const BusinessAlerts = () => {
  const { selectedStore } = useStoreContext();
  const selectedStoreId = selectedStore?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertsData, setAlertsData] = useState(null);

  const fetchAlerts = async () => {
    if (!selectedStoreId) {
      setError('Please select a store');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/analytics/business-alerts?storeId=${selectedStoreId}`);
      const fallback = { alertCount: 0, criticalCount: 0, alerts: [] };
      const data = response?.data?.data || fallback;
      // Normalize shape
      const safeData = {
        alertCount: typeof data.alertCount === 'number' ? data.alertCount : 0,
        criticalCount: typeof data.criticalCount === 'number' ? data.criticalCount : 0,
        alerts: Array.isArray(data.alerts) ? data.alerts : [],
      };
      setAlertsData(safeData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch business alerts');
      console.error('Alerts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
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

  if (!selectedStoreId || !alertsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Store Selected</h2>
          <p className="text-gray-500">Please select a store to view business alerts</p>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-6 h-6" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'success':
        return <CheckCircle className="w-6 h-6" />;
      case 'info':
        return <Info className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          icon: 'text-red-600',
          title: 'text-red-900',
          text: 'text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          text: 'text-yellow-800',
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          icon: 'text-green-600',
          title: 'text-green-900',
          text: 'text-green-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          text: 'text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          icon: 'text-gray-600',
          title: 'text-gray-900',
          text: 'text-gray-800',
        };
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      revenue: { label: 'Revenue', color: 'bg-green-100 text-green-800' },
      product: { label: 'Product', color: 'bg-purple-100 text-purple-800' },
      customer: { label: 'Customer', color: 'bg-blue-100 text-blue-800' },
      inventory: { label: 'Inventory', color: 'bg-orange-100 text-orange-800' },
    };
    const badge = badges[category] || { label: category, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Alerts</h1>
          <p className="text-gray-600 mt-1">Proactive insights and actionable recommendations</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Refresh Alerts
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Alerts</div>
              <div className="text-2xl font-bold text-gray-900">{alertsData.alertCount}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
              <div className="text-2xl font-bold text-red-600">{alertsData.criticalCount}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-lg font-semibold text-gray-900">
                {alertsData.criticalCount === 0 ? 'Healthy' : 'Needs Attention'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {(!alertsData || !Array.isArray(alertsData.alerts) || alertsData.alerts.length === 0) ? (
          <Card>
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No alerts at this time. Your business metrics look healthy.</p>
            </div>
          </Card>
        ) : (
          alertsData.alerts.map((alert, index) => {
            const styles = getAlertStyles(alert.type);
            return (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${styles.bg} ${styles.border}`}
              >
                <div className="flex items-start gap-4">
                  <div className={styles.icon}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-lg font-semibold ${styles.title}`}>
                        {alert.title}
                      </h3>
                      {getCategoryBadge(alert.category)}
                    </div>
                    <p className={`${styles.text} mb-3`}>{alert.message}</p>
                    <div className={`p-3 bg-white rounded-lg border ${styles.border}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">💡 Recommended Action:</span>
                      </div>
                      <p className="text-sm text-gray-700">{alert.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <Card>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">How Business Alerts Work</p>
            <p>
              Our AI system continuously monitors your business metrics and compares them against historical patterns. 
              When significant changes are detected, we generate actionable alerts with specific recommendations to help 
              you respond quickly and make data-driven decisions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusinessAlerts;
