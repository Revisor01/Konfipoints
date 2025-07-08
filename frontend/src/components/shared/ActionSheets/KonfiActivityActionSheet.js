import React from 'react';
import { Eye, X, Edit, Check, BarChart3 } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const KonfiActivityActionSheet = ({ 
  isOpen, 
  onClose, 
  activity, 
  konfi,
  assignment, // The activity assignment record
  onViewDetails, 
  onRemoveActivity,
  onEditPoints,
  onViewStatistics,
  userRole = 'admin',
  isLoading = false 
}) => {
  if (!activity || !konfi) return null;

  const actions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(activity, konfi);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    }
  ];

  if (userRole === 'admin') {
    actions.push(
      {
        id: 'statistics',
        label: 'Aktivitäts-Statistiken',
        icon: BarChart3,
        onClick: () => {
          onViewStatistics?.(activity, konfi);
          onClose();
        },
        className: 'text-purple-600 hover:bg-purple-50'
      },
      {
        id: 'edit-points',
        label: 'Punkte bearbeiten',
        icon: Edit,
        onClick: () => {
          onEditPoints?.(assignment);
          onClose();
        },
        className: 'text-orange-600 hover:bg-orange-50'
      },
      {
        id: 'remove',
        label: 'Aktivität entfernen',
        icon: X,
        onClick: () => {
          onRemoveActivity?.(assignment);
          onClose();
        },
        className: 'text-red-600 hover:bg-red-50'
      }
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Abgeschlossen';
      case 'in_progress': return 'In Bearbeitung';
      default: return 'Offen';
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
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {activity.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                für {konfi.name}
              </p>
              <p className="text-sm text-gray-800">
                {activity.description}
              </p>
            </div>
            
            {assignment?.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                {getStatusText(assignment.status)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Standard-Punkte:</span>
              <div className="font-semibold text-blue-600">
                {activity.points}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Erhaltene Punkte:</span>
              <div className="font-semibold text-green-600">
                {assignment?.points || activity.points}
              </div>
            </div>
          </div>

          {assignment?.completed_at && (
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Abgeschlossen:</span>
              <div className="font-medium">
                {new Date(assignment.completed_at).toLocaleDateString('de-DE')}
              </div>
            </div>
          )}

          {assignment?.note && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Notiz:</strong> {assignment.note}
              </p>
            </div>
          )}

          {activity.category && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {activity.category}
              </span>
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

export default KonfiActivityActionSheet;