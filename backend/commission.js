
function calculateCommission(sales) {
 
  if (sales >= 1800) {
    return 0.10 * 1000 + 0.15 * 800 + 0.20 * (sales - 1800);
  } else if (sales >= 1000) {
    return 0.10 * 1000 + 0.15 * (sales - 1000);
  } else {
    return sales * 0.10;
  }
}

module.exports = calculateCommission;
