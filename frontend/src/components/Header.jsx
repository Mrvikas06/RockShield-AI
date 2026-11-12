import { useEffect, useRef, useState } from "react";

export default function Header({ connected, avgVibration, activeTab, onTabChange, notifications, clearNotifications }) {
  const [now, setNow] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

  // Dynamically calculate navigation underline based on active button bounding rect
  useEffect(() => {
    const activeEl = document.querySelector(".header-menu button.active-tab");
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <header className="header glass-panel">
      <div className="brand" style={{ flexShrink: 0 }}>
        <svg viewBox="0 0 40 40" width="28" height="28" style={{ flexShrink: 0 }}>
          <path
            d="M20 3 L35 12 V28 L20 37 L5 28 V12 Z"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
          />
          <path d="M20 12 L28 18 L23 26 L17 26 L12 18 Z" fill="var(--primary)" opacity="0.85" />
        </svg>
        <span className="brand-title">ROCKSHIELD AI</span>
      </div>

      {/* Center Navigation Links with dynamic sliding underline */}
      <nav className="header-nav" style={{ margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <ul className="header-menu" style={{ position: "relative", display: "flex", gap: 28, paddingBottom: 6 }}>
          <li>
            <button 
              onClick={() => onTabChange("dashboard")} 
              className={`tab-btn ${activeTab === "dashboard" ? "active-tab" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => onTabChange("analytics")} 
              className={`tab-btn ${activeTab === "analytics" ? "active-tab" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
            >
              AI Charts
            </button>
          </li>
          <li>
            <button 
              onClick={() => onTabChange("diagnostics")} 
              className={`tab-btn ${activeTab === "diagnostics" ? "active-tab" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
            >
              Safety Rules
            </button>
          </li>
          <li>
            <button 
              onClick={() => onTabChange("pit_image")} 
              className={`tab-btn ${activeTab === "pit_image" ? "active-tab" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
            >
              Drone Camera
            </button>
          </li>

          {/* Animated active underline line */}
          <div style={{
            position: "absolute",
            bottom: -2,
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            height: 3,
            backgroundColor: "var(--primary)",
            borderRadius: 2,
            transition: "left 0.35s cubic-bezier(0.16, 1, 0.3, 1), width 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "none"
          }} />
        </ul>
      </nav>

      {/* Right Telemetry Clock, Notification Bell & Status */}
      <div className="header-actions" style={{ flexShrink: 0, position: "relative" }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--dark-gray)", display: "flex", alignItems: "center", gap: 14 }}>
          {/* Notification Bell Icon Button */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isOpen ? "var(--primary)" : "var(--dark-gray)",
                transition: "color 0.2s"
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {notifications.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  boxShadow: "0 0 4px var(--primary)",
                  animation: "pulse-dot 1.5s infinite"
                }} />
              )}
            </button>

            {/* Glassmorphic Notification Dropdown Overlay */}
            {isOpen && (
              <div className="glass-panel" style={{
                position: "absolute",
                top: 36,
                right: -10,
                width: 280,
                maxHeight: 320,
                overflowY: "auto",
                zIndex: 100,
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                animation: "slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--gray)", paddingBottom: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "var(--black)" }}>Alarms</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        clearNotifications();
                        setIsOpen(false);
                      }}
                      style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 10, fontWeight: 600 }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: "16px 0", textAlign: "center", color: "var(--grey-chateau)", fontSize: 11 }}>
                    No alerts triggered
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                        <span style={{ color: "var(--black)", fontWeight: 500 }}>
                          [{n.type.toUpperCase()}] {n.message}
                        </span>
                        <span style={{ fontSize: 9, color: "var(--grey-chateau)" }}>
                          {new Date(n.id).toLocaleTimeString("en-IN", { hour12: false })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="status-pill inline" style={{ display: "flex", alignItems: "center", gap: 6, color: connected ? "var(--success)" : "var(--primary)", fontWeight: 600 }}>
            <span className="dot" style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "currentColor",
              display: "inline-block",
              animation: "pulse-dot 1.5s infinite"
            }} />
            {connected ? "LIVE FEED" : "OFFLINE"}
          </div>
          {typeof avgVibration === "number" && (
            <span style={{ borderLeft: "1px solid var(--gray)", paddingLeft: 12, fontWeight: 500 }}>
              SEISMIC: <span style={{ color: "var(--black)", fontWeight: 600 }}>{avgVibration.toFixed(2)} mm/s</span>
            </span>
          )}
          <span style={{ borderLeft: "1px solid var(--gray)", paddingLeft: 12, fontWeight: 500 }}>
            {now.toLocaleTimeString("en-IN", { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  );
}
