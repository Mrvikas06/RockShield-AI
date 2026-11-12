import test, { after, before } from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { server, telemetryInterval } = await import("../src/server.js");

let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  clearInterval(telemetryInterval);
  await new Promise((resolve) => server.close(resolve));
});

test("GET /api/health returns 200 OK", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.deepEqual(data, { ok: true });
});

test("GET /api/model-info returns hyperparameters and feature list", async () => {
  const res = await fetch(`${baseUrl}/api/model-info`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.nEstimators, 100);
  assert.ok(data.accuracy > 0.65);
  assert.equal(data.features.length, 7);
});

test("GET /api/sectors returns all 9 sectors", async () => {
  const res = await fetch(`${baseUrl}/api/sectors`);
  assert.equal(res.status, 200);
  const data = await res.json();
  const keys = Object.keys(data);
  assert.equal(keys.length, 9);
  assert.ok(keys.includes("A01"));
  assert.ok(keys.includes("C03"));
});

test("POST /api/predict calculates risk for valid payload", async () => {
  const payload = {
    slope: 35,
    displacement: 8,
    strain: 0.3,
    porePressure: 45,
    vibration: 0.3,
    rainfall: 15,
    crackScore: 0.2,
    sector: "B02",
  };
  const res = await fetch(`${baseUrl}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(data.prediction));
  assert.equal(data.sectorOverride, true);
});

test("POST /api/predict rejects out-of-bounds sensor values", async () => {
  const invalid = {
    slope: 150,
    displacement: 8,
    strain: 0.3,
    porePressure: 45,
    vibration: 0.3,
    rainfall: 15,
    crackScore: 0.2,
  };
  const res = await fetch(`${baseUrl}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalid),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes("out of physical bounds"));
});

test("GET /api/unknown returns 404 JSON error", async () => {
  const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.deepEqual(data, { error: "API endpoint not found" });
});
