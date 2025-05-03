import React, { useState, useEffect } from 'react';
import { RefreshCw, CircuitBoard, Download, ZoomIn, ZoomOut, Home as ResetIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// Mock system schematic components
interface SchematicComponent {
  id: string;
  type: 'pump' | 'valve' | 'tank' | 'pipe' | 'sensor' | 'filter';
  status: 'normal' | 'warning' | 'critical' | 'inactive';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  value?: number;
  unit?: string;
  connections?: string[];
}

// Mock water flow path definitions
interface FlowPath {
  id: string;
  path: string;
  status: 'normal' | 'warning' | 'critical' | 'inactive';
  flowRate?: number;
}

const SystemSchematic: React.FC = () => {
  const { refreshRate } = useApp();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedComponent, setSelectedComponent] = useState<SchematicComponent | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [components, setComponents] = useState<SchematicComponent[]>([]);
  const [flowPaths, setFlowPaths] = useState<FlowPath[]>([]);

  useEffect(() => {
    // Initialize components
    const initialComponents: SchematicComponent[] = [
      // Intake system
      {
        id: 'intake1',
        type: 'sensor',
        status: 'normal',
        label: 'Intake Flow',
        x: 100,
        y: 200,
        width: 40,
        height: 40,
        value: 285,
        unit: 'gal/min',
      },
      {
        id: 'valve1',
        type: 'valve',
        status: 'normal',
        label: 'Intake Valve',
        x: 180,
        y: 200,
        width: 40,
        height: 40,
        rotation: 0,
        value: 100, // Percent open
        unit: '%',
      },
      
      // Raw water storage
      {
        id: 'tank1',
        type: 'tank',
        status: 'normal',
        label: 'Raw Water Basin',
        x: 300,
        y: 180,
        width: 100,
        height: 80,
        value: 75, // Percent full
        unit: '%',
      },
      
      // Primary pumps
      {
        id: 'pump1',
        type: 'pump',
        status: 'normal',
        label: 'Primary Pump 1',
        x: 440,
        y: 160,
        width: 60,
        height: 40,
        value: 90, // Percent capacity
        unit: '%',
      },
      {
        id: 'pump2',
        type: 'pump',
        status: 'warning',
        label: 'Primary Pump 2',
        x: 440,
        y: 240,
        width: 60,
        height: 40,
        value: 75,
        unit: '%',
      },
      
      // Filtration
      {
        id: 'filter1',
        type: 'filter',
        status: 'normal',
        label: 'Coagulation',
        x: 540,
        y: 200,
        width: 80,
        height: 60,
      },
      {
        id: 'filter2',
        type: 'filter',
        status: 'normal',
        label: 'Sedimentation',
        x: 660,
        y: 200,
        width: 80,
        height: 60,
      },
      {
        id: 'filter3',
        type: 'filter',
        status: 'normal',
        label: 'Sand Filtration',
        x: 780,
        y: 200,
        width: 80,
        height: 60,
      },
      
      // Chlorination
      {
        id: 'sensor1',
        type: 'sensor',
        status: 'normal',
        label: 'Chlorine',
        x: 900,
        y: 200,
        width: 40,
        height: 40,
        value: 1.2,
        unit: 'mg/L',
      },
      
      // Clean water storage
      {
        id: 'tank2',
        type: 'tank',
        status: 'normal',
        label: 'Clean Water Reservoir',
        x: 1000,
        y: 180,
        width: 100,
        height: 80,
        value: 82,
        unit: '%',
      },
      
      // Distribution pumps
      {
        id: 'pump3',
        type: 'pump',
        status: 'normal',
        label: 'Distribution Pump 1',
        x: 1140,
        y: 160,
        width: 60,
        height: 40,
        value: 95,
        unit: '%',
      },
      {
        id: 'pump4',
        type: 'pump',
        status: 'inactive',
        label: 'Distribution Pump 2',
        x: 1140,
        y: 240,
        width: 60,
        height: 40,
        value: 0,
        unit: '%',
      },
      
      // Output
      {
        id: 'valve2',
        type: 'valve',
        status: 'normal',
        label: 'Output Valve',
        x: 1240,
        y: 200,
        width: 40,
        height: 40,
        rotation: 0,
        value: 85,
        unit: '%',
      },
      {
        id: 'sensor2',
        type: 'sensor',
        status: 'normal',
        label: 'Output Flow',
        x: 1320,
        y: 200,
        width: 40,
        height: 40,
        value: 265,
        unit: 'gal/min',
      },
    ];

    // Initialize flow paths
    const initialFlowPaths: FlowPath[] = [
      // Intake to Raw Water Basin
      {
        id: 'flow1',
        path: 'M140,200 L180,200 L300,200',
        status: 'normal',
        flowRate: 285,
      },
      // Raw Water Basin to Pumps
      {
        id: 'flow2',
        path: 'M400,200 L440,180',
        status: 'normal',
        flowRate: 150,
      },
      {
        id: 'flow3',
        path: 'M400,200 L440,260',
        status: 'warning',
        flowRate: 135,
      },
      // Pumps to Filtration
      {
        id: 'flow4',
        path: 'M500,180 L520,200 L540,200',
        status: 'normal',
        flowRate: 150,
      },
      {
        id: 'flow5',
        path: 'M500,260 L520,200',
        status: 'warning',
        flowRate: 135,
      },
      // Through Filtration Chain
      {
        id: 'flow6',
        path: 'M620,200 L660,200',
        status: 'normal',
        flowRate: 285,
      },
      {
        id: 'flow7',
        path: 'M740,200 L780,200',
        status: 'normal',
        flowRate: 280,
      },
      {
        id: 'flow8',
        path: 'M860,200 L900,200',
        status: 'normal',
        flowRate: 275,
      },
      // To Clean Water Reservoir
      {
        id: 'flow9',
        path: 'M940,200 L1000,200',
        status: 'normal',
        flowRate: 270,
      },
      // To Distribution Pumps
      {
        id: 'flow10',
        path: 'M1100,200 L1140,180',
        status: 'normal',
        flowRate: 270,
      },
      {
        id: 'flow11',
        path: 'M1100,200 L1140,260',
        status: 'inactive',
        flowRate: 0,
      },
      // To Output
      {
        id: 'flow12',
        path: 'M1200,180 L1220,200 L1240,200',
        status: 'normal',
        flowRate: 265,
      },
      {
        id: 'flow13',
        path: 'M1200,260 L1220,200',
        status: 'inactive',
        flowRate: 0,
      },
      // Final output
      {
        id: 'flow14',
        path: 'M1280,200 L1320,200',
        status: 'normal',
        flowRate: 265,
      },
    ];

    setComponents(initialComponents);
    setFlowPaths(initialFlowPaths);

    // Set up periodic updates
    const updateInterval = setInterval(() => {
      // Update some random component values to simulate live data
      setComponents(prev => prev.map(component => {
        if (Math.random() > 0.7) {
          let newValue = component.value;
          if (newValue !== undefined) {
            // Add some random fluctuation
            const fluctuation = (Math.random() * 10) - 5;
            newValue = Math.max(0, Math.min(100, newValue + fluctuation));
            
            // Determine status based on value
            let newStatus = component.status;
            if (component.type === 'pump' || component.type === 'valve') {
              if (newValue < 10) newStatus = 'inactive';
              else if (newValue < 50) newStatus = 'warning';
              else if (newValue > 95) newStatus = 'warning';
              else newStatus = 'normal';
            } else if (component.type === 'sensor') {
              const isFlow = component.label.includes('Flow');
              if (isFlow) {
                if (newValue < 100) newStatus = 'warning';
                else if (newValue > 350) newStatus = 'critical';
                else newStatus = 'normal';
              } else {
                // For chlorine or other sensors
                if (newValue < 0.5) newStatus = 'warning';
                else if (newValue > 2.0) newStatus = 'critical';
                else newStatus = 'normal';
              }
            }

            return { ...component, value: newValue, status: newStatus };
          }
        }
        return component;
      }));

      // Also update flow rates
      setFlowPaths(prev => prev.map(flow => {
        if (flow.status !== 'inactive' && Math.random() > 0.7) {
          let newFlowRate = flow.flowRate;
          if (newFlowRate !== undefined) {
            // Add some random fluctuation
            const fluctuation = (Math.random() * 10) - 5;
            newFlowRate = Math.max(0, newFlowRate + fluctuation);
            
            // Determine status based on flow rate
            let newStatus = flow.status;
            if (newFlowRate < 100) newStatus = 'warning';
            else if (newFlowRate > 350) newStatus = 'critical';
            else newStatus = 'normal';

            return { ...flow, flowRate: newFlowRate, status: newStatus };
          }
        }
        return flow;
      }));

      setLastUpdated(new Date());
    }, refreshRate);

    return () => clearInterval(updateInterval);
  }, [refreshRate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleComponentClick = (component: SchematicComponent) => {
    setSelectedComponent(component);
  };

  const getComponentColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10B981'; // success
      case 'warning': return '#F59E0B'; // warning
      case 'critical': return '#EF4444'; // danger
      case 'inactive': return '#9CA3AF'; // gray
      default: return '#9CA3AF';
    }
  };

  const getFlowPathClass = (status: string) => {
    switch (status) {
      case 'normal': return 'stroke-success';
      case 'warning': return 'stroke-warning';
      case 'critical': return 'stroke-danger';
      case 'inactive': return 'stroke-gray-400 dark:stroke-gray-600';
      default: return 'stroke-gray-400 dark:stroke-gray-600';
    }
  };

  const renderComponent = (component: SchematicComponent) => {
    const color = getComponentColor(component.status);
    const isSelected = selectedComponent?.id === component.id;
    const selectionClass = isSelected ? 'stroke-blue-500 stroke-[3px]' : 'stroke-gray-700 dark:stroke-gray-300';
    
    switch (component.type) {
      case 'pump':
        return (
          <g 
            key={component.id}
            transform={`translate(${component.x},${component.y})`}
            onClick={() => handleComponentClick(component)}
            className="cursor-pointer"
          >
            <rect
              x={0}
              y={0}
              width={component.width}
              height={component.height}
              rx={4}
              fill={color}
              className={selectionClass}
            />
            <circle
              cx={component.width / 2}
              cy={component.height / 2}
              r={component.height / 3}
              fill="white"
              className={`${component.status === 'inactive' ? '' : 'animate-spin'}`}
              style={{ animationDuration: '3s' }}
            />
            <text
              x={component.width / 2}
              y={component.height + 15}
              textAnchor="middle"
              fill="currentColor"
              className="text-xs font-medium"
            >
              {component.label}
            </text>
            {component.value !== undefined && (
              <text
                x={component.width / 2}
                y={component.height + 30}
                textAnchor="middle"
                fill="currentColor"
                className="text-xs"
              >
                {component.value.toFixed(0)}{component.unit}
              </text>
            )}
          </g>
        );
      
      case 'valve':
        return (
          <g 
            key={component.id}
            transform={`translate(${component.x},${component.y})`}
            onClick={() => handleComponentClick(component)}
            className="cursor-pointer"
          >
            <rect
              x={0}
              y={0}
              width={component.width}
              height={component.height}
              transform={`rotate(${component.rotation || 0}, ${component.width/2}, ${component.height/2})`}
              fill={color}
              className={selectionClass}
            />
            <line
              x1={5}
              y1={component.height / 2}
              x2={component.width - 5}
              y2={component.height / 2}
              strokeWidth={4}
              stroke="white"
            />
            <line
              x1={component.width / 2}
              y1={5}
              x2={component.width / 2}
              y2={component.height - 5}
              strokeWidth={4}
              stroke="white"
            />
            <text
              x={component.width / 2}
              y={component.height + 15}
              textAnchor="middle"
              fill="currentColor"
              className="text-xs font-medium"
            >
              {component.label}
            </text>
            {component.value !== undefined && (
              <text
                x={component.width / 2}
                y={component.height + 30}
                textAnchor="middle"
                fill="currentColor"
                className="text-xs"
              >
                {component.value.toFixed(0)}{component.unit}
              </text>
            )}
          </g>
        );
      
      case 'tank':
        const fillHeight = (component.value || 0) / 100 * component.height;
        return (
          <g 
            key={component.id}
            transform={`translate(${component.x},${component.y})`}
            onClick={() => handleComponentClick(component)}
            className="cursor-pointer"
          >
            {/* Water level */}
            <rect
              x={0}
              y={component.height - fillHeight}
              width={component.width}
              height={fillHeight}
              fill="#60A5FA"
              className="flowing-water"
            />
            {/* Tank outline */}
            <rect
              x={0}
              y={0}
              width={component.width}
              height={component.height}
              rx={4}
              fill="none"
              className={`${selectionClass} fill-none`}
              strokeWidth={2}
            />
            <text
              x={component.width / 2}
              y={component.height + 15}
              textAnchor="middle"
              fill="currentColor"
              className="text-xs font-medium"
            >
              {component.label}
            </text>
            {component.value !== undefined && (
              <text
                x={component.width / 2}
                y={component.height + 30}
                textAnchor="middle"
                fill="currentColor"
                className="text-xs"
              >
                {component.value.toFixed(0)}{component.unit}
              </text>
            )}
          </g>
        );
      
      case 'sensor':
        return (
          <g 
            key={component.id}
            transform={`translate(${component.x},${component.y})`}
            onClick={() => handleComponentClick(component)}
            className="cursor-pointer"
          >
            <circle
              cx={component.width / 2}
              cy={component.height / 2}
              r={component.width / 2}
              fill={color}
              className={selectionClass}
            />
            <text
              x={component.width / 2}
              y={component.height / 2 + 5}
              textAnchor="middle"
              fill="white"
              className="text-xs font-bold"
            >
              S
            </text>
            <text
              x={component.width / 2}
              y={component.height + 15}
              textAnchor="middle"
              fill="currentColor"
              className="text-xs font-medium"
            >
              {component.label}
            </text>
            {component.value !== undefined && (
              <text
                x={component.width / 2}
                y={component.height + 30}
                textAnchor="middle"
                fill="currentColor"
                className="text-xs"
              >
                {component.value.toFixed(1)}{component.unit}
              </text>
            )}
          </g>
        );
      
      case 'filter':
        return (
          <g 
            key={component.id}
            transform={`translate(${component.x},${component.y})`}
            onClick={() => handleComponentClick(component)}
            className="cursor-pointer"
          >
            <rect
              x={0}
              y={0}
              width={component.width}
              height={component.height}
              rx={4}
              fill={color}
              className={selectionClass}
            />
            {/* Filter lines */}
            {[1, 2, 3].map(i => (
              <line
                key={i}
                x1={10}
                y1={i * (component.height / 4)}
                x2={component.width - 10}
                y2={i * (component.height / 4)}
                strokeWidth={2}
                stroke="white"
                strokeDasharray="4 2"
              />
            ))}
            <text
              x={component.width / 2}
              y={component.height + 15}
              textAnchor="middle"
              fill="currentColor"
              className="text-xs font-medium"
            >
              {component.label}
            </text>
          </g>
        );
      
      default:
        return null;
    }
  };

  const renderFlowPath = (flow: FlowPath, index: number) => {
    const classNames = `${getFlowPathClass(flow.status)} ${
      flow.status !== 'inactive' ? 'animate-flow' : ''
    }`;
    
    return (
      <g key={flow.id}>
        <path
          d={flow.path}
          fill="none"
          strokeWidth={6}
          className={classNames}
          strokeLinecap="round"
          strokeDasharray={flow.status !== 'inactive' ? "10 5" : ""}
        />
        {flow.flowRate && flow.status !== 'inactive' && (
          <text
            x={getPathMiddlePoint(flow.path).x}
            y={getPathMiddlePoint(flow.path).y - 10}
            textAnchor="middle"
            fill="currentColor"
            className="text-xs"
          >
            {flow.flowRate.toFixed(0)} gal/min
          </text>
        )}
      </g>
    );
  };

  // Helper to get the middle point of a path for labels
  const getPathMiddlePoint = (pathD: string) => {
    const commands = pathD.split(/(?=[LMC])/).map(cmd => cmd.trim());
    
    if (commands.length >= 2) {
      const midCommandIndex = Math.floor(commands.length / 2);
      const command = commands[midCommandIndex];
      
      const parts = command.substring(1).split(',').map(Number);
      return { x: parts[0], y: parts[1] };
    }
    
    // Fallback
    return { x: 0, y: 0 };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <CircuitBoard className="h-6 w-6 mr-2" />
          System Schematic
        </h1>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => {
              const now = new Date();
              setLastUpdated(now);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </button>
        </div>
      </div>

      {/* Schematic Controls */}
      <div className="card p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleReset}
          >
            <ResetIcon className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Zoom: {(zoom * 100).toFixed(0)}%
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-success mr-1"></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Normal</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-warning mr-1"></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Warning</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-danger mr-1"></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Critical</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-600 mr-1"></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Inactive</span>
          </div>
        </div>
        
        <button
          className="btn-outline text-sm flex items-center"
        >
          <Download className="h-4 w-4 mr-1" />
          Export Schematic
        </button>
      </div>

      {/* Schematic Diagram */}
      <div className="flex gap-6">
        <div className="card overflow-hidden flex-1" style={{ height: '70vh' }}>
          <div 
            className="w-full h-full overflow-auto relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg 
              width="100%" 
              height="100%"
              viewBox="0 0 1500 500"
              preserveAspectRatio="xMidYMid meet"
              className="text-gray-900 dark:text-white"
              style={{ 
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.2s',
              }}
            >
              {/* Flow Paths */}
              {flowPaths.map(renderFlowPath)}
              
              {/* Components */}
              {components.map(renderComponent)}
            </svg>
          </div>
        </div>
        
        {/* Component Details */}
        {selectedComponent ? (
          <div className="card w-80 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Component Details
              </h2>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <div className="flex items-center space-x-2 mb-4">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: getComponentColor(selectedComponent.status) }}
                ></div>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {selectedComponent.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedComponent.label}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Type: <span className="capitalize">{selectedComponent.type}</span>
                  </p>
                </div>
                
                {selectedComponent.value !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Value
                    </h3>
                    <div className="mt-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {selectedComponent.value.toFixed(1)}
                      </span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        {selectedComponent.unit}
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status History
                  </h3>
                  <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded">
                    {/* Mock graph */}
                    <div className="h-full w-full flex items-end">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-primary-500"
                          style={{ 
                            height: `${20 + Math.random() * 60}%`,
                            margin: '0 1px' 
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Control
                  </h3>
                  {(selectedComponent.type === 'pump' || selectedComponent.type === 'valve') && (
                    <div className="space-y-2">
                      <input
                        type="range"
                        className="w-full"
                        min="0"
                        max="100"
                        value={selectedComponent.value}
                        onChange={() => {}} // Read-only in this demo
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                      <button className="btn-primary text-sm mt-2 w-full">
                        Apply Changes
                      </button>
                    </div>
                  )}
                  
                  {selectedComponent.type === 'sensor' && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Sensors are read-only devices.
                    </div>
                  )}
                  
                  {selectedComponent.type === 'tank' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button className="btn-outline text-sm py-1">Open Inlet</button>
                        <button className="btn-outline text-sm py-1">Close Inlet</button>
                        <button className="btn-outline text-sm py-1">Open Outlet</button>
                        <button className="btn-outline text-sm py-1">Close Outlet</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="btn-outline text-sm w-full"
                onClick={() => setSelectedComponent(null)}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="card w-80 flex items-center justify-center p-4">
            <div className="text-center">
              <CircuitBoard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a component to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSchematic;