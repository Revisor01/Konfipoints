// frontend/src/components/common/LoadingSpinner.js
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, size = 'large', text = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <Loader className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;