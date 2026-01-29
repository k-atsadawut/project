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

    // ✅ CORS Headers (ใช้ร่วมกันทุก response)
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // ✅ Handle CORS Preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // ✅ Health Check Endpoint
      if (url.pathname === "/" && req.method === "GET") {
        return new Response(
          JSON.stringify({
            ok: true,
            message: "Commission Backend API is running! 🚀",
            version: "1.0.0",
            endpoints: [
              {
                method: "POST",
                path: "/api/calc",
                description: "Calculate commission",
                example: {
                  stock: 10,
                  lock: 5,
                  barrel: 8,
                },
              },
            ],
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      // ✅ Calculate API Endpoint
      if (url.pathname === "/api/calc" && req.method === "POST") {
        // อ่าน request body
        const body = await req.json();

        console.log("📥 Received:", body);

        // แปลงเป็นตัวเลข และใช้ 0 ถ้าไม่มีค่า
        const stock = Number(body.stock || 0);
        const lock = Number(body.lock || 0);
        const barrel = Number(body.barrel || 0);

        // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้อง
        if (isNaN(stock) || isNaN(lock) || isNaN(barrel)) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Invalid input: stock, lock, and barrel must be numbers",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        // คำนวณยอดขาย
        const sales =
          stock * PRICE.stock + lock * PRICE.lock + barrel * PRICE.barrel;

        // คำนวณค่าคอมมิชชั่น
        const commission = calculateCommission(sales);

        const result = {
          ok: true,
          input: { stock, lock, barrel },
          prices: PRICE,
          sales,
          commission: Math.round(commission * 100) / 100, // ปัดทศนิยม 2 ตำแหน่ง
          total: Math.round((sales + commission) * 100) / 100,
        };

        console.log("📤 Sending:", result);

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // ✅ 404 Not Found
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Not Found",
          path: url.pathname,
          method: req.method,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      // ✅ Error Handler
      console.error("❌ Error:", error);

      return new Response(
        JSON.stringify({
          ok: false,
          error: "Internal Server Error",
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  },
};