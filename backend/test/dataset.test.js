import test from "node:test";
import assert from "node:assert/strict";
import {
  computeRawScore,
  scoreToRisk,
  createDataset,
  FEATURES,
  RISK_LEVELS,
} from "../src/dataset.js";

test("FEATURES contains 7 expected geotechnical parameters", () => {
  assert.equal(FEATURES.length, 7);
  assert.deepEqual(FEATURES, [
    "Slope Angle",
    "Displacement",
    "Strain",
    "Pore Pressure",
    "Vibration",
    "Rainfall",
    "Crack Score",
  ]);
});

test("RISK_LEVELS contains 4 graduated risk categories", () => {
  assert.deepEqual(RISK_LEVELS, ["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
});

test("scoreToRisk assigns correct risk classifications", () => {
  assert.equal(scoreToRisk(0.1), "LOW");
  assert.equal(scoreToRisk(0.32), "LOW");
  assert.equal(scoreToRisk(0.33), "MEDIUM");
  assert.equal(scoreToRisk(0.52), "MEDIUM");
  assert.equal(scoreToRisk(0.53), "HIGH");
  assert.equal(scoreToRisk(0.7), "HIGH");
  assert.equal(scoreToRisk(0.71), "CRITICAL");
  assert.equal(scoreToRisk(0.99), "CRITICAL");
});

test("computeRawScore calculates weighted multi-sensor score", () => {
  const nominal = {
    slope: 20,
    displacement: 1,
    strain: 0,
    porePressure: 20,
    vibration: 0,
    rainfall: 0,
    crackScore: 0,
  };
  const nominalScore = computeRawScore(nominal);
  assert.equal(nominalScore, 0);

  const maxRisk = {
    slope: 60,
    displacement: 25,
    strain: 1.0,
    porePressure: 100,
    vibration: 1.0,
    rainfall: 80,
    crackScore: 1.0,
  };
  const maxScore = computeRawScore(maxRisk);
  assert.ok(Math.abs(maxScore - 1.0) < 1e-6);
});

test("createDataset generates requested number of deterministic rows", () => {
  const dataset = createDataset(50, 42);
  assert.equal(dataset.length, 50);

  const first = dataset[0];
  assert.equal(first.x.length, 7);
  assert.ok(RISK_LEVELS.includes(first.risk));

  // Verify determinism with identical seed
  const repeat = createDataset(50, 42);
  assert.deepEqual(dataset[0], repeat[0]);
});
