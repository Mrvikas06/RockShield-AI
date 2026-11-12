import { useEffect, useRef, useState } from "react";

export const DEFAULT_SCENARIOS = {
  Custom: null,
  "Safe Conditions": { slope: 28, displacement: 5, strain: 0.15, porePressure: 35, vibration: 0.15, rainfall: 5, crackScore: 0.1 },
  "Warning Conditions": { slope: 43, displacement: 13, strain: 0.55, porePressure: 68, vibration: 0.55, rainfall: 35, crackScore: 0.48 },
  "Critical Conditions": { slope: 52, displacement: 21, strain: 0.86, porePressure: 88, vibration: 0.82, rainfall: 65, crackScore: 0.82 },
};

const SLIDERS = [
  { key: "vibration", label: "Ground Vibration (Seismic)", unit: " mm/s", min: 0.05, max: 1.0, step: 0.01 },
  { key: "displacement", label: "Wall Movement (Tilt)", unit: " mm", min: 1, max: 25, step: 0.1 },
  { key: "slope", label: "Slope Steepness", unit: "°", min: 20, max: 60, step: 0.5 },
  { key: "porePressure", label: "Water Pressure / Moisture", unit: " kPa", min: 20, max: 100, step: 0.5 },
];

export { DEFAULT_SCENARIOS as SCENARIOS };

export default function SensorControls({ sensors, onChange, sector, onSector, sectors, scenario, onScenario, isAnalyzing, onRunAnalysis }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Sensor Tuning Overrides</h3>
          <p className="panel-subtitle">Manually test sensor parameters</p>
        </div>
      </div>

      <div className="slider-group">
        <div ref={dropdownRef} className="slider-container" style={{ position: "relative" }}>
          <label className="slider-label-row">
            <span>Active Mine Zone</span>
          </label>
          
          {/* Custom Glassmorphic React Dropdown Trigger */}
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inset-well mono"
            style={{
              width: "100%",
              color: "var(--black)",
              border: "1px solid var(--gray)",
              background: "var(--white)",
              padding: "10px 14px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8
            }}
          >
            <span>Sector {sector}</span>
            <svg 
              viewBox="0 0 24 24" 
              width="14" 
              height="14" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s ease"
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Custom Dropdown Options Overlay */}
          {isOpen && (
            <div 
              className="glass-panel" 
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 6,
                borderRadius: 8,
                zIndex: 100,
                maxHeight: 220,
                overflowY: "auto",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                animation: "slideUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) both"
              }}
            >
              {sectors.map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    onSector(s);
                    onRunAnalysis();
                    setIsOpen(false);
                  }}
                  className="mono"
                  style={{
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: s === sector ? 700 : 500,
                    color: s === sector ? "var(--primary)" : "var(--black)",
                    background: s === sector ? "rgba(243, 63, 54, 0.04)" : "transparent",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    if (s !== sector) e.target.style.background = "rgba(0, 0, 0, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (s !== sector) e.target.style.background = "transparent";
                  }}
                >
                  Sector {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {SLIDERS.map((s) => (
          <div className="slider-container" key={s.key}>
            <div className="slider-label-row">
              <span>{s.label}</span>
              <span className="slider-current-val">
                {sensors[s.key]?.toFixed(s.step < 1 ? 2 : 1)}
                {s.unit}
              </span>
            </div>
            <input
              type="range"
              className="custom-range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={sensors[s.key] || s.min}
              onChange={(e) => {
                onScenario("Custom");
                onChange({ ...sensors, [s.key]: parseFloat(e.target.value) });
              }}
            />
          </div>
        ))}

        <div className="slider-container">
          <label className="slider-label-row">
            <span>Simulation Scenarios Preset</span>
          </label>
          <div className="preset-group">
            <button
              className={`preset-btn ${scenario === "Safe Conditions" ? "active-preset safe-preset" : ""}`}
              onClick={() => {
                onScenario("Safe Conditions");
                onChange(DEFAULT_SCENARIOS["Safe Conditions"]);
                onRunAnalysis();
              }}
            >
              SAFE PRESET
            </button>
            <button
              className={`preset-btn ${scenario === "Warning Conditions" ? "active-preset warning-preset" : ""}`}
              onClick={() => {
                onScenario("Warning Conditions");
                onChange(DEFAULT_SCENARIOS["Warning Conditions"]);
                onRunAnalysis();
              }}
            >
              WARNING PRESET
            </button>
            <button
              className={`preset-btn ${scenario === "Critical Conditions" ? "active-preset critical-preset" : ""}`}
              onClick={() => {
                onScenario("Critical Conditions");
                onChange(DEFAULT_SCENARIOS["Critical Conditions"]);
                onRunAnalysis();
              }}
            >
              CRITICAL PRESET
            </button>
          </div>
        </div>

        <button 
          className="emergency-btn" 
          style={{ background: "var(--primary)", borderColor: "var(--primary)", marginTop: 12 }}
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "AI RUNNING CALCULATIONS..." : "TEST AI PREDICTION NOW"}
        </button>
      </div>
    </div>
  );
}
