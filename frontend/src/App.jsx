import { useEffect, useMemo, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Header from "./components/Header.jsx";
import SensorControls from "./components/SensorControls.jsx";
import SectorMap from "./components/SectorMap.jsx";
import MetricBar from "./components/MetricBar.jsx";
import { SensorAnalysisChart, FeatureImportanceChart, RiskRadar, StabilityTrendChart } from "./components/Charts.jsx";
import AlertPanel from "./components/AlertPanel.jsx";
import ModelInfoPanel from "./components/ModelInfoPanel.jsx";
import { fetchModelInfo, predict as apiPredict } from "./api.js";
import "./App.css";

const SECTOR_LIST = ["A01", "A02", "A03", "B01", "B02", "B03", "C01", "C02", "C03"];

const DEFAULT_SENSORS = { slope: 35, displacement: 8, strain: 0.3, porePressure: 45, vibration: 0.3, rainfall: 15, crackScore: 0.2 };

const TIMELINE_DATA = {
  live: { slope: 35, displacement: 8, strain: 0.3, porePressure: 45, vibration: 0.3, rainfall: 15, crackScore: 0.2 },
  t20: { slope: 45, displacement: 16, strain: 0.65, porePressure: 72, vibration: 0.65, rainfall: 42, crackScore: 0.58 },
  t40: { slope: 55, displacement: 23, strain: 0.88, porePressure: 90, vibration: 0.89, rainfall: 68, crackScore: 0.85 },
  t60: { slope: 25, displacement: 3, strain: 0.12, porePressure: 32, vibration: 0.12, rainfall: 8, crackScore: 0.08 }
};

export default function App() {
  const [sector, setSector] = useState("B02");
  const [scenario, setScenario] = useState("Custom");
  const [sensors, setSensors] = useState(DEFAULT_SENSORS);
  const [sectors, setSectors] = useState({});
  const [connected, setConnected] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [live, setLive] = useState(null); 
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Advanced features state
  const [timelinePoint, setTimelinePoint] = useState("live");
  const [vibrationRuleLimit, setVibrationRuleLimit] = useState(0.7);
  const [rainfallRuleLimit, setRainfallRuleLimit] = useState(50);
  const [notifications, setNotifications] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null); 

  useEffect(() => {
    fetchModelInfo().then(setModelInfo).catch(() => {});
  }, []);

  useEffect(() => {
    const socket = io("/", { path: "/socket.io" });
    socket.on("connect", () => {
      setConnected(true);
      addNotification("info", "Websocket data stream linked successfully.");
    });
    socket.on("disconnect", () => {
      setConnected(false);
      addNotification("warning", "Websocket stream disconnected.");
    });
    socket.on("sectors-init", (data) => setSectors(data));
    socket.on("sector-update", ({ sector: sec, data }) => {
      setSectors((prev) => ({ ...prev, [sec]: data }));
    });
    return () => socket.disconnect();
  }, []);

  // run prediction whenever sensors/sector change
  useEffect(() => {
    const id = setTimeout(() => {
      apiPredict({ ...sensors, sector })
        .then(setLive)
        .catch(() => {});
    }, 150);
    return () => clearTimeout(id);
  }, [sensors, sector]);

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [{ id, type, message }, ...prev].slice(0, 10)); 
  };

  const handleRunAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    addNotification("info", "AI Model processing stability telemetry...");
    setTimeout(() => {
      setIsAnalyzing(false);
      addNotification("success", "Analysis complete. Stability score updated.");
    }, 1200);
  }, []);

  const handleSectorSelect = useCallback(
    (sec) => {
      setSector(sec);
      const d = sectors[sec];
      if (d) {
        setSensors({
          slope: d.slope,
          displacement: d.displacement,
          strain: d.strain,
          porePressure: d.porePressure,
          vibration: d.vibration,
          rainfall: d.rainfall,
          crackScore: d.crackScore,
        });
        setScenario("Custom");
        handleRunAnalysis();
      }
    },
    [sectors, handleRunAnalysis]
  );

  // Handle timeline shifts
  const handleTimelineChange = (point) => {
    setTimelinePoint(point);
    setSensors(TIMELINE_DATA[point]);
    setScenario(`Timeline ${point.toUpperCase()}`);
    handleRunAnalysis();
    addNotification("info", `Rewound stability database state to ${point === "live" ? "Live Telemetry" : point.toUpperCase()}`);
  };

  const avgVibration = useMemo(() => {
    const vals = Object.values(sectors);
    if (!vals.length) return sensors.vibration;
    return vals.reduce((a, s) => a + (s.vibration || 0), 0) / vals.length;
  }, [sectors, sensors.vibration]);

  const prediction = live?.prediction || "LOW";
  const danger = live?.danger ?? 0;
  const probabilities = live?.probabilities;

  // Active Rule violations checks
  const ruleViolation = useMemo(() => {
    return sensors.vibration > vibrationRuleLimit || sensors.rainfall > rainfallRuleLimit;
  }, [sensors, vibrationRuleLimit, rainfallRuleLimit]);

  // Trigger notification if rule violation detected
  useEffect(() => {
    if (ruleViolation) {
      addNotification("warning", `Sensor limits exceeded safety alert limits!`);
    }
  }, [ruleViolation]);

  return (
    <div className="app-shell">
      <div className="contour-bg" />

      <Header 
        connected={connected} 
        avgVibration={avgVibration} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        notifications={notifications}
        clearNotifications={() => setNotifications([])}
      />

      <div className="layout">
        {/* Main Centered Content Pane */}
        <main className="scrollpane content">
          <div className="content-container">
            {/* Top Welcome Hero Banner Card */}
            <div className="panel animate-slideUp" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "28px 36px", borderLeft: "6px solid var(--primary)" }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: "var(--black)", letterSpacing: "-0.02em" }}>Mine Control Dashboard</h1>
                <p style={{ fontSize: 14, color: "var(--dark-gray)", margin: "8px 0 0 0", lineHeight: 1.5 }}>
                  Real-time Early Warning System mapping geological telemetry to AI prediction algorithms.
                </p>
              </div>
              
              {/* Rules Violation Alarm Widget */}
              {ruleViolation ? (
                <div className="mono" style={{
                  background: "rgba(243, 63, 54, 0.1)",
                  border: "1px solid var(--primary)",
                  color: "var(--primary)",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: "0 0 12px rgba(243, 63, 54, 0.2)",
                  animation: "pulse-dot 1.5s infinite"
                }}>
                  🚨 ALERT: DANGER LIMITS EXCEEDED
                </div>
              ) : (
                <div className="mono" style={{
                  background: "rgba(18, 182, 21, 0.08)",
                  border: "1px solid var(--success)",
                  color: "var(--success)",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", animation: "pulse-dot 1.5s infinite" }} />
                  SYSTEM STABLE
                </div>
              )}
            </div>

            <MetricBar sector={sector} prediction={prediction} danger={danger} onSelectMetric={setSelectedMetric} />

            {/* Dynamic Tab Rendering */}
            {activeTab === "dashboard" && (
              <>
                <div className="dashboard-grid">
                  {/* Left Column: Interactive Inputs */}
                  <div className="dashboard-column">
                    <SectorMap sectors={sectors} activeSector={sector} onSelect={handleSectorSelect} />
                    <SensorControls
                      sensors={sensors}
                      onChange={setSensors}
                      sector={sector}
                      onSector={handleSectorSelect}
                      sectors={SECTOR_LIST}
                      scenario={scenario}
                      onScenario={setScenario}
                      isAnalyzing={isAnalyzing}
                      onRunAnalysis={handleRunAnalysis}
                    />
                  </div>

                  {/* Right Column: AI Analysis Outcomes & Side-by-Side Sensor Feeds */}
                  <div className="dashboard-column">
                    {/* Side-by-Side Geotechnical Feeds */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      {/* Fault Line Sensor Feeds */}
                      <div className="panel" style={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }} onClick={() => setSelectedMetric({ title: "Fault Line Sensor Logs", desc: "Wall movement indicators", values: { "Active Faults": "3", "Shear Joint S01": "0.12 mm/yr", "Tension Gap T02": "1.4 mm", "Slip Ratio": "Normal" } })}>
                        <div>
                          <div className="panel-head" style={{ marginBottom: 12, paddingBottom: 8 }}>
                            <div>
                              <h3 className="panel-title" style={{ fontSize: 14 }}>Fault Line Feeds</h3>
                              <p className="panel-subtitle" style={{ fontSize: 9 }}>Tension & Wall Tilt</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Shear Joint S01</span>
                              <span className="mono" style={{ fontWeight: 600 }}>0.12 mm/yr</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Shear Joint S02</span>
                              <span className="mono" style={{ fontWeight: 600 }}>0.05 mm/yr</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Tension Gap T02</span>
                              <span className="mono" style={{ fontWeight: 600 }}>1.4 mm</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Tension Gap T03</span>
                              <span className="mono" style={{ fontWeight: 600 }}>0.8 mm</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Slip Velocity</span>
                              <span className="mono" style={{ color: "var(--success)", fontWeight: 600 }}>0.01 mm/hr</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wall Crack Acoustic Logs */}
                      <div className="panel" style={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }} onClick={() => setSelectedMetric({ title: "Acoustic Fracture Log", desc: "Micro-sound burst alerts in pit walls", values: { "Microphone Status": "ONLINE", "Sound Burst Index": "14 dB", "Log Status": "Clear" } })}>
                        <div>
                          <div className="panel-head" style={{ marginBottom: 12, paddingBottom: 8 }}>
                            <div>
                              <h3 className="panel-title" style={{ fontSize: 14 }}>Wall Crack Logs</h3>
                              <p className="panel-subtitle" style={{ fontSize: 9 }}>Acoustic sound bursts</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Sound Index</span>
                              <span className="mono" style={{ color: "var(--success)", fontWeight: 600 }}>14 dB (Safe)</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Peak Amplitude</span>
                              <span className="mono" style={{ fontWeight: 600 }}>18 dB</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Scan Rate</span>
                              <span className="mono" style={{ fontWeight: 600 }}>44 kHz</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Acoustic Bursts</span>
                              <span className="mono" style={{ fontWeight: 600 }}>3 events/hr</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                              <span>Last Fracture</span>
                              <span className="mono" style={{ fontWeight: 600 }}>12m ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Safety Protocols Card to fill height gap */}
                    <div className="panel animate-slideUp" style={{ animationDelay: "100ms" }}>
                      <div className="panel-head" style={{ marginBottom: 12, paddingBottom: 8 }}>
                        <div>
                          <h3 className="panel-title">Daily Safety Protocols</h3>
                          <p className="panel-subtitle">Inspections and checks for current shift</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                          <span style={{ color: "var(--dark-gray)" }}>Verify geophone sensor calibrations</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                          <span style={{ color: "var(--dark-gray)" }}>Clear pit wall drainage channel blockages</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                          <span style={{ color: "var(--dark-gray)" }}>Test warning siren broadcasts</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                          <span style={{ color: "var(--dark-gray)" }}>Inspect UAV drone battery banks</span>
                        </div>
                      </div>
                    </div>

                    <AlertPanel sector={sector} prediction={prediction} danger={danger} isAnalyzing={isAnalyzing} sensors={sensors} />
                  </div>
                </div>

                {/* Historical Timeline Playback Slider */}
                <div className="panel animate-slideUp">
                  <div className="panel-head">
                    <div>
                      <h3 className="panel-title">Landslide Simulation Time-Travel Playback</h3>
                      <p className="panel-subtitle">Rewind and inspect past landslide simulation logs</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 8 }}>
                    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--dark-gray)" }}>
                        <span>60 mins ago (Normal)</span>
                        <span>40 mins ago (Minor Cracks)</span>
                        <span>20 mins ago (Alert Rising)</span>
                        <span style={{ fontWeight: 700, color: "var(--primary)" }}>Present Status (Live Data)</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="3" 
                        step="1"
                        value={timelinePoint === "t60" ? 0 : timelinePoint === "t40" ? 1 : timelinePoint === "t20" ? 2 : 3}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const point = val === 0 ? "t60" : val === 1 ? "t40" : val === 2 ? "t20" : "live";
                          handleTimelineChange(point);
                        }}
                        className="custom-range"
                      />
                    </div>
                  </div>
                </div>

                {/* Problem-Solution & Flow Diagram Card */}
                <div className="panel animate-slideUp" style={{ animationDelay: "150ms", padding: "36px" }}>
                  <div className="panel-head" style={{ marginBottom: 24, paddingBottom: 16 }}>
                    <div>
                      <h3 className="panel-title" style={{ fontSize: 20 }}>System Architecture & Early Warning Pipeline</h3>
                      <p className="panel-subtitle">A detailed view of how sensor data is analyzed by the AI model to trigger warnings</p>
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 32 }}>
                    <div style={{ background: "rgba(243, 63, 54, 0.02)", padding: 20, borderRadius: 8, borderLeft: "4px solid var(--primary)" }}>
                      <span className="eyebrow" style={{ color: "var(--primary)", fontSize: 11, fontWeight: 700 }}>THE PROBLEM</span>
                      <h4 style={{ margin: "8px 0", fontSize: 16, color: "var(--black)" }}>Catastrophic Mining Wall Landslides</h4>
                      <p style={{ fontSize: 13, color: "var(--dark-gray)", lineHeight: 1.6, margin: 0 }}>
                        Open-pit mine walls are highly susceptible to sudden rockfalls and landslides caused by shifting soil pressure, ground vibrations, or heavy rainfall. Traditional inspections are done manually, causing warnings to be delayed until it is too late to save lives and machinery.
                      </p>
                    </div>
                    <div style={{ background: "rgba(55, 108, 251, 0.02)", padding: 20, borderRadius: 8, borderLeft: "4px solid var(--secondary)" }}>
                      <span className="eyebrow" style={{ color: "var(--secondary)", fontSize: 11, fontWeight: 700 }}>OUR AI SOLUTION</span>
                      <h4 style={{ margin: "8px 0", fontSize: 16, color: "var(--black)" }}>Real-Time Sensor Monitoring & Alarms</h4>
                      <p style={{ fontSize: 13, color: "var(--dark-gray)", lineHeight: 1.6, margin: 0 }}>
                        RockShield AI automatically monitors physical ground sensors. The data is piped instantly to our trained Random Forest AI model, which evaluates risk parameters and sounds site sirens within milliseconds when danger is detected.
                      </p>
                    </div>
                  </div>

                  {/* SVG Flowchart Diagram */}
                  <div style={{ padding: 24, background: "var(--neutral-white-fill)", borderRadius: 10, border: "1px dashed var(--gray)", marginBottom: 36 }}>
                    <svg viewBox="0 0 800 120" style={{ width: "100%", height: "auto", display: "block" }}>
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--grey-chateau)" />
                        </marker>
                      </defs>

                      {/* Box 1: Sensors */}
                      <rect x="10" y="25" width="150" height="70" rx="8" fill="var(--white)" stroke="var(--gray)" strokeWidth="1" />
                      <text x="85" y="50" fontFamily="var(--font-body)" fontSize="12" fontWeight="700" fill="var(--black)" textAnchor="middle">1. Ground Sensors</text>
                      <text x="85" y="68" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">Measures vibration,</text>
                      <text x="85" y="80" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">tilt and moisture</text>

                      {/* Arrow 1 */}
                      <line x1="160" y1="60" x2="200" y2="60" stroke="var(--gray)" strokeWidth="2" markerEnd="url(#arrow)" />

                      {/* Box 2: Stream */}
                      <rect x="210" y="25" width="150" height="70" rx="8" fill="var(--white)" stroke="var(--gray)" strokeWidth="1" />
                      <text x="285" y="50" fontFamily="var(--font-body)" fontSize="12" fontWeight="700" fill="var(--black)" textAnchor="middle">2. Live Data Link</text>
                      <text x="285" y="68" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">Pipes sensor data</text>
                      <text x="285" y="80" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">instantly to cloud</text>

                      {/* Arrow 2 */}
                      <line x1="360" y1="60" x2="400" y2="60" stroke="var(--gray)" strokeWidth="2" markerEnd="url(#arrow)" />

                      {/* Box 3: Model */}
                      <rect x="410" y="25" width="160" height="70" rx="8" fill="var(--white)" stroke="var(--secondary)" strokeWidth="1.5" />
                      <text x="490" y="50" fontFamily="var(--font-body)" fontSize="12" fontWeight="700" fill="var(--secondary)" textAnchor="middle">3. AI Risk Brain</text>
                      <text x="490" y="68" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">Analyzes data to</text>
                      <text x="490" y="80" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">predict slide risk</text>

                      {/* Arrow 3 */}
                      <line x1="570" y1="60" x2="610" y2="60" stroke="var(--gray)" strokeWidth="2" markerEnd="url(#arrow)" />

                      {/* Box 4: Alerts */}
                      <rect x="620" y="25" width="160" height="70" rx="8" fill="var(--white)" stroke="var(--primary)" strokeWidth="1.5" />
                      <text x="700" y="50" fontFamily="var(--font-body)" fontSize="12" fontWeight="700" fill="var(--primary)" textAnchor="middle">4. Siren Alarm</text>
                      <text x="700" y="68" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">Triggers lights,</text>
                      <text x="700" y="80" fontFamily="var(--font-mono)" fontSize="9" fill="var(--dark-gray)" textAnchor="middle">SMS, and site sirens</text>
                    </svg>
                  </div>

                  {/* Core Platform Features Summary Grid */}
                  <div>
                    <span className="eyebrow" style={{ color: "var(--black)", fontSize: 12, fontWeight: 700 }}>Key Dashboard Features</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginTop: 16 }}>
                      <div style={{ padding: 16, background: "var(--white)", borderRadius: 8, border: "1px solid var(--gray)" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--black)" }}>📡 Live Sensor Data</span>
                        <p style={{ fontSize: 12, color: "var(--dark-gray)", lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                          Streams soil ground vibration speeds and slope movement coordinates via continuous WebSockets.
                        </p>
                      </div>
                      <div style={{ padding: 16, background: "var(--white)", borderRadius: 8, border: "1px solid var(--gray)" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--black)" }}>🧠 Smart AI Predictions</span>
                        <p style={{ fontSize: 12, color: "var(--dark-gray)", lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                          Evaluates raw vibration and displacement levels to output instant risk predictions (Safe, Warning, Critical).
                        </p>
                      </div>
                      <div style={{ padding: 16, background: "var(--white)", borderRadius: 8, border: "1px solid var(--gray)" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--black)" }}>📅 Time Travel Logs</span>
                        <p style={{ fontSize: 12, color: "var(--dark-gray)", lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                          A history playback slider allows users to rewind telemetry to inspect data profiles from past shift events.
                        </p>
                      </div>
                      <div style={{ padding: 16, background: "var(--white)", borderRadius: 8, border: "1px solid var(--gray)" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--black)" }}>⚙️ Custom Safety Limits</span>
                        <p style={{ fontSize: 12, color: "var(--dark-gray)", lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                          Set custom trigger levels for ground vibration and rain moisture sensors to test alarm thresholds.
                        </p>
                      </div>
                      <div style={{ padding: 16, background: "var(--white)", borderRadius: 8, border: "1px solid var(--gray)" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--black)" }}>🗺️ Interactive Mine Map</span>
                        <p style={{ fontSize: 12, color: "var(--dark-gray)", lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                          A 9-sector mine coordinates map grid lets engineers inspect localized vibration and slide readings.
                        </p>
                      </div>
                      <div style={{ padding: 16, background: "var(--white)", borderRadius: 8, border: "1px solid var(--gray)" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--black)" }}>🔍 Inspect Sensor Metrics</span>
                        <p style={{ fontSize: 12, color: "var(--dark-gray)", lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
                          Click any card metric row or sensor index to toggle detail modals showing battery life and signal latency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "analytics" && (
              <div className="dashboard-grid">
                <div className="dashboard-column">
                  <SensorAnalysisChart sensors={sensors} />
                  <FeatureImportanceChart importance={modelInfo?.featureImportance} />
                </div>
                <div className="dashboard-column">
                  <RiskRadar probabilities={probabilities} />
                  <StabilityTrendChart danger={danger} />
                </div>
              </div>
            )}

            {activeTab === "diagnostics" && (
              <div className="dashboard-grid">
                <div className="dashboard-column">
                  <ModelInfoPanel info={modelInfo} />
                  
                  {/* Hardware Sensor Nodes Health Status Table */}
                  <div className="panel animate-slideUp">
                    <div className="panel-head">
                      <div>
                        <h3 className="panel-title">Sensor Health Log</h3>
                        <p className="panel-subtitle">Array battery levels and connection latency</p>
                      </div>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "var(--font-mono)", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--gray)", color: "var(--dark-gray)" }}>
                          <th style={{ padding: "6px 0" }}>Node</th>
                          <th style={{ padding: "6px 0" }}>Sector</th>
                          <th style={{ padding: "6px 0" }}>Signal</th>
                          <th style={{ padding: "6px 0" }}>Battery</th>
                          <th style={{ padding: "6px 0", textAlign: "right" }}>Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: "A01", ping: "12ms", bat: "94%", link: "ACTIVE", alert: false },
                          { id: "A02", ping: "18ms", bat: "89%", link: "ACTIVE", alert: false },
                          { id: "B02", ping: "24ms", bat: "78%", link: "WARNING", alert: true },
                          { id: "C03", ping: "19ms", bat: "88%", link: "ACTIVE", alert: false }
                        ].map((n) => (
                          <tr key={n.id} style={{ borderBottom: "1px dashed var(--gray)" }}>
                            <td style={{ padding: "8px 0", fontWeight: 700 }}>NODE_{n.id}</td>
                            <td style={{ padding: "8px 0" }}>Sector {n.id}</td>
                            <td style={{ padding: "8px 0" }}>{n.ping}</td>
                            <td style={{ padding: "8px 0", color: n.alert ? "var(--primary)" : "inherit" }}>{n.bat}</td>
                            <td style={{ padding: "8px 0", textAlign: "right", color: n.alert ? "var(--primary)" : "var(--success)", fontWeight: 700 }}>{n.link}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="dashboard-column">
                  {/* Alert Rules Configuration Panel */}
                  <div className="panel" style={{ marginBottom: 24 }}>
                    <div className="panel-head">
                      <div>
                        <h3 className="panel-title">Safety Alert Limits Configuration</h3>
                        <p className="panel-subtitle">Set trigger points for alarm activation</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 500 }}>
                          <span>Vibration Trigger Threshold</span>
                          <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{vibrationRuleLimit} mm/s</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.2" 
                          max="1.0" 
                          step="0.05" 
                          value={vibrationRuleLimit} 
                          onChange={(e) => setVibrationRuleLimit(parseFloat(e.target.value))}
                          className="custom-range"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 500 }}>
                          <span>Rainfall Trigger Threshold</span>
                          <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{rainfallRuleLimit} mm</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="80" 
                          step="5" 
                          value={rainfallRuleLimit} 
                          onChange={(e) => setRainfallRuleLimit(parseInt(e.target.value))}
                          className="custom-range"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <div>
                        <h3 className="panel-title">Active Telemetry Logs</h3>
                        <p className="panel-subtitle">Live system notifications</p>
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--dark-gray)", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gray)", paddingBottom: 6 }}>
                        <span>[INFO] Node cluster synchronization active.</span>
                        <span style={{ color: "var(--grey-chateau)" }}>Just now</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gray)", paddingBottom: 6 }}>
                        <span>[INFO] Live telemetry streaming on port 4000.</span>
                        <span style={{ color: "var(--grey-chateau)" }}>2m ago</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gray)", paddingBottom: 6 }}>
                        <span>[INFO] Random Forest trained on 3,000 samples.</span>
                        <span style={{ color: "var(--grey-chateau)" }}>15m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pit_image" && (
              <div className="dashboard-grid">
                <div className="dashboard-column">
                  <div className="panel animate-slideUp">
                    <div className="panel-head">
                      <div>
                        <h3 className="panel-title">Drone Camera Monitor</h3>
                        <p className="panel-subtitle">Live aerial photos tracking mine wall cracks</p>
                      </div>
                    </div>
                    <div style={{ width: "100%", maxHeight: "500px", overflow: "hidden", borderRadius: 8 }}>
                      <img 
                        src="/rockfall_open_pit.png" 
                        alt="Open Pit Rockfall Monitoring" 
                        style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} 
                      />
                    </div>
                  </div>
                </div>
                <div className="dashboard-column">
                  <div className="panel animate-slideUp" style={{ animationDelay: "50ms" }}>
                    <div className="panel-head">
                      <div>
                        <h3 className="panel-title">Drone Operations</h3>
                        <p className="panel-subtitle">UAV flight parameters and GPS coordinates</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--dark-gray)" }}>Flight Status</span>
                        <span className="mono" style={{ color: "var(--success)", fontWeight: 700 }}>NOMINAL SCANNING</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--dark-gray)" }}>GPS Coordinates</span>
                        <span className="mono" style={{ fontWeight: 600 }}>24.897° N, 78.432° E</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--dark-gray)" }}>Flight Speed</span>
                        <span className="mono" style={{ fontWeight: 600 }}>14.2 m/s</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--dark-gray)" }}>Battery charge</span>
                        <span className="mono" style={{ fontWeight: 600 }}>82%</span>
                      </div>
                    </div>
                  </div>

                  <div className="panel animate-slideUp" style={{ animationDelay: "150ms" }}>
                    <div className="panel-head">
                      <div>
                        <h3 className="panel-title">Drone Cameras & Sensors</h3>
                        <p className="panel-subtitle">Sensors mounted on the drone payload</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--dark-gray)" }}>LiDAR Laser Scanner</span>
                        <span className="mono" style={{ color: "var(--success)", fontWeight: 700 }}>SYNCHRONIZED</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--dark-gray)" }}>Thermal Heat Camera</span>
                        <span className="mono" style={{ color: "var(--success)", fontWeight: 700 }}>ONLINE</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--dark-gray)" }}>Data Link Status</span>
                        <span className="mono" style={{ color: "var(--success)", fontWeight: 700 }}>NOMINAL</span>
                      </div>
                    </div>
                  </div>

                  <div className="panel animate-slideUp" style={{ animationDelay: "250ms" }}>
                    <div className="panel-head">
                      <div>
                        <h3 className="panel-title">Thermal Risk Hotspots</h3>
                        <p className="panel-subtitle">Detected heat anomalies on the mine wall</p>
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--dark-gray)", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--gray)", paddingBottom: 6 }}>
                        <span>HOTSPOT_A03 (Wall crack detected)</span>
                        <span style={{ color: "var(--primary)", fontWeight: 700 }}>CRITICAL</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--gray)", paddingBottom: 6 }}>
                        <span>HOTSPOT_B02 (Minor crack detected)</span>
                        <span style={{ color: "var(--yellow)", fontWeight: 700 }}>WARNING</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <footer className="footer">
              RockShield AI — Early Landslide Warning System | SIH Project Command Center
            </footer>
          </div>
        </main>
      </div>

      {/* Glassmorphic Click-to-Inspect Modal */}
      {selectedMetric && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200
        }} onClick={() => setSelectedMetric(null)}>
          <div className="glass-panel" style={{
            width: "450px",
            borderRadius: 12,
            padding: 24,
            animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--gray)", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--black)" }}>{selectedMetric.title}</h3>
                <p style={{ fontSize: 11, color: "var(--dark-gray)", margin: "2px 0 0 0" }}>{selectedMetric.desc}</p>
              </div>
              <button onClick={() => setSelectedMetric(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "var(--dark-gray)" }}>&times;</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(selectedMetric.values).map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px dashed var(--gray)", paddingBottom: 6 }}>
                  <span style={{ color: "var(--dark-gray)" }}>{label}</span>
                  <span className="mono" style={{ fontWeight: 600, color: "var(--black)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
