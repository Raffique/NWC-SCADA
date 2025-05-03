import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { BarChart3, Calendar, Download, Filter, List, RefreshCw, Table2 } from 'lucide-react';
import { generateTimeSeriesData } from '../data/mockAlarms';
import { format, subDays, subHours, subMonths } from 'date-fns';

// Time range options
type TimeRange = '6h' | '24h' | '7d' | '30d' | '90d' | '1y';

// Metric options
interface MetricOption {
  id: string;
  name: string;
  unit: string;
  category: 'flow' | 'quality' | 'pressure' | 'level' | 'energy';
}

const HistoricalData: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['flow-main', 'pressure-main']);
  const [viewType, setViewType] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  // Available metrics
  const metricOptions: MetricOption[] = [
    { id: 'flow-main', name: 'Main Flow Rate', unit: 'gal/min', category: 'flow' },
    { id: 'flow-intake', name: 'Intake Flow', unit: 'gal/min', category: 'flow' },
    { id: 'flow-output', name: 'Output Flow', unit: 'gal/min', category: 'flow' },
    { id: 'pressure-main', name: 'System Pressure', unit: 'PSI', category: 'pressure' },
    { id: 'pressure-intake', name: 'Intake Pressure', unit: 'PSI', category: 'pressure' },
    { id: 'pressure-output', name: 'Output Pressure', unit: 'PSI', category: 'pressure' },
    { id: 'quality-turbidity', name: 'Turbidity', unit: 'NTU', category: 'quality' },
    { id: 'quality-chlorine', name: 'Chlorine Level', unit: 'mg/L', category: 'quality' },
    { id: 'quality-ph', name: 'pH Level', unit: 'pH', category: 'quality' },
    { id: 'level-raw', name: 'Raw Water Level', unit: '%', category: 'level' },
    { id: 'level-clean', name: 'Clean Water Level', unit: '%', category: 'level' },
    { id: 'energy-consumption', name: 'Energy Consumption', unit: 'kWh', category: 'energy' },
  ];

  // Generate date range based on selected time range
  const getTimeRangeConfig = (range: TimeRange) => {
    const now = new Date();
    let startDate: Date;
    let dataPoints: number;
    let timeFormat: string;
    
    switch (range) {
      case '6h':
        startDate = subHours(now, 6);
        dataPoints = 60;
        timeFormat = 'HH:mm';
        break;
      case '24h':
        startDate = subHours(now, 24);
        dataPoints = 96;
        timeFormat = 'HH:mm';
        break;
      case '7d':
        startDate = subDays(now, 7);
        dataPoints = 168;
        timeFormat = 'MMM dd HH:mm';
        break;
      case '30d':
        startDate = subDays(now, 30);
        dataPoints = 120;
        timeFormat = 'MMM dd';
        break;
      case '90d':
        startDate = subDays(now, 90);
        dataPoints = 90;
        timeFormat = 'MMM dd';
        break;
      case '1y':
        startDate = subMonths(now, 12);
        dataPoints = 52;
        timeFormat = 'MMM yyyy';
        break;
    }
    
    return { startDate, dataPoints, timeFormat };
  };

  // Generate mock data
  const generateChartData = () => {
    const { dataPoints, timeFormat } = getTimeRangeConfig(timeRange);
    
    // Generate data for each selected metric
    const metricData: Record<string, any[]> = {};
    
    selectedMetrics.forEach(metricId => {
      const metric = metricOptions.find(m => m.id === metricId);
      if (metric) {
        // Generate different patterns based on metric type
        let baseValue = 100;
        let volatility = 0.1;
        let trend = 0;
        
        if (metric.category === 'flow') {
          baseValue = 200;
          volatility = 0.15;
        } else if (metric.category === 'pressure') {
          baseValue = 65;
          volatility = 0.05;
        } else if (metric.category === 'quality') {
          if (metric.id === 'quality-ph') {
            baseValue = 7.2;
            volatility = 0.02;
          } else if (metric.id === 'quality-chlorine') {
            baseValue = 1.2;
            volatility = 0.1;
          } else {
            baseValue = 2.5;
            volatility = 0.2;
          }
        } else if (metric.category === 'level') {
          baseValue = 75;
          volatility = 0.05;
          trend = metric.id === 'level-raw' ? -0.01 : 0.005;
        } else if (metric.category === 'energy') {
          baseValue = 400;
          volatility = 0.2;
          // Add daily pattern
          const hourFactor = (h: number) => 1 + Math.sin((h % 24) / 24 * Math.PI * 2) * 0.5;
        }
        
        metricData[metricId] = generateTimeSeriesData(
          timeRange === '6h' ? 6 : 
          timeRange === '24h' ? 24 : 
          timeRange === '7d' ? 168 : 
          timeRange === '30d' ? 720 : 
          timeRange === '90d' ? 2160 : 8760, 
          baseValue, 
          volatility,
          trend
        );
      }
    });
    
    // Combine data into single array for chart
    const combinedData = [];
    const primaryMetricData = metricData[selectedMetrics[0]] || [];
    
    for (let i = 0; i < primaryMetricData.length; i++) {
      const dataPoint: Record<string, any> = {
        timestamp: primaryMetricData[i].timestamp,
        formattedTime: format(primaryMetricData[i].timestamp, timeFormat),
      };
      
      // Add values for each metric
      selectedMetrics.forEach(metricId => {
        if (metricData[metricId] && metricData[metricId][i]) {
          dataPoint[metricId] = metricData[metricId][i].value;
        }
      });
      
      combinedData.push(dataPoint);
    }
    
    return combinedData;
  };

  const chartData = generateChartData();

  // Get color for a metric
  const getMetricColor = (metricId: string) => {
    const metric = metricOptions.find(m => m.id === metricId);
    if (!metric) return '#9CA3AF';
    
    switch (metric.category) {
      case 'flow': return '#3B82F6'; // blue
      case 'pressure': return '#10B981'; // green
      case 'quality': return '#6366F1'; // indigo
      case 'level': return '#F59E0B'; // amber
      case 'energy': return '#EF4444'; // red
    }
  };

  // Toggle a metric selection
  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <BarChart3 className="h-6 w-6 mr-2" />
          Historical Data
        </h1>
        <div className="flex items-center space-x-2">
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
              viewType === 'chart' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'text-gray-500'
            }`}
            onClick={() => setViewType('chart')}
          >
            <BarChart3 className="h-5 w-5" />
          </button>
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
              viewType === 'table' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'text-gray-500'
            }`}
            onClick={() => setViewType('table')}
          >
            <Table2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="input text-sm py-1"
              >
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            
            {/* Chart Type Selector (only when in chart view) */}
            {viewType === 'chart' && (
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'line' | 'area' | 'bar')}
                  className="input text-sm py-1"
                >
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="btn-outline text-sm py-1 px-3 flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
            <button className="btn-outline text-sm py-1 px-3 flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Metrics Selector */}
        <div className="lg:col-span-1 card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metrics</h2>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Flow Metrics */}
            <div>
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Flow Rates</h3>
              <div className="space-y-2">
                {metricOptions.filter(m => m.category === 'flow').map(metric => (
                  <div key={metric.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => toggleMetricSelection(metric.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={metric.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {metric.name} ({metric.unit})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pressure Metrics */}
            <div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Pressure</h3>
              <div className="space-y-2">
                {metricOptions.filter(m => m.category === 'pressure').map(metric => (
                  <div key={metric.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => toggleMetricSelection(metric.id)}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <label htmlFor={metric.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {metric.name} ({metric.unit})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Water Quality Metrics */}
            <div>
              <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Water Quality</h3>
              <div className="space-y-2">
                {metricOptions.filter(m => m.category === 'quality').map(metric => (
                  <div key={metric.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => toggleMetricSelection(metric.id)}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor={metric.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {metric.name} ({metric.unit})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Water Level Metrics */}
            <div>
              <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Water Levels</h3>
              <div className="space-y-2">
                {metricOptions.filter(m => m.category === 'level').map(metric => (
                  <div key={metric.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => toggleMetricSelection(metric.id)}
                      className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                    />
                    <label htmlFor={metric.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {metric.name} ({metric.unit})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Energy Metrics */}
            <div>
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Energy</h3>
              <div className="space-y-2">
                {metricOptions.filter(m => m.category === 'energy').map(metric => (
                  <div key={metric.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => toggleMetricSelection(metric.id)}
                      className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <label htmlFor={metric.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {metric.name} ({metric.unit})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Metrics Control Buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
            <button 
              className="btn-outline text-sm py-1 flex-1"
              onClick={() => setSelectedMetrics([])}
            >
              Clear All
            </button>
            <button 
              className="btn-primary text-sm py-1 flex-1"
              onClick={() => setSelectedMetrics(metricOptions.map(m => m.id))}
            >
              Select All
            </button>
          </div>
        </div>

        {/* Chart or Table View */}
        <div className="lg:col-span-3 card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historical Data Visualization
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedMetrics.length} metrics selected
            </span>
          </div>

          {selectedMetrics.length === 0 ? (
            <div className="p-8 text-center">
              <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No Metrics Selected
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Please select at least one metric from the panel on the left to visualize data.
              </p>
            </div>
          ) : viewType === 'chart' ? (
            <div className="p-4 h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }} 
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Legend />
                    {selectedMetrics.map((metricId) => {
                      const metric = metricOptions.find(m => m.id === metricId);
                      return (
                        <Line 
                          key={metricId}
                          type="monotone" 
                          dataKey={metricId} 
                          stroke={getMetricColor(metricId)} 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6, stroke: getMetricColor(metricId), strokeWidth: 2, fill: 'white' }}
                          name={metric?.name || metricId}
                        />
                      );
                    })}
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }} 
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Legend />
                    {selectedMetrics.map((metricId) => {
                      const metric = metricOptions.find(m => m.id === metricId);
                      const color = getMetricColor(metricId);
                      return (
                        <Area 
                          key={metricId}
                          type="monotone" 
                          dataKey={metricId} 
                          stroke={color} 
                          fill={color}
                          fillOpacity={0.2}
                          strokeWidth={2}
                          activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
                          name={metric?.name || metricId}
                        />
                      );
                    })}
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }} 
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Legend />
                    {selectedMetrics.map((metricId) => {
                      const metric = metricOptions.find(m => m.id === metricId);
                      return (
                        <Bar 
                          key={metricId}
                          dataKey={metricId} 
                          fill={getMetricColor(metricId)} 
                          name={metric?.name || metricId}
                        />
                      );
                    })}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    {selectedMetrics.map((metricId) => {
                      const metric = metricOptions.find(m => m.id === metricId);
                      return (
                        <th 
                          key={metricId}
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {metric?.name || metricId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {chartData.slice(0, 20).map((dataPoint, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {dataPoint.formattedTime}
                      </td>
                      {selectedMetrics.map((metricId) => {
                        const metric = metricOptions.find(m => m.id === metricId);
                        return (
                          <td key={metricId} className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {typeof dataPoint[metricId] === 'number' 
                              ? dataPoint[metricId].toFixed(2)
                              : 'N/A'
                            } {metric?.unit}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Table pagination controls */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing 1-20 of {chartData.length} records
                </div>
                <div className="flex space-x-2">
                  <button className="btn-outline text-sm py-1 px-3">Previous</button>
                  <button className="btn-primary text-sm py-1 px-3">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalData;