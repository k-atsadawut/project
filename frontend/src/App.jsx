import React, { useState, useEffect } from "react";
import { calculateAPI } from "./api";

// ❌ ไม่ให้พิมพ์ทศนิยม
const preventDecimal = (e) => {
  if ([".", ",", "e", "E"].includes(e.key)) {
    e.preventDefault();
  }
};

export default function App() {
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    name: "",
    stock: "",
    lock: "",
    barrel: "",
    priceStock: 30,
    priceLock: 45,
    priceBarrel: 25,
  });

  const [errors, setErrors] = useState({});
  const [showCalculated, setShowCalculated] = useState(false);
  
  // ✅ เก็บค่าที่คำนวณแล้วไว้ใน state แยก
  const [calculatedValues, setCalculatedValues] = useState({
    sales: 0,
    commission: 0,
    total: 0
  });
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setForm((s) => ({ ...s, [name]: val }));
    
    // ✅ เมื่อเปลี่ยนค่าให้ซ่อนผลลัพธ์
    setShowCalculated(false);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "กรุณากรอกชื่อพนักงาน";
    if (form.stock !== "" && (form.stock < 1 || form.stock > 80)) e.stock = "1-80";
    if (form.lock !== "" && (form.lock < 1 || form.lock > 70)) e.lock = "1-70";
    if (form.barrel !== "" && (form.barrel < 1 || form.barrel > 90)) e.barrel = "1-90";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    validate();
  }, [form]);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("commission_history") || "[]");
    setHistory(h);
  }, []);

  const calculateCommissionLocal = (sales) => {
    if (sales >= 1800) {
      return 0.1 * 1000 + 0.15 * 800 + 0.2 * (sales - 1800);
    } else if (sales >= 1000) {
      return 0.1 * 1000 + 0.15 * (sales - 1000);
    } else {
      return sales * 0.1;
    }
  };

  const saveHistory = (data) => {
    const old = JSON.parse(localStorage.getItem("commission_history") || "[]");
    const updated = [...old, data];
    localStorage.setItem("commission_history", JSON.stringify(updated));
    setHistory(updated);
  };

  const handleClear = () => {
    setForm({
      name: form.name,
      stock: "",
      lock: "",
      barrel: "",
      priceStock: 30,
      priceLock: 45,
      priceBarrel: 25,
    });
    setErrors({});
    setResult(null);
    setShowCalculated(false);
    setCalculatedValues({ sales: 0, commission: 0, total: 0 });
  };

 const onConfirm = async () => {
  setSubmitted(true);

  const e = {};

  if (!form.name.trim()) e.name = "กรุณากรอกชื่อพนักงาน";
  if (form.stock === "") e.stock = "กรุณากรอกจำนวน stock : 1-80";
  if (form.lock === "") e.lock = "กรุณากรอกจำนวน lock : 1-70";
  if (form.barrel === "") e.barrel = "กรุณากรอกจำนวน barrel : 1-90";

  // เช็กช่วงค่า (ใช้ของเดิม)
  if (form.stock !== "" && (form.stock < 1 || form.stock > 80)) e.stock = "กรุณากรอกจำนวนระหว่าง: 1-80";
  if (form.lock !== "" && (form.lock < 1 || form.lock > 70)) e.lock = "กรุณากรอกจำนวนระหว่าง: 1-70";
  if (form.barrel !== "" && (form.barrel < 1 || form.barrel > 90)) e.barrel = "กรุณากรอกจำนวนระหว่าง: 1-90";

  setErrors(e);

  if (Object.keys(e).length > 0) return; // ❌ หยุดคำนวณทันที

  // ===============================
  // คำนวณ (ของเดิมแทบไม่ต้องแตะ)
  // ===============================
  const stock = form.stock;
  const lock = form.lock;
  const barrel = form.barrel;

  const localSales =
    stock * form.priceStock +
    lock * form.priceLock +
    barrel * form.priceBarrel;

  const localCommission = calculateCommissionLocal(localSales);
  const localTotal = localSales + localCommission;

  setLoading(true);
  try {
    const res = await calculateAPI({ stock, lock, barrel });

    if (res.ok) {
      setCalculatedValues({
        sales: localSales,
        commission: localCommission,
        total: localTotal,
      });

      saveHistory({
        date: new Date().toLocaleString(),
        name: form.name,
        stock,
        lock,
        barrel,
        priceStock: form.priceStock,
        priceLock: form.priceLock,
        priceBarrel: form.priceBarrel,
        sales: localSales,
        commission: localCommission,
        total: localTotal,
      });

      setShowCalculated(true);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-gray-100">
      {/* Page 2 */}
      {page === 2 && (
        <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-10 w-full max-w-4xl mx-4">
          <h2 className="text-xl font-semibold mb-4 text-center">ระบบคำนวณค่าคอมมิชชั่นสินค้า</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <label className="text-sm">
                ชื่อพนักงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                placeholder="ชื่อพนักงาน"
              />
              {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}

              {/* LOCK */}
              <div className="mt-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span>lock</span>
                  <span>ราคา/หน่วย</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    name="lock"
                    value={form.lock}
                    onChange={handleChange}
                    onKeyDown={preventDecimal}
                    className={`w-full p-2 border rounded ${errors.lock ? "border-red-400" : ""}`}
                    placeholder="1-70"
                  />
                  <input
                    type="number"
                    name="priceLock"
                    value={form.priceLock}
                    onChange={handleChange}
                    onKeyDown={preventDecimal}
                    className="w-24 p-2 border rounded"
                  />
                </div>
                {errors.lock && <div className="text-red-500 text-xs mt-1"> {errors.lock}</div>}
              </div>

              {/* STOCK */}
              <div className="mt-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span>stock</span>
                  <span>ราคา/หน่วย</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    onKeyDown={preventDecimal}
                    className={`w-full p-2 border rounded ${errors.stock ? "border-red-400" : ""}`}
                    placeholder="1-80"
                  />
                  <input
                    type="number"
                    name="priceStock"
                    value={form.priceStock}
                    onChange={handleChange}
                    onKeyDown={preventDecimal}
                    className="w-24 p-2 border rounded"
                  />
                </div>
                {errors.stock && <div className="text-red-500 text-xs mt-1"> {errors.stock}</div>}
              </div>

              {/* BARREL */}
              <div className="mt-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>barrel</span>
                  <span>ราคา/หน่วย</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    name="barrel"
                    value={form.barrel}
                    onChange={handleChange}
                    onKeyDown={preventDecimal}
                    className={`w-full p-2 border rounded ${errors.barrel ? "border-red-400" : ""}`}
                    placeholder="1-90"
                  />
                  <input
                    type="number"
                    name="priceBarrel"
                    value={form.priceBarrel}
                    onChange={handleChange}
                    onKeyDown={preventDecimal}
                    className="w-24 p-2 border rounded"
                  />
                </div>
                {errors.barrel && <div className="text-red-500 text-xs mt-1"> {errors.barrel}</div>}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-4">
                <label className="text-sm">ยอดขาย</label>
                <input
                  disabled
                  value={showCalculated ? calculatedValues.sales.toLocaleString() : ""}
                  className="w-full p-2 border rounded bg-gray-200 mt-1"
                  placeholder=""
                />
              </div>

              <div className="mb-4">
                <label className="text-sm">ค่าคอมมิชชั่น</label>
                <input
                  disabled
                  value={showCalculated ? calculatedValues.commission.toLocaleString() : ""}
                  className="w-full p-2 border rounded bg-gray-200 mt-1"
                  placeholder=""
                />
              </div>

              <div>
                <label className="text-sm">ยอดขาย + ค่าคอมมิชชั่น</label>
                <input
                  disabled
                  value={showCalculated ? calculatedValues.total.toLocaleString() : ""}
                  className="w-full p-2 border rounded bg-gray-200 mt-1"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          {/* FOOTER BUTTON */}
          <div className="flex flex-col sm:flex-row sm:justify-between mt-8 gap-3">
            <button
              onClick={onConfirm}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              disabled={
                loading ||
                !form.name.trim() ||
                Object.keys(errors).length > 0 ||
                (form.stock === "" && form.lock === "" && form.barrel === "")
              }
            >
              {loading ? "กำลังคำนวณ..." : "คำนวณ"}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                ประวัติ
              </button>

              <button
                onClick={handleClear}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                เคลียร์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[70vh] overflow-auto shadow-xl mx-4">
            <h3 className="text-lg font-semibold mb-4">ประวัติการคำนวณ</h3>

            {history.length === 0 ? (
              <p className="text-gray-600 text-sm">ยังไม่มีประวัติการคำนวณ</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">ลำดับ</th>
                    <th>ชื่อพนักงาน</th>
                    <th>วันที่</th>
                    <th>Stock</th>
                    <th>Lock</th>
                    <th>Barrel</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 text-center">{i + 1}</td>
                      <td className="text-center">{h.name}</td>
                      <td className="text-center">{h.date}</td>
                      <td className="text-center">{h.stock}</td>
                      <td className="text-center">{h.lock}</td>
                      <td className="text-center">{h.barrel}</td>
                      <td className="text-center">{h.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                ล้างประวัติ
              </button>

              <button
                onClick={() => setShowHistory(false)}
                className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear History Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
            <h3 className="text-lg font-semibold mb-4">ยืนยันการล้างประวัติ</h3>
            <p className="text-sm text-gray-600 mb-6">
              คุณต้องการล้างประวัติการคำนวณทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("commission_history");
                  setHistory([]);
                  setShowClearConfirm(false);
                  setShowHistory(false);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                ล้างประวัติ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
