import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-white',
          textColor: 'text-green-600',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: 'bg-white',
          textColor: 'text-red-600',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'info':
        return {
          bgColor: 'bg-white',
          textColor: 'text-blue-600',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: 'bg-white',
          textColor: 'text-yellow-600',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      default:
        return {
          bgColor: 'bg-white',
          textColor: 'text-gray-600',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const { bgColor, textColor, iconColor, borderColor, icon } = getToastStyles(type);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${bgColor} ${borderColor} border ${textColor} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}>
        <div className={iconColor}>
          {icon}
        </div>
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className={`${iconColor} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
