import React from 'react';
import { createPortal } from 'react-dom';

const UniversalModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  submitButtonText,
  onSubmit,
  submitDisabled = false,
  loading = false,
  size = 'md', // Keep for backward compatibility but not used
  showCloseButton = true, // Keep for backward compatibility 
  closeOnOverlayClick = true, // Keep for backward compatibility
  closeOnEscape = true, // Keep for backward compatibility
  className = '', // Keep for backward compatibility
  overlayClassName = '', // Keep for backward compatibility
  contentClassName = '' // Keep for backward compatibility
}) => {
  if (!isOpen) return null;

  // Use iOS-style fullscreen modal like the original
  const modalContent = (
    <div className="fixed inset-0 bg-white z-[8888] flex flex-col safe-area-top safe-area-bottom">
      {/* iOS Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onClose}
          className="text-blue-600 font-medium text-base"
        >
          Abbrechen
        </button>
        
        <h1 className="text-lg font-semibold text-gray-900 text-center flex-1 px-4">
          {title}
        </h1>
        
        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={submitDisabled || loading}
            className={`font-medium text-base ${
              submitDisabled || loading 
                ? 'text-gray-400' 
                : 'text-blue-600'
            }`}
          >
            {loading ? 'Senden...' : (submitButtonText || 'Senden')}
          </button>
        )}
        
        {!onSubmit && <div className="w-16"></div>}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UniversalModal;