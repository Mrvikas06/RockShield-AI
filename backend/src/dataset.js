// Synthetic geotechnical dataset generator — mirrors original Python logic 1:1
// Features: Slope Angle, Displacement, Strain, Pore Pressure, Vibration, Rainfall, Crack Score

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng, mean = 0, std = 1) {
  const u1 = Math.min(Math.max(rng(), 1e-9), 1 - 1e-9);
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

function uniform(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}

export const FEATURES = [
  "Slope Angle",
  "Displacement",
  "Strain",
  "Pore Pressure",
  "Vibration",
  "Rainfall",
  "Crack Score",
];

export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function scoreToRisk(score) {
  if (score <= 0.32) return "LOW";
  if (score <= 0.52) return "MEDIUM";
  if (score <= 0.7) return "HIGH";
  return "CRITICAL";
}

export function computeRawScore({
  slope,
  displacement,
  strain,
  porePressure,
  vibration,
  rainfall,
  crackScore,
}) {
  return (
    0.2 * ((slope - 20) / 40) +
    0.2 * ((displacement - 1) / 24) +
    0.15 * strain +
    0.15 * ((porePressure - 20) / 80) +
    0.08 * vibration +
    0.07 * (rainfall / 80) +
    0.15 * crackScore
  );
}

export function createDataset(n = 3000, seed = 42) {
  const rng = mulberry32(seed);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const slope = uniform(rng, 20, 60);
    const displacement = uniform(rng, 1, 25);
    const strain = uniform(rng, 0.05, 1.0);
    const porePressure = uniform(rng, 20, 100);
    const vibration = uniform(rng, 0.05, 1.0);
    const rainfall = uniform(rng, 0, 80);
    const crackScore = uniform(rng, 0, 1);

    let score = computeRawScore({
      slope,
      displacement,
      strain,
      porePressure,
      vibration,
      rainfall,
      crackScore,
    });
    score += gaussian(rng, 0, 0.05);

    rows.push({
      x: [slope, displacement, strain, porePressure, vibration, rainfall, crackScore],
      risk: scoreToRisk(score),
    });
  }
  return rows;
}
