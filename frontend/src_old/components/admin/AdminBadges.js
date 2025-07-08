import React, { useState } from 'react';
import { Plus, Award, ChevronDown } from 'lucide-react';

const AdminBadges = ({
  badges,
  criteriaTypes,
  showMobileBadgeModal,
  setShowMobileBadgeModal,
  editBadge,
  setEditBadge,
  showBadgeActionSheet,
  setShowBadgeActionSheet,
  selectedActionBadge,
  setSelectedActionBadge,
  setDeleteType,
  setDeleteItem,
  setShowDeleteModal
}) => {
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [badgeSort, setBadgeSort] = useState('name');

  return (
    <div className="space-y-4 pt-10">
      <BadgeEditActionSheet
        show={showBadgeActionSheet}
        onClose={() => {
          setShowBadgeActionSheet(false);
          setSelectedActionBadge(null);
        }}
        badge={selectedActionBadge}
        onEdit={() => {
          setEditBadge(selectedActionBadge);
          setShowMobileBadgeModal(true);
        }}
        onDelete={() => {
          setDeleteType('badge');
          setDeleteItem(selectedActionBadge);
          setShowDeleteModal(true);
        }}
        criteriaTypes={criteriaTypes}
      />
      
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Badge Verwaltung</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="text-xs opacity-80">Badges</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{badges.filter(b => b.is_active).length}</div>
            <div className="text-xs opacity-80">Aktiv</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{badges.filter(b => b.is_hidden).length}</div>
            <div className="text-xs opacity-80">Geheim</div>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => {
          setEditBadge(null);
          setShowMobileBadgeModal(true);
        }}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-4 h-4" />
        Neues Badge erstellen
      </button>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:bg-white appearance-none"
            >
              <option value="all">Alle Badges</option>
              <option value="active">Nur Aktive</option>
              <option value="inactive">Nur Inaktive</option>
              <option value="hidden">Nur Geheime</option>
              <option value="visible">Nur Sichtbare</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={badgeSort}
              onChange={(e) => setBadgeSort(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:bg-white appearance-none"
            >
              <option value="name">Nach Name</option>
              <option value="criteria">Nach Kriterium</option>
              <option value="status">Nach Status</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {badges.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Badges vorhanden</p>
          </div>
        ) : (
          badges
            .filter(badge => {
              if (badgeFilter === 'active') return badge.is_active;
              if (badgeFilter === 'inactive') return !badge.is_active;
              if (badgeFilter === 'hidden') return badge.is_hidden;
              if (badgeFilter === 'visible') return !badge.is_hidden;
              return true;
            })
            .sort((a, b) => {
              if (badgeSort === 'criteria') return a.criteria_type.localeCompare(b.criteria_type);
              if (badgeSort === 'status') return Number(b.is_active) - Number(a.is_active);
              return a.name.localeCompare(b.name);
            })
            .map(badge => (
              <div 
                key={badge.id} 
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
                onClick={() => {
                  setSelectedActionBadge(badge);
                  setShowBadgeActionSheet(true);
                }}
              >
                <div className="space-y-4">
                  {/* ERSTE ZEILE: Icon + Name + Buttons */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="text-3xl">{badge.icon}</div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 leading-tight">{badge.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed mt-1">{badge.description}</p>
                    </div>
                    
                    {/* Status-Dots rechts */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${badge.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {badge.is_hidden && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {badge.is_active ? 'Aktiv' : 'Inaktiv'}
                        {badge.is_hidden && <div className="text-purple-600">Geheim</div>}
                      </div>
                    </div>
                  </div>
                  
                  {/* ZWEITE ZEILE: Kriterium über volle Breite */}
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <p className="text-xs text-gray-700 font-medium">
                      {criteriaTypes[badge.criteria_type]?.label} ≥ {badge.criteria_value}
                    </p>
                  </div>
                  
                  {/* DRITTE ZEILE: Vergabe-Statistik über volle Breite */}
                  <div className={`text-center py-2 px-3 rounded-lg border ${
                    badge.earned_count > 0 
                      ? 'text-green-700 bg-green-50 border-green-200' 
                      : 'text-gray-600 bg-gray-50 border-gray-200'
                  }`}>
                    <span className="text-sm font-bold">{badge.earned_count}</span>
                    <span className="text-xs ml-1">mal vergeben</span>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

// Helper Component
const BadgeEditActionSheet = ({ show, onClose, badge, onEdit, onDelete, criteriaTypes }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{badge?.name}</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{badge?.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            {criteriaTypes[badge?.criteria_type]?.label} ≥ {badge?.criteria_value}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Bearbeiten
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Löschen
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBadges;