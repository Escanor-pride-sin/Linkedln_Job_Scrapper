import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration
}) => {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
      default:
        return <Info size={20} className="text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      className={`
        flex items-center p-4 rounded-lg border shadow-lg
        min-w-[300px] max-w-md
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
        ${getBackgroundColor()}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start flex-1">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {message}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className={`
          ml-4 flex-shrink-0 p-1 rounded-full
          hover:bg-gray-200/50 transition-colors
          ${getTextColor()} opacity-60 hover:opacity-100
        `}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};