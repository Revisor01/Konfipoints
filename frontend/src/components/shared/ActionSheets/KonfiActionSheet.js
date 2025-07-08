import React from 'react';
import { User, Edit, Gift, Trophy, BarChart3, Trash2, Key } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const KonfiActionSheet = ({ 
  isOpen, 
  onClose, 
  konfi, 
  onViewProfile, 
  onEdit, 
  onDelete, 
  onGiveBonusPoints, 
  onViewBadges, 
  onViewStatistics,
  onResetPassword,
  userRole = 'admin',
  isLoading = false 
}) => {
  if (!konfi) return null;

  const actions = [
    {
      id: 'profile',
      label: 'Profil anzeigen',
      icon: User,
      onClick: () => {
        onViewProfile?.(konfi);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'statistics',
      label: 'Statistiken anzeigen',
      icon: BarChart3,
      onClick: () => {
        onViewStatistics?.(konfi);
        onClose();
      },
      className: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'badges',
      label: 'Badges anzeigen',
      icon: Trophy,
      onClick: () => {
        onViewBadges?.(konfi);
        onClose();
      },
      className: 'text-yellow-600 hover:bg-yellow-50'
    }
  ];

  if (userRole === 'admin') {
    actions.push(
      {
        id: 'bonus',
        label: 'Bonuspunkte vergeben',
        icon: Gift,
        onClick: () => {
          onGiveBonusPoints?.(konfi);
          onClose();
        },
        className: 'text-green-600 hover:bg-green-50'
      },
      {
        id: 'edit',
        label: 'Bearbeiten',
        icon: Edit,
        onClick: () => {
          onEdit?.(konfi);
          onClose();
        },
        className: 'text-orange-600 hover:bg-orange-50'
      },
      {
        id: 'reset-password',
        label: 'Passwort zurücksetzen',
        icon: Key,
        onClick: () => {
          onResetPassword?.(konfi);
          onClose();
        },
        className: 'text-indigo-600 hover:bg-indigo-50'
      },
      {
        id: 'delete',
        label: 'Löschen',
        icon: Trash2,
        onClick: () => {
          onDelete?.(konfi);
          onClose();
        },
        className: 'text-red-600 hover:bg-red-50'
      }
    );
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height="auto"
      className="max-h-[80vh]"
    >
      <div className="p-4 space-y-4">
        <div className="border-b pb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              {konfi.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {konfi.name}
              </h3>
              <p className="text-sm text-gray-600">
                {konfi.jahrgang?.name || 'Kein Jahrgang'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Gesamtpunkte:</span>
              <div className="font-semibold text-blue-600">
                {konfi.total_points || 0}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Aktivitäten:</span>
              <div className="font-semibold">
                {konfi.activities_count || 0}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Badges:</span>
              <div className="font-semibold text-yellow-600">
                {konfi.badges_count || 0}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Rang:</span>
              <div className="font-semibold">
                #{konfi.rank || '?'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={isLoading}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.className}`}
            >
              <action.icon size={20} />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full p-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default KonfiActionSheet;