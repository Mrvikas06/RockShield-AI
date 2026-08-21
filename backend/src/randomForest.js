// Minimal, dependency-free Random Forest classifier (CART trees, Gini impurity,
// bootstrap bagging, random feature subsampling). Built in-house after the
// ml-random-forest npm package proved unstable (hangs / OOB crash) at this
// dataset scale. Small, fast, and gives real per-feature Gini importances.

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gini(counts, total) {
  let imp = 1;
  for (const c of counts) {
    const p = c / total;
    imp -= p * p;
  }
  return imp;
}

class TreeNode {
  constructor() {
    this.isLeaf = false;
    this.featureIdx = null;
    this.threshold = null;
    this.left = null;
    this.right = null;
    this.classCounts = null; // leaf: counts per class
  }
}

class DecisionTree {
  constructor({ maxDepth, minSamplesSplit, nFeaturesSample, rng, nClasses }) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.nFeaturesSample = nFeaturesSample;
    this.rng = rng;
    this.nClasses = nClasses;
    this.root = null;
    this.importances = null; // filled during fit
  }

  fit(X, y, nFeaturesTotal) {
    this.importances = new Array(nFeaturesTotal).fill(0);
    const idx = X.map((_, i) => i);
    this.root = this._build(X, y, idx, 0);
  }

  _classCounts(y, idx) {
    const counts = new Array(this.nClasses).fill(0);
    for (const i of idx) counts[y[i]]++;
    return counts;
  }

  _build(X, y, idx, depth) {
    const node = new TreeNode();
    const counts = this._classCounts(y, idx);

    const majority = counts.indexOf(Math.max(...counts));
    const pure = counts.filter((c) => c > 0).length <= 1;

    if (depth >= this.maxDepth || idx.length < this.minSamplesSplit || pure) {
      node.isLeaf = true;
      node.classCounts = counts;
      node.majority = majority;
      return node;
    }

    const split = this._bestSplit(X, y, idx, counts);
    if (!split) {
      node.isLeaf = true;
      node.classCounts = counts;
      node.majority = majority;
      return node;
    }

    this.importances[split.featureIdx] += split.gain * idx.length;

    node.featureIdx = split.featureIdx;
    node.threshold = split.threshold;
    node.left = this._build(X, y, split.leftIdx, depth + 1);
    node.right = this._build(X, y, split.rightIdx, depth + 1);
    return node;
  }

  _bestSplit(X, y, idx, parentCounts) {
    const nFeaturesTotal = X[0].length;
    // random feature subset (feature bagging)
    const allFeats = Array.from({ length: nFeaturesTotal }, (_, i) => i);
    for (let i = allFeats.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [allFeats[i], allFeats[j]] = [allFeats[j], allFeats[i]];
    }
    const feats = allFeats.slice(0, this.nFeaturesSample);

    const parentImpurity = gini(parentCounts, idx.length);
    let best = null;

    for (const f of feats) {
      const sorted = [...idx].sort((a, b) => X[a][f] - X[b][f]);
      const leftCounts = new Array(this.nClasses).fill(0);
      const rightCounts = [...parentCounts];

      // try up to ~12 evenly spaced thresholds for speed
      const step = Math.max(1, Math.floor(sorted.length / 12));
      let cursor = 0;

      for (let s = 0; s < sorted.length; s++) {
        const i = sorted[s];
        leftCounts[y[i]]++;
        rightCounts[y[i]]--;
        cursor++;

        const isCandidate = cursor % step === 0 && s < sorted.length - 1;
        if (!isCandidate) continue;

        const leftVal = X[sorted[s]][f];
        const rightVal = X[sorted[s + 1]][f];
        if (leftVal === rightVal) continue;

        const nLeft = s + 1;
        const nRight = sorted.length - nLeft;
        if (nLeft === 0 || nRight === 0) continue;

        const impLeft = gini(leftCounts, nLeft);
        const impRight = gini(rightCounts, nRight);
        const weighted = (nLeft / sorted.length) * impLeft + (nRight / sorted.length) * impRight;
        const gain = parentImpurity - weighted;

        if (!best || gain > best.gain) {
          const threshold = (leftVal + rightVal) / 2;
          best = { featureIdx: f, threshold, gain };
        }
      }
    }

    if (!best || best.gain <= 1e-9) return null;

    const leftIdx = idx.filter((i) => X[i][best.featureIdx] <= best.threshold);
    const rightIdx = idx.filter((i) => X[i][best.featureIdx] > best.threshold);
    if (!leftIdx.length || !rightIdx.length) return null;

    return { ...best, leftIdx, rightIdx };
  }

  predictOne(x) {
    let node = this.root;
    while (!node.isLeaf) {
      node = x[node.featureIdx] <= node.threshold ? node.left : node.right;
    }
    return node.majority;
  }

  predictProbaOne(x) {
    let node = this.root;
    while (!node.isLeaf) {
      node = x[node.featureIdx] <= node.threshold ? node.left : node.right;
    }
    const total = node.classCounts.reduce((a, b) => a + b, 0) || 1;
    return node.classCounts.map((c) => c / total);
  }
}

export class RandomForest {
  constructor({ nEstimators = 100, maxDepth = 10, minSamplesSplit = 4, seed = 42, nClasses }) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.seed = seed;
    this.nClasses = nClasses;
    this.trees = [];
  }

  fit(X, y) {
    const rng = mulberry32(this.seed);
    const n = X.length;
    const nFeatures = X[0].length;
    const nFeaturesSample = Math.max(1, Math.round(Math.sqrt(nFeatures)) + 1);

    this.trees = [];
    for (let t = 0; t < this.nEstimators; t++) {
      // bootstrap sample
      const bootIdx = new Array(n);
      for (let i = 0; i < n; i++) bootIdx[i] = Math.floor(rng() * n);
      const Xb = bootIdx.map((i) => X[i]);
      const yb = bootIdx.map((i) => y[i]);

      const tree = new DecisionTree({
        maxDepth: this.maxDepth,
        minSamplesSplit: this.minSamplesSplit,
        nFeaturesSample,
        rng,
        nClasses: this.nClasses,
      });
      tree.fit(Xb, yb, nFeatures);
      this.trees.push(tree);
    }
  }

  predict(X) {
    return X.map((x) => {
      const votes = new Array(this.nClasses).fill(0);
      for (const tree of this.trees) votes[tree.predictOne(x)]++;
      return votes.indexOf(Math.max(...votes));
    });
  }

  predictProba(x) {
    const acc = new Array(this.nClasses).fill(0);
    for (const tree of this.trees) {
      const p = tree.predictProbaOne(x);
      p.forEach((v, i) => (acc[i] += v));
    }
    const total = acc.reduce((a, b) => a + b, 0) || 1;
    return acc.map((v) => v / total);
  }

  featureImportances(nFeatures) {
    const sums = new Array(nFeatures).fill(0);
    for (const tree of this.trees) {
      tree.importances.forEach((v, i) => (sums[i] += v));
    }
    const total = sums.reduce((a, b) => a + b, 0) || 1;
    return sums.map((v) => v / total);
  }
}
