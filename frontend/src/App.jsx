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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCalculated, setShowCalculated] = useState(false);




    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);




    const handleChange = (e) => {
      const { name, value, type } = e.target;
      const val = type === "number" ? (value === "" ? "" : Number(value)) : value;
      setForm((s) => ({ ...s, [name]: val }));
    };




    const validate = () => {
      const e = {};
      if (!form.name.trim()) e.name = "กรุณากรอกชื่อพนักงาน";
      if (form.stock !== "" && (form.stock < 1 || form.stock > 70)) e.stock = "1-70";
      if (form.lock !== "" && (form.lock < 1 || form.lock > 80)) e.lock = "1-80";
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
    };




    const onConfirm = async () => {
      if (!validate()) return alert("กรุณาตรวจสอบค่าให้อยู่ในช่วงที่กำหนด");




      setLoading(true);
      try {
        const res = await calculateAPI({ stock, lock, barrel });




        if (res.ok) {
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




          setResult(res);
          setShowCalculated(true);
          setPage(2);
        } else {
          alert("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
        }
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถเชื่อมต่อ backend ได้");
      } finally {
        setLoading(false);
      }
    };




    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6 bg-gray-100">
     





        {/* Page 2 */}
        {page === 2 && (
          <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-10 w-full max-w-4xl mx-4">









            <h2 className="text-xl font-semibold mb-4 text-center">ระบบคำนวณค่าคอมมิชชั่นสินค้า
  </h2>




            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">




              {/* Left Column */}
              <div>
                <label className="text-sm">ชื่อพนักงาน</label>
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
                      placeholder="1-80"
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
                  {errors.lock && <div className="text-red-500 text-xs mt-1">ช่วง: {errors.lock}</div>}
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
                      placeholder="1-70"
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
                  {errors.stock && <div className="text-red-500 text-xs mt-1">ช่วง: {errors.stock}</div>}
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
                  {errors.barrel && <div className="text-red-500 text-xs mt-1">ช่วง: {errors.barrel}</div>}
                </div>
              </div>




              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="text-sm">ยอดขาย</label>
                  <input
                    disabled
                    value={showCalculated ? localSales.toLocaleString() : ""}
                    className="w-full p-2 border rounded bg-gray-200 mt-1"
                  />
                </div>




                <div className="mb-4">
                  <label className="text-sm">ค่าคอมมิชชั่น</label>
                  <input
                    disabled
                    value={showCalculated ? localCommission.toLocaleString() : ""}
                    className="w-full p-2 border rounded bg-gray-200 mt-1"
                  />
                </div>




                <div>
                  <label className="text-sm">ยอดขาย + ค่าคอมมิชชั่น</label>
                  <input
                    disabled
                    value={showCalculated ? localTotal.toLocaleString() : ""}
                    className="w-full p-2 border rounded bg-gray-200 mt-1"
                  />
                </div>
              </div>
            </div>




            {/* FOOTER BUTTON */}
            <div className="flex flex-col sm:flex-row sm:justify-between mt-8 gap-3">
              <button
                onClick={onConfirm}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                disabled={Object.keys(errors).length > 0 || (form.stock === "" && form.lock === "" && form.barrel === "")}
              >
                คำนวณ
              </button>




              <div className="flex gap-3">
                <button
                  onClick={() => setShowHistory(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg"
                >
                  ประวัติ
                </button>




                <button
                  onClick={handleClear}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg"
                >
                  เคลียร์
                </button>
              </div>
            </div>
          </div>
        )}




     




        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                        <td className="py-2">{i+1}</td>
                        <td>{h.name}</td>
                        <td>{h.date}</td>
                        <td>{h.stock}</td>
                        <td>{h.lock}</td>
                        <td>{h.barrel}</td>
                        <td>{h.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}




              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg"
                >
                  ล้างประวัติ
                </button>




                <button
                  onClick={() => setShowHistory(false)}
                  className="bg-gray-300 px-6 py-2 rounded-lg"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}




        {/* Clear History Confirm Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
              <h3 className="text-lg font-semibold mb-4">ยืนยันการล้างประวัติ</h3>
              <p className="text-sm text-gray-600 mb-6">คุณต้องการล้างประวัติการคำนวณทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้</p>




              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="bg-gray-300 text-black px-6 py-2 rounded-lg"
                >
                  ยกเลิก
                </button>




                <button
                  onClick={() => {
                    localStorage.removeItem("commission_history");
                    setHistory([]);
                    setShowClearConfirm(false);
                  }}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg"
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











//git add .
//git commit -m "feat: connect frontend to production backend at Render"
//git push origin main