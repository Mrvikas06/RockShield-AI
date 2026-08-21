const BASE = "/api";

export async function fetchModelInfo() {
  const r = await fetch(`${BASE}/model-info`);
  return r.json();
}

export async function fetchSectors() {
  const r = await fetch(`${BASE}/sectors`);
  return r.json();
}

export async function predict(payload) {
  const r = await fetch(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || "predict failed");
  return r.json();
}
