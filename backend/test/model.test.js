import test from "node:test";
import assert from "node:assert/strict";
import { trainModel, predict, getModelInfo } from "../src/model.js";

test("trainModel initializes and evaluates Random Forest model", () => {
  trainModel();
  const info = getModelInfo();

  assert.ok(info.accuracy > 0.65, `Expected accuracy > 0.65, got ${info.accuracy}`);
  assert.equal(info.trainSize, 2400);
  assert.equal(info.testSize, 600);
  assert.equal(info.nEstimators, 100);
  assert.equal(info.maxDepth, 10);
  assert.equal(info.features.length, 7);
  assert.equal(info.featureImportance.length, 7);
});

test("predict produces valid risk prediction and probabilities for benign parameters", () => {
  const safeSensors = [25, 2, 0.1, 25, 0.1, 5, 0.05];
  const res = predict(safeSensors);

  assert.ok(res.prediction, "Should return a prediction string");
  assert.equal(typeof res.prediction, "string");
  assert.equal(res.prediction, "LOW");
  assert.ok(res.probabilities.LOW > 0.4);
});

test("predict produces CRITICAL prediction for severe geotechnical parameters", () => {
  const severeSensors = [58, 24, 0.95, 95, 0.95, 78, 0.95];
  const res = predict(severeSensors);

  assert.equal(res.prediction, "CRITICAL");
  assert.ok(res.probabilities.CRITICAL > 0.5);
});
