const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExts = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid format. Only .pdf, .doc, .docx, .png, .jpg, .jpeg formats are accepted."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB strict limit
  fileFilter
});

module.exports = upload;