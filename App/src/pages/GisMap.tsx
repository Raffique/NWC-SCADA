import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Map as MapIcon, Layers, Info, AlertTriangle } from 'lucide-react';
import { generateMockAlarms } from '../data/mockAlarms';

// Jamaica coordinates
const JAMAICA_CENTER = [18.1096, -77.2975];
const JAMAICA_BOUNDS = [
  [17.7, -78.4], // Southwest
  [18.5, -76.2]  // Northeast
];

interface WaterAsset {
  id: string;
  name: string;
  type: 'plant' | 'reservoir' | 'pump' | 'sensor' | 'well';
  location: [number, number];
  status: 'normal' | 'warning' | 'critical' | 'maintenance';
  details: {
    capacity?: number;
    flow?: number;
    pressure?: number;
    lastMaintenance?: string;
    installDate?: string;
    manufacturer?: string;
  };
}

const GisMap: React.FC = () => {
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
  // Mock water assets data
  const waterAssets: WaterAsset[] = [
    {
      id: '1',
      name: 'Kingston Water Treatment Plant',
      type: 'plant',
      location: [18.0179, -76.8356],
      status: 'normal',
      details: {
        capacity: 15000000,
        flow: 12500,
        lastMaintenance: '2023-10-15',
        installDate: '2010-05-22',
        manufacturer: 'Siemens Water Technologies',
      }
    },
    {
      id: '2',
      name: 'Montego Bay Reservoir',
      type: 'reservoir',
      location: [18.4762, -77.9209],
      status: 'warning',
      details: {
        capacity: 8000000,
        lastMaintenance: '2023-09-10',
        installDate: '2012-07-15',
      }
    },
    {
      id: '3',
      name: 'Mandeville Pump Station',
      type: 'pump',
      location: [18.0367, -77.5014],
      status: 'critical',
      details: {
        flow: 850,
        pressure: 72,
        lastMaintenance: '2023-11-05',
        installDate: '2015-03-28',
        manufacturer: 'Grundfos',
      }
    },
    {
      id: '4',
      name: 'Ocho Rios Pressure Sensor',
      type: 'sensor',
      location: [18.4066, -77.1029],
      status: 'normal',
      details: {
        pressure: 65,
        lastMaintenance: '2023-12-01',
        installDate: '2019-01-10',
        manufacturer: 'Endress+Hauser',
      }
    },
    {
      id: '5',
      name: 'Negril Treatment Plant',
      type: 'plant',
      location: [18.2696, -78.3494],
      status: 'maintenance',
      details: {
        capacity: 5000000,
        flow: 0, // Currently offline for maintenance
        lastMaintenance: '2024-01-15',
        installDate: '2011-08-30',
        manufacturer: 'Veolia Water Technologies',
      }
    },
    {
      id: '6',
      name: 'Spanish Town Well',
      type: 'well',
      location: [18.0470, -77.0000],
      status: 'normal',
      details: {
        flow: 320,
        lastMaintenance: '2023-08-22',
        installDate: '2017-06-15',
      }
    },
    {
      id: '7',
      name: 'May Pen Reservoir',
      type: 'reservoir',
      location: [17.9714, -77.2429],
      status: 'normal',
      details: {
        capacity: 3500000,
        lastMaintenance: '2023-07-15',
        installDate: '2014-11-18',
      }
    },
    {
      id: '8',
      name: 'Port Antonio Pump Station',
      type: 'pump',
      location: [18.1794, -76.4506],
      status: 'warning',
      details: {
        flow: 420,
        pressure: 58,
        lastMaintenance: '2023-05-28',
        installDate: '2016-09-03',
        manufacturer: 'KSB',
      }
    },
  ];

  // Mock alarms related to map assets
  const assetAlarms = generateMockAlarms(5).map(alarm => ({
    ...alarm,
    assetId: waterAssets[Math.floor(Math.random() * waterAssets.length)].id
  }));

  const getMarkerColorByStatus = (status: WaterAsset['status']) => {
    switch (status) {
      case 'normal': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'critical': return 'var(--color-danger)';
      case 'maintenance': return 'rgb(59, 130, 246)'; // Blue
    }
  };

  const getAssetTypeIcon = (type: WaterAsset['type']) => {
    switch (type) {
      case 'plant': return '🏭';
      case 'reservoir': return '💧';
      case 'pump': return '⚙️';
      case 'sensor': return '📡';
      case 'well': return '⛲';
    }
  };

  // Find alarms related to a specific asset
  const getAssetAlarms = (assetId: string) => {
    return assetAlarms.filter(alarm => alarm.assetId === assetId);
  };

  const selectedAsset = selectedAssetId 
    ? waterAssets.find(asset => asset.id === selectedAssetId) 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MapIcon className="h-6 w-6 mr-2" />
          GIS Infrastructure Map
        </h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Map Type:</span>
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value as 'street' | 'satellite')}
            className="input text-sm py-1"
          >
            <option value="street">Street</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="h-[70vh]">
            <MapContainer 
              center={JAMAICA_CENTER} 
              zoom={9} 
              style={{ height: '100%', width: '100%' }}
              maxBounds={JAMAICA_BOUNDS}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={mapType === 'street' 
                  ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                }
              />
              
              {waterAssets.map(asset => (
                <React.Fragment key={asset.id}>
                  <Marker 
                    position={asset.location}
                    eventHandlers={{
                      click: () => {
                        setSelectedAssetId(asset.id);
                      }
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-medium">{getAssetTypeIcon(asset.type)} {asset.name}</h3>
                        <p className="text-sm">Status: {asset.status}</p>
                        <button 
                          onClick={() => setSelectedAssetId(asset.id)}
                          className="text-xs text-primary-600 mt-1"
                        >
                          View details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle 
                    center={asset.location} 
                    radius={1500}
                    pathOptions={{
                      fillColor: getMarkerColorByStatus(asset.status),
                      fillOpacity: 0.2,
                      weight: 1,
                      color: getMarkerColorByStatus(asset.status),
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Asset Information Panel */}
        <div className="lg:col-span-1 flex flex-col h-[70vh]">
          {selectedAsset ? (
            <div className="card flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Asset Details
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${selectedAsset.status === 'normal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  selectedAsset.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                  selectedAsset.status === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}
                >
                  {selectedAsset.status}
                </span>
              </div>
              
              <div className="p-4 overflow-y-auto">
                <div className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {getAssetTypeIcon(selectedAsset.type)} {selectedAsset.name}
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Asset Information</h3>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-gray-500 dark:text-gray-400">Type:</div>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">{selectedAsset.type}</div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Location:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedAsset.location[0].toFixed(4)}, {selectedAsset.location[1].toFixed(4)}
                      </div>
                      
                      {selectedAsset.details.installDate && (
                        <>
                          <div className="text-gray-500 dark:text-gray-400">Install Date:</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedAsset.details.installDate}</div>
                        </>
                      )}
                      
                      {selectedAsset.details.manufacturer && (
                        <>
                          <div className="text-gray-500 dark:text-gray-400">Manufacturer:</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedAsset.details.manufacturer}</div>
                        </>
                      )}
                      
                      {selectedAsset.details.lastMaintenance && (
                        <>
                          <div className="text-gray-500 dark:text-gray-400">Last Maintenance:</div>
                          <div className="font-medium text-gray-900 dark:text-white">{selectedAsset.details.lastMaintenance}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Operational data */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Operational Data</h3>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {selectedAsset.details.capacity && (
                        <>
                          <div className="text-gray-500 dark:text-gray-400">Capacity:</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedAsset.details.capacity.toLocaleString()} gal
                          </div>
                        </>
                      )}
                      
                      {selectedAsset.details.flow !== undefined && (
                        <>
                          <div className="text-gray-500 dark:text-gray-400">Flow Rate:</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedAsset.details.flow.toLocaleString()} gal/min
                          </div>
                        </>
                      )}
                      
                      {selectedAsset.details.pressure && (
                        <>
                          <div className="text-gray-500 dark:text-gray-400">Pressure:</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedAsset.details.pressure} PSI
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Recent alarms */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                      Recent Alarms
                    </h3>
                    
                    {getAssetAlarms(selectedAsset.id).length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {getAssetAlarms(selectedAsset.id).map(alarm => (
                          <div 
                            key={alarm.id} 
                            className={`p-2 rounded text-xs
                              ${alarm.priority === 'critical' ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200' : 
                              alarm.priority === 'high' ? 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' : 
                              alarm.priority === 'medium' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : 
                              'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'}`}
                          >
                            <div className="font-medium">{alarm.title}</div>
                            <div>{alarm.message}</div>
                            <div className="mt-1 text-xs opacity-80">
                              {format(alarm.timestamp, 'MMM d, HH:mm')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        No recent alarms for this asset.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setSelectedAssetId(null)}
                  className="btn-outline text-sm w-full"
                >
                  Close Details
                </button>
              </div>
            </div>
          ) : (
            <div className="card flex-1 flex flex-col items-center justify-center p-6">
              <Layers className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Asset Selected</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Click on a marker on the map to view detailed information about water infrastructure assets.
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="font-medium text-lg text-gray-900 dark:text-white">{waterAssets.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Assets</div>
                </div>
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="font-medium text-lg text-gray-900 dark:text-white">
                    {waterAssets.filter(a => a.status === 'warning' || a.status === 'critical').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Assets with Issues</div>
                </div>
              </div>
              
              <div className="mt-6 w-full">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Normal Operation</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Warning</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Critical</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Maintenance</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GisMap;