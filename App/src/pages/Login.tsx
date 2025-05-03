import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Droplets, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }
    
    setLoginError('');
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setLoginError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 card p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Droplets className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            National Water Commission
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            SCADA Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginError && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{loginError}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1 block w-full"
                placeholder="email@nwc.gov.jm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1 block w-full"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex justify-center items-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <KeyRound className="h-5 w-5 mr-2" />
              )}
              Sign in
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            <p>Demo Credentials:</p>
            <p>Admin: admin@nwc.gov.jm / admin123</p>
            <p>Operator: operator@nwc.gov.jm / operator123</p>
            <p>Viewer: viewer@nwc.gov.jm / viewer123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;