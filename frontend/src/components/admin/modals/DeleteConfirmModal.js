import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import UniversalModal from '../../shared/UniversalModal';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Löschen bestätigen',
  message = 'Möchtest du dieses Element wirklich löschen?',
  itemName = '',
  itemType = '',
  consequences = [],
  confirmText = 'LÖSCHEN',
  requireConfirmText = false,
  loading = false 
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [understood, setUnderstood] = useState(false);

  const canConfirm = () => {
    if (requireConfirmText && confirmInput !== confirmText) {
      return false;
    }
    if (consequences.length > 0 && !understood) {
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (canConfirm()) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmInput('');
    setUnderstood(false);
    onClose();
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {itemType && itemName ? `${itemType} "${itemName}" löschen?` : message}
            </h3>
            
            <p className="text-gray-600 mb-4">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            {consequences.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">
                  Auswirkungen des Löschens:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {consequences.map((consequence, index) => (
                    <li key={index}>{consequence}</li>
                  ))}
                </ul>
                
                <label className="flex items-start space-x-2 mt-3">
                  <input
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="mt-1 rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-red-700">
                    Ich verstehe die Auswirkungen und möchte trotzdem fortfahren
                  </span>
                </label>
              </div>
            )}

            {requireConfirmText && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Gib <code className="bg-gray-100 px-1 rounded font-mono">{confirmText}</code> ein, um zu bestätigen:
                </p>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={confirmText}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <X size={16} className="inline mr-1" />
            Abbrechen
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !canConfirm()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline mr-2"></div>
            ) : (
              <Trash2 size={16} className="inline mr-1" />
            )}
            Endgültig löschen
          </button>
        </div>
      </div>
    </UniversalModal>
  );
};

export default DeleteConfirmModal;