import React, { useState, useEffect } from "react";
import { calculateAPI } from "./api";

export default function App() {
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    stock: "",
    lock: "",
    barrel: "",
    priceStock: 30,
    priceLock: 45,
    priceBarrel: 25,
  });

  const [result, setResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCalculated, setShowCalculated] = useState(false);

  // 🟦 รองรับค่าว่างใน input number
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setForm((s) => ({ ...s, [name]: val }));
  };

  // 🟦 validate เฉพาะตอนมีค่า
  const validate = () => {
    const e = {};
    if (form.stock !== "" && (form.stock < 1 || form.stock > 70)) e.stock = "1-70";
    if (form.lock !== "" && (form.lock < 1 || form.lock > 80)) e.lock = "1-80";
    if (form.barrel !== "" && (form.barrel < 1 || form.barrel > 90)) e.barrel = "1-90";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    validate();
  }, [form]);

  // 🟦 แปลงค่าว่าง → 0 สำหรับการคำนวณ
  const stock = form.stock === "" ? 0 : form.stock;
  const lock = form.lock === "" ? 0 : form.lock;
  const barrel = form.barrel === "" ? 0 : form.barrel;

  const localSales =
    stock * form.priceStock +
    lock * form.priceLock +
    barrel * form.priceBarrel;

  const calculateCommissionLocal = (sales) => {
    if (sales >= 1800) {
      return 0.10 * 1000 + 0.15 * 800 + 0.20 * (sales - 1800);
    } else if (sales >= 1000) {
      return 0.10 * 1000 + 0.15 * (sales - 1000);
    } else {
      return sales * 0.10;
    }
  };

  const localCommission = calculateCommissionLocal(localSales);
  const localTotal = localSales + localCommission;

  const handleClear = () => {
    setForm({
      name: "",
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
  };

  const onConfirm = async () => {
    if (!validate()) return alert("กรุณาตรวจสอบค่าให้อยู่ในช่วงที่กำหนด");

    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await calculateAPI({
        stock,
        lock,
        barrel,
      });

      if (res.ok) {
        setResult(res);
        setShowCalculated(true);
        setPage(2);
      } else {
        alert("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อ backend ได้ กรุณาเช็คว่า backend รันอยู่ที่ http://localhost:5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-gray-100">
      {/* Page 1 */}
      {page === 1 && (
        <div className="bg-white shadow-xl rounded-2xl p-16 text-center w-[500px]">
          <h1 className="text-2xl mb-10">ระบบคำนวณค่าคอมมิชชั่นสินค้า</h1>
          <button
            onClick={() => setPage(2)}
            className="bg-sky-400 text-white px-10 py-3 rounded-full text-lg"
          >
            เริ่มต้นใช้งาน
          </button>
        </div>
      )}

      {/* Page 2 - Form */}
      {page === 2 && (
        <div className="bg-white shadow-xl rounded-2xl p-10 w-[850px]">
          <h2 className="text-xl font-semibold mb-4">Calculate BY group</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Left - inputs */}
            <div>
              <label className="text-sm">ชื่อโปรไฟล์</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1"
                placeholder="ชื่อโปรไฟล์"
              />

              {/* stock */}
              <div className="mt-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span>stock</span>
                  <span>ราคา</span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.stock ? "border-red-400" : ""}`}
                    placeholder="1-70"
                  />
                  <input
                    type="number"
                    name="priceStock"
                    value={form.priceStock}
                    onChange={handleChange}
                    className="w-24 p-2 border rounded"
                  />
                </div>
                {errors.stock && <div className="text-red-500 text-xs mt-1">ช่วง: {errors.stock}</div>}
              </div>

              {/* lock */}
              <div className="mt-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>lock</span>
                  <span>ราคา</span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    name="lock"
                    value={form.lock}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.lock ? "border-red-400" : ""}`}
                    placeholder="1-80"
                  />
                  <input
                    type="number"
                    name="priceLock"
                    value={form.priceLock}
                    onChange={handleChange}
                    className="w-24 p-2 border rounded"
                  />
                </div>
                {errors.lock && <div className="text-red-500 text-xs mt-1">ช่วง: {errors.lock}</div>}
              </div>

              {/* barrel */}
              <div className="mt-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>barrel</span>
                  <span>ราคา</span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    name="barrel"
                    value={form.barrel}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.barrel ? "border-red-400" : ""}`}
                    placeholder="1-90"
                  />
                  <input
                    type="number"
                    name="priceBarrel"
                    value={form.priceBarrel}
                    onChange={handleChange}
                    className="w-24 p-2 border rounded"
                  />
                </div>
                {errors.barrel && <div className="text-red-500 text-xs mt-1">ช่วง: {errors.barrel}</div>}
              </div>
            </div>

            {/* Right - preview */}
            <div>
              <div className="mb-4">
                <label className="text-sm">Sales</label>
                <input
                  disabled
                  value={showCalculated ? localSales.toLocaleString() : ""}
                  className="w-full p-2 border rounded bg-gray-200 mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm">Commission</label>
                <input
                  disabled
                  value={showCalculated ? localCommission.toLocaleString() : ""}
                  className="w-full p-2 border rounded bg-gray-200 mt-1"
                />
              </div>

              <div>
                <label className="text-sm">รวม</label>
                <input
                  disabled
                  value={showCalculated ? localTotal.toLocaleString() : ""}
                  className="w-full p-2 border rounded bg-gray-200 mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 gap-3">
            <button
              onClick={handleClear}
              className="bg-gray-300 text-black px-6 py-2 rounded-lg"
            >
              เคลียร์
            </button>

            <button
              onClick={() => setShowConfirm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              disabled={Object.keys(errors).length > 0}
            >
              คำนวณ
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-semibold mb-4">ยืนยันการคำนวณ</h3>
            <p className="text-sm text-gray-600 mb-6">คุณต้องการคำนวณค่าคอมมิชชั่นใช่หรือไม่?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-blue-400"
              >
                {loading ? "กำลังคำนวณ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backend Result */}
      {result && (
        <div className="fixed bottom-6 left-6 bg-white shadow rounded p-4 w-[340px]">
          <h4 className="font-semibold mb-2">ผลลัพธ์ (จาก Backend)</h4>
          <div className="text-sm">
            <p>Sales: {result.sales.toLocaleString()}</p>
            <p>Commission: {result.commission.toLocaleString()}</p>
            <p className="font-bold">Total: {result.total.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
