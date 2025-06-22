import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SystemSchematic from './pages/SystemSchematic';
import AlarmManagement from './pages/AlarmManagement';
import HistoricalData from './pages/HistoricalData';
import GisMap from './pages/GisMap';
import EquipmentControl from './pages/EquipmentControl';
import DeviceManagement from './pages/DeviceManagement';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter  basename='/NWC-SCADA'>
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="schematic" element={<SystemSchematic />} />
              <Route path="alarms" element={<AlarmManagement />} />
              <Route path="historical" element={<HistoricalData />} />
              <Route path="map" element={<GisMap />} />
              <Route path="equipment" element={<EquipmentControl />} />
              <Route path="devices" element={<DeviceManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;