import { useState } from "react";

export default function ModelInfoPanel({ info }) {
  const [open, setOpen] = useState(false);
  if (!info) return null;
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">AI Brain Specs</h3>
          <p className="panel-subtitle">Details about our AI model accuracy and settings</p>
        </div>
      </div>
      
      <div className="diagnostics-grid">
        <div className="inset-well diagnostic-well">
          <span className="diagnostic-title">Prediction Success Rate</span>
          <span className="diagnostic-value">{info.accuracy != null ? `${(info.accuracy * 100).toFixed(1)}%` : "---"}</span>
        </div>
        <div className="inset-well diagnostic-well">
          <span className="diagnostic-title">AI Decision Trees</span>
          <span className="diagnostic-value">{info.nEstimators || 100}</span>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button 
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span>{open ? "[-] Hide System Details" : "[+] View System Details"}</span>
        </button>

        {open && (
          <div className="inset-well mono" style={{ marginTop: 12, fontSize: 11, display: "flex", flexDirection: "column", gap: 6, color: "var(--stone-300)" }}>
            <div><b>AI Method:</b> {info.algorithm || "Random Forest Classifier"}</div>
            <div><b>Training Data Records:</b> {info.trainSize} entries</div>
            <div><b>Test Data Records:</b> {info.testSize} entries</div>
            <div><b>Checked Sensors:</b> Ground Vibration, Wall Movement, Steepness, Water Pressure, Rain, Strain, Cracks</div>
            <p style={{ margin: "8px 0 0 0", color: "var(--stone-400)", lineHeight: 1.4 }}>
              This early warning prototype runs calculations instantly when sliders are tuned. Actual site deployment hooks up to physical ground geophones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
