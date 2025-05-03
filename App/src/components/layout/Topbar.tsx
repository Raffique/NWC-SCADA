import React from 'react';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  Clock,
  RefreshCcw
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { format } from 'date-fns';

interface TopbarProps {
  onNotificationClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onNotificationClick }) => {
  const { toggleSidebar, theme, toggleTheme, refreshRate, setRefreshRate } = useApp();
  const { unreadCount } = useNotifications();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shadow-sm z-10">
      {/* Left Section */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
          National Water Commission SCADA
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Refresh Rate Selector */}
        <div className="hidden md:flex items-center">
          <RefreshCcw size={16} className="text-gray-500 mr-2" />
          <select
            value={refreshRate}
            onChange={(e) => setRefreshRate(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-md py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
          </select>
        </div>

        {/* Current Time */}
        <div className="hidden md:flex items-center text-gray-700 dark:text-gray-300">
          <Clock size={16} className="mr-2" />
          <span className="text-sm">
            {format(currentTime, 'MMM d, yyyy HH:mm:ss')}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-block w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;