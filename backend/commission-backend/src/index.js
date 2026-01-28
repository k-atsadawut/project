const ALLOWED_ORIGIN = "https://commission-frontend1.pages.dev"; 
// ❗ เปลี่ยนเป็น URL Pages ของคุณจริง

export default {
  async fetch(req) {
    const url = new URL(req.url);

    // ===== CORS =====
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // ===== HEALTH CHECK =====
    if (url.pathname === "/api/health") {
      return Response.json(
        { status: "ok" },
        { headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } }
      );
    }

    // ===== CALCULATE API =====
    if (url.pathname === "/api/calc" && req.method === "POST") {
      const body = await req.json();
      const result = body.a + body.b;

      return new Response(JSON.stringify({ result }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
