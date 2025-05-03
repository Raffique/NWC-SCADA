import React, { useState } from 'react';
import { Bell, Filter, Search, CheckCircle2, AlertTriangle, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useNotifications, Alarm, AlarmPriority } from '../contexts/NotificationContext';

const AlarmManagement: React.FC = () => {
  const { alarms, acknowledgeAlarm, resolveAlarm } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<AlarmPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | 'all'>('24h');

  // Apply filters
  const filteredAlarms = alarms.filter(alarm => {
    // Search term
    const matchesSearch = 
      alarm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || alarm.priority === priorityFilter;
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !alarm.acknowledged && !alarm.resolved) ||
      (statusFilter === 'acknowledged' && alarm.acknowledged && !alarm.resolved) ||
      (statusFilter === 'resolved' && alarm.resolved);
    
    // Time range filter
    const now = new Date();
    let timeLimit = new Date();
    
    switch (timeRange) {
      case '1h':
        timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        timeLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        timeLimit = new Date(0); // Beginning of time
        break;
    }
    
    const matchesTimeRange = alarm.timestamp >= timeLimit;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesTimeRange;
  });
  
  // Get status count
  const statusCounts = {
    active: alarms.filter(a => !a.acknowledged && !a.resolved).length,
    acknowledged: alarms.filter(a => a.acknowledged && !a.resolved).length,
    resolved: alarms.filter(a => a.resolved).length,
  };
  
  // Get priority count
  const priorityCounts = {
    critical: alarms.filter(a => a.priority === 'critical').length,
    high: alarms.filter(a => a.priority === 'high').length,
    medium: alarms.filter(a => a.priority === 'medium').length,
    low: alarms.filter(a => a.priority === 'low').length,
  };

  const getPriorityIcon = (priority: AlarmPriority) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadgeClass = (priority: AlarmPriority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Bell className="h-6 w-6 mr-2" />
          Alarm Management
        </h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Alarms</div>
          <div className="text-2xl font-bold mt-1">{alarms.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold mt-1 text-red-600 dark:text-red-500">{statusCounts.active}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Acknowledged</div>
          <div className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-500">{statusCounts.acknowledged}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Resolved</div>
          <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-500">{statusCounts.resolved}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Priority Filter */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as AlarmPriority | 'all')}
                className="input text-sm py-1"
              >
                <option value="all">All</option>
                <option value="critical">Critical ({priorityCounts.critical})</option>
                <option value="high">High ({priorityCounts.high})</option>
                <option value="medium">Medium ({priorityCounts.medium})</option>
                <option value="low">Low ({priorityCounts.low})</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'acknowledged' | 'resolved')}
                className="input text-sm py-1"
              >
                <option value="all">All</option>
                <option value="active">Active ({statusCounts.active})</option>
                <option value="acknowledged">Acknowledged ({statusCounts.acknowledged})</option>
                <option value="resolved">Resolved ({statusCounts.resolved})</option>
              </select>
            </div>
            
            {/* Time Range Filter */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Time:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '1h' | '6h' | '24h' | '7d' | 'all')}
                className="input text-sm py-1"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search alarms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Alarms Table */}
      <div className="card overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtered Alarms
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredAlarms.length} of {alarms.length} alarms
          </div>
        </div>
        
        {filteredAlarms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Alarm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAlarms.map((alarm) => (
                  <tr key={alarm.id} className={!alarm.acknowledged && !alarm.resolved ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPriorityIcon(alarm.priority)}
                        <span className={`ml-2 inline-flex text-xs font-medium rounded-full px-2 py-0.5 ${getPriorityBadgeClass(alarm.priority)}`}>
                          {alarm.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{alarm.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{alarm.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {alarm.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(alarm.timestamp, 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {alarm.resolved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Resolved
                        </span>
                      ) : alarm.acknowledged ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Clock className="mr-1 h-3 w-3" />
                          Acknowledged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!alarm.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlarm(alarm.id)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        >
                          Acknowledge
                        </button>
                      )}
                      {!alarm.resolved && (
                        <button
                          onClick={() => resolveAlarm(alarm.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No alarms found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmManagement;