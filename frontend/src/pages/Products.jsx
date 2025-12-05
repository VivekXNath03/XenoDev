import React, { useState, useEffect } from 'react';
import { useStoreContext } from '../stores/storeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { Package, Search, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const Products = () => {
  const { selectedStore } = useStoreContext();
  const selectedStoreId = selectedStore?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [view, setView] = useState('table'); // 'table' | 'grid'

  const fetchProducts = async () => {
    if (!selectedStoreId) {
      setError('Please select a store');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch products directly from the database via a custom endpoint
      const response = await api.get(`/products?storeId=${selectedStoreId}`);
      setProducts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch products');
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedStoreId]);

  const normalized = Array.isArray(products) ? products : [];
  const filtered = normalized
    .filter(p => {
      const matchesQuery = query.trim().length === 0 || (p.title || '').toLowerCase().includes(query.toLowerCase()) || (p.handle || '').toLowerCase().includes(query.toLowerCase()) || (p.sku || '').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (p.status || '').toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price') {
        return (b.price || 0) - (a.price || 0);
      }
      return (a.title || '').localeCompare(b.title || '');
    });

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
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Store Selected</h2>
          <p className="text-gray-500">Please select a store from the dropdown to view products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-1">Manage and analyze your product catalog</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, handle or SKU"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="title">Sort: Title</option>
              <option value="price">Sort: Price</option>
            </select>
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView('table')}
                className={`px-3 py-2 text-sm ${view==='table' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
              >Table</button>
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-2 text-sm ${view==='grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
              >Grid</button>
            </div>
          </div>
        </div>
      </div>

      {/* Products View */}
      {view === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
            <div className="text-sm text-gray-600">Showing {filtered.length} of {normalized.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handle</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No products match your filters</td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.handle || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{product.price ? formatCurrency(product.price) : '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (product.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                          (product.status || '').toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          (product.status || '').toLowerCase() === 'archived' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">No products match your filters</div>
              </div>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-600">SKU: {p.sku || '—'}</div>
                        <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                        {p.handle && <div className="text-sm text-gray-500">/{p.handle}</div>}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (p.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                        (p.status || '').toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        (p.status || '').toLowerCase() === 'archived' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="text-base font-semibold text-gray-900">{p.price ? formatCurrency(p.price) : '—'}</div>
                      </div>
                      <button className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">View details</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
