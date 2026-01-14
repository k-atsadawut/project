// backend/server.js
const express = require("express");
const cors = require("cors");
const calculateCommission = require("./commission");

const app = express();

// อนุญาตให้ Frontend จาก Netlify เรียกใช้งานได้
app.use(cors()); 
app.use(express.json());

const PRICE = {
  stock: 30,
  lock: 45,
  barrel: 25,
};

app.post("/api/calc", (req, res) => {
  const { stock = 0, lock = 0, barrel = 0 } = req.body;

  const s = Number(stock) || 0;
  const l = Number(lock) || 0;
  const b = Number(barrel) || 0;

  const sales = s * PRICE.stock + l * PRICE.lock + b * PRICE.barrel;
  const commission = calculateCommission(sales);
  const total = sales + commission;

  res.json({
    ok: true,
    price: PRICE,
    inputs: { stock: s, lock: l, barrel: b },
    sales,
    commission,
    total,
  });
});

// ใช้ PORT จาก Environment Variable ที่ Cloud (Render) กำหนดให้
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));