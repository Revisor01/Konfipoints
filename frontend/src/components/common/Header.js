// frontend/src/components/common/Header.js
import React from 'react';
import { Award, LogOut, RefreshCw } from 'lucide-react';
import { logout } from '../../services/auth';
import { useApp } from '../../contexts/AppContext';

const Header = ({ title, subtitle, onRefresh, loading }) => {
  const { user, setUser } = useApp();

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <header className="bg-white shadow-sm border-b safe-area-top">
      <div className="px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;