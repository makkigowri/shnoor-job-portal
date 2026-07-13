const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const extractResumeText = async (filePath, mimetype) => {
  if (mimetype === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || "";
  }
  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }
  if (mimetype === "application/msword") {
    throw new Error("Legacy .doc files can't be analyzed. Please upload a PDF or DOCX resume.");
  }
  throw new Error("Unsupported file type. Please upload a PDF or DOCX resume.");
};
module.exports = extractResumeText;
