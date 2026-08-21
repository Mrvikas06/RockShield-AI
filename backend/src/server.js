import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { trainModel, predict, getModelInfo } from "./model.js";
import { FEATURES, computeRawScore, scoreToRisk } from "./dataset.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

console.log("[RockShield] Training model on synthetic geotechnical data...");
const __t0 = Date.now();
trainModel();
console.log(`[RockShield] trainModel() returned in ${Date.now() - __t0}ms`);

const SECTORS = ["A01", "A02", "A03", "B01", "B02", "B03", "C01", "C02", "C03"];

// live simulated state per sector (for the auto-refreshing sector grid)
const sectorState = {};
SECTORS.forEach((s) => {
  sectorState[s] = randomSensorSet();
});

function randomSensorSet(bias = "normal") {
  const jitter = (lo, hi) => lo + Math.random() * (hi - lo);
  if (bias === "critical") {
    return {
      slope: jitter(48, 60),
      displacement: jitter(18, 25),
      strain: jitter(0.75, 1.0),
      porePressure: jitter(80, 100),
      vibration: jitter(0.7, 1.0),
      rainfall: jitter(50, 80),
      crackScore: jitter(0.7, 1.0),
    };
  }
  return {
    slope: jitter(20, 55),
    displacement: jitter(1, 20),
    strain: jitter(0.05, 0.8),
    porePressure: jitter(20, 90),
    vibration: jitter(0.05, 0.8),
    rainfall: jitter(0, 60),
    crackScore: jitter(0, 0.75),
  };
}

function toVec(s) {
  return [s.slope, s.displacement, s.strain, s.porePressure, s.vibration, s.rainfall, s.crackScore];
}

function evaluateSector(s) {
  const { prediction, probabilities } = predict(toVec(s));
  const danger = ["MEDIUM", "HIGH", "CRITICAL"].reduce((acc, k) => acc + (probabilities[k] || 0), 0) * 100;
  return { ...s, prediction, probabilities, danger };
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/model-info", (req, res) => {
  res.json(getModelInfo());
});

app.get("/api/sectors", (req, res) => {
  const out = {};
  SECTORS.forEach((s) => (out[s] = evaluateSector(sectorState[s])));
  res.json(out);
});

app.post("/api/predict", (req, res) => {
  const body = req.body || {};
  const required = ["slope", "displacement", "strain", "porePressure", "vibration", "rainfall", "crackScore"];
  for (const key of required) {
    if (typeof body[key] !== "number" || Number.isNaN(body[key])) {
      return res.status(400).json({ error: `Missing/invalid field: ${key}` });
    }
  }
  const vec = toVec(body);
  const { prediction, probabilities } = predict(vec);
  const danger = ["MEDIUM", "HIGH", "CRITICAL"].reduce((acc, k) => acc + (probabilities[k] || 0), 0) * 100;
  const rawScore = computeRawScore(body);

  res.json({
    prediction,
    probabilities,
    danger,
    rawScore,
    sectorOverride: sectorState[body.sector] ? true : false,
  });

  if (body.sector && sectorState[body.sector]) {
    sectorState[body.sector] = body;
    io.emit("sector-update", { sector: body.sector, data: evaluateSector(body) });
  }
});

// WebSocket: broadcast full sector grid periodically, simulating live sensors drifting
io.on("connection", (socket) => {
  socket.emit("sectors-init", (() => {
    const out = {};
    SECTORS.forEach((s) => (out[s] = evaluateSector(sectorState[s])));
    return out;
  })());
});

setInterval(() => {
  // Randomly drift one sector's sensors slightly to simulate live telemetry
  const pick = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  const cur = sectorState[pick];
  const drift = (v, amt, lo, hi) => Math.min(hi, Math.max(lo, v + (Math.random() - 0.5) * amt));
  sectorState[pick] = {
    slope: drift(cur.slope, 2, 20, 60),
    displacement: drift(cur.displacement, 1, 1, 25),
    strain: drift(cur.strain, 0.04, 0.05, 1),
    porePressure: drift(cur.porePressure, 3, 20, 100),
    vibration: drift(cur.vibration, 0.04, 0.05, 1),
    rainfall: drift(cur.rainfall, 3, 0, 80),
    crackScore: drift(cur.crackScore, 0.03, 0, 1),
  };
  io.emit("sector-update", { sector: pick, data: evaluateSector(sectorState[pick]) });
}, 4000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[RockShield] Backend live on http://localhost:${PORT}`);
});
