import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  isFlowing?: boolean;
  minValue?: number;
  maxValue?: number;
  criticalThreshold?: number;
  warningThreshold?: number;
  previousValue?: number;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  isFlowing = false,
  minValue = 0,
  maxValue = 100,
  criticalThreshold,
  warningThreshold,
  previousValue,
  isLoading = false,
}) => {
  const { refreshRate } = useApp();
  const [currentValue, setCurrentValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (value !== currentValue) {
      setIsUpdating(true);
      setCurrentValue(value);
      
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [value, currentValue]);

  // Determine status color
  const getStatusColor = () => {
    if (criticalThreshold !== undefined && (value >= criticalThreshold || value <= minValue)) {
      return 'text-danger';
    }
    if (warningThreshold !== undefined && value >= warningThreshold) {
      return 'text-warning';
    }
    return 'text-success';
  };

  // Calculate change percentage
  const changePercent = previousValue 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;

  // Calculate gradient for progress bar
  const percentage = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));
  
  // Determine gradient colors based on thresholds
  const getGradientColors = () => {
    if (criticalThreshold !== undefined && (percentage >= ((criticalThreshold - minValue) / (maxValue - minValue)) * 100)) {
      return 'from-red-500 to-red-600';
    }
    if (warningThreshold !== undefined && (percentage >= ((warningThreshold - minValue) / (maxValue - minValue)) * 100)) {
      return 'from-yellow-500 to-yellow-600';
    }
    return 'from-green-500 to-green-600';
  };

  return (
    <div className={`metric-card relative ${isUpdating ? 'bg-blue-50 dark:bg-blue-900/20' : ''} transition-colors duration-300`}>
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-700 dark:text-gray-300 font-medium text-sm">{title}</h3>
        <div className="text-gray-500 dark:text-gray-400">{icon}</div>
      </div>
      
      {/* Value */}
      <div className="flex justify-between items-end mt-1">
        <div className="flex items-baseline">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          ) : (
            <>
              <span className={`text-2xl font-bold ${getStatusColor()}`}>
                {value.toLocaleString()}
              </span>
              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</span>
            </>
          )}
        </div>
        
        {previousValue !== undefined && !isLoading && (
          <div className={`flex items-center text-xs font-medium ${
            changePercent > 0 ? 'text-green-600 dark:text-green-400' : 
            changePercent < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {changePercent > 0 ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : changePercent < 0 ? (
              <ArrowDown className="h-3 w-3 mr-1" />
            ) : null}
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getGradientColors()} ${
            isFlowing ? 'flowing-water' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Min/Max Labels */}
      <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{minValue}</span>
        <span>Updated every {refreshRate / 1000}s</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
};

export default MetricCard;