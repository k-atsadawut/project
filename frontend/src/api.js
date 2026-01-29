export async function calculateAPI(payload) {
  const base = import.meta.env.VITE_API_BASE || "https://qa-backend.sidksuug.workers.dev";
  console.log("API_BASE =", base);

  const res = await fetch(`${base}/api/calc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}