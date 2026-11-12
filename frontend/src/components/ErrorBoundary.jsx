import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[RockShield ErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "var(--basalt-950)",
          fontFamily: "var(--font-body)",
          color: "var(--black)"
        }}>
          <div className="panel" style={{ maxWidth: 520, width: "100%", padding: 32, textAlign: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px 0", color: "var(--primary)" }}>
              Monitoring Session Interrupted
            </h2>
            <p style={{ fontSize: 13, color: "var(--dark-gray)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
              An unexpected display error occurred while rendering telemetry. Geotechnical systems remain operational.
            </p>
            <button
              onClick={this.handleReload}
              className="emergency-btn"
              style={{ margin: "0 auto", background: "var(--secondary)", borderColor: "var(--secondary)" }}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
