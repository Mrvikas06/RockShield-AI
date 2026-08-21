import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import { RISK_THEME } from "../riskTheme.js";

const AXIS_STYLE = { fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--dark-gray)", fontWeight: 500 };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid var(--gray)",
        borderRadius: 8,
        padding: "8px 12px",
        boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.05)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
      }}>
        <div style={{ fontWeight: 600, color: "var(--black)", marginBottom: 4 }}>{label}</div>
        <div style={{ color: "var(--primary)", fontWeight: 700 }}>
          Value: {payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};

// Dynamic historical line chart tracking active stability index
export function StabilityTrendChart({ danger = 0 }) {
  const data = [
    { time: "T-60m", value: 12 },
    { time: "T-45m", value: Math.max(0, +(danger * 0.4).toFixed(1)) },
    { time: "T-30m", value: Math.max(0, +(danger * 0.65).toFixed(1)) },
    { time: "T-15m", value: Math.max(0, +(danger * 0.85).toFixed(1)) },
    { time: "Live Index", value: Math.round(danger) }
  ];

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Stability Trend Over Time</h3>
          <p className="panel-subtitle">Landslide probability history logs</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 8, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--gray)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={{ stroke: "var(--gray)" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={AXIS_STYLE} axisLine={{ stroke: "var(--gray)" }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ stroke: "var(--primary)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Large animated circular progress score component
export function CircularProgressChart({ targetValue = 0, isProcessing = false }) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      setCurrentValue(0);
      return;
    }
    let start = 0;
    const end = Math.round(targetValue);
    if (start === end) {
      setCurrentValue(end);
      return;
    }

    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += 1;
      setCurrentValue(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 10));

    return () => clearInterval(timer);
  }, [targetValue, isProcessing]);

  let strokeColor = "var(--success)";
  if (isProcessing) strokeColor = "var(--secondary)";
  else if (targetValue > 70) strokeColor = "var(--primary)";
  else if (targetValue > 35) strokeColor = "var(--yellow)";

  const radius = 60;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentValue / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 0" }}>
      <div style={{ position: "relative", width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: "rotate(-90deg)" }}>
          <circle
            stroke="var(--seashell-white)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "var(--black)", fontFamily: "var(--font-mono)" }}>
            {isProcessing ? "---" : `${currentValue}%`}
          </span>
          <span style={{ fontSize: 8, color: "var(--dark-gray)", fontWeight: 600, letterSpacing: "0.05em", textAnchor: "middle", textTransform: "uppercase" }}>
            {isProcessing ? "SCANNING" : "HAZARD RISK"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SensorAnalysisChart({ sensors }) {
  const data = [
    { name: "Steepness", value: +((sensors.slope - 20) / 40).toFixed(2) },
    { name: "Movement", value: +((sensors.displacement - 1) / 24).toFixed(2) },
    { name: "Stretching", value: +sensors.strain.toFixed(2) },
    { name: "Water Pressure", value: +((sensors.porePressure - 20) / 80).toFixed(2) },
    { name: "Vibration", value: +sensors.vibration.toFixed(2) },
    { name: "Rainfall", value: +(sensors.rainfall / 80).toFixed(2) },
    { name: "Cracks", value: +sensors.crackScore.toFixed(2) },
  ];
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Sensor Risk Levels</h3>
          <p className="panel-subtitle">Normalized live sensor metrics</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--gray)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={{ stroke: "var(--gray)" }} tickLine={false} />
          <YAxis domain={[0, 1]} tick={AXIS_STYLE} axisLine={{ stroke: "var(--gray)" }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#areaGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FeatureImportanceChart({ importance }) {
  if (!importance) return null;
  const FEATURE_MAP = {
    vibration: "Vibration",
    displacement: "Wall Movement",
    slope: "Steepness",
    porePressure: "Water Pressure",
    rainfall: "Rainfall",
    crackScore: "Wall Cracks",
    strain: "Stretching"
  };
  const data = importance.map((d) => ({
    name: FEATURE_MAP[d.feature] || d.feature,
    value: +(d.importance * 100).toFixed(1)
  }));
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Main Risk Factors (AI Weight)</h3>
          <p className="panel-subtitle">What the AI model cares about most</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="var(--secondary)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--gray)" horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tick={AXIS_STYLE} axisLine={{ stroke: "var(--gray)" }} tickLine={false} />
          <YAxis dataKey="name" type="category" width={80} tick={AXIS_STYLE} axisLine={{ stroke: "var(--gray)" }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.01)" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="url(#barGradient)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskRadar({ probabilities }) {
  if (!probabilities) return null;
  const order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const data = order.map((k) => ({ level: k, value: +(probabilities[k] * 100).toFixed(1) }));
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">AI Vote Distribution</h3>
          <p className="panel-subtitle">Voter percentage splits for risk levels</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} outerRadius={70}>
          <PolarGrid stroke="var(--gray)" />
          <PolarAngleAxis dataKey="level" tick={AXIS_STYLE} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ ...AXIS_STYLE, fontSize: 8 }} axisLine={false} />
          <Radar dataKey="value" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.15} />
          <Tooltip
            contentStyle={{
              background: "var(--white)",
              border: "1px solid var(--gray)",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="prob-list mono" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11, marginTop: 12 }}>
        {order.map((k) => (
          <div key={k} className="prob-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--gray)", paddingBottom: 6 }}>
            <span style={{ color: RISK_THEME[k].color, fontWeight: "600" }}>{RISK_THEME[k].label}</span>
            <span style={{ fontWeight: 500 }}>{(probabilities[k] * 100).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
