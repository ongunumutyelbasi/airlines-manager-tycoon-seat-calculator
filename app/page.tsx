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
} from "lucide-react";

/* --- CONSTANTS --- */
const PLANES_DB = [
  { model: "Custom Aircraft (Enter Below)", maxCapacity: 0, maxPayload: 0 },
  { model: "Airbus A320neo", maxCapacity: 195, maxPayload: 19.65 },
  { model: "Boeing 737-800", maxCapacity: 189, maxPayload: 20.3 },
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

  return { E: requiredE, B: requiredB, F: requiredF, C: requiredC, totalPayload, totalSpaceUsed };
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
        transition: "left 200ms",
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
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#F9FAFB",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#111827",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            marginBottom: "1rem",
          }}
        >
          Menu
        </h2>
        <Link
          href="/"
          style={{
            color: "#E5E7EB",
            marginBottom: "0.75rem",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>
        <Link
          href="/settings"
          style={{ color: "#E5E7EB", textDecoration: "none" }}
        >
          Settings
        </Link>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          backgroundColor: "white",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "800",
            color: "#1F2937",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Plane size={20} color={primaryColor} /> Airlines Manager Configurator
        </h1>

        {/* AIRCRAFT SELECTION */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Choose Aircraft Model</label>
          <select
            value={selectedPlaneModel}
            onChange={(e) => setSelectedPlaneModel(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.25rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            {PLANES_DB.map((p) => (
              <option key={p.model}>{p.model}</option>
            ))}
          </select>
        </div>

        {selectedPlaneModel === "Custom Aircraft (Enter Below)" && (
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <InputField
              label="Max Capacity"
              keyName="capacity"
              value={customCapacity}
              onChange={(k, v) => handleCustomStatChange("capacity", v)}
              icon={<Users size={14} />}
            />
            <InputField
              label="Max Payload"
              keyName="payload"
              value={customPayload}
              onChange={(k, v) => handleCustomStatChange("payload", v)}
              icon={<Package size={14} />}
            />
          </div>
        )}

        {/* DEMAND INPUTS */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <InputField
            icon={<Users size={16} color="#22C55E" />}
            label="Economy"
            keyName="E"
            value={demand.E}
            onChange={handleDemandChange}
          />
          <InputField
            icon={<Briefcase size={16} color="#F59E0B" />}
            label="Business"
            keyName="B"
            value={demand.B}
            onChange={handleDemandChange}
          />
          <InputField
            icon={<Gem size={16} color="#EF4444" />}
            label="First"
            keyName="F"
            value={demand.F}
            onChange={handleDemandChange}
          />
          <InputField
            icon={<Package size={16} color="#3B82F6" />}
            label="Cargo"
            keyName="C"
            value={demand.C}
            onChange={handleDemandChange}
            unit="Tn"
          />
        </div>

        {/* TIME LIMIT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Clock size={16} />
          <span>Limit Flights by Time</span>
          <ToggleSwitch checked={isTimeLimited} onChange={setIsTimeLimited} />
        </div>

        {isTimeLimited && (
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <TimeDropdown
              label="Hours (hh)"
              value={flightTimeHours}
              onChange={setFlightTimeHours}
              options={HOURS_OPTIONS}
            />
            <TimeDropdown
              label="Minutes (mm)"
              value={flightTimeMinutes}
              onChange={setFlightTimeMinutes}
              options={MINUTES_OPTIONS}
            />
          </div>
        )}

        {/* RESULTS TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ background: "#F3F4F6" }}>
              <th>RT</th>
              <th>Economy</th>
              <th>Business</th>
              <th>First</th>
              <th>Cargo</th>
              <th>Payload</th>
              <th>Valid?</th>
              {isTimeLimited && <th>Time Left</th>}
            </tr>
          </thead>
          <tbody>
            {configurations.map((c, i) => (
              <tr
                key={i}
                style={{
                  textAlign: "center",
                  borderBottom: "1px solid #E5E7EB",
                  color: darkTextColor,
                }}
              >
                <td>{c.roundTrips}</td>
                <td>{c.E}</td>
                <td>{c.B}</td>
                <td>{c.F}</td>
                <td>{c.C}</td>
                <td>{c.totalPayload.toFixed(2)}</td>
                <td style={{ color: c.isPayloadValid && c.isCapacityValid ? "#059669" : "#B91C1C" }}>
                  {c.isPayloadValid && c.isCapacityValid ? (
                    <Check size={16} />
                  ) : (
                    <X size={16} />
                  )}
                </td>
                {isTimeLimited && <td>{formatTime(c.remainingTimeMinutes ?? 0)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
