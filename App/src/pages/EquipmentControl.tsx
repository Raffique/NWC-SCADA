import React, { useState } from 'react';
import { 
  Settings, 
  Filter, 
  Power, 
  AlertTriangle, 
  RotateCcw, 
  Sliders, 
  Play, 
  Pause, 
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';

// Equipment types
type EquipmentType = 'pump' | 'valve' | 'filter' | 'sensor' | 'treatment';
type EquipmentStatus = 'running' | 'stopped' | 'maintenance' | 'fault';

interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  location: string;
  status: EquipmentStatus;
  controlMode: 'auto' | 'manual';
  operatingHours: number;
  lastMaintenance: string;
  parameters: {
    // Common
    powerConsumption?: number; // kWh
    efficiency?: number; // percentage
    
    // Pump specific
    flowRate?: number; // gal/min
    pressure?: number; // PSI
    speed?: number; // RPM
    
    // Valve specific
    openPercentage?: number; // 0-100
    pressureDrop?: number; // PSI
    
    // Filter specific
    differentialPressure?: number; // PSI
    particulateRemoval?: number; // percentage
    
    // Sensor specific
    readingValue?: number;
    readingUnit?: string;
    accuracy?: number; // percentage
    
    // Treatment specific
    dosageRate?: number; // mg/L
    residualLevel?: number; // mg/L
  };
  maintenanceSchedule: {
    nextDue: string;
    intervalDays: number;
    tasks: string[];
  };
  alarms?: {
    id: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    acknowledged: boolean;
  }[];
  controls: string[];
}

const EquipmentControl: React.FC = () => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<EquipmentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'all'>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Mock equipment data
  const equipmentList: EquipmentItem[] = [
    {
      id: 'pump-001',
      name: 'Main Intake Pump 1',
      type: 'pump',
      location: 'Kingston Plant',
      status: 'running',
      controlMode: 'auto',
      operatingHours: 12567,
      lastMaintenance: '2023-10-15',
      parameters: {
        flowRate: 240,
        pressure: 65,
        speed: 1750,
        powerConsumption: 22.5,
        efficiency: 87
      },
      maintenanceSchedule: {
        nextDue: '2024-04-15',
        intervalDays: 180,
        tasks: ['Bearing inspection', 'Seal replacement', 'Impeller check']
      },
      alarms: [],
      controls: ['Start/Stop', 'Speed Control', 'Mode Change']
    },
    {
      id: 'pump-002',
      name: 'Main Intake Pump 2',
      type: 'pump',
      location: 'Kingston Plant',
      status: 'stopped',
      controlMode: 'manual',
      operatingHours: 8954,
      lastMaintenance: '2023-12-10',
      parameters: {
        flowRate: 0,
        pressure: 0,
        speed: 0,
        powerConsumption: 0,
        efficiency: 89
      },
      maintenanceSchedule: {
        nextDue: '2024-06-10',
        intervalDays: 180,
        tasks: ['Bearing inspection', 'Seal replacement', 'Impeller check']
      },
      alarms: [],
      controls: ['Start/Stop', 'Speed Control', 'Mode Change']
    },
    {
      id: 'pump-003',
      name: 'Distribution Pump 1',
      type: 'pump',
      location: 'Kingston Plant',
      status: 'running',
      controlMode: 'auto',
      operatingHours: 15689,
      lastMaintenance: '2023-09-05',
      parameters: {
        flowRate: 320,
        pressure: 72,
        speed: 1850,
        powerConsumption: 28.2,
        efficiency: 85
      },
      maintenanceSchedule: {
        nextDue: '2024-03-05',
        intervalDays: 180,
        tasks: ['Bearing inspection', 'Seal replacement', 'Impeller check', 'Motor inspection']
      },
      alarms: [
        {
          id: 'alarm-001',
          message: 'High motor temperature warning',
          timestamp: '2024-01-30T14:22:15',
          priority: 'medium',
          acknowledged: true
        }
      ],
      controls: ['Start/Stop', 'Speed Control', 'Mode Change']
    },
    {
      id: 'valve-001',
      name: 'Intake Control Valve',
      type: 'valve',
      location: 'Kingston Plant',
      status: 'running',
      controlMode: 'auto',
      operatingHours: 14578,
      lastMaintenance: '2023-11-20',
      parameters: {
        openPercentage: 75,
        pressureDrop: 8.2,
        powerConsumption: 0.8
      },
      maintenanceSchedule: {
        nextDue: '2024-05-20',
        intervalDays: 180,
        tasks: ['Actuator check', 'Seal inspection', 'Lubrication']
      },
      alarms: [],
      controls: ['Open/Close', 'Position Control', 'Mode Change']
    },
    {
      id: 'valve-002',
      name: 'Filter Backwash Valve',
      type: 'valve',
      location: 'Kingston Plant',
      status: 'stopped',
      controlMode: 'manual',
      operatingHours: 5842,
      lastMaintenance: '2023-12-05',
      parameters: {
        openPercentage: 0,
        pressureDrop: 0,
        powerConsumption: 0
      },
      maintenanceSchedule: {
        nextDue: '2024-06-05',
        intervalDays: 180,
        tasks: ['Actuator check', 'Seal inspection', 'Lubrication']
      },
      alarms: [],
      controls: ['Open/Close', 'Position Control', 'Mode Change']
    },
    {
      id: 'filter-001',
      name: 'Sand Filter 1',
      type: 'filter',
      location: 'Kingston Plant',
      status: 'running',
      controlMode: 'auto',
      operatingHours: 8976,
      lastMaintenance: '2023-10-10',
      parameters: {
        differentialPressure: 5.4,
        particulateRemoval: 95.8,
        efficiency: 92
      },
      maintenanceSchedule: {
        nextDue: '2024-04-10',
        intervalDays: 180,
        tasks: ['Media inspection', 'Underdrain cleaning', 'Backwash system check']
      },
      alarms: [],
      controls: ['Backwash', 'Mode Change']
    },
    {
      id: 'filter-002',
      name: 'Sand Filter 2',
      type: 'filter',
      location: 'Kingston Plant',
      status: 'maintenance',
      controlMode: 'manual',
      operatingHours: 9124,
      lastMaintenance: '2024-01-15',
      parameters: {
        differentialPressure: 0,
        particulateRemoval: 0,
        efficiency: 94
      },
      maintenanceSchedule: {
        nextDue: '2024-07-15',
        intervalDays: 180,
        tasks: ['Media inspection', 'Underdrain cleaning', 'Backwash system check']
      },
      alarms: [],
      controls: ['Backwash', 'Mode Change']
    },
    {
      id: 'sensor-001',
      name: 'Intake Flow Meter',
      type: 'sensor',
      location: 'Kingston Plant',
      status: 'running',
      controlMode: 'auto',
      operatingHours: 17845,
      lastMaintenance: '2023-11-25',
      parameters: {
        readingValue: 285.6,
        readingUnit: 'gal/min',
        accuracy: 98.5,
        powerConsumption: 0.2
      },
      maintenanceSchedule: {
        nextDue: '2024-05-25',
        intervalDays: 180,
        tasks: ['Calibration', 'Electrical check', 'Cleaning']
      },
      alarms: [],
      controls: ['Calibrate', 'Reset']
    },
    {
      id: 'sensor-002',
      name: 'Turbidity Sensor',
      type: 'sensor',
      location: 'Kingston Plant',
      status: 'fault',
      controlMode: 'manual',
      operatingHours: 15689,
      lastMaintenance: '2023-10-20',
      parameters: {
        readingValue: 0,
        readingUnit: 'NTU',
        accuracy: 0,
        powerConsumption: 0.1
      },
      maintenanceSchedule: {
        nextDue: '2024-04-20',
        intervalDays: 180,
        tasks: ['Calibration', 'Electrical check', 'Cleaning', 'Probe replacement']
      },
      alarms: [
        {
          id: 'alarm-002',
          message: 'Sensor failure - No signal',
          timestamp: '2024-01-28T08:45:12',
          priority: 'high',
          acknowledged: false
        }
      ],
      controls: ['Calibrate', 'Reset']
    },
    {
      id: 'treatment-001',
      name: 'Chlorine Dosing System',
      type: 'treatment',
      location: 'Kingston Plant',
      status: 'running',
      controlMode: 'auto',
      operatingHours: 12458,
      lastMaintenance: '2023-12-15',
      parameters: {
        dosageRate: 1.8,
        residualLevel: 1.2,
        powerConsumption: 1.5,
        efficiency: 95
      },
      maintenanceSchedule: {
        nextDue: '2024-06-15',
        intervalDays: 180,
        tasks: ['Pump inspection', 'Tank cleaning', 'Injector check', 'Sensor calibration']
      },
      alarms: [],
      controls: ['Start/Stop', 'Dosage Control', 'Mode Change']
    },
    {
      id: 'pump-004',
      name: 'Montego Bay Intake Pump',
      type: 'pump',
      location: 'Montego Bay Plant',
      status: 'running',
      controlMode: 'auto',
      operatingHours: 9876,
      lastMaintenance: '2023-11-10',
      parameters: {
        flowRate: 180,
        pressure: 58,
        speed: 1720,
        powerConsumption: 18.5,
        efficiency: 88
      },
      maintenanceSchedule: {
        nextDue: '2024-05-10',
        intervalDays: 180,
        tasks: ['Bearing inspection', 'Seal replacement', 'Impeller check']
      },
      alarms: [],
      controls: ['Start/Stop', 'Speed Control', 'Mode Change']
    },
    {
      id: 'valve-003',
      name: 'Mandeville Distribution Valve',
      type: 'valve',
      location: 'Mandeville Station',
      status: 'fault',
      controlMode: 'manual',
      operatingHours: 7865,
      lastMaintenance: '2023-10-05',
      parameters: {
        openPercentage: 25,
        pressureDrop: 12.8,
        powerConsumption: 0.9
      },
      maintenanceSchedule: {
        nextDue: '2024-04-05',
        intervalDays: 180,
        tasks: ['Actuator check', 'Seal inspection', 'Lubrication']
      },
      alarms: [
        {
          id: 'alarm-003',
          message: 'Actuator failure - Position error',
          timestamp: '2024-01-29T16:32:45',
          priority: 'critical',
          acknowledged: true
        }
      ],
      controls: ['Open/Close', 'Position Control', 'Mode Change']
    },
  ];

  // Get unique locations for filter
  const locations = ['all', ...new Set(equipmentList.map(equipment => equipment.location))];

  // Filter equipment
  const filteredEquipment = equipmentList.filter(equipment => {
    const matchesType = filterType === 'all' || equipment.type === filterType;
    const matchesStatus = filterStatus === 'all' || equipment.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || equipment.location === filterLocation;
    const matchesSearch = 
      searchTerm === '' || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesLocation && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const paginatedEquipment = filteredEquipment.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Get selected equipment
  const selectedEquipment = selectedEquipmentId 
    ? equipmentList.find(equipment => equipment.id === selectedEquipmentId)
    : null;

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Power className="h-3 w-3 mr-1" />
            Running
          </span>
        );
      case 'stopped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            <Pause className="h-3 w-3 mr-1" />
            Stopped
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Settings className="h-3 w-3 mr-1" />
            Maintenance
          </span>
        );
      case 'fault':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Fault
          </span>
        );
    }
  };

  const getTypeIcon = (type: EquipmentType) => {
    switch (type) {
      case 'pump': return <RotateCcw className="h-5 w-5 text-blue-500" />;
      case 'valve': return <Sliders className="h-5 w-5 text-green-500" />;
      case 'filter': return <Filter className="h-5 w-5 text-amber-500" />;
      case 'sensor': return <Activity className="h-5 w-5 text-purple-500" />;
      case 'treatment': return <Flask className="h-5 w-5 text-rose-500" />;
    }
  };
  
  const handleStartStop = (equipment: EquipmentItem) => {
    alert(`This would ${equipment.status === 'running' ? 'stop' : 'start'} ${equipment.name}`);
  };

  const handleMaintenanceRequest = (equipment: EquipmentItem) => {
    setShowMaintenanceModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          Equipment Control
        </h1>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Equipment Type
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EquipmentType | 'all')}
              className="input w-full"
            >
              <option value="all">All Types</option>
              <option value="pump">Pumps</option>
              <option value="valve">Valves</option>
              <option value="filter">Filters</option>
              <option value="sensor">Sensors</option>
              <option value="treatment">Treatment</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EquipmentStatus | 'all')}
              className="input w-full"
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="maintenance">Maintenance</option>
              <option value="fault">Fault</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <select
              id="location-filter"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="input w-full"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment List */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipment List
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredEquipment.length} items
            </span>
          </div>
          
          {paginatedEquipment.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Control Mode
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedEquipment.map((equipment) => (
                    <tr 
                      key={equipment.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedEquipmentId === equipment.id ? 
                        'bg-blue-50 dark:bg-blue-900/20' : ''
                      } cursor-pointer`}
                      onClick={() => setSelectedEquipmentId(equipment.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getTypeIcon(equipment.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {equipment.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {equipment.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(equipment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`${
                          equipment.controlMode === 'auto' ? 
                          'text-green-600 dark:text-green-400' : 
                          'text-blue-600 dark:text-blue-400'
                        } font-medium`}>
                          {equipment.controlMode === 'auto' ? 'Automatic' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartStop(equipment);
                          }}
                          className={`mr-3 ${
                            equipment.status === 'running' ? 
                            'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 
                            'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                          }`}
                        >
                          {equipment.status === 'running' ? 'Stop' : 'Start'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowControlModal(true);
                            setSelectedEquipmentId(equipment.id);
                          }}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Control
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No equipment found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search term
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {filteredEquipment.length > 0 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`btn-outline text-sm py-1 px-3 ${
                    page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`btn-outline text-sm py-1 px-3 ${
                    page === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Equipment Details */}
        {selectedEquipment ? (
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Equipment Details
              </h2>
              {getStatusBadge(selectedEquipment.status)}
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                  {getTypeIcon(selectedEquipment.type)}
                  <span className="ml-2">{selectedEquipment.name}</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID: {selectedEquipment.id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Location: {selectedEquipment.location}
                </p>
              </div>
              
              {/* Key Parameters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedEquipment.parameters.flowRate !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Flow Rate</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.flowRate} gal/min
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.pressure !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pressure</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.pressure} PSI
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.speed !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Speed</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.speed} RPM
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.openPercentage !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.openPercentage}% open
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.differentialPressure !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Diff. Pressure</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.differentialPressure} PSI
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.readingValue !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reading</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.readingValue} {selectedEquipment.parameters.readingUnit}
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.powerConsumption !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Power</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.powerConsumption} kWh
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.efficiency !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Efficiency</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.efficiency}%
                      </p>
                    </div>
                  )}
                  
                  {selectedEquipment.parameters.dosageRate !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dosage Rate</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.dosageRate} mg/L
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Maintenance Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  Maintenance Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Operating Hours:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedEquipment.operatingHours.toLocaleString()} hrs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last Maintenance:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedEquipment.lastMaintenance).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Next Due:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedEquipment.maintenanceSchedule.nextDue).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Active Alarms */}
              {selectedEquipment.alarms && selectedEquipment.alarms.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                    Active Alarms
                  </h3>
                  <div className="space-y-2">
                    {selectedEquipment.alarms.map(alarm => (
                      <div 
                        key={alarm.id}
                        className={`p-2 rounded text-xs ${
                          alarm.priority === 'critical' ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                          alarm.priority === 'high' ? 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                          alarm.priority === 'medium' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                          'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        }`}
                      >
                        <div className="font-medium flex justify-between">
                          <span>{alarm.message}</span>
                          <span className="uppercase text-xs">{alarm.priority}</span>
                        </div>
                        <div className="mt-1 text-xs opacity-80 flex justify-between">
                          <span>{new Date(alarm.timestamp).toLocaleString()}</span>
                          <span>{alarm.acknowledged ? 'Acknowledged' : 'Unacknowledged'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStartStop(selectedEquipment)}
                  className={`btn text-sm ${
                    selectedEquipment.status === 'running' 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {selectedEquipment.status === 'running' ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowControlModal(true)}
                  className="btn-primary text-sm"
                >
                  <Sliders className="h-4 w-4 mr-1" />
                  Control Panel
                </button>
                
                <button
                  onClick={() => handleMaintenanceRequest(selectedEquipment)}
                  className="btn-outline text-sm col-span-2"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-8 flex flex-col items-center justify-center">
            <Settings className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No Equipment Selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              Select an equipment from the list to view details and controls
            </p>
          </div>
        )}
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Schedule Maintenance
              </h3>
              <button 
                onClick={() => setShowMaintenanceModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Schedule maintenance for <strong>{selectedEquipment.name}</strong>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maintenance Type
                  </label>
                  <select className="input w-full">
                    <option>Routine Maintenance</option>
                    <option>Preventive Maintenance</option>
                    <option>Corrective Maintenance</option>
                    <option>Emergency Repair</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Date
                  </label>
                  <input type="date" className="input w-full" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select className="input w-full">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea className="input w-full" rows={3}></textarea>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button 
                onClick={() => setShowMaintenanceModal(false)}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Maintenance request submitted');
                  setShowMaintenanceModal(false);
                }}
                className="btn-primary text-sm"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Modal */}
      {showControlModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                {getTypeIcon(selectedEquipment.type)}
                <span className="ml-2">Control Panel: {selectedEquipment.name}</span>
              </h3>
              <button 
                onClick={() => setShowControlModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {/* Mode Selector */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Control Mode
                </label>
                <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                  <button 
                    className={`flex-1 py-2 text-sm font-medium ${
                      selectedEquipment.controlMode === 'auto' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Automatic
                  </button>
                  <button 
                    className={`flex-1 py-2 text-sm font-medium ${
                      selectedEquipment.controlMode === 'manual' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>
              
              <div className="space-y-5">
                {/* Pump Controls */}
                {selectedEquipment.type === 'pump' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pump Speed
                      </label>
                      <div className="flex items-center">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={selectedEquipment.parameters.speed ? (selectedEquipment.parameters.speed / 20) : 0}
                          className="w-full" 
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 w-12">
                          {selectedEquipment.parameters.speed} RPM
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Flow Rate
                      </label>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          className="input w-24" 
                          value={selectedEquipment.parameters.flowRate} 
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          gal/min
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Valve Controls */}
                {selectedEquipment.type === 'valve' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valve Position
                    </label>
                    <div className="flex items-center">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedEquipment.parameters.openPercentage || 0}
                        className="w-full" 
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 w-12">
                        {selectedEquipment.parameters.openPercentage}%
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Sensor Controls */}
                {selectedEquipment.type === 'sensor' && (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Current Reading: <strong>{selectedEquipment.parameters.readingValue} {selectedEquipment.parameters.readingUnit}</strong>
                      </p>
                    </div>
                    <button className="btn-outline text-sm w-full">
                      Calibrate Sensor
                    </button>
                  </>
                )}
                
                {/* Filter Controls */}
                {selectedEquipment.type === 'filter' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Differential Pressure</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedEquipment.parameters.differentialPressure} PSI
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Particulate Removal</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedEquipment.parameters.particulateRemoval}%
                        </p>
                      </div>
                    </div>
                    <button className="btn-outline text-sm w-full">
                      Initiate Backwash Cycle
                    </button>
                  </>
                )}
                
                {/* Treatment Controls */}
                {selectedEquipment.type === 'treatment' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dosage Rate
                      </label>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          step="0.1"
                          min="0"
                          className="input w-24" 
                          value={selectedEquipment.parameters.dosageRate} 
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          mg/L
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Current Residual Level</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.parameters.residualLevel} mg/L
                      </p>
                    </div>
                  </>
                )}
                
                {/* Common Controls */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Actions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="btn-outline text-sm py-1.5">Reset</button>
                    <button className="btn-outline text-sm py-1.5">Emergency Stop</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button 
                onClick={() => setShowControlModal(false)}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Control settings applied');
                  setShowControlModal(false);
                }}
                className="btn-primary text-sm"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Flask icon component
const Flask: React.FC<{ className?: string; size?: number }> = ({ className, size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9 3h6v4l5 7a3 3 0 0 1-2.7 4.4 3 3 0 0 1-.6 0H7.3a3 3 0 0 1-2.6-4.386 3 3 0 0 1-.034-.013L9 7V3z" />
      <path d="M7.5 15h9" />
    </svg>
  );
};

export default EquipmentControl;