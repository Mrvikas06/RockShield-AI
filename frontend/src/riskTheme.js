export const RISK_THEME = {
  LOW: { color: "var(--safe)", glow: "var(--safe-glow)", label: "SAFE", icon: "●" },
  MEDIUM: { color: "var(--warning)", glow: "var(--warning-glow)", label: "WARNING", icon: "▲" },
  HIGH: { color: "var(--critical)", glow: "var(--critical-glow)", label: "CRITICAL", icon: "✕" },
  CRITICAL: { color: "var(--critical)", glow: "var(--critical-glow)", label: "CRITICAL", icon: "✕" },
};

export const RISK_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
