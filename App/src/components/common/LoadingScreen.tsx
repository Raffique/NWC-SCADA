import React from 'react';
import { Droplets } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-primary-500 animate-pulse">
        <Droplets size={64} />
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-primary-700 dark:text-primary-300">
        Loading SCADA System
      </h1>
      <div className="mt-6 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full w-1/3 animate-flow" />
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        National Water Commission
      </p>
    </div>
  );
};

export default LoadingScreen;