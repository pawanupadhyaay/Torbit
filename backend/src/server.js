const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

// Load .env, .env.local, or .env.production
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
dotenv.config({ path: path.join(__dirname, "../", envFile) });
dotenv.config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const upload = require("./middleware/uploadMiddleware");
const { uploadToR2, isR2Configured } = require("./services/r2Service");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const alertRoutes = require("./routes/alertRoutes");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 📝 1. Advanced CRUD & API Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const time = new Date().toLocaleTimeString('en-GB');
  
  // Identify CRUD Operation Type
  const methodMap = {
    GET: '🔍 [READ]   ',
    POST: '✨ [CREATE] ',
    PUT: '📝 [UPDATE] ',
    PATCH: '⚡ [PATCH]  ',
    DELETE: '🗑️ [DELETE] '
  };
  const crudType = methodMap[req.method] || `📌 [${req.method}]`;

  // Filter and sanitize body for logging (mask passwords)
  let safeBody = null;
  if (req.body && Object.keys(req.body).length > 0) {
    safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '******';
    if (safeBody.passwordHash) safeBody.passwordHash = '******';
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusIcon = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
    
    console.log(`[${time}] ${crudType} ${req.method.padEnd(6)} ${req.originalUrl} -> ${statusIcon} ${status} (${duration}ms)`);
    
    // Print payload if POST/PUT/PATCH/DELETE has body
    if (safeBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const bodyStr = JSON.stringify(safeBody);
      const truncated = bodyStr.length > 120 ? bodyStr.substring(0, 120) + '...' : bodyStr;
      console.log(`         ↳ 📦 Payload: ${truncated}`);
    }
  });

  next();
});

// Upload Route (< 2MB & PDF/DOC/DOCX check) -> Cloudflare R2 Upload
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or file rejected by validation." });
  }

  try {
    let fileUrl;
    const folder = req.body.folder || "resumes";

    if (isR2Configured()) {
      const result = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype, folder);
      fileUrl = result.fileUrl;
    } else {
      // Local disk fallback
      const uploadDir = path.join(__dirname, `../uploads/${folder}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const safeName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, req.file.buffer);
      fileUrl = `http://localhost:${PORT}/uploads/${folder}/${safeName}`;
    }

    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file to Cloud Storage." });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alerts", alertRoutes);

// Public Categories API (Master Data for Seeker & Recruiter panels)
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      message: "Torbit Job Portal Enterprise Backend is healthy!",
      database: "Prisma DB Connected",
      storage: isR2Configured() ? "Cloudflare R2" : "Local Storage"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection check failed",
      error: err.message
    });
  }
});

// 🚨 2. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`\n❌ [BACKEND ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  if (err.stack) {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    timestamp: new Date().toISOString()
  });
});

// 🚀 3. Server Startup & Database Verification
app.listen(PORT, async () => {
  console.log("\n=======================================================");
  console.log("🏢 TORBIT REALTY - ENTERPRISE BACKEND SERVICE");
  console.log("=======================================================");
  console.log(`🚀 Server Running on: http://localhost:${PORT}`);
  console.log(`📦 Storage Service  : ${isR2Configured() ? "Cloudflare R2" : "Local Storage Fallback"}`);

  // Test Database Connection
  try {
    await prisma.$connect();
    console.log("✅ Database Status  : Connected to Database successfully");
  } catch (dbErr) {
    console.error("❌ Database Status  : Connection Failed ->", dbErr.message);
  }
  console.log("📡 API Live Logger  : Active (Tracking all requests & errors)");
  console.log("=======================================================\n");
});

module.exports = app;