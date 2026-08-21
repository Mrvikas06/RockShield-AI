import { RISK_THEME } from "../riskTheme.js";

export default function SectorMap({ sectors, activeSector, onSelect }) {
  const list = ["A01", "A02", "A03", "B01", "B02", "B03", "C01", "C02", "C03"];

  return (
    <div className="panel">
      <div className="map-header">
        <div>
          <h3 className="panel-title">Mine Wall Monitoring Map</h3>
          <p className="panel-subtitle">Landslide hazard risk grid coordinates</p>
        </div>
        <div className="map-status-legend">
          <div className="legend-item">
            <span className="legend-dot safe" />
            <span>Safe</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot warning" />
            <span>Warning</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot critical" />
            <span>Hazard Alert</span>
          </div>
        </div>
      </div>

      <div className="sector-grid">
        {list.map((sec) => {
          const d = sectors[sec] || { vibration: 0.1, displacement: 1.2, prediction: "LOW" };
          const active = sec === activeSector;
          const pred = d.prediction || "LOW";
          const theme = RISK_THEME[pred] || RISK_THEME.LOW;

          const isCritical = pred === "CRITICAL" || pred === "HIGH";
          const isWarning = pred === "MEDIUM";
          
          let stateClass = "safe-status";
          if (isCritical) stateClass = "critical-status";
          else if (isWarning) stateClass = "warning-status";

          return (
            <div
              key={sec}
              onClick={() => onSelect(sec)}
              className={`sector-cell ${stateClass} ${active ? "active-sector" : ""}`}
              style={{
                background: active 
                  ? "rgba(243, 63, 54, 0.05)" 
                  : "linear-gradient(135deg, var(--white) 0%, var(--neutral-white-fill) 100%)",
                border: active ? "1px solid var(--primary)" : "1px solid rgba(227, 227, 227, 0.6)",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 110,
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              {active && <div className="radar-sweep" />}

              <div className="sector-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span className="sector-name" style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--black)" }}>
                  SEC_{sec}
                </span>
                <span className={`sector-status-icon ${pred.toLowerCase()}`} style={{ fontSize: 10, fontWeight: 700, color: theme.color }}>
                  {theme.label}
                </span>
              </div>

              {/* Highly structured grid-aligned metrics table inside cell */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4, width: "100%", zIndex: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--dark-gray)" }}>
                  <span>VIBRATION:</span>
                  <span style={{ fontWeight: 600, color: "var(--black)" }}>{d.vibration?.toFixed(2)} mm/s</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--dark-gray)" }}>
                  <span>WALL TILT:</span>
                  <span style={{ fontWeight: 600, color: "var(--black)" }}>{d.displacement?.toFixed(1)} mm</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
