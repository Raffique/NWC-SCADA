import React from 'react';
import { 
  Check, 
  AlertTriangle, 
  XCircle, 
  CircleSlash, 
  Radio, 
  Wifi,
  Server,
  Database,
  Network
} from 'lucide-react';

interface StatusItemProps {
  name: string;
  status: 'online' | 'warning' | 'error' | 'maintenance';
  lastUpdated: string;
  icon: React.ReactNode;
}

const StatusItem: React.FC<StatusItemProps> = ({ name, status, lastUpdated, icon }) => {
  const getStatusIndicator = () => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Check className="mr-1 h-3 w-3" />
            Online
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Error
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <CircleSlash className="mr-1 h-3 w-3" />
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-center">
        <div className="flex-shrink-0 text-gray-500 dark:text-gray-400 mr-3">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
        </div>
      </div>
      <div>
        {getStatusIndicator()}
      </div>
    </div>
  );
};

const SystemStatus: React.FC = () => {
  const statuses: StatusItemProps[] = [
    { 
      name: 'SCADA Server', 
      status: 'online', 
      lastUpdated: '1 min ago',
      icon: <Server size={18} />
    },
    { 
      name: 'Database System', 
      status: 'online', 
      lastUpdated: '3 mins ago',
      icon: <Database size={18} />
    },
    { 
      name: 'Kingston WTP Network', 
      status: 'warning', 
      lastUpdated: '5 mins ago',
      icon: <Network size={18} />
    },
    { 
      name: 'Montego Bay RTU', 
      status: 'error', 
      lastUpdated: '15 mins ago',
      icon: <Radio size={18} />
    },
    { 
      name: 'Mandeville Station', 
      status: 'maintenance', 
      lastUpdated: '30 mins ago',
      icon: <Wifi size={18} />
    },
  ];

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {statuses.map((status, index) => (
          <StatusItem key={index} {...status} />
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;