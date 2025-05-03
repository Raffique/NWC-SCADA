import React, { useState, useEffect } from 'react';
import { Droplets, Gauge, Wind, Timer, Thermometer, FlaskRound as Flask, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import MetricCard from '../components/dashboard/MetricCard';
import SystemStatus from '../components/dashboard/SystemStatus';
import ReservoirCard from '../components/dashboard/ReservoirCard';
import { useApp } from '../contexts/AppContext';
import { generateTimeSeriesData } from '../data/mockAlarms';

const Dashboard: React.FC = () => {
  const { refreshRate } = useApp();
  const [metrics, setMetrics] = useState({
    pressure: 65,
    flow: 180,
    turbidity: 2.4,
    pumpSpeed: 75,
    temperature: 24.5,
    chlorine: 1.2,
    pH: 7.2,
  });
  
  const [previousMetrics, setPreviousMetrics] = useState({
    pressure: 64,
    flow: 178,
    turbidity: 2.5,
    pumpSpeed: 74,
    temperature: 24.3,
    chlorine: 1.1,
    pH: 7.3,
  });

  const [chartData, setChartData] = useState(generateTimeSeriesData(24, 180, 0.05));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setIsLoading(true);
      
      // Save current metrics as previous
      setPreviousMetrics({...metrics});
      
      // Update with random variations
      const newMetrics = {
        pressure: Math.max(0, Math.min(100, metrics.pressure + (Math.random() * 4 - 2))),
        flow: Math.max(0, Math.min(300, metrics.flow + (Math.random() * 10 - 5))),
        turbidity: Math.max(0, Math.min(10, metrics.turbidity + (Math.random() * 0.4 - 0.2))),
        pumpSpeed: Math.max(0, Math.min(100, metrics.pumpSpeed + (Math.random() * 4 - 2))),
        temperature: Math.max(15, Math.min(35, metrics.temperature + (Math.random() * 0.6 - 0.3))),
        chlorine: Math.max(0, Math.min(3, metrics.chlorine + (Math.random() * 0.2 - 0.1))),
        pH: Math.max(6, Math.min(9, metrics.pH + (Math.random() * 0.2 - 0.1))),
      };
      
      setMetrics(newMetrics);
      
      // Add new data point to chart
      const newDataPoint = {
        timestamp: new Date(),
        value: newMetrics.flow,
      };
      
      setChartData(prevData => {
        const newData = [...prevData.slice(1), newDataPoint];
        return newData;
      });
      
      setTimeout(() => setIsLoading(false), 500);
    };
    
    // Initial update
    updateData();
    
    // Set interval for updates
    const interval = setInterval(updateData, refreshRate);
    
    return () => clearInterval(interval);
  }, [metrics, refreshRate]);

  const formattedChartData = chartData.map(point => ({
    ...point,
    formattedTime: format(point.timestamp, 'HH:mm'),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {format(new Date(), 'MMM d, yyyy HH:mm:ss')}
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="System Pressure"
          value={metrics.pressure}
          unit="PSI"
          icon={<Gauge size={20} />}
          isLoading={isLoading}
          previousValue={previousMetrics.pressure}
          warningThreshold={80}
          criticalThreshold={90}
        />
        <MetricCard
          title="Main Flow Rate"
          value={metrics.flow}
          unit="gal/min"
          icon={<Wind size={20} />}
          isFlowing={true}
          isLoading={isLoading}
          previousValue={previousMetrics.flow}
          warningThreshold={250}
          criticalThreshold={280}
          maxValue={300}
        />
        <MetricCard
          title="Water Turbidity"
          value={metrics.turbidity}
          unit="NTU"
          icon={<Droplets size={20} />}
          isLoading={isLoading}
          previousValue={previousMetrics.turbidity}
          warningThreshold={5}
          criticalThreshold={8}
          maxValue={10}
        />
        <MetricCard
          title="Pump Speed"
          value={metrics.pumpSpeed}
          unit="%"
          icon={<Timer size={20} />}
          isLoading={isLoading}
          previousValue={previousMetrics.pumpSpeed}
          warningThreshold={90}
          criticalThreshold={95}
        />
      </div>

      {/* Secondary Metrics and Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 card p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flow Rate Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedChartData}>
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
                  domain={[0, 'dataMax + 50']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb'
                  }}
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value) => [`${value.toFixed(2)} gal/min`, 'Flow Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0A5688" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#0A5688', strokeWidth: 2, fill: 'white' }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-1 grid grid-cols-1 gap-4">
          <MetricCard
            title="Water Temperature"
            value={metrics.temperature}
            unit="°C"
            icon={<Thermometer size={20} />}
            isLoading={isLoading}
            previousValue={previousMetrics.temperature}
            minValue={15}
            maxValue={35}
            warningThreshold={30}
            criticalThreshold={32}
          />
          <MetricCard
            title="Chlorine Level"
            value={metrics.chlorine}
            unit="mg/L"
            icon={<Flask size={20} />}
            isLoading={isLoading}
            previousValue={previousMetrics.chlorine}
            maxValue={3}
            warningThreshold={2}
            criticalThreshold={2.5}
          />
          <MetricCard
            title="pH Level"
            value={metrics.pH}
            unit="pH"
            icon={<Activity size={20} />}
            isLoading={isLoading}
            previousValue={previousMetrics.pH}
            minValue={6}
            maxValue={9}
            warningThreshold={8}
            criticalThreshold={8.5}
          />
        </div>
      </div>

      {/* Reservoirs & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReservoirCard
            name="Kingston Main Reservoir"
            currentLevel={2800000}
            capacity={5000000}
            fillRate={4200}
            outflowRate={3800}
          />
          <ReservoirCard
            name="Montego Bay Reservoir"
            currentLevel={950000}
            capacity={2000000}
            fillRate={1800}
            outflowRate={2100}
          />
          <ReservoirCard
            name="Mandeville Storage"
            currentLevel={280000}
            capacity={1500000}
            fillRate={1200}
            outflowRate={1000}
          />
          <ReservoirCard
            name="May Pen Reservoir"
            currentLevel={120000}
            capacity={800000}
            fillRate={800}
            outflowRate={950}
          />
        </div>
        <div className="lg:col-span-1">
          <SystemStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;