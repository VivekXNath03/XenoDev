import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Store, 
  Settings, 
  LogOut,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Bell,
  Target,
  Grid3x3
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    {
      icon: BarChart3,
      label: 'Analytics',
      subItems: [
        { icon: TrendingUp, label: 'Business Insights', path: '/insights/business' },
        { icon: Users, label: 'Customer Segments', path: '/insights/segments' },
        { icon: Target, label: 'Revenue Forecast', path: '/insights/forecast' },
        { icon: Bell, label: 'Business Alerts', path: '/insights/alerts' },
        { icon: Grid3x3, label: 'Product Matrix', path: '/insights/product-matrix' },
      ],
    },
    {
      icon: Package,
      label: 'Data',
      subItems: [
        { icon: ShoppingCart, label: 'Orders', path: '/insights/orders' },
        { icon: Package, label: 'Products', path: '/insights/products' },
        { icon: Users, label: 'Customers', path: '/insights/customers' },
      ],
    },
    { icon: Store, label: 'Stores', path: '/stores' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path) => {
    if (path) navigate(path);
  };

  const NavItem = ({ item, isSubItem = false }) => {
    const Icon = item.icon;
    const isActive = window.location.pathname === item.path;
    
    return (
      <div>
        <button
          onClick={() => handleNavigation(item.path)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isSubItem ? 'pl-12' : ''
          } ${
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{item.label}</span>
        </button>
        {item.subItems && (
          <div className="mt-1">
            {item.subItems.map((subItem, idx) => (
              <NavItem key={idx} item={subItem} isSubItem />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Xeno</h1>
        <p className="text-sm text-gray-600 mt-1">Analytics Platform</p>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => (
          <NavItem key={idx} item={item} />
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
