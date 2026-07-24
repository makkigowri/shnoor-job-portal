const ExcelJS = require("exceljs");
const buildExportFilename = (prefix, suffix) => {
  const base = suffix ? `${prefix}_${suffix}` : prefix;
  const safe = base
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${safe || prefix}.xlsx`;
};
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};
const sendExcelFile = async (res, filename, columns, rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Export");
  sheet.columns = columns.map((header) => ({ header, key: header, width: 24 }));
  rows.forEach((row) => {
    const record = {};
    columns.forEach((col, idx) => {
      record[col] = row[idx] === undefined || row[idx] === null ? "" : row[idx];
    });
    sheet.addRow(record);
  });
  sheet.getRow(1).font = { bold: true };
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};
module.exports = { buildExportFilename, formatDate, sendExcelFile };
