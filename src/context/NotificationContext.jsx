import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration,
      isVisible: true,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 3000) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);

  const showError = useCallback((message, duration = 5000) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration = 3000) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration = 4000) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);

  const value = {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render all notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        <div className="pointer-events-auto space-y-3">
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              message={notification.message}
              type={notification.type}
              isVisible={notification.isVisible}
              onClose={() => removeNotification(notification.id)}
              duration={notification.duration}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
