const BASE = "/api";

export async function fetchModelInfo() {
  const r = await fetch(`${BASE}/model-info`);
  if (!r.ok) {
    throw new Error(`Failed to fetch model info (status ${r.status})`);
  }
  return r.json();
}

export async function fetchSectors() {
  const r = await fetch(`${BASE}/sectors`);
  if (!r.ok) {
    throw new Error(`Failed to fetch sectors (status ${r.status})`);
  }
  return r.json();
}

export async function predict(payload) {
  const r = await fetch(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    let msg = `Prediction failed (status ${r.status})`;
    try {
      const errData = await r.json();
      if (errData?.error) msg = errData.error;
    } catch {
      // Non-JSON response body
    }
    throw new Error(msg);
  }
  return r.json();
}
