import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NotificationPanel from '../notifications/NotificationPanel';
import { useApp } from '../../contexts/AppContext';

const Layout: React.FC = () => {
  const { sidebarOpen } = useApp();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const toggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-16'
      }`}>
        <Topbar onNotificationClick={toggleNotifications} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Panel (Slide-in) */}
      <NotificationPanel 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
};

export default Layout;