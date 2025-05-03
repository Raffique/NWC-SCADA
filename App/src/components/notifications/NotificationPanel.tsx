import React from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications, Notification, Alarm } from '../../contexts/NotificationContext';
import { format } from 'date-fns';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    alarms, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    acknowledgeAlarm,
    resolveAlarm
  } = useNotifications();
  
  const [activeTab, setActiveTab] = React.useState<'notifications' | 'alarms'>('notifications');

  React.useEffect(() => {
    // Handle escape key to close panel
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Sort notifications and alarms with newest first
  const sortedNotifications = [...notifications].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  const sortedAlarms = [...alarms].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Filter active alarms
  const activeAlarms = sortedAlarms.filter(alarm => !alarm.resolved);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getAlarmPriorityClass = (priority: Alarm['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={onClose}
        />
      )}
    
      {/* Panel */}
      <div 
        className={`fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg z-50 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-200 ease-in-out flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {activeTab === 'notifications' ? 'Notifications' : 'Alarms & Events'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-3 font-medium text-sm focus:outline-none ${
              activeTab === 'notifications' 
                ? 'text-primary-600 border-b-2 border-primary-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm focus:outline-none ${
              activeTab === 'alarms' 
                ? 'text-primary-600 border-b-2 border-primary-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('alarms')}
          >
            Alarms & Events
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'notifications' && (
            <>
              {sortedNotifications.length > 0 ? (
                <div className="space-y-3">
                  {sortedNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-md border ${
                        notification.read 
                          ? 'border-gray-200 dark:border-gray-700' 
                          : 'border-primary-300 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/30'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex">
                        <div className="flex-shrink-0 mr-3">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {format(notification.timestamp, 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No notifications</p>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'alarms' && (
            <>
              {activeAlarms.length > 0 ? (
                <div className="space-y-3">
                  {activeAlarms.map(alarm => (
                    <div 
                      key={alarm.id}
                      className={`p-3 rounded-md border ${getAlarmPriorityClass(alarm.priority)}`}
                    >
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium">{alarm.title}</h3>
                        <span className="text-xs uppercase font-semibold">{alarm.priority}</span>
                      </div>
                      <p className="mt-1 text-sm">{alarm.message}</p>
                      <p className="mt-1 text-xs opacity-80">
                        Source: {alarm.source} • {format(alarm.timestamp, 'MMM d, HH:mm:ss')}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        {!alarm.acknowledged && (
                          <button 
                            onClick={() => acknowledgeAlarm(alarm.id)}
                            className="btn btn-sm bg-white text-gray-800 hover:bg-gray-100 text-xs"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button 
                          onClick={() => resolveAlarm(alarm.id)}
                          className="btn btn-sm bg-white text-gray-800 hover:bg-gray-100 text-xs"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No active alarms</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          {activeTab === 'notifications' && notifications.length > 0 && (
            <button 
              onClick={markAllNotificationsAsRead}
              className="w-full py-2 text-sm text-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;