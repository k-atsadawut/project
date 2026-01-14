const onConfirm = async () => {
  if (!validate()) return alert("กรุณาตรวจสอบค่าให้อยู่ในช่วงที่กำหนด");

  setLoading(true);
  // จำลองการโหลดเล็กน้อยเพื่อให้ดูเหมือนเรียก API
  setTimeout(() => {
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

    setResult({ ok: true }); 
    setShowCalculated(true);
    setLoading(false);
  }, 500);
};