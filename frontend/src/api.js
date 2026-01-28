const API_BASE = import.meta.env.VITE_API_BASE;

export async function calculateAPI(payload) {
  const res = await fetch(`${API_BASE}/api/calc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
