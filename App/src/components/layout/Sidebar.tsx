import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CircuitBoard, 
  Bell, 
  BarChart3, 
  Map, 
  Cog,
  LogOut,
  Users,
  Gauge,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Settings
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useApp();
  const { logout, user } = useAuth();
  const { activeAlarmsCount } = useNotifications();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-primary-700 dark:text-white">
          <Droplets className="h-8 w-8" />
          {sidebarOpen && (
            <span className="ml-2 font-semibold text-lg">NWC SCADA</span>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto pt-4 px-2">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" end className="nav-link">
              <LayoutDashboard className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/schematic" className="nav-link">
              <CircuitBoard className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>System Schematic</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/alarms" className="nav-link relative">
              <Bell className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>Alarms & Events</span>}
              {activeAlarmsCount.total > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-danger text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeAlarmsCount.total}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/historical" className="nav-link">
              <BarChart3 className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>Historical Data</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className="nav-link">
              <Map className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>GIS Map</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/equipment" className="nav-link">
              <Gauge className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>Equipment Control</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/devices" className="nav-link">
              <Settings className="h-5 w-5 mr-2" />
              {sidebarOpen && <span>Device Management</span>}
            </NavLink>
          </li>
        </ul>

        {/* Admin Section */}
        {user?.role === 'admin' && sidebarOpen && (
          <>
            <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </div>
            <ul className="space-y-1">
              <li>
                <NavLink to="/settings" className="nav-link">
                  <Cog className="h-5 w-5 mr-2" />
                  {sidebarOpen && <span>Settings</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/users" className="nav-link">
                  <Users className="h-5 w-5 mr-2" />
                  {sidebarOpen && <span>User Management</span>}
                </NavLink>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* User Area */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        {sidebarOpen ? (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                alt="User avatar"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="ml-auto p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;