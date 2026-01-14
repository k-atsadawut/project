export async function calculateAPI(payload) {
  const res = await fetch("https://project-ao8q.onrender.com/api/calc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}