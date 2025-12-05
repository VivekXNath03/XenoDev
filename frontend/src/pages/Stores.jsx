import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Card from '../components/Card';
import { Building2, Globe, Clock, RefreshCw } from 'lucide-react';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/stores');
      setStores(res.data?.data || []);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load stores';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const refreshStore = async (storeId) => {
    try {
      setRefreshing(true);
      await api.post(`/ingestion/stores/${storeId}/sync`);
      await fetchStores();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to trigger sync';
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600 mt-1">Manage your connected Shopify stores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-12 text-gray-600">No stores found</div>
            </Card>
          </div>
        ) : (
          stores.map((store) => (
            <Card key={store.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{store.shopDomain}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Last synced: {store.lastSyncedAt ? new Date(store.lastSyncedAt).toLocaleString() : '—'}</span>
                  </div>
                </div>
                <button
                  disabled={refreshing}
                  onClick={() => refreshStore(store.id)}
                  className={`px-3 py-2 text-sm rounded-lg border ${refreshing ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Sync
                  </span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Stores;
