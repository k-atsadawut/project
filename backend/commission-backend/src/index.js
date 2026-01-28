const ALLOWED_ORIGIN = "*";

const PRICE = {
  stock: 30,
  lock: 45,
  barrel: 25,
};

const calculateCommission = (sales) => {
  if (sales >= 1800) {
    return 0.1 * 1000 + 0.15 * 800 + 0.2 * (sales - 1800);
  } else if (sales >= 1000) {
    return 0.1 * 1000 + 0.15 * (sales - 1000);
  } else {
    return sales * 0.1;
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export default {
  async fetch(req) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === "/" || url.pathname === "/api/health") {
      return Response.json(
        { status: "ok" },
        { headers: corsHeaders }
      );
    }

    // Commission calculation
    if (url.pathname === "/api/calc" && req.method === "POST") {
      try {
        const { stock = 0, lock = 0, barrel = 0 } = await req.json();

        const s = Number(stock) || 0;
        const l = Number(lock) || 0;
        const b = Number(barrel) || 0;

        const sales = s * PRICE.stock + l * PRICE.lock + b * PRICE.barrel;
        const commission = calculateCommission(sales);
        const total = sales + commission;

        return Response.json(
          {
            ok: true,
            price: PRICE,
            inputs: { stock: s, lock: l, barrel: b },
            sales,
            commission,
            total,
          },
          { headers: corsHeaders }
        );
      } catch (err) {
        return Response.json(
          { ok: false, error: err.message },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
