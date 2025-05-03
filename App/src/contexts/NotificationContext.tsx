import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateMockAlarms } from '../data/mockAlarms';

export type AlarmPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Alarm {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  priority: AlarmPriority;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationContextType {
  alarms: Alarm[];
  notifications: Notification[];
  unreadCount: number;
  activeAlarmsCount: {
    total: number;
    byPriority: Record<AlarmPriority, number>;
  };
  acknowledgeAlarm: (id: string) => void;
  resolveAlarm: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Initialize with mock data
    const mockAlarms = generateMockAlarms(10);
    setAlarms(mockAlarms);

    // Create notifications from unacknowledged alarms
    const alarmNotifications = mockAlarms
      .filter(alarm => !alarm.acknowledged)
      .map(alarm => ({
        id: `notification-${alarm.id}`,
        title: alarm.title,
        message: alarm.message,
        timestamp: alarm.timestamp,
        read: false,
        type: getPriorityNotificationType(alarm.priority),
      }));

    // Add some system notifications
    const systemNotifications = [
      {
        id: 'sys-1',
        title: 'System Update',
        message: 'SCADA system updated to version 2.4.1',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: true,
        type: 'info' as const,
      },
      {
        id: 'sys-2',
        title: 'Connection Restored',
        message: 'Connection to Kingston Plant restored after maintenance',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: false,
        type: 'success' as const,
      },
    ];

    setNotifications([...alarmNotifications, ...systemNotifications]);

    // Simulate new alarms coming in
    const alarmInterval = setInterval(() => {
      const newAlarm = generateMockAlarms(1)[0];
      setAlarms(prev => [newAlarm, ...prev]);
      
      // Add notification for the new alarm
      const newNotification = {
        id: `notification-${newAlarm.id}`,
        title: newAlarm.title,
        message: newAlarm.message,
        timestamp: newAlarm.timestamp,
        read: false,
        type: getPriorityNotificationType(newAlarm.priority),
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }, 60000); // Add new alarm every minute

    return () => clearInterval(alarmInterval);
  }, []);

  const getPriorityNotificationType = (priority: AlarmPriority): Notification['type'] => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
    }
  };

  const acknowledgeAlarm = (id: string) => {
    setAlarms(prev => 
      prev.map(alarm => 
        alarm.id === id ? { ...alarm, acknowledged: true } : alarm
      )
    );
  };

  const resolveAlarm = (id: string) => {
    setAlarms(prev => 
      prev.map(alarm => 
        alarm.id === id ? { ...alarm, resolved: true, acknowledged: true } : alarm
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Calculate counts
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const activeAlarmsCount = {
    total: alarms.filter(a => !a.resolved).length,
    byPriority: {
      critical: alarms.filter(a => !a.resolved && a.priority === 'critical').length,
      high: alarms.filter(a => !a.resolved && a.priority === 'high').length,
      medium: alarms.filter(a => !a.resolved && a.priority === 'medium').length,
      low: alarms.filter(a => !a.resolved && a.priority === 'low').length,
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        alarms,
        notifications,
        unreadCount,
        activeAlarmsCount,
        acknowledgeAlarm,
        resolveAlarm,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};