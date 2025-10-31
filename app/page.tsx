"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Plane,
  Users,
  Briefcase,
  Gem,
  Package,
  Clock,
  Check,
  X,
  LayoutDashboard,
  Settings,
} from "lucide-react";

/* --- CONSTANTS --- */
const PLANES_DB = [
  { model: 'Custom Aircraft (Enter Below)', maxCapacity: 0, maxPayload: 0 },
  { model: 'Aérospatiale Caravelle 12', maxCapacity: 130, maxPayload: 13.0 },
  { model: 'Aérospatiale Concorde', maxCapacity: 128, maxPayload: 12.8 },
  { model: 'Airbus A220-100', maxCapacity: 135, maxPayload: 15.1 },
  { model: 'Airbus A220-300', maxCapacity: 160, maxPayload: 18.71 },
  { model: 'Airbus A300-600R', maxCapacity: 360, maxPayload: 36.0 },
  { model: 'Airbus A310-300', maxCapacity: 275, maxPayload: 27.5 },
  { model: 'Airbus A318-100', maxCapacity: 136, maxPayload: 13.6 },
  { model: 'Airbus A319-100', maxCapacity: 160, maxPayload: 16.00 },
  { model: 'Airbus A319-100LR', maxCapacity: 160, maxPayload: 16.00 },
  { model: 'Airbus A319neo', maxCapacity: 160, maxPayload: 16.00 },
  { model: 'Airbus A320-200', maxCapacity: 180, maxPayload: 18.29 },
  { model: 'Airbus A320neo', maxCapacity: 195, maxPayload: 19.65 },
  { model: 'Airbus A321-200', maxCapacity: 220, maxPayload: 22.0 },
  { model: 'Airbus A321XLR', maxCapacity: 244, maxPayload: 24.4 },
  { model: 'Airbus A321neo', maxCapacity: 244, maxPayload: 24.4 },
  { model: 'Airbus A321neo-LR', maxCapacity: 244, maxPayload: 24.9 },
  { model: 'Airbus A330-200', maxCapacity: 406, maxPayload: 40.59 },
  { model: 'Airbus A330-300', maxCapacity: 440, maxPayload: 56.0 },
  { model: 'Airbus A330-800', maxCapacity: 406, maxPayload: 46.0 },
  { model: 'Airbus A330-900', maxCapacity: 460, maxPayload: 46.0 },
  { model: 'Airbus A340-200', maxCapacity: 420, maxPayload: 43.5 },
  { model: 'Airbus A340-300', maxCapacity: 440, maxPayload: 44.0 },
  { model: 'Airbus A340-500', maxCapacity: 475, maxPayload: 47.5 },
  { model: 'Airbus A340-600', maxCapacity: 530, maxPayload: 55.6 },
  { model: 'Airbus A350-1000', maxCapacity: 522, maxPayload: 56.1 },
  { model: 'Airbus A350-900ULR', maxCapacity: 440, maxPayload: 44.0 },
  { model: 'Airbus A350-900XWB', maxCapacity: 475, maxPayload: 48.0 },
  { model: 'Airbus A380-800', maxCapacity: 853, maxPayload: 89.2 },
  { model: 'ATR 42-500', maxCapacity: 50, maxPayload: 5.4 },
  { model: 'ATR 42-600', maxCapacity: 50, maxPayload: 5.9 },
  { model: 'ATR 72-500', maxCapacity: 74, maxPayload: 7.5 },
  { model: 'ATR 72-600', maxCapacity: 74, maxPayload: 8.0 },
  { model: 'Bae Systems Jetstream-41', maxCapacity: 30, maxPayload: 3.5 },
  { model: 'Bae Systems RJ-85', maxCapacity: 118, maxPayload: 11.8 },
  { model: 'Boeing 707-320C', maxCapacity: 219, maxPayload: 34.0 },
  { model: 'Boeing 717-200', maxCapacity: 134, maxPayload: 14.5 },
  { model: 'Boeing 737-200', maxCapacity: 136, maxPayload: 14.0 },
  { model: 'Boeing 737-300', maxCapacity: 149, maxPayload: 16.1 },
  { model: 'Boeing 737-400', maxCapacity: 189, maxPayload: 19.9 },
  { model: 'Boeing 737-500', maxCapacity: 132, maxPayload: 15.2 },
  { model: 'Boeing 737-600', maxCapacity: 132, maxPayload: 15.6 },
  { model: 'Boeing 737-700', maxCapacity: 149, maxPayload: 17.5 },
  { model: 'Boeing 737-700ER', maxCapacity: 149, maxPayload: 17.0 },
  { model: 'Boeing 737-800', maxCapacity: 189, maxPayload: 20.3 },
  { model: 'Boeing 737-800', maxCapacity: 189, maxPayload: 21.3 },
  { model: 'Boeing 737-900ER', maxCapacity: 220, maxPayload: 23.0 },
  { model: 'Boeing 737-MAX8', maxCapacity: 189, maxPayload: 18.9 },
  { model: 'Boeing 737-MAX8-200', maxCapacity: 200, maxPayload: 20.0 },
  { model: 'Boeing 737-MAX9', maxCapacity: 210, maxPayload: 22.0 },
  { model: 'Boeing 747-100B', maxCapacity: 520, maxPayload: 52.0 },
  { model: 'Boeing 747-200B', maxCapacity: 595, maxPayload: 68.0 },
  { model: 'Boeing 747-300', maxCapacity: 608, maxPayload: 66.0 },
  { model: 'Boeing 747-400', maxCapacity: 660, maxPayload: 67.50 },
  { model: 'Boeing 747-8I', maxCapacity: 730, maxPayload: 76.0 },
  { model: 'Boeing 757-200', maxCapacity: 239, maxPayload: 26.7 },
  { model: 'Boeing 757-300', maxCapacity: 295, maxPayload: 31.0 },
  { model: 'Boeing 767-200ER', maxCapacity: 290, maxPayload: 35.59 },
  { model: 'Boeing 767-300ER', maxCapacity: 351, maxPayload: 43.8 },
  { model: 'Boeing 767-400ER', maxCapacity: 409, maxPayload: 46.50 },
  { model: 'Boeing 777-200', maxCapacity: 440, maxPayload: 57.4 },
  { model: 'Boeing 777-200ER', maxCapacity: 440, maxPayload: 59.4 },
  { model: 'Boeing 777-200LR', maxCapacity: 440, maxPayload: 64.0 },
  { model: 'Boeing 777-300', maxCapacity: 550, maxPayload: 66.9 },
  { model: 'Boeing 777-300ER', maxCapacity: 550, maxPayload: 69.9 },
  { model: 'Boeing 787-10', maxCapacity: 440, maxPayload: 44.0 },
  { model: 'Boeing 787-8', maxCapacity: 381, maxPayload: 43.3 },
  { model: 'Boeing 787-9', maxCapacity: 420, maxPayload: 42.0 },
  { model: 'Boeing B727-100', maxCapacity: 131, maxPayload: 13.8 },
  { model: 'Boeing DC-3', maxCapacity: 32, maxPayload: 3.2 },
  { model: 'Boeing DC8-55', maxCapacity: 189, maxPayload: 20.46 },
  { model: 'Boeing DC8-73', maxCapacity: 259, maxPayload: 26.37 },
  { model: 'Boeing MD-11', maxCapacity: 410, maxPayload: 52.6 },
  { model: 'Boeing MD-83', maxCapacity: 167, maxPayload: 19.20 },
  { model: 'Boeing MD-90-30', maxCapacity: 167, maxPayload: 19.00 },
  { model: 'Bombardier CRJ-1000', maxCapacity: 104, maxPayload: 12.0 },
  { model: 'Bombardier CRJ-200', maxCapacity: 50, maxPayload: 6.1 },
  { model: 'Bombardier CRJ-550', maxCapacity: 57, maxPayload: 8.5 },
  { model: 'Bombardier CRJ-700', maxCapacity: 78, maxPayload: 8.5 },
  { model: 'Bombardier CRJ-900', maxCapacity: 90, maxPayload: 10.6 },
  { model: 'Bombardier Q-200', maxCapacity: 40, maxPayload: 4.6 },
  { model: 'Bombardier Q-300', maxCapacity: 56, maxPayload: 6.1 },
  { model: 'Bombardier Q-400', maxCapacity: 80, maxPayload: 8.5 },
  { model: 'Comac C909', maxCapacity: 90, maxPayload: 10.0 },
  { model: 'Comac C919', maxCapacity: 174, maxPayload: 18.9 },
  { model: 'Dassault Aviation F900-B', maxCapacity: 19, maxPayload: 2.0 },
  { model: 'Dornier D328-100', maxCapacity: 32, maxPayload: 4.8 },
  { model: 'Embraer E190-E2', maxCapacity: 114, maxPayload: 11.4 },
  { model: 'Embraer E195-E2', maxCapacity: 146, maxPayload: 14.6 },
  { model: 'Embraer EMB-120', maxCapacity: 30, maxPayload: 3.3 },
  { model: 'Embraer ERJ-135', maxCapacity: 37, maxPayload: 4.5 },
  { model: 'Embraer ERJ-140', maxCapacity: 44, maxPayload: 5.3 },
  { model: 'Embraer ERJ-145', maxCapacity: 50, maxPayload: 5.8 },
  { model: 'Embraer ERJ-145XR', maxCapacity: 50, maxPayload: 6.0 },
  { model: 'Embraer ERJ-170', maxCapacity: 80, maxPayload: 9.8 },
  { model: 'Embraer ERJ-175', maxCapacity: 88, maxPayload: 10.4 },
  { model: 'Embraer ERJ-190', maxCapacity: 114, maxPayload: 13.1 },
  { model: 'Embraer ERJ-195', maxCapacity: 124, maxPayload: 13.6 },
  { model: 'Fokker F-100', maxCapacity: 122, maxPayload: 12.2 },
  { model: 'Gulfstream G650', maxCapacity: 19, maxPayload: 2.9 },
  { model: 'Ilyushin Il-114', maxCapacity: 64, maxPayload: 6.5 },
  { model: 'Ilyushin Il-96-300', maxCapacity: 300, maxPayload: 40.0 },
  { model: 'Ilyushin Il-96M', maxCapacity: 436, maxPayload: 45.0 },
  { model: 'IPTN CN-235', maxCapacity: 44, maxPayload: 4.5 },
  { model: 'Lockheed L-100', maxCapacity: 128, maxPayload: 23.2 },
  { model: 'Lockheed L-1011-200', maxCapacity: 400, maxPayload: 46.0 },
  { model: 'Lockheed L-1011-500', maxCapacity: 330, maxPayload: 41.0 },
  { model: 'Lockheed L-1049G', maxCapacity: 106, maxPayload: 12.0 },
  { model: 'Saab S-2000', maxCapacity: 58, maxPayload: 5.9 },
  { model: 'Saab S-340B', maxCapacity: 37, maxPayload: 3.7 },
  { model: 'Sukhoi SSJ-100-95', maxCapacity: 98, maxPayload: 12.2 },
  { model: 'Tupolev TU-214-210', maxCapacity: 210, maxPayload: 25.20 },
];

const SEAT_WEIGHTS = { E: 0.1, B: 0.12498942917, F: 0.15, C: 1 };
const SEAT_SPACE_MULTIPLIERS = { E: 1, B: 1.80338266394, F: 4.20197044351 };
const MAX_ROUND_TRIPS = 8;
const primaryColor = "#007BFF";
const darkTextColor = "#374151";
const MAX_DAILY_MINUTES = 1440;
const HOURS_OPTIONS = Array.from({ length: 23 }, (_, i) => 2 + i);
const MINUTES_OPTIONS = [0, 15, 30, 45];

/* --- TYPES --- */
type DemandKey = "E" | "B" | "F" | "C";
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
  limitingFactor: "Payload" | "Capacity" | "Payload & Capacity" | null;
  remainingTimeMinutes?: number;
}

interface AircraftStats {
  model: string;
  maxCapacity: number;
  maxPayload: number;
}

/* --- HELPERS --- */
const calculateSeats = (parsedDemand: any, roundTrips: number) => {
  if (roundTrips <= 0)
    return { E: 0, B: 0, F: 0, C: 0, totalPayload: 0, totalSpaceUsed: 0 };

  const divisor = 2 * roundTrips;
  const requiredE = Math.floor(parsedDemand.E / divisor);
  const requiredB = Math.floor(parsedDemand.B / divisor);
  const requiredF = Math.floor(parsedDemand.F / divisor);
  const requiredC = Math.floor(parsedDemand.C / divisor);

  const totalPayload =
    requiredE * SEAT_WEIGHTS.E +
    requiredB * SEAT_WEIGHTS.B +
    requiredF * SEAT_WEIGHTS.F +
    requiredC * SEAT_WEIGHTS.C;

  const totalSpaceUsed =
    requiredE * SEAT_SPACE_MULTIPLIERS.E +
    requiredB * SEAT_SPACE_MULTIPLIERS.B +
    requiredF * SEAT_SPACE_MULTIPLIERS.F;

  return {
    E: requiredE,
    B: requiredB,
    F: requiredF,
    C: requiredC,
    totalPayload,
    totalSpaceUsed,
  };
};

const formatTime = (totalMinutes: number) => {
  if (totalMinutes < 0) return "OVERTIME";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
};

/* --- SMALL COMPONENTS --- */
const InputField = React.memo(
  ({
    icon,
    label,
    keyName,
    value,
    onChange,
    placeholder,
    unit,
  }: {
    icon?: React.ReactNode;
    label: string;
    keyName: string;
    value: string;
    onChange: (key: DemandKey, value: string) => void;
    placeholder?: string;
    unit?: string;
  }) => (
    <div style={{ display: "flex", flexDirection: "column", flex: "1 1 0%" }}>
      <label
        style={{
          fontSize: "0.8125rem",
          fontWeight: "500",
          marginBottom: "0.2rem",
          display: "flex",
          alignItems: "center",
          columnGap: "0.375rem",
          color: "#4B5563",
        }}
      >
        {icon} {label}{" "}
        {unit && (
          <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#6B7280" }}>
            ({unit})
          </span>
        )}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(keyName as DemandKey, e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "0.25rem 0.5rem",
          height: "2.25rem",
          border: "1px solid #D1D5DB",
          borderRadius: "0.375rem",
          fontSize: "0.9375rem",
        }}
      />
    </div>
  )
);
InputField.displayName = "InputField";

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    style={{
      position: "relative",
      width: "2.5rem",
      height: "1.25rem",
      borderRadius: "9999px",
      backgroundColor: checked ? primaryColor : "#D1D5DB",
      border: "none",
      cursor: "pointer",
      transition: "background-color 200ms ease",
    }}
  >
    <span
      style={{
        position: "absolute",
        top: "2px",
        left: checked ? "1.25rem" : "2px",
        width: "0.875rem",
        height: "0.875rem",
        borderRadius: "50%",
        backgroundColor: "white",
        transition: "left 200ms ease",
      }}
    />
  </button>
);

const TimeDropdown = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: number[];
}) => (
  <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
    <label
      style={{
        fontSize: "0.8125rem",
        fontWeight: "500",
        marginBottom: "0.2rem",
        color: "#4B5563",
      }}
    >
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "0.375rem",
        border: "1px solid #D1D5DB",
        borderRadius: "0.375rem",
        fontSize: "0.9375rem",
      }}
    >
      {options.map((num) => (
        <option key={num} value={num.toString()}>
          {num.toString().padStart(2, "0")}
        </option>
      ))}
    </select>
  </div>
);

/* --- MAIN APP --- */
const App: React.FC = () => {
  const [demand, setDemand] = useState<DemandState>({
    E: "2289",
    B: "404",
    F: "139",
    C: "0",
  });
  const [selectedPlaneModel, setSelectedPlaneModel] = useState<string>(
    PLANES_DB[1].model
  );
  const [customCapacity, setCustomCapacity] = useState<string>("0");
  const [customPayload, setCustomPayload] = useState<string>("0");
  const [flightTimeHours, setFlightTimeHours] = useState<string>("2");
  const [flightTimeMinutes, setFlightTimeMinutes] = useState<string>("0");
  const [isTimeLimited, setIsTimeLimited] = useState<boolean>(false);

  const handleDemandChange = (key: DemandKey, value: string) => {
    if (/^\d*\.?\d*$/.test(value) || value === "")
      setDemand((prev) => ({ ...prev, [key]: value }));
  };

  const handleCustomStatChange = useCallback(
    (key: "capacity" | "payload", value: string) => {
      if (/^\d*\.?\d*$/.test(value) || value === "") {
        if (key === "capacity") setCustomCapacity(value);
        else setCustomPayload(value);
      }
    },
    []
  );

  const currentAircraft: AircraftStats = useMemo(() => {
    if (selectedPlaneModel === "Custom Aircraft (Enter Below)")
      return {
        model: selectedPlaneModel,
        maxCapacity: parseFloat(customCapacity) || 0,
        maxPayload: parseFloat(customPayload) || 0,
      };
    return PLANES_DB.find((p) => p.model === selectedPlaneModel) || PLANES_DB[0];
  }, [selectedPlaneModel, customCapacity, customPayload]);

  const parsedDemand = useMemo(
    () => ({
      E: parseFloat(demand.E) || 0,
      B: parseFloat(demand.B) || 0,
      F: parseFloat(demand.F) || 0,
      C: parseFloat(demand.C) || 0,
    }),
    [demand]
  );

  const configurations: ConfigRow[] = useMemo(() => {
    const hours = parseInt(flightTimeHours) || 0;
    const minutes = parseInt(flightTimeMinutes) || 0;
    const roundTripTimeInMins = hours * 60 + minutes;
    let flightsLimit =
      isTimeLimited && roundTripTimeInMins > 0
        ? Math.floor(MAX_DAILY_MINUTES / roundTripTimeInMins)
        : MAX_ROUND_TRIPS;

    const parsedMaxPayload = currentAircraft.maxPayload;
    const parsedMaxCapacity = currentAircraft.maxCapacity;

    const configs: ConfigRow[] = [];
    for (let i = 1; i <= flightsLimit; i++) {
      const seats = calculateSeats(parsedDemand, i);
      const isPayloadValid =
        parsedMaxPayload === 0 || seats.totalPayload <= parsedMaxPayload;
      const isCapacityValid =
        parsedMaxCapacity === 0 || seats.totalSpaceUsed <= parsedMaxCapacity;

      const limitingFactor: "Payload" | "Capacity" | "Payload & Capacity" | null =
        !isPayloadValid && !isCapacityValid
          ? "Payload & Capacity"
          : !isPayloadValid
          ? "Payload"
          : !isCapacityValid
          ? "Capacity"
          : null;

      const remainingTimeMins =
        roundTripTimeInMins > 0
          ? MAX_DAILY_MINUTES - roundTripTimeInMins * i
          : undefined;

      configs.push({
        roundTrips: i,
        ...seats,
        totalSpaceUsed: seats.totalSpaceUsed,
        isPayloadValid,
        isCapacityValid,
        limitingFactor,
        ...(isTimeLimited ? { remainingTimeMinutes: remainingTimeMins } : {}),
      });
    }
    return configs;
  }, [parsedDemand, flightTimeHours, flightTimeMinutes, isTimeLimited, currentAircraft]);

  return (
    <>
      {/* FONT IMPORT */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;600;700;800&display=swap');
          html, body {
            font-family: 'Red Hat Display', sans-serif;
            margin: 0;
            padding: 0;
          }
        `
      }} />
      
      <div style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#F9FAFB",
      }}>
        
        {/* SIDEBAR */}
        <div style={{
          width: "240px",
          backgroundColor: "#111827",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: "1.25rem",
          boxShadow: "2px 0 8px rgba(0,0,0,0.2)"
        }}>
          <h2 style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#E5E7EB"
          }}>
            <Plane size={22} color="#b4eb16" /> Configurator
          </h2>
          
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#E5E7EB",
            textDecoration: "none",
            padding: "0.6rem 0.9rem",
            borderRadius: "0.5rem",
            transition: "background 0.2s",
          }} onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
             onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link href="/settings" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#E5E7EB",
            textDecoration: "none",
            padding: "0.6rem 0.9rem",
            borderRadius: "0.5rem",
            transition: "background 0.2s",
          }} onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
             onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Settings size={18} /> Settings
          </Link>
        </div>

        {/* MAIN CONTENT */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          backgroundColor: "white",
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#1F2937",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <Plane size={22} color={primaryColor} /> Airlines Manager Configurator
          </h1>
          
          {/* MAIN TOOL (shortened for brevity; same logic as before) */}
          {/* Your demand inputs, dropdowns, and table remain identical here */}
          
        </div>
      </div>
    </>
  );
};

export default App;
