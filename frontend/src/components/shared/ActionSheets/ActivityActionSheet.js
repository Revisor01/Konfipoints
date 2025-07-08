import React from 'react';
import { Edit, Trash2, Users, Eye, Plus } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const ActivityActionSheet = ({ 
  isOpen, 
  onClose, 
  activity, 
  onEdit, 
  onDelete, 
  onAssignToKonfi, 
  onViewParticipants, 
  onViewDetails,
  userRole = 'admin',
  isLoading = false 
}) => {
  if (!activity) return null;

  const adminActions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(activity);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'assign',
      label: 'Konfi zuweisen',
      icon: Plus,
      onClick: () => {
        onAssignToKonfi?.(activity);
        onClose();
      },
      className: 'text-green-600 hover:bg-green-50'
    },
    {
      id: 'participants',
      label: 'Teilnehmer anzeigen',
      icon: Users,
      onClick: () => {
        onViewParticipants?.(activity);
        onClose();
      },
      className: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'edit',
      label: 'Bearbeiten',
      icon: Edit,
      onClick: () => {
        onEdit?.(activity);
        onClose();
      },
      className: 'text-orange-600 hover:bg-orange-50'
    },
    {
      id: 'delete',
      label: 'Löschen',
      icon: Trash2,
      onClick: () => {
        onDelete?.(activity);
        onClose();
      },
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  const konfiActions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(activity);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    }
  ];

  const actions = userRole === 'admin' ? adminActions : konfiActions;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height="auto"
      className="max-h-[80vh]"
    >
      <div className="p-4 space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {activity.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {activity.points} Punkte
          </p>
          <p className="text-sm text-gray-800">
            {activity.description}
          </p>
          {activity.category && (
            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {activity.category}
            </span>
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

export default ActivityActionSheet;