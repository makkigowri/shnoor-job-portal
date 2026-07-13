const parseSalaryRange = (salaryText) => {
  if (!salaryText || typeof salaryText !== "string") {
    return { min: null, max: null };
  }
  const numbers = salaryText.match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) {
    return { min: null, max: null };
  }
  const values = numbers.map((n) => parseFloat(n));
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min: Math.round(min), max: Math.round(max) };
};
module.exports = parseSalaryRange;
