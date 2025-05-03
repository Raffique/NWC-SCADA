import { Alarm, AlarmPriority } from '../contexts/NotificationContext';

// Generate a random date within the last 24 hours
const getRandomRecentDate = (hoursAgo = 24) => {
  const now = new Date();
  const pastTime = now.getTime() - Math.random() * hoursAgo * 60 * 60 * 1000;
  return new Date(pastTime);
};

// Get a random element from an array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Generate a random boolean with a bias towards false
const randomBoolean = (trueProbability = 0.3) => {
  return Math.random() < trueProbability;
};

// Sample data for alarm generation
const alarmSources = [
  'Kingston Main Reservoir',
  'Montego Bay Water Treatment Plant',
  'Mandeville Pump Station',
  'May Pen Distribution Network',
  'Spanish Town Water Tower',
  'Portmore Desalination Plant',
  'Ocho Rios Filtration System',
  'Savanna-la-Mar Network Node',
  'Port Antonio Pressure Station',
  'Kingston Harbor Intake',
];

const alarmTitles = {
  critical: [
    'Critical Pressure Detected',
    'System Shutdown Required',
    'Major Leak Detected',
    'Pump Failure',
    'Water Quality Critical',
  ],
  high: [
    'High Pressure Alert',
    'Low Water Level',
    'Pump Overheating',
    'Flow Rate Anomaly',
    'Chemical Dosing Error',
  ],
  medium: [
    'Unusual Pressure Reading',
    'Communications Delay',
    'Minor Flow Variation',
    'Sensor Calibration Required',
    'Power Fluctuation',
  ],
  low: [
    'Routine Maintenance Due',
    'Sensor Reading Drift',
    'Network Performance Degradation',
    'Minor Configuration Warning',
    'Documentation Update Required',
  ],
};

const alarmMessages = {
  critical: [
    'Immediate action required. System pressure exceeds safety threshold.',
    'Critical failure detected. System shutdown initiated to prevent damage.',
    'Major leak detected. Flow rate exceeds expected values by over 200%.',
    'Primary pump failure detected. Switch to backup systems initiated.',
    'Water quality parameters outside critical thresholds. Treatment interrupted.',
  ],
  high: [
    'Pressure exceeds normal operating range. Check system integrity.',
    'Water level below 15% threshold. Refill procedures should be initiated.',
    'Pump temperature exceeding normal operating range. Check cooling system.',
    'Unexpected flow rate detected. Possible infrastructure issue.',
    'Chemical dosing system reporting errors. Manual verification required.',
  ],
  medium: [
    'Pressure readings showing unusual patterns. Monitor system closely.',
    'Communications delays experienced. Check network connectivity.',
    'Minor variations in flow rate detected. Monitor for patterns.',
    'Sensor reporting potentially inaccurate values. Calibration recommended.',
    'Power supply showing fluctuations. No immediate impact on operations.',
  ],
  low: [
    'Scheduled maintenance reminder. Service due within 7 days.',
    'Minor sensor drift detected. Consider recalibration during next maintenance.',
    'Network performance slightly below optimal. No immediate action required.',
    'Configuration warning: outdated settings detected in non-critical system.',
    'System documentation requires updating to reflect recent changes.',
  ],
};

// Generate a mock alarm
const generateMockAlarm = (): Alarm => {
  const priorities: AlarmPriority[] = ['critical', 'high', 'medium', 'low'];
  const priority = getRandomElement(priorities);
  
  // Adjust probability of acknowledged and resolved based on priority
  let acknowledgedProbability = 0.5;
  let resolvedProbability = 0.3;
  
  if (priority === 'critical') {
    acknowledgedProbability = 0.8;
    resolvedProbability = 0.2;
  } else if (priority === 'low') {
    acknowledgedProbability = 0.3;
    resolvedProbability = 0.6;
  }
  
  const acknowledged = randomBoolean(acknowledgedProbability);
  const resolved = acknowledged ? randomBoolean(resolvedProbability) : false;
  
  return {
    id: generateId(),
    title: getRandomElement(alarmTitles[priority]),
    message: getRandomElement(alarmMessages[priority]),
    timestamp: getRandomRecentDate(),
    priority,
    source: getRandomElement(alarmSources),
    acknowledged,
    resolved,
  };
};

// Generate multiple mock alarms
export const generateMockAlarms = (count: number): Alarm[] => {
  return Array.from({ length: count }, () => generateMockAlarm())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate mock metrics for different points in time
export const generateTimeSeriesData = (
  hours = 24, 
  baseValue = 100, 
  volatility = 0.1,
  trend = 0.01 // positive for upward, negative for downward, 0 for flat
) => {
  const data = [];
  let currentValue = baseValue;
  
  const now = new Date();
  const timeStep = (hours * 60 * 60 * 1000) / 100; // 100 data points
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now.getTime() - (100 - i) * timeStep);
    
    // Add random variation + trend
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
    const trendFactor = 1 + (trend * i / 100);
    
    currentValue = currentValue * randomFactor * trendFactor;
    // Ensure no negative values
    currentValue = Math.max(0, currentValue);
    
    data.push({
      timestamp,
      value: currentValue,
    });
  }
  
  return data;
};