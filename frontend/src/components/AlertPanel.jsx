import { CircularProgressChart } from "./Charts.jsx";
import { RISK_THEME } from "../riskTheme.js";

export default function AlertPanel({ sector, prediction, danger, isAnalyzing, sensors }) {
  const alarm = prediction === "HIGH" || prediction === "CRITICAL";
  const theme = RISK_THEME[prediction] || RISK_THEME.LOW;

  const groundSensors = sensors || { vibration: 0.3, displacement: 8, slope: 35, porePressure: 45 };

  // Simple sensor evaluation check logic
  const isVibAlert = groundSensors.vibration > 0.6;
  const isMovAlert = groundSensors.displacement > 15;
  const isSlopeAlert = groundSensors.slope > 45;
  const isWaterAlert = groundSensors.porePressure > 70;

  return (
    <div className="panel glow-border" style={{ border: `1px solid ${theme.color}`, position: "relative" }}>
      {isAnalyzing && <div className="scan-line-overlay" />}
      
      <div className="panel-head" style={{ borderBottomColor: "var(--gray)", textAlign: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h3 className="panel-title" style={{ textAlign: "center" }}>AI Landslide Risk Analysis</h3>
          <p className="panel-subtitle" style={{ textAlign: "center" }}>Predicting landslide hazards using multi-sensor inputs</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Centered animated circular progress ring */}
        <CircularProgressChart targetValue={danger} isProcessing={isAnalyzing} />

        {/* Live checklist replacing text paragraph */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px", background: "var(--neutral-white-fill)", borderRadius: 8, border: "1px dashed var(--gray)" }}>
          <span className="eyebrow" style={{ color: "var(--black)", textAlign: "left", display: "block" }}>Live Sensor Checks</span>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Vibration Check</span>
              <span className="mono" style={{ fontWeight: 600, color: isVibAlert ? "var(--primary)" : "var(--success)" }}>
                {isVibAlert ? "🚨 Too High" : "✓ Normal"} ({groundSensors.vibration?.toFixed(2)} mm/s)
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Wall Movement Check</span>
              <span className="mono" style={{ fontWeight: 600, color: isMovAlert ? "var(--primary)" : "var(--success)" }}>
                {isMovAlert ? "🚨 High Slide" : "✓ Normal"} ({groundSensors.displacement?.toFixed(1)} mm)
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Slope Steepness Check</span>
              <span className="mono" style={{ fontWeight: 600, color: isSlopeAlert ? "var(--primary)" : "var(--success)" }}>
                {isSlopeAlert ? "🚨 Too Steep" : "✓ Safe"} ({groundSensors.slope?.toFixed(1)}°)
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Water Pressure Check</span>
              <span className="mono" style={{ fontWeight: 600, color: isWaterAlert ? "var(--primary)" : "var(--success)" }}>
                {isWaterAlert ? "🚨 High Pressure" : "✓ Safe"} ({groundSensors.porePressure?.toFixed(1)} kPa)
              </span>
            </div>
          </div>
        </div>

        {/* Centered Risk Banner */}
        <div className={`risk-banner ${prediction.toLowerCase()}`} style={{ width: "100%", justifyContent: "center", textAlign: "center" }}>
          <span className="risk-banner-icon">{theme.icon}</span>
          <span>
            {isAnalyzing ? (
              <b>AI MODEL RUNNING CALCULATIONS...</b>
            ) : (
              <>
                <b>{prediction} RISK PREDICTED:</b> {alarm ? "Evacuation alert active for Sector " + sector : "Sensors record safe stable levels."}
              </>
            )}
          </span>
        </div>

        {alarm && !isAnalyzing && (
          <div className="mono" style={{ fontSize: 11, color: "var(--dark-gray)", textAlign: "center", maxWidth: "400px", lineHeight: 1.4 }}>
            <b>EVACUATION ACTION PLAN:</b> Evacuate all personnel from Sector {sector} immediately. Sound site sirens. Restrict traffic in neighboring areas.
          </div>
        )}
      </div>
    </div>
  );
}
