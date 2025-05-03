import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-primary-500 mb-4">
        <Droplets size={64} />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
      <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary flex items-center">
        <Home className="h-5 w-5 mr-2" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;