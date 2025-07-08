import React from 'react';
import { Edit, Trash2, Users, Eye, BarChart3, Calendar } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const JahrgangActionSheet = ({ 
  isOpen, 
  onClose, 
  jahrgang, 
  onEdit, 
  onDelete, 
  onViewKonfis, 
  onViewStatistics,
  onViewDetails,
  onSetActive,
  userRole = 'admin',
  isLoading = false 
}) => {
  if (!jahrgang) return null;

  const actions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(jahrgang);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'konfis',
      label: 'Konfis anzeigen',
      icon: Users,
      onClick: () => {
        onViewKonfis?.(jahrgang);
        onClose();
      },
      className: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'statistics',
      label: 'Statistiken anzeigen',
      icon: BarChart3,
      onClick: () => {
        onViewStatistics?.(jahrgang);
        onClose();
      },
      className: 'text-green-600 hover:bg-green-50'
    }
  ];

  if (userRole === 'admin') {
    if (!jahrgang.is_active) {
      actions.push({
        id: 'activate',
        label: 'Als aktiv setzen',
        icon: Calendar,
        onClick: () => {
          onSetActive?.(jahrgang);
          onClose();
        },
        className: 'text-indigo-600 hover:bg-indigo-50'
      });
    }

    actions.push(
      {
        id: 'edit',
        label: 'Bearbeiten',
        icon: Edit,
        onClick: () => {
          onEdit?.(jahrgang);
          onClose();
        },
        className: 'text-orange-600 hover:bg-orange-50'
      },
      {
        id: 'delete',
        label: 'Löschen',
        icon: Trash2,
        onClick: () => {
          onDelete?.(jahrgang);
          onClose();
        },
        className: 'text-red-600 hover:bg-red-50',
        disabled: jahrgang.is_active || (jahrgang.konfis_count && jahrgang.konfis_count > 0)
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
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                Jahrgang {jahrgang.name}
              </h3>
              <p className="text-sm text-gray-600">
                {jahrgang.description || 'Kein Beschreibung'}
              </p>
            </div>
            {jahrgang.is_active && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                Aktiv
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Konfis:</span>
              <div className="font-semibold text-blue-600">
                {jahrgang.konfis_count || 0}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Ø Punkte:</span>
              <div className="font-semibold">
                {jahrgang.average_points || 0}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Gesamt:</span>
              <div className="font-semibold text-green-600">
                {jahrgang.total_points || 0}
              </div>
            </div>
          </div>

          {jahrgang.created_at && (
            <p className="text-xs text-gray-500 mt-2">
              Erstellt: {new Date(jahrgang.created_at).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={isLoading || action.disabled}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.className}`}
            >
              <action.icon size={20} />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {jahrgang.is_active && jahrgang.konfis_count > 0 && userRole === 'admin' && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 text-center">
              Aktive Jahrgänge mit Konfis können nicht gelöscht werden
            </p>
          </div>
        )}

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

export default JahrgangActionSheet;