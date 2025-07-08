import React from 'react';
import { Check, X, Eye, MessageSquare } from 'lucide-react';
import BottomSheet from '../BottomSheet';

const RequestActionSheet = ({ 
  isOpen, 
  onClose, 
  request, 
  onApprove, 
  onReject, 
  onViewDetails, 
  onAddComment,
  isLoading = false 
}) => {
  if (!request) return null;

  const actions = [
    {
      id: 'view',
      label: 'Details anzeigen',
      icon: Eye,
      onClick: () => {
        onViewDetails?.(request);
        onClose();
      },
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'approve',
      label: 'Genehmigen',
      icon: Check,
      onClick: () => {
        onApprove?.(request);
        onClose();
      },
      className: 'text-green-600 hover:bg-green-50',
      disabled: request.status !== 'pending'
    },
    {
      id: 'reject',
      label: 'Ablehnen',
      icon: X,
      onClick: () => {
        onReject?.(request);
        onClose();
      },
      className: 'text-red-600 hover:bg-red-50',
      disabled: request.status !== 'pending'
    },
    {
      id: 'comment',
      label: 'Kommentar hinzufügen',
      icon: MessageSquare,
      onClick: () => {
        onAddComment?.(request);
        onClose();
      },
      className: 'text-gray-600 hover:bg-gray-50'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      default: return 'Ausstehend';
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
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {request.activity?.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {getStatusText(request.status)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            von {request.konfi?.name}
          </p>
          
          <p className="text-sm text-gray-800">
            {request.description}
          </p>
          
          {request.points_requested && (
            <p className="text-sm text-blue-600 mt-2">
              Punkte beantragt: {request.points_requested}
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

export default RequestActionSheet;