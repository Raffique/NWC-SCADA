import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, RefreshCw, Power, Activity, Settings } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'plc' | 'microcontroller' | 'soc' | 'sensor';
  protocol: 'mqtt' | 'modbus' | 'opcua';
  address: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  readings?: {
    [key: string]: number;
  };
}

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});

  const [formData, setFormData] = useState({
    name: '',
    type: 'plc',
    protocol: 'mqtt',
    address: ''
  });

  useEffect(() => {
    // Fetch devices from backend
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/devices');
      const data = await response.json();
      setDevices(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/devices', {
        method: showEditModal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(showEditModal ? { ...formData, id: selectedDevice?.id } : formData),
      });
      
      if (response.ok) {
        fetchDevices();
        setShowAddModal(false);
        setShowEditModal(false);
        setFormData({ name: '', type: 'plc', protocol: 'mqtt', address: '' });
      }
    } catch (error) {
      console.error('Error saving device:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        await fetch(`http://localhost:8080/api/devices/${id}`, {
          method: 'DELETE',
        });
        fetchDevices();
      } catch (error) {
        console.error('Error deleting device:', error);
      }
    }
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      protocol: device.protocol,
      address: device.address,
    });
    setShowEditModal(true);
  };

  const testDevice = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/devices/${id}/test`, {
        method: 'POST',
      });
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [id]: result.success }));
      
      // Clear test result after 3 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[id];
          return newResults;
        });
      }, 3000);
    } catch (error) {
      console.error('Error testing device:', error);
      setTestResults(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          Device Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Protocol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Seen
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {device.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                      {device.protocol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      device.status === 'online' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : device.status === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      <Power className="h-3 w-3 mr-1" />
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.lastSeen}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => testDevice(device.id)}
                      className={`mr-2 ${
                        testResults[device.id] === undefined
                          ? 'text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300'
                          : testResults[device.id]
                          ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                          : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                      }`}
                    >
                      {testResults[device.id] === undefined ? (
                        <Activity className="h-4 w-4" />
                      ) : testResults[device.id] ? (
                        'Success'
                      ) : (
                        'Failed'
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(device)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Device Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showEditModal ? 'Edit Device' : 'Add New Device'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Device Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="mt-1 input w-full"
                  >
                    <option value="plc">PLC</option>
                    <option value="microcontroller">Microcontroller</option>
                    <option value="soc">System on Chip</option>
                    <option value="sensor">Sensor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protocol
                  </label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value as any })}
                    className="mt-1 input w-full"
                  >
                    <option value="mqtt">MQTT</option>
                    <option value="modbus">Modbus</option>
                    <option value="opcua">OPC UA</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 input w-full"
                    placeholder="IP address, URL, or device identifier"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData({ name: '', type: 'plc', protocol: 'mqtt', address: '' });
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {showEditModal ? 'Save Changes' : 'Add Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;