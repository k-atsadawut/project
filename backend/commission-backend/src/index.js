const ALLOWED_ORIGIN = "https://commission-frontend1.pages.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(req) {
    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);

    // Health check
    if (url.pathname === "/api/health" && req.method === "GET") {
      return Response.json(
        { status: "ok" },
        { headers: corsHeaders }
      );
    }

    // Calculate API
    if (url.pathname === "/api/calc" && req.method === "POST") {
      const body = await req.json();

      const result = body.a + body.b;

      return new Response(JSON.stringify({ result }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};
