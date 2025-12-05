import React, { useEffect, useState } from 'react';
import { ChevronDown, RefreshCw, Store } from 'lucide-react';
import { useStoreContext } from '../stores/storeContext';
import { useAuthStore } from '../stores/authStore';
import { storesService } from '../services/storesService';

const Navbar = () => {
  const { selectedStore, stores, setSelectedStore, setStores } = useStoreContext();
  const { user } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await storesService.getStores();
      const storesList = response.data || [];
      setStores(storesList);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const handleStoreChange = (store) => {
    setSelectedStore(store);
    setIsDropdownOpen(false);
  };

  const handleSync = async () => {
    if (!selectedStore || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await storesService.syncStore(selectedStore.id);
      alert('Sync started successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {window.location.pathname.split('/').pop() || 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Store Selector */}
        {stores.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Store className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {selectedStore?.name || 'Select Store'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-2">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => handleStoreChange(store)}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                          selectedStore?.id === store.id
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {store.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sync Button */}
        {selectedStore && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </span>
          </button>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">Organization Admin</p>
          </div>
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
