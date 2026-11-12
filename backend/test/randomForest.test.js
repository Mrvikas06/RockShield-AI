import test from "node:test";
import assert from "node:assert/strict";
import { RandomForest } from "../src/randomForest.js";

test("RandomForest initializes and fits synthetic classification data", () => {
  const X = [
    [0.1, 0.2],
    [0.2, 0.1],
    [0.8, 0.9],
    [0.9, 0.8],
  ];
  const y = [0, 0, 1, 1];

  const rf = new RandomForest({
    nEstimators: 10,
    maxDepth: 4,
    minSamplesSplit: 2,
    seed: 123,
    nClasses: 2,
  });

  rf.fit(X, y);
  assert.equal(rf.trees.length, 10);

  const preds = rf.predict(X);
  assert.equal(preds.length, 4);
  assert.deepEqual(preds, [0, 0, 1, 1]);
});

test("RandomForest.predictProba outputs normalized probability distribution", () => {
  const X = [
    [10, 2],
    [12, 3],
    [50, 20],
    [55, 22],
  ];
  const y = [0, 0, 1, 1];

  const rf = new RandomForest({
    nEstimators: 15,
    maxDepth: 5,
    minSamplesSplit: 2,
    seed: 77,
    nClasses: 2,
  });
  rf.fit(X, y);

  const probaLow = rf.predictProba([11, 2.5]);
  assert.equal(probaLow.length, 2);
  const sumLow = probaLow.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sumLow - 1.0) < 1e-4);
  assert.ok(probaLow[0] > probaLow[1]);

  const probaHigh = rf.predictProba([52, 21]);
  const sumHigh = probaHigh.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sumHigh - 1.0) < 1e-4);
  assert.ok(probaHigh[1] > probaHigh[0]);
});

test("RandomForest computes feature importances summing to 1", () => {
  const X = [
    [1, 0],
    [2, 0],
    [10, 0],
    [12, 0],
  ];
  const y = [0, 0, 1, 1];

  const rf = new RandomForest({
    nEstimators: 10,
    maxDepth: 3,
    minSamplesSplit: 2,
    seed: 42,
    nClasses: 2,
  });
  rf.fit(X, y);

  const importances = rf.featureImportances(2);
  assert.equal(importances.length, 2);
  const sum = importances.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-4);
  // Feature 0 should carry higher importance than feature 1 (which is constant)
  assert.ok(importances[0] >= importances[1]);
});
