import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      // Progress bar animation
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
      }, 10);

      // Auto close timer
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for exit animation
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, onClose, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible && !isExiting) return null;

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

  const getProgressBarColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={`
        ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
        w-full max-w-sm
      `}
      style={{
        animation: isExiting 
          ? 'toastExit 0.3s ease-in-out forwards' 
          : 'toastEnter 0.3s ease-in-out forwards'
      }}
    >
      <div className={`${bgColor} ${borderColor} border ${textColor} rounded-lg shadow-xl overflow-hidden backdrop-blur-sm`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className={`${iconColor} flex-shrink-0`}>
            {icon}
          </div>
          <span className="flex-1 text-sm font-medium leading-snug">{message}</span>
          <button
            onClick={handleClose}
            className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full ${getProgressBarColor(type)} transition-all ease-linear`}
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.01s linear'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
