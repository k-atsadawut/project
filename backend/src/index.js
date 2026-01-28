const ALLOWED_ORIGIN = "*";

const PRICE = {
  stock: 30,
  lock: 45,
  barrel: 25,
};

function calculateCommission(sales) {
  if (sales >= 1800) {
    return 0.1 * 1000 + 0.15 * 800 + 0.2 * (sales - 1800);
  } else if (sales >= 1000) {
    return 0.1 * 1000 + 0.15 * (sales - 1000);
  }
  return sales * 0.1;
}

export default {
  async fetch(req) {
    const url = new URL(req.url);

    // ✅ CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // ✅ API
    if (url.pathname === "/api/calc" && req.method === "POST") {
      const body = await req.json();

      const stock = Number(body.stock || 0);
      const lock = Number(body.lock || 0);
      const barrel = Number(body.barrel || 0);

      const sales =
        stock * PRICE.stock +
        lock * PRICE.lock +
        barrel * PRICE.barrel;

      const commission = calculateCommission(sales);

      return new Response(
        JSON.stringify({
          ok: true,
          sales,
          commission,
          total: sales + commission,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};
