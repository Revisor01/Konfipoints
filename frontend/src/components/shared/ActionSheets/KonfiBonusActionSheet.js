import React from 'react';
import { Eye, X, Edit, Gift, BarChart3, MessageSquare } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const KonfiBonusActionSheet = ({ 
  isOpen, 
  onClose, 
  bonusPoints, 
  konfi,
  onViewDetails, 
  onRemoveBonus,
  onEditBonus,
  onViewHistory,
  onAddComment,
  userRole = 'admin',
  isLoading = false 
}) => {
  if (!bonusPoints || !konfi) return null;

  const actions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(bonusPoints, konfi);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    }
  ];

  if (userRole === 'admin') {
    actions.push(
      {
        id: 'history',
        label: 'Bonus-Historie anzeigen',
        icon: BarChart3,
        onClick: () => {
          onViewHistory?.(konfi);
          onClose();
        },
        className: 'text-purple-600 hover:bg-purple-50'
      },
      {
        id: 'comment',
        label: 'Kommentar hinzufügen',
        icon: MessageSquare,
        onClick: () => {
          onAddComment?.(bonusPoints);
          onClose();
        },
        className: 'text-indigo-600 hover:bg-indigo-50'
      },
      {
        id: 'edit',
        label: 'Bearbeiten',
        icon: Edit,
        onClick: () => {
          onEditBonus?.(bonusPoints);
          onClose();
        },
        className: 'text-orange-600 hover:bg-orange-50'
      },
      {
        id: 'remove',
        label: 'Bonuspunkte entfernen',
        icon: X,
        onClick: () => {
          onRemoveBonus?.(bonusPoints);
          onClose();
        },
        className: 'text-red-600 hover:bg-red-50'
      }
    );
  }

  const getCategoryText = (category) => {
    const categories = {
      manual: 'Manuell vergeben',
      participation: 'Teilnahme',
      behavior: 'Verhalten',
      achievement: 'Besondere Leistung',
      help: 'Hilfsbereitschaft',
      creativity: 'Kreativität',
      other: 'Sonstiges'
    };
    return categories[category] || 'Unbekannt';
  };

  const getCategoryColor = (category) => {
    const colors = {
      manual: 'bg-gray-100 text-gray-800',
      participation: 'bg-blue-100 text-blue-800',
      behavior: 'bg-green-100 text-green-800',
      achievement: 'bg-yellow-100 text-yellow-800',
      help: 'bg-purple-100 text-purple-800',
      creativity: 'bg-pink-100 text-pink-800',
      other: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-lg text-gray-900">
                  Bonuspunkte
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                für {konfi.name}
              </p>
              <p className="text-sm text-gray-800">
                {bonusPoints.reason}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                +{bonusPoints.points}
              </div>
              <div className="text-xs text-gray-500">
                Punkte
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Kategorie:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bonusPoints.category)}`}>
                {getCategoryText(bonusPoints.category)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Vergeben am:</span>
              <span className="font-medium">
                {new Date(bonusPoints.created_at).toLocaleDateString('de-DE')}
              </span>
            </div>
            
            {bonusPoints.admin && (
              <div className="flex justify-between">
                <span className="text-gray-600">Vergeben von:</span>
                <span className="font-medium">
                  {bonusPoints.admin.name}
                </span>
              </div>
            )}
          </div>

          {bonusPoints.admin_comment && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Admin-Kommentar:</strong> {bonusPoints.admin_comment}
              </p>
            </div>
          )}
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

export default KonfiBonusActionSheet;