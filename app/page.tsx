"use client";

import React, { useState, useMemo, useCallback } from 'react';
{/* Using Lucide icons: Users, Briefcase, Gem (for First), Package (for Cargo), Clock, Plane, Maximize2 (for Capacity), Database (for Plane DB), ChevronDown, ChevronUp (NEW) */}
import { Plane, Users, Briefcase, Gem, Package, Clock, Maximize2, Database, ChevronDown, Check, X, Timer } from 'lucide-react';

{/* --- CONSTANTS --- */}

// Hardcoded sample database of common passenger aircraft (Modeled for Airlines Manager Tycoon)
// Format: { model: string, maxCapacity: number (All-Y), maxPayload: number (Tonnes) }
const PLANES_DB = [
  { model: 'Custom Aircraft (Enter Below)', maxCapacity: 0, maxPayload: 0 },
  { model: 'Airbus A380-800', maxCapacity: 853, maxPayload: 89.2 },
  { model: 'Boeing 747-8I', maxCapacity: 730, maxPayload: 76.0 },
  { model: 'Boeing 747-400', maxCapacity: 660, maxPayload: 67.50 },
  { model: 'Airbus A350-1000', maxCapacity: 522, maxPayload: 56.1 },
  { model: 'Airbus A350-900ULR', maxCapacity: 440, maxPayload: 44.0 },
  { model: 'Airbus A350-900XWB', maxCapacity: 475, maxPayload: 48.0 },
  { model: 'Boeing 777-300ER', maxCapacity: 550, maxPayload: 69.90 },
  { model: 'Airbus A321-200', maxCapacity: 220, maxPayload: 22.9 },
  { model: 'Boeing 737-800', maxCapacity: 189, maxPayload: 20.3 },
  { model: 'Boeing 787-9', maxCapacity: 330, maxPayload: 55.0 },
];

const SEAT_WEIGHTS = {
  E: 0.1,          /* Economy seat weight (Tonnes) */
  B: 0.12458253968253967, /* Business seat weight (Tonnes) - High Precision */
  F: 0.15,         /* First seat weight (Tonnes) */
  C: 1,            /* Cargo unit weight (Tonnes) */
};

const SEAT_SPACE_MULTIPLIERS = {
  E: 1,
  B: 2,
  F: 5,
};

const MAX_ROUND_TRIPS = 8;       /* Default limit for standard view */
const primaryColor = '#007BFF';  /* Used for inline styling consistency */
const darkTextColor = '#374151'; /* NEW: For high-contrast text on table data cells */
const MAX_DAILY_MINUTES = 1440;  /* 24 hours */

// Dropdown options for time selection
const HOURS_OPTIONS = Array.from({ length: 23 }, (_, i) => 2 + i); // 2 to 24 hours
const MINUTES_OPTIONS = [0, 15, 30, 45]; // 00, 15, 30, 45 minutes

{/* --- TYPES --- */}

type DemandKey = 'E' | 'B' | 'F' | 'C';
type DemandState = { [key in DemandKey]: string };

interface ConfigRow {
  roundTrips: number;
  E: number;
  B: number;
  F: number;
  C: number;
  totalPayload: number;
  totalSpaceUsed: number;
  isPayloadValid: boolean;
  isCapacityValid: boolean;
  limitingFactor: 'Payload' | 'Capacity' | 'Payload & Capacity' | null;
  remainingTimeMinutes?: number; // Optional field for when time limiting is enabled
}

interface AircraftStats {
  model: string;
  maxCapacity: number;
  maxPayload: number;
}

{/* --- HELPER FUNCTIONS --- */}

/**
 * Calculates the required seats, total payload, and total space used for a given demand and number of round trips.
 * Uses Math.floor() to round DOWN the required seats/cargo per flight segment.
 */
const calculateSeats = (parsedDemand: { [key: string]: number }, roundTrips: number) => {
  if (roundTrips <= 0) {
    return { 
        E: 0, B: 0, F: 0, C: 0, 
        totalPayload: 0, totalSpaceUsed: 0 
    };
  }

  {/* Divide daily demand by two-way flights (2 * roundTrips) */}
  const divisor = 2 * roundTrips;
  const requiredE = Math.floor(parsedDemand.E / divisor);
  const requiredB = Math.floor(parsedDemand.B / divisor);
  const requiredF = Math.floor(parsedDemand.F / divisor);
  const requiredC = Math.floor(parsedDemand.C / divisor);

  {/* Calculate payload required for this configuration */}
  const totalPayload = (
    requiredE * SEAT_WEIGHTS.E +
    requiredB * SEAT_WEIGHTS.B +
    requiredF * SEAT_WEIGHTS.F +
    requiredC * SEAT_WEIGHTS.C
  );

  {/* Calculate total space used (Economy-Equivalent Seats) */}
  const totalSpaceUsed = (
    requiredE * SEAT_SPACE_MULTIPLIERS.E +
    requiredB * SEAT_SPACE_MULTIPLIERS.B +
    requiredF * SEAT_SPACE_MULTIPLIERS.F
  );

  return {
    E: requiredE,
    B: requiredB,
    F: requiredF,
    C: requiredC,
    totalPayload,
    totalSpaceUsed,
  };
};

/**
 * Helper to convert total minutes back to h:m format for display.
 */
const formatTime = (totalMinutes: number) => {
    if (totalMinutes < 0) return 'OVERTIME';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
};


{/* --- REUSABLE COMPONENTS --- */}

interface InputFieldProps {
    icon: React.ReactNode; 
    label: string; 
    keyName: string; 
    value: string;
    onChange: (key: DemandKey, value: string) => void; 
    placeholder?: string;
    unit?: string;
}

const InputField = React.memo<InputFieldProps>(({ icon, label, keyName, value, onChange, placeholder, unit }) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%' }}>
      <label htmlFor={keyName} style={{ fontSize: '0.8125rem', fontWeight: '500', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', columnGap: '0.375rem', color: '#4B5563' }}>
        {icon}
        {label}
        {unit && <span style={{fontSize: '0.75rem', fontWeight: '400', color: '#6B7280'}}>({unit})</span>}
      </label>
      <input
        id={keyName}
        type="text"
        value={value}
        onChange={(e) => onChange(keyName as DemandKey, e.target.value)}
        style={{
          padding: '0.25rem 0.5rem', /* REDUCED vertical padding */
          height: '2.25rem', /* REDUCED height for compactness */
          border: '1px solid #D1D5DB',
          borderRadius: '0.375rem',
          outline: 'none',
          fontSize: '0.9375rem',
          transition: 'border-color 150ms',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          appearance: 'none',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => e.target.style.borderColor = primaryColor}
        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
        placeholder={placeholder}
      />
    </div>
));

InputField.displayName = 'InputField';

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, label: string }> = ({ checked, onChange, label }) => {
    // Dimensions
    const SWITCH_HEIGHT = '1.25rem'; // 20px
    const SWITCH_WIDTH = '2.5rem';   // 40px
    const CIRCLE_SIZE = '0.875rem';  // 14px
    const PADDING = '0.1875rem';     // 3px
    const ON_POSITION = '1.25rem';
    const OFF_POSITION = PADDING;

    return (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              height: SWITCH_HEIGHT,
              width: SWITCH_WIDTH,
              alignItems: 'center',
              borderRadius: '9999px',
              transition: 'all 200ms',
              outline: 'none',
              backgroundColor: checked ? primaryColor : 'white',
              cursor: 'pointer',
              border: '1px solid #D1D5DB',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = primaryColor}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                height: CIRCLE_SIZE,
                width: CIRCLE_SIZE,
                top: '50%',
                transform: 'translateY(-50%)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                left: checked ? ON_POSITION : OFF_POSITION,
                borderRadius: '9999px',
                backgroundColor: checked ? 'white' : '#D1D5DB',
                transition: 'left 200ms ease-in-out, background-color 200ms ease-in-out, transform 200ms ease-in-out',
              }}
            />
          </button>
          {label ? <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4B5563' }}>{label}</span> : null}
        </div>
    );
};

interface TimeDropdownProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: number[];
}

/**
 * Custom dropdown for hours or minutes, styled to match the rest of the inputs.
 */
const TimeDropdown: React.FC<TimeDropdownProps> = ({ label, value, onChange, options }) => {
    // Helper for padding the display value (e.g., '02' for 2)
    const formatValue = (num: number) => num.toString().padStart(2, '0');

    return (
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={label} style={{ fontSize: '0.8125rem', fontWeight: '500', marginBottom: '0.2rem', color: '#4B5563', display: 'block' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <select
                    id={label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        padding: '0.375rem 0.5rem',
                        height: '2.25rem',
                        border: '1px solid #D1D5DB',
                        borderRadius: '0.375rem',
                        outline: 'none',
                        fontSize: '0.9375rem',
                        width: '100%',
                        appearance: 'none',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        fontFamily: 'inherit',
                        paddingRight: '2.5rem',
                        cursor: 'pointer',
                        backgroundColor: 'white'
                    }}
                >
                    {options.map(num => (
                        <option key={num} value={num.toString()}>
                            {formatValue(num)}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={18}
                    color="#4B5563"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '0.5rem',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                    }}
                />
            </div>
        </div>
    );
};

/**
 * Renders the visual indicator for the limits check column.
 */
const renderLimitsCheck = (config: ConfigRow) => {
    if (!config.isPayloadValid && !config.isCapacityValid) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C' }}>
                <X size={18} />
                <span style={{ marginLeft: '0.3rem', fontSize: '0.75rem', fontWeight: 'bold' }}>BOTH</span>
            </div>
        );
    }
    if (!config.isPayloadValid) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C' }}>
                <X size={18} />
                <span style={{ marginLeft: '0.3rem', fontSize: '0.75rem', fontWeight: 'bold' }}>PAYLOAD</span>
            </div>
        );
    }
    if (!config.isCapacityValid) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C' }}>
                <X size={18} />
                <span style={{ marginLeft: '0.3rem', fontSize: '0.75rem', fontWeight: 'bold' }}>CAPACITY</span>
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Check size={18} />
        </div>
    );
};


{/* --- MAIN COMPONENT --- */}
const App: React.FC = () => {
  
  {/* State for user input demand (stored as strings) */}
  const [demand, setDemand] = useState<DemandState>({
    E: '2289', /* Economy */
    B: '404',  /* Business */
    F: '139',  /* First */
    C: '0',    /* Cargo */
  });
  
  {/* State for selected aircraft and custom inputs */}
  const [selectedPlaneModel, setSelectedPlaneModel] = useState<string>(PLANES_DB[4].model); // Default to Airbus A321-200
  const [customCapacity, setCustomCapacity] = useState<string>('0');
  const [customPayload, setCustomPayload] = useState<string>('0');

  {/* State for optional flight time limiting */}
  const [flightTimeHours, setFlightTimeHours] = useState<string>('2'); 
  const [flightTimeMinutes, setFlightTimeMinutes] = useState<string>('0'); 
  const [isTimeLimited, setIsTimeLimited] = useState<boolean>(false); 

  {/* Input Handler for Demand (Stable logic) */}
  const handleDemandChange = (key: DemandKey, value: string) => {
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setDemand(prev => ({ ...prev, [key]: value }));
    }
  };

  {/* Input Handler for Custom Stats */}
  const handleCustomStatChange = useCallback((key: 'capacity' | 'payload', value: string) => {
    if (/^\d*\.?\d*$/.test(value) || value === '') {
        if (key === 'capacity') {
            setCustomCapacity(value);
        } else {
            setCustomPayload(value);
        }
    }
  }, []);


  {/* MEMOIZED DERIVED STATE */}

  // 1. Get the current aircraft's capacity and payload
  const currentAircraft: AircraftStats = useMemo(() => {
    if (selectedPlaneModel === 'Custom Aircraft (Enter Below)') {
        return {
            model: selectedPlaneModel,
            maxCapacity: parseFloat(customCapacity) || 0,
            maxPayload: parseFloat(customPayload) || 0,
        };
    }
    // Find the plane in the DB
    const plane = PLANES_DB.find(p => p.model === selectedPlaneModel) || PLANES_DB[0];
    return plane;
  }, [selectedPlaneModel, customCapacity, customPayload]);

  // 2. Convert demand input strings to numbers
  const parsedDemand = useMemo(() => {
    return {
      E: parseFloat(demand.E) || 0,
      B: parseFloat(demand.B) || 0,
      F: parseFloat(demand.F) || 0,
      C: parseFloat(demand.C) || 0,
    };
  }, [demand]);


  // 3. Calculation results are memorized
  const configurations: ConfigRow[] = useMemo(() => {
    // Ensure the state values are parsed correctly as numbers
    const hours = parseInt(flightTimeHours) || 0;
    const minutes = parseInt(flightTimeMinutes) || 0;
    
    // Total Round Trip Cycle Time (A-B-A) in minutes
    const roundTripTimeInMins = (hours * 60) + minutes; 
    
    let flightsLimit: number;
    
    if (isTimeLimited && roundTripTimeInMins > 0) {
        if (roundTripTimeInMins > MAX_DAILY_MINUTES) {
            return [{ 
                roundTrips: -1, E: 0, B: 0, F: 0, C: 0, 
                totalPayload: 0, totalSpaceUsed: 0, 
                isPayloadValid: true, isCapacityValid: true, limitingFactor: null 
            }];
        }
        
        flightsLimit = Math.floor(MAX_DAILY_MINUTES / roundTripTimeInMins); 
    } else {
        flightsLimit = MAX_ROUND_TRIPS; 
    }

    flightsLimit = Math.max(0, flightsLimit); 
    
    const parsedMaxPayload = currentAircraft.maxPayload;
    const parsedMaxCapacity = currentAircraft.maxCapacity;

    const configs = [];
    for (let i = 1; i <= flightsLimit; i++) {
        const seats = calculateSeats(parsedDemand, i);
        
        // Constraint Checking
        const isPayloadValid = parsedMaxPayload === 0 || seats.totalPayload <= parsedMaxPayload;
        const isCapacityValid = parsedMaxCapacity === 0 || seats.totalSpaceUsed <= parsedMaxCapacity;
        
        let limitingFactor: 'Payload' | 'Capacity' | 'Payload & Capacity' | null = null;
        if (!isPayloadValid && !isCapacityValid) {
            limitingFactor = 'Payload & Capacity';
        } else if (!isPayloadValid) {
            limitingFactor = 'Payload';
        } else if (!isCapacityValid) {
            limitingFactor = 'Capacity';
        }

        // Fix for undefined usage: using Nullish Coalescing (??)
        const remainingTimeMins = roundTripTimeInMins > 0 
            ? MAX_DAILY_MINUTES - (roundTripTimeInMins * i) 
            : undefined;

        configs.push({
            roundTrips: i,
            ...seats,
            totalSpaceUsed: seats.totalSpaceUsed,
            isPayloadValid,
            isCapacityValid,
            limitingFactor,
            // Only include remainingTimeMinutes if time limiting is enabled AND a valid cycle time exists
            ...(isTimeLimited && roundTripTimeInMins > 0 ? {
              remainingTimeMinutes: remainingTimeMins
            } : {})
        });
    }
    return configs;
  }, [parsedDemand, flightTimeHours, flightTimeMinutes, isTimeLimited, currentAircraft]);

  
  // Calculate total cycle time for display in error messages
  const calculatedCycleTime = (parseInt(flightTimeHours) || 0) * 60 + (parseInt(flightTimeMinutes) || 0);
  const isTimeExceeded = configurations[0]?.roundTrips === -1;
  const isZeroFlightsPossible = isTimeLimited && calculatedCycleTime > 0 && configurations.length === 0 && !isTimeExceeded;

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{__html: `
        /* --- FONT FIX: Using Red Hat Display from Google Fonts --- */
        @import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;600;700;800&display=swap');
        
        /* Basic Tailwind-like reset for isolation */
        html, body {
          font-family: 'Red Hat Display', sans-serif; /* Applied the requested font */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Fixes for iFrame scroll */
        body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh;
          overflow: hidden;
          position: fixed;
          width: 100%;
        }
        /* Table Styles for Responsiveness and Aesthetics */
        .config-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 0.875rem; /* Small font size for density */
        }
        .config-table th, .config-table td {
            padding: 0.5rem 0.75rem;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
            vertical-align: middle;
        }
        .config-table th {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #4B5563;
            background-color: #F9FAFB;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .config-table tbody tr:last-child td {
            border-bottom: none;
        }
        .config-table tbody tr:hover {
            background-color: #F3F4F6;
        }
        .config-table tbody tr {
             transition: background-color 150ms;
        }
        
      `}} />
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem'
      }}>
      
      {/* Inner Card: Fixed width, vertically centered */}
      <div style={{ 
        width: '100%',
        maxWidth: '70rem',
        backgroundColor: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderRadius: '0.75rem',
        overflowY: 'auto',
        maxHeight: '98vh' // Leave a small gap
      }}>
          
          {/* Header Section */}
          <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'white', borderBottom: `2px solid ${primaryColor}` }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', columnGap: '0.375rem', marginBottom: '0.2rem' }}>
              <Plane size={20} color={primaryColor} />
              Airlines Manager Configurator
              <Plane size={20} color={primaryColor} />
            </h1>
            <p style={{ color: '#4B5563', fontSize: '0.8125rem' }}>
              Select an aircraft to automatically load its limits, then enter your route demand.
            </p>
          </div>

          <div style={{ padding: '1rem 1.5rem 0.75rem' }}>
            
            {/* 1. Aircraft Limits Selection */}
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1F2937', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.375rem' }}>
              1. Select Aircraft Model
            </h2>
            
            {/* Flex Container for Dropdown and Limits - Alignment adjusted to prevent field stretching the Limits Box */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1rem', 
                marginBottom: '1.5rem',
                alignItems: 'flex-start',
            }}>
                
                {/* LEFT/TOP SECTION (Plane Selector + Custom Inputs) */}
                <div style={{ 
                    flex: '1 1 55%', 
                    minWidth: '280px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem' 
                }}>
                    {/* Aircraft Dropdown Container */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor="plane-select" style={{ fontSize: '0.8125rem', fontWeight: '500', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', columnGap: '0.375rem', color: '#4B5563' }}>
                            <Database size={16} color="#059669" />
                            Choose Aircraft Model
                        </label>
                        {/* Wrapper for the Select and Icon */}
                        <div style={{ position: 'relative' }}>
                          <select
                              id="plane-select"
                              value={selectedPlaneModel}
                              onChange={(e) => setSelectedPlaneModel(e.target.value)}
                              style={{ 
                                  padding: '0.375rem 0.5rem', 
                                  height: '2.25rem', /* REDUCED height */
                                  border: '1px solid #D1D5DB', 
                                  borderRadius: '0.375rem', 
                                  outline: 'none', 
                                  fontSize: '0.9375rem', 
                                  width: '100%', 
                                  appearance: 'none', 
                                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                  fontFamily: 'inherit',
                                  paddingRight: '2.5rem', 
                                  cursor: 'pointer',
                              }}
                          >
                              {PLANES_DB.map((plane) => (
                                  <option key={plane.model} value={plane.model}>{plane.model}</option>
                              ))}
                          </select>
                          {/* Custom Dropdown Arrow Icon */}
                          <ChevronDown 
                            size={18} 
                            color="#4B5563" 
                            style={{ 
                                position: 'absolute', 
                                top: '50%', 
                                right: '0.5rem', 
                                transform: 'translateY(-50%)', 
                                pointerEvents: 'none' 
                            }} 
                          />
                        </div>
                    </div>

                    {/* Custom Input Fields (Conditional based on selection) */}
                    {selectedPlaneModel === 'Custom Aircraft (Enter Below)' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%' }}>
                              <label htmlFor="customCapacity" style={{ fontSize: '0.8125rem', fontWeight: '500', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', columnGap: '0.375rem', color: '#4B5563' }}>
                                  Max Capacity
                              </label>
                              <input
                                id="customCapacity"
                                type="text"
                                value={customCapacity}
                                onChange={(e) => handleCustomStatChange('capacity', e.target.value)}
                                style={{
                                  padding: '0.25rem 0.5rem', /* REDUCED vertical padding */
                                  height: '2.25rem', /* REDUCED height */
                                  border: '1px solid #D1D5DB',
                                  borderRadius: '0.375rem',
                                  outline: 'none',
                                  fontSize: '0.9375rem',
                                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                  fontFamily: 'inherit', 
                                }}
                                placeholder="e.g., 550"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%' }}>
                              <label htmlFor="customPayload" style={{ fontSize: '0.8125rem', fontWeight: '500', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', columnGap: '0.375rem', color: '#4B5563' }}>
                                  Max Payload (Tonnes)
                              </label>
                              <input
                                id="customPayload"
                                type="text"
                                value={customPayload}
                                onChange={(e) => handleCustomStatChange('payload', e.target.value)}
                                style={{
                                  padding: '0.25rem 0.5rem', /* REDUCED vertical padding */
                                  height: '2.25rem', /* REDUCED height */
                                  border: '1px solid #D1D5DB',
                                  borderRadius: '0.375rem',
                                  outline: 'none',
                                  fontSize: '0.9375rem',
                                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                  fontFamily: 'inherit', 
                                }}
                                placeholder="e.g., 85.3"
                              />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT/BOTTOM SECTION (Limits Box) */}
                <div style={{ 
                    flex: '1 1 35%', 
                    minWidth: '200px', 
                    display: 'flex', 
                    flexDirection: 'column',
                }}>
                    <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#4B5563', 
                        border: '1px dashed #D1D5DB', 
                        padding: '0.5rem 0.5rem',
                        borderRadius: '0.375rem', 
                        backgroundColor: '#F3F4F6',
                        lineHeight: '1.4',
                        display: 'flex',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        textAlign: 'center', 
                        height: '100%',
                    }}>
                        <span style={{ display: 'block' }}>
                            Max Capacity: {currentAircraft.maxCapacity.toLocaleString()} Seats 
                            <br/>
                            Max Payload: {currentAircraft.maxPayload.toFixed(2)} Tn
                        </span>
                    </p>
                </div>

            </div>
            {/* End of new Flex Container */}

            {/* 2. Demand Input Section */}
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1F2937', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.375rem' }}>
              2. Total Daily Route Demand
            </h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <InputField icon={<Users size={16} color="#22C55E" />} label="Economy" keyName="E" value={demand.E} onChange={handleDemandChange} placeholder="Daily Economy" />
              <InputField icon={<Briefcase size={16} color="#F59E0B" />} label="Business" keyName="B" value={demand.B} onChange={handleDemandChange} placeholder="Daily Business" />
              <InputField icon={<Gem size={16} color="#EF4444" />} label="First" keyName="F" value={demand.F} onChange={handleDemandChange} placeholder="Daily First" />
              <InputField icon={<Package size={16} color="#3B82F6" />} label="Cargo" keyName="C" value={demand.C} onChange={handleDemandChange} placeholder="Daily Cargo (Tn)" unit="Tn" />
            </div>
            
            <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', columnGap: '0.375rem', color: '#4B5563' }}>
                  <Clock size={16} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>Limit Flights by Time</span>
                </div>
                <ToggleSwitch 
                  checked={isTimeLimited} 
                  onChange={setIsTimeLimited} 
                  label=""
                />
              </div>
              
              {/* Animated Time Input Container */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateRows: isTimeLimited ? '1fr' : '0fr',
                  transition: 'grid-template-rows 300ms ease-in-out, opacity 300ms ease-in-out',
                  overflow: 'hidden',
                  opacity: isTimeLimited ? 1 : 0,
                  marginTop: isTimeLimited ? '0.375rem' : '0',
                }}
              >
                <div style={{ minHeight: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: '500', marginBottom: '0.2rem', color: '#4B5563', display: 'block' }}>
                    Total Round Trip Cycle Time (A-B-A)
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                      
                      {/* Hours Dropdown */}
                      <TimeDropdown
                          label="Hours (hh)"
                          value={flightTimeHours}
                          onChange={setFlightTimeHours}
                          options={HOURS_OPTIONS}
                      />

                      {/* Minutes Dropdown */}
                      <TimeDropdown
                          label="Minutes (mm)"
                          value={flightTimeMinutes}
                          onChange={setFlightTimeMinutes}
                          options={MINUTES_OPTIONS}
                      />
                  </div>
                  {/* FIX: Replaced 'doesn't' with 'doesn&apos;t' to resolve ESLint error 725:128 */}
                  <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.2rem' }}>This configurator currently doesn&apos;t support round trips longer than 24 hours. We are working on adding this feature in the future.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Comparison Table */}
          <div style={{ padding: '0.75rem 1.5rem 1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1F2937', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.375rem' }}>
              3. Results: Configuration Comparison
            </h2>
            
            {isTimeExceeded ? (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', fontWeight: '600' }}>
                <p>
                    <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                    Error: The entered round trip cycle time of {calculatedCycleTime} minutes is longer than 24 hours (1440 minutes). No flights are possible.
                </p>
              </div>
            ) : isZeroFlightsPossible ? (
              <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCD34D', fontWeight: '600' }}>
                <p>
                    <Timer size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                    Warning: With a cycle time of {calculatedCycleTime} minutes, you cannot complete even one round trip within 24 hours. Consider a shorter route or faster plane.
                </p>
              </div>
            ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                    <table className="config-table">
                        <thead>
                            <tr>
                                <th style={{ width: '8%' }}>
                                    <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> RT
                                </th>
                                <th style={{ width: '10%' }}>ECONOMY</th>
                                <th style={{ width: '10%' }}>BUSINESS</th>
                                <th style={{ width: '10%' }}>FIRST</th>
                                <th style={{ width: '10%' }}>CARGO</th>
                                <th style={{ width: '15%' }}>
                                    <Maximize2 size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> Space
                                </th>
                                <th style={{ width: '15%' }}>
                                    <Package size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> Payload
                                </th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Valid?</th>
                                {isTimeLimited && (
                                    <th style={{ width: '12%' }}>
                                        <Timer size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> Time Left
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {configurations.map((config, index) => {
                                const isRowInvalid = !config.isPayloadValid || !config.isCapacityValid;
                                
                                // Apply specific styling if invalid, otherwise stick to default dark text
                                const rowStyle: React.CSSProperties = isRowInvalid ? { 
                                    backgroundColor: '#FEF2F2', 
                                    color: '#991B1C', 
                                    fontWeight: '600' 
                                } : {
                                    color: darkTextColor // Default text color
                                };

                                return (
                                    <tr key={index} style={rowStyle}>
                                        <td style={{ fontWeight: '700' }}>{config.roundTrips}</td>
                                        <td>{config.E.toLocaleString()}</td>
                                        <td>{config.B.toLocaleString()}</td>
                                        <td>{config.F.toLocaleString()}</td>
                                        <td>{config.C.toFixed(2)}</td>
                                        <td>{config.totalSpaceUsed.toLocaleString()}</td>
                                        <td>{config.totalPayload.toFixed(2)}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {renderLimitsCheck(config)}
                                        </td>
                                        {isTimeLimited && (
                                            <td style={{ color: config.remainingTimeMinutes !== undefined && config.remainingTimeMinutes < 0 ? '#B91C1C' : darkTextColor }}>
                                                {config.remainingTimeMinutes !== undefined ? formatTime(config.remainingTimeMinutes) : 'N/A'}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
          </div> {/* End of section 3 padding div */}
        </div> {/* End of Inner Card */}
      </div> {/* End of Fixed Position Container */}
    </React.Fragment>
  );
};

export default App;
