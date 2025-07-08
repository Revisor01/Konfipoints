// frontend/src/components/admin/MoreView.js
import React, { useState } from 'react';
import { ChevronRight, Clock, Calendar, User, Settings as SettingsIcon } from 'lucide-react';
import RequestsView from './more/RequestsView';
import JahrgaengeView from './more/JahrgaengeView';
import AdminsView from './more/AdminsView';
import SettingsView from './more/SettingsView';

const MoreView = ({ settings, jahrgaenge, requests, konfis, onUpdate, notifications }) => {
  const [selectedView, setSelectedView] = useState(null);

  const menuItems = [
    { 
      id: 'requests', 
      label: 'Anträge', 
      icon: Clock,
      description: 'Aktivitätsanträge prüfen',
      notification: notifications?.requests || 0
    },
    { 
      id: 'jahrgaenge', 
      label: 'Jahrgänge', 
      icon: Calendar,
      description: 'Jahrgänge verwalten'
    },
    { 
      id: 'admins', 
      label: 'Administratoren', 
      icon: User,
      description: 'Admin-Accounts verwalten'
    },
    { 
      id: 'settings', 
      label: 'Einstellungen', 
      icon: SettingsIcon,
      description: 'System-Einstellungen'
    }
  ];

  const renderSubView = () => {
    switch (selectedView) {
      case 'requests':
        return <RequestsView requests={requests} onUpdate={onUpdate} onBack={() => setSelectedView(null)} />;
      case 'jahrgaenge':
        return <JahrgaengeView jahrgaenge={jahrgaenge} konfis={konfis} onUpdate={onUpdate} onBack={() => setSelectedView(null)} />;
      case 'admins':
        return <AdminsView onUpdate={onUpdate} onBack={() => setSelectedView(null)} />;
      case 'settings':
        return <SettingsView settings={settings} onUpdate={onUpdate} onBack={() => setSelectedView(null)} />;
      default:
        return null;
    }
  };

  if (selectedView) {
    return renderSubView();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Weitere Funktionen</h2>
        <p className="text-sm text-gray-600">Verwaltung und Einstellungen</p>
      </div>

      <div className="space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id)}
              className="w-full bg-white rounded-lg p-4 shadow-sm active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium flex items-center gap-2">
                      {item.label}
                      {item.notification > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.notification}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoreView;