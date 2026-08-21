import { RandomForest } from "./randomForest.js";
import { createDataset, RISK_LEVELS, FEATURES } from "./dataset.js";

const RISK_TO_IDX = Object.fromEntries(RISK_LEVELS.map((r, i) => [r, i]));
const IDX_TO_RISK = RISK_LEVELS;

let model = null;
let testAccuracy = null;
let trainSize = 0;
let testSize = 0;
let featureImportance = null;

function shuffleSplit(rows, testRatio, seed) {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const idx = rows.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const cut = Math.floor(rows.length * (1 - testRatio));
  return { trainIdx: idx.slice(0, cut), testIdx: idx.slice(cut) };
}

export function trainModel() {
  const data = createDataset(3000, 42);
  const { trainIdx, testIdx } = shuffleSplit(data, 0.2, 42);

  const XTrain = trainIdx.map((i) => data[i].x);
  const yTrain = trainIdx.map((i) => RISK_TO_IDX[data[i].risk]);
  const XTest = testIdx.map((i) => data[i].x);
  const yTest = testIdx.map((i) => RISK_TO_IDX[data[i].risk]);

  model = new RandomForest({
    nEstimators: 100,
    maxDepth: 10,
    minSamplesSplit: 4,
    seed: 42,
    nClasses: RISK_LEVELS.length,
  });
  model.fit(XTrain, yTrain);

  const preds = model.predict(XTest);
  let correct = 0;
  preds.forEach((p, i) => {
    if (p === yTest[i]) correct++;
  });
  testAccuracy = correct / yTest.length;
  trainSize = XTrain.length;
  testSize = XTest.length;
  featureImportance = model.featureImportances(FEATURES.length);

  console.log(
    `[RockShield] Model trained. Accuracy=${(testAccuracy * 100).toFixed(2)}% train=${trainSize} test=${testSize}`
  );
}

export function predict(inputVec) {
  if (!model) trainModel();
  const probaArr = model.predictProba(inputVec);
  const predIdx = probaArr.indexOf(Math.max(...probaArr));

  const probabilities = {};
  RISK_LEVELS.forEach((r, i) => {
    probabilities[r] = probaArr[i];
  });

  return {
    prediction: IDX_TO_RISK[predIdx],
    probabilities,
  };
}

export function getModelInfo() {
  if (!model) trainModel();
  return {
    algorithm: "Random Forest Classifier (100 trees, depth 10, Gini impurity)",
    trainSize,
    testSize,
    accuracy: testAccuracy,
    features: FEATURES,
    featureImportance: FEATURES.map((f, i) => ({
      feature: f,
      importance: featureImportance[i],
    })).sort((a, b) => b.importance - a.importance),
  };
}
