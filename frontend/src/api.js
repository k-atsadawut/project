export async function calculateAPI(payload) {
  const res = await fetch("http://localhost:5000/api/calc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
