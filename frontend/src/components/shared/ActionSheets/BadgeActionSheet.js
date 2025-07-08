import React from 'react';
import { Edit, Trash2, Users, Eye, Award } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const BadgeActionSheet = ({ 
  isOpen, 
  onClose, 
  badge, 
  onEdit, 
  onDelete, 
  onViewRecipients, 
  onViewDetails,
  onAwardToBatch,
  userRole = 'admin',
  isLoading = false 
}) => {
  if (!badge) return null;

  const actions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(badge);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'recipients',
      label: 'Empfänger anzeigen',
      icon: Users,
      onClick: () => {
        onViewRecipients?.(badge);
        onClose();
      },
      className: 'text-purple-600 hover:bg-purple-50'
    }
  ];

  if (userRole === 'admin') {
    actions.push(
      {
        id: 'award',
        label: 'Mehreren Konfis vergeben',
        icon: Award,
        onClick: () => {
          onAwardToBatch?.(badge);
          onClose();
        },
        className: 'text-green-600 hover:bg-green-50'
      },
      {
        id: 'edit',
        label: 'Bearbeiten',
        icon: Edit,
        onClick: () => {
          onEdit?.(badge);
          onClose();
        },
        className: 'text-orange-600 hover:bg-orange-50'
      },
      {
        id: 'delete',
        label: 'Löschen',
        icon: Trash2,
        onClick: () => {
          onDelete?.(badge);
          onClose();
        },
        className: 'text-red-600 hover:bg-red-50'
      }
    );
  }

  const getCriteriaText = (type, value) => {
    switch (type) {
      case 'total_points':
        return `${value} Gesamtpunkte`;
      case 'activities_count':
        return `${value} Aktivitäten`;
      case 'specific_activity':
        return `Spezifische Aktivität`;
      case 'streak':
        return `${value} Wochen Streak`;
      case 'konfi_days':
        return `${value} Konfi-Tage`;
      case 'bonus':
        return `Bonus Badge`;
      case 'seasonal':
        return `Saison Badge`;
      default:
        return `Kriterium: ${value}`;
    }
  };

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
            <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl">
              {badge.icon || '🏆'}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600">
                {getCriteriaText(badge.criteria_type, badge.criteria_value)}
              </p>
            </div>
          </div>
          
          {badge.description && (
            <p className="text-sm text-gray-800 mb-3">
              {badge.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Typ:</span>
              <div className="font-medium">
                {badge.criteria_type?.replace(/_/g, ' ') || 'Unbekannt'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Empfänger:</span>
              <div className="font-medium text-yellow-600">
                {badge.recipients_count || 0}
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

export default BadgeActionSheet;