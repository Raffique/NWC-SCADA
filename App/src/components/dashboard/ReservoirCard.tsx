import React from 'react';
import { Droplets } from 'lucide-react';

interface ReservoirCardProps {
  name: string;
  currentLevel: number;
  capacity: number;
  fillRate: number; // in gallons per minute
  outflowRate: number; // in gallons per minute
  warningThreshold?: number;
  criticalThreshold?: number;
}

const ReservoirCard: React.FC<ReservoirCardProps> = ({
  name,
  currentLevel,
  capacity,
  fillRate,
  outflowRate,
  warningThreshold = 20,
  criticalThreshold = 10,
}) => {
  // Calculate percentage filled
  const percentFilled = Math.max(0, Math.min(100, (currentLevel / capacity) * 100));
  
  // Calculate time to empty or fill
  const netRate = fillRate - outflowRate;
  let timeEstimate = '';
  let timeEstimateLabel = '';
  
  if (netRate < 0) {
    // Reservoir is emptying
    const hoursToEmpty = (currentLevel / Math.abs(netRate)) * 60;
    
    if (hoursToEmpty < 1) {
      timeEstimate = `${Math.round(hoursToEmpty * 60)} minutes`;
    } else {
      timeEstimate = `${Math.round(hoursToEmpty)} hours`;
    }
    timeEstimateLabel = 'Time to empty:';
  } else if (netRate > 0) {
    // Reservoir is filling
    const hoursToFill = ((capacity - currentLevel) / netRate) * 60;
    
    if (hoursToFill < 1) {
      timeEstimate = `${Math.round(hoursToFill * 60)} minutes`;
    } else {
      timeEstimate = `${Math.round(hoursToFill)} hours`;
    }
    timeEstimateLabel = 'Time to fill:';
  } else {
    // Stable level
    timeEstimate = 'Stable';
    timeEstimateLabel = 'Status:';
  }
  
  // Determine color based on percentage
  const getWaterColor = () => {
    if (percentFilled <= criticalThreshold) return 'bg-red-500';
    if (percentFilled <= warningThreshold) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-gray-900 dark:text-white font-medium">{name}</h3>
        <Droplets className="text-blue-500" size={20} />
      </div>
      
      {/* Reservoir visualization */}
      <div className="relative h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div 
          className={`absolute bottom-0 left-0 right-0 ${getWaterColor()} transition-all duration-1000 flowing-water`}
          style={{ height: `${percentFilled}%` }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 px-3 py-1 rounded">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {percentFilled.toFixed(1)}%
            </span>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {currentLevel.toLocaleString()} / {capacity.toLocaleString()} gal
            </div>
          </div>
        </div>
      </div>
      
      {/* Flow rates */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <div className="text-sm text-gray-500 dark:text-gray-400">Inflow</div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            {fillRate.toLocaleString()} gal/min
          </div>
        </div>
        <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <div className="text-sm text-gray-500 dark:text-gray-400">Outflow</div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            {outflowRate.toLocaleString()} gal/min
          </div>
        </div>
      </div>
      
      {/* Time estimate */}
      <div className="mt-3 text-sm flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">{timeEstimateLabel}</span>
        <span className="font-medium text-gray-900 dark:text-white">{timeEstimate}</span>
      </div>
    </div>
  );
};

export default ReservoirCard;