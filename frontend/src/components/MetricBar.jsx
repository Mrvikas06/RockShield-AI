import { RISK_THEME } from "../riskTheme.js";

export default function MetricBar({ sector, prediction, danger, onSelectMetric }) {
  const theme = RISK_THEME[prediction] || RISK_THEME.LOW;
  const alarm = prediction === "HIGH" || prediction === "CRITICAL";

  let riskClass = "risk-safe";
  if (prediction === "MEDIUM") riskClass = "risk-warning";
  else if (alarm) riskClass = "risk-critical";

  const handleKeyDown = (callback) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  };

  const openZoneMetric = () => onSelectMetric({
    title: "Target Mine Zone",
    desc: "The active area of the open-pit mine being monitored",
    values: {
      "Active Sector": sector,
      "Zone Region": `Pit Wall Region ${sector[0]}`,
      "Updates Rate": "100 times per second",
      "Hardware Sensors Linked": "12 active array devices"
    }
  });

  const openRiskMetric = () => onSelectMetric({
    title: "AI Landslide Risk Prediction",
    desc: "The risk level predicted by our AI model",
    values: {
      "AI Prediction Level": prediction,
      "Low Risk Range": "Below 35% hazard chance",
      "Warning Risk Range": "Between 35% and 70% hazard chance",
      "Critical Risk Range": "Above 70% hazard chance"
    }
  });

  const openDangerMetric = () => onSelectMetric({
    title: "Landslide Probability Index",
    desc: "AI model's calculated percentage chance of a landslide event",
    values: {
      "Hazard Probability": `${danger.toFixed(1)}%`,
      "AI Calculation Basis": "Random Forest ensemble computing parameters",
      "Data Reliability Confidence": "High (94.2%)",
      "Vibration Impact Contribution": "48% weight share"
    }
  });

  const openNetMetric = () => onSelectMetric({
    title: "Sensor Network Health Status",
    desc: "Link synchronization health of the hardware devices on site",
    values: {
      "Network Connection": alarm ? "CRITICAL ALARM DETECTED" : "NOMINAL OPERATIONAL",
      "Ping Latency": "24 milliseconds",
      "Data Delivery Rate": "100% success rate",
      "Evacuation Alarms status": alarm ? "SIRENS ACTIVATED" : "STANDBY"
    }
  });

  return (
    <div className="metric-row">
      {/* Target Zone Detail Click Card */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Target Zone Sector ${sector}. Click to inspect.`}
        className="metric-card" 
        onClick={openZoneMetric}
        onKeyDown={handleKeyDown(openZoneMetric)}
        style={{ cursor: "pointer" }}
      >
        <span className="metric-label">Target Zone</span>
        <span className="metric-value mono">Sector {sector}</span>
      </div>

      {/* AI Risk Level Detail Click Card */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`AI Risk Level ${theme.label}. Click to inspect.`}
        className="metric-card" 
        onClick={openRiskMetric}
        onKeyDown={handleKeyDown(openRiskMetric)}
        style={{ cursor: "pointer" }}
      >
        <span className="metric-label">AI Risk Level</span>
        <span className={`metric-value mono ${riskClass}`}>
          {theme.icon} {theme.label}
        </span>
      </div>

      {/* Danger Share Detail Click Card */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Landslide Probability ${danger.toFixed(1)}%. Click to inspect.`}
        className="metric-card" 
        onClick={openDangerMetric}
        onKeyDown={handleKeyDown(openDangerMetric)}
        style={{ cursor: "pointer" }}
      >
        <span className="metric-label">Landslide Chance</span>
        <span className="metric-value mono">{danger.toFixed(1)}%</span>
        <div className="micro-bar">
          <div className="micro-bar-fill" style={{ width: `${danger}%`, background: theme.color }} />
        </div>
      </div>

      {/* Node Status Detail Click Card */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Sensor Network Health ${alarm ? "Alarm Active" : "Operational"}. Click to inspect.`}
        className="metric-card" 
        onClick={openNetMetric}
        onKeyDown={handleKeyDown(openNetMetric)}
        style={{ cursor: "pointer" }}
      >
        <span className="metric-label">Sensor Net Health</span>
        <span className="metric-value mono" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {alarm ? (
            <>
              <span className="node-status-glow" style={{ background: "var(--critical)", boxShadow: "0 0 8px var(--critical)", width: 8, height: 8, borderRadius: "50%", animation: "pulse-dot 1.5s infinite" }} />
              ALARM ACTIVE
            </>
          ) : (
            <>
              <span className="node-status-glow" style={{ background: "var(--safe)", boxShadow: "0 0 8px var(--safe)", width: 8, height: 8, borderRadius: "50%" }} />
              OPERATIONAL
            </>
          )}
        </span>
      </div>
    </div>
  );
}
