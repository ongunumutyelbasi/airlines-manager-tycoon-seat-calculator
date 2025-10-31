"use client";

import React, { useState, useMemo, useCallback } from 'react';
// Adding required icons for both calculator and sidebar
import { Plane, Users, Briefcase, Gem, Package, Clock, Maximize2, Database, ChevronDown, Check, X, Timer, LayoutDashboard, Settings, DollarSign } from 'lucide-react';

// --- TYPE DEFINITIONS ---

interface PlaneData {
  model: string;
  maxCapacity: number;
  maxPayload: number; // Tonnes
}

interface UserConfig {
  id: string;
  planeModel: string;
  maxCapacity: number;
  maxPayload: number;
  E: number; // Economy seats
  B: number; // Business seats
  F: number; // First seats
  C: number; // Cargo (Tonnes)
  timeLimitHours: number | null; // Null if no limit
  roundTrips: number;
  // Calculated fields (needed for initial state satisfaction)
  totalPayload: number;
  totalCapacity: number;
  isCapacityValid: boolean;
  isPayloadValid: boolean;
  remainingTimeMinutes?: number;
}

// --- CONSTANTS ---

const PLANES_DB: PlaneData[] = [
  { model: 'Custom Aircraft (Enter Below)', maxCapacity: 0, maxPayload: 0 },
  { model: 'Aérospatiale Caravelle 12', maxCapacity: 130, maxPayload: 13.0 },
  { model: 'Aérospatiale Concorde', maxCapacity: 128, maxPayload: 12.8 },
  { model: 'Airbus A220-100', maxCapacity: 135, maxPayload: 15.1 },
  { model: 'Airbus A220-300', maxCapacity: 160, maxPayload: 18.71 },
  { model: 'Airbus A300-600R', maxCapacity: 360, maxPayload: 36.0 },
  { model: 'Airbus A310-300', maxCapacity: 275, maxPayload: 27.5 },
  { model: 'Airbus A318-100', maxCapacity: 136, maxPayload: 13.6 },
  { model: 'Airbus A319-100', maxCapacity: 160, maxPayload: 16.0 },
];

const PASSENGER_WEIGHT_TONNE = 0.1; 
const CARGO_SLOT_WEIGHT_TONNE = 0.1; 
const FUEL_PER_ROUND_TRIP_HOURS = 16; 

// --- HELPER COMPONENTS: SIDEBAR ---

/**
 * Renders a single link item for the sidebar.
 * This is a standard functional component definition compatible with TypeScript.
 */
const SidebarLink: React.FC<{ href: string; icon: React.ReactNode; text: string }> = ({ href, icon, text }) => (
  <a
    href={href}
    className="flex items-center gap-3 p-3 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
    aria-label={text}
  >
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </a>
);

/**
 * Sidebar Navigation Component
 * This is the component you asked to add.
 */
const Sidebar: React.FC = () => (
  // Fixed width, dark background, sticky and full height, hidden on small screens
  <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 p-4 shadow-xl sticky top-0 h-screen">
    <div className="flex items-center gap-3 p-2 mb-8 border-b border-gray-800/50 pb-4">
      <Plane className="w-8 h-8 text-indigo-400" />
      <h1 className="text-xl font-bold text-white tracking-wider">Airlines Tycoon</h1>
    </div>
    <nav className="flex-1 space-y-2">
      <SidebarLink
        href="#calculator"
        icon={<DollarSign className="w-5 h-5" />}
        text="Cost Calculator"
      />
      <SidebarLink
        href="#planes"
        icon={<Database className="w-5 h-5" />}
        text="Aircraft Database"
      />
      <SidebarLink
        href="#settings"
        icon={<Settings className="w-5 h-5" />}
        text="Settings"
      />
    </nav>
    <div className="mt-auto pt-4 border-t border-gray-800/50">
      <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-400">v1.0</span>
      </p>
    </div>
  </aside>
);

// --- CALCULATOR CONTENT ---

// Note: This component is typed as React.FC, which is the TypeScript way to define
// a functional component.
const CalculatorContent: React.FC = () => {
  const [configs, setConfigs] = useState<UserConfig[]>([
    {
      id: crypto.randomUUID(),
      planeModel: PLANES_DB[4].model, 
      maxCapacity: PLANES_DB[4].maxCapacity,
      maxPayload: PLANES_DB[4].maxPayload,
      E: 100,
      B: 30,
      F: 0,
      C: 5,
      timeLimitHours: 7 * 24,
      roundTrips: 1,
      totalPayload: 0,
      totalCapacity: 0,
      isCapacityValid: true,
      isPayloadValid: true,
    },
  ]);

  const [planeDatabase, setPlaneDatabase] = useState<PlaneData[]>(PLANES_DB);
  const [customPlane, setCustomPlane] = useState<PlaneData>({ model: '', maxCapacity: 0, maxPayload: 0 });

  const darkTextColor = 'rgb(17, 24, 39)'; // Tailwind gray-900

  const isTimeLimited = useMemo(() => configs.some(c => c.timeLimitHours !== null), [configs]);

  const calculateConfig = useCallback((config: UserConfig): UserConfig => {
    const totalSeats = config.E + config.B + config.F;
    const totalPassengers = totalSeats * config.roundTrips;
    
    // Payload calculation
    const passengerPayload = totalPassengers * PASSENGER_WEIGHT_TONNE;
    const cargoPayload = config.C * CARGO_SLOT_WEIGHT_TONNE * config.roundTrips;
    const totalPayload = passengerPayload + cargoPayload;

    // Time calculation
    let remainingTimeMinutes: number | undefined = undefined;
    if (config.timeLimitHours !== null) {
      const totalFlightTime = config.roundTrips * FUEL_PER_ROUND_TRIP_HOURS;
      const remainingTime = (config.timeLimitHours * 60) - (totalFlightTime * 60);
      remainingTimeMinutes = remainingTime;
    }

    return {
      ...config,
      totalCapacity: config.maxCapacity,
      totalPayload: totalPayload,
      isCapacityValid: totalSeats <= config.maxCapacity,
      isPayloadValid: totalPayload <= config.maxPayload,
      remainingTimeMinutes: remainingTimeMinutes,
    } as UserConfig;
  }, []);

  const calculatedConfigs = useMemo(() => configs.map(calculateConfig), [configs, calculateConfig]);

  const updateConfig = useCallback(
    (id: string, field: keyof UserConfig, value: number | string | null) => {
      setConfigs(prevConfigs =>
        prevConfigs.map(config => (config.id === id ? { ...config, [field]: value } : config))
      );
    },
    []
  );

  const addConfig = useCallback(() => {
    const newConfig: UserConfig = {
      id: crypto.randomUUID(),
      planeModel: PLANES_DB[1].model,
      maxCapacity: PLANES_DB[1].maxCapacity,
      maxPayload: PLANES_DB[1].maxPayload,
      E: 100,
      B: 0,
      F: 0,
      C: 0,
      timeLimitHours: configs[0]?.timeLimitHours ?? 7 * 24,
      roundTrips: 1,
      totalPayload: 0,
      totalCapacity: 0,
      isCapacityValid: true,
      isPayloadValid: true,
    };
    setConfigs(prevConfigs => [...prevConfigs, newConfig]);
  }, [configs]);

  const deleteConfig = useCallback((id: string) => {
    setConfigs(prevConfigs => prevConfigs.filter(config => config.id !== id));
  }, []);

  const handlePlaneChange = useCallback((id: string, model: string) => {
    const selectedPlane = planeDatabase.find(p => p.model === model);
    if (selectedPlane) {
      updateConfig(id, 'planeModel', model);
      updateConfig(id, 'maxCapacity', selectedPlane.maxCapacity);
      updateConfig(id, 'maxPayload', selectedPlane.maxPayload);
    } else if (model === 'Custom Aircraft (Enter Below)') {
      updateConfig(id, 'planeModel', model);
      updateConfig(id, 'maxCapacity', 0);
      updateConfig(id, 'maxPayload', 0);
    }
  }, [planeDatabase, updateConfig]);

  const handleCustomPlaneUpdate = useCallback(() => {
    if (customPlane.model && customPlane.maxCapacity > 0 && customPlane.maxPayload > 0) {
      const newDB = planeDatabase.filter(p => p.model !== customPlane.model);
      setPlaneDatabase([...newDB, customPlane]);
    }
  }, [customPlane, planeDatabase]);

  const formatTime = (minutes: number) => {
    const sign = minutes < 0 ? '-' : '';
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = Math.round(absMinutes % 60);
    return `${sign}${hours}h ${mins}m`;
  };

  const renderLimitsCheck = (config: UserConfig) => {
    const isValid = config.isPayloadValid && config.isCapacityValid;
    const color = isValid ? '#059669' : '#B91C1C';
    const Icon = isValid ? Check : X;
    const tooltipText = isValid ? "Valid Configuration (Capacity and Payload are within limits)" : "Invalid Configuration (Capacity or Payload exceeds limits)";
    
    return (
      <div 
        style={{ color }} 
        className="flex justify-center"
        title={tooltipText} // Correct: Standard HTML title for tooltip
      >
        {/* FIX: Removed the problematic 'title' prop from the Icon component */}
        <Icon size={16} />
      </div>
    );
  };

  return (
    // This wrapper is now flow content, inside the main layout
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8"> 
      
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Aircraft Configuration Analyzer</h2>
        <p className="mt-1 text-gray-600">Simulate payload and capacity limits for different fleet configurations.</p>
      </header>

      {/* Custom Plane Input Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-indigo-600" /> Custom Aircraft Definition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Model Name (e.g., B787 Custom)"
            value={customPlane.model}
            onChange={(e) => setCustomPlane({ ...customPlane, model: e.target.value })}
            className="col-span-1 md:col-span-2 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
          <input
            type="number"
            placeholder="Max Capacity (Seats)"
            value={customPlane.maxCapacity || ''}
            onChange={(e) => setCustomPlane({ ...customPlane, maxCapacity: parseInt(e.target.value) || 0 })}
            className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Max Payload (Tonnes)"
            value={customPlane.maxPayload || ''}
            onChange={(e) => setCustomPlane({ ...customPlane, maxPayload: parseFloat(e.target.value) || 0 })}
            className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleCustomPlaneUpdate}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          disabled={!customPlane.model || customPlane.maxCapacity <= 0 || customPlane.maxPayload <= 0}
        >
          Add/Update Custom Plane to List
        </button>
      </div>

      {/* Configuration Cards */}
      <div className="space-y-6">
        {calculatedConfigs.map((config, index) => (
          <div key={config.id} className="bg-white p-6 rounded-xl shadow-lg border-2" style={{ borderColor: config.isPayloadValid && config.isCapacityValid ? '#D1FAE5' : '#FEE2E2' }}>
            <div className="flex justify-between items-start mb-4 border-b pb-3 border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Configuration #{index + 1} ({config.planeModel})
              </h4>
              <button onClick={() => deleteConfig(config.id)} className="text-red-500 hover:text-red-700 transition-colors p-1" aria-label="Delete configuration">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft Model</label>
                <select
                  value={config.planeModel}
                  onChange={(e) => handlePlaneChange(config.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                >
                  {planeDatabase.map(plane => (
                    <option key={plane.model} value={plane.model}>
                      {plane.model} (Cap: {plane.maxCapacity}, Load: {plane.maxPayload}T)
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Maximize2 className="w-4 h-4" /> Max Cap
                </label>
                <input
                  type="number"
                  value={config.maxCapacity || ''}
                  onChange={(e) => updateConfig(config.id, 'maxCapacity', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  disabled={config.planeModel !== 'Custom Aircraft (Enter Below)'}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Package className="w-4 h-4" /> Max Load (T)
                </label>
                <input
                  type="number"
                  value={config.maxPayload || ''}
                  onChange={(e) => updateConfig(config.id, 'maxPayload', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  disabled={config.planeModel !== 'Custom Aircraft (Enter Below)'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-t pt-4 border-gray-100">
              {/* Seat Inputs */}
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-600" /> Economy (E)
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.E || ''}
                  onChange={(e) => updateConfig(config.id, 'E', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-blue-600" /> Business (B)
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.B || ''}
                  onChange={(e) => updateConfig(config.id, 'B', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Gem className="w-4 h-4 text-yellow-600" /> First (F)
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.F || ''}
                  onChange={(e) => updateConfig(config.id, 'F', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Cargo, Trips, Time Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Package className="w-4 h-4 text-gray-600" /> Cargo (T Slots)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={config.C || ''}
                  onChange={(e) => updateConfig(config.id, 'C', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <ChevronDown className="w-4 h-4" /> Round Trips
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.roundTrips}
                  onChange={(e) => updateConfig(config.id, 'roundTrips', parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Timer className="w-4 h-4" /> Time Limit (H)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 168 (7 days)"
                  value={config.timeLimitHours || ''}
                  onChange={(e) => updateConfig(config.id, 'timeLimitHours', parseInt(e.target.value) || null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addConfig}
        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 mt-6"
      >
        Add Another Configuration
      </button>

      {/* Results Table */}
      {calculatedConfigs.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Results Summary</h3>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-xl overflow-hidden">
              <thead className="bg-indigo-50/50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Config</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Model</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Max Cap</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Trips</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">E/B/F</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cargo (T)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Load (T)</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Valid?</th>
                  {isTimeLimited && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time Left</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculatedConfigs.map((config, index) => (
                  <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">{config.planeModel}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">{config.maxCapacity.toLocaleString()}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">{config.roundTrips}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">{config.E}/{config.B}/{config.F}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">{config.C.toFixed(2)}</td>
                    <td className="px-3 py-4 text-sm text-gray-700" style={{ color: config.isPayloadValid ? darkTextColor : '#B91C1C' }}>{config.totalPayload.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {renderLimitsCheck(config)}
                    </td>
                    {isTimeLimited && (
                      <td className="px-3 py-4 whitespace-nowrap text-sm" style={{ color: config.remainingTimeMinutes !== undefined && config.remainingTimeMinutes < 0 ? '#B91C1C' : darkTextColor }}>
                        {config.remainingTimeMinutes !== undefined ? formatTime(config.remainingTimeMinutes) : 'N/A'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APPLICATION LAYOUT ---

/**
 * The main App component which serves as the page.
 * It uses a flex layout to correctly position the Sidebar and Main content.
 */
const App: React.FC = () => {
  return (
    // Flex container to hold the sidebar and the main content side-by-side
    <div className="flex min-h-screen bg-gray-100">
      
      {/* 1. Sidebar Component: Fixed width, sticky, hidden on mobile (md:flex) */}
      <Sidebar />
      
      {/* 2. Main Content Area: Takes up remaining width, is scrollable */}
      <main id="calculator" className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <CalculatorContent />
        </div>
      </main>
    </div>
  );
};

export default App;
