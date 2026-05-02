const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");
const dotenv = require("dotenv");
const ViteExpress = require("vite-express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const apiRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_change_me";
const SECRET_PASSWORD = process.env.INITIAL_PASSWORD || "vampire2024";

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

// MongoDB connection pooling for serverless
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  if (!mongoUrl || !dbName) {
    const missing = [];
    if (!mongoUrl) missing.push("MONGO_URL");
    if (!dbName) missing.push("DB_NAME");
    throw new Error(`Missing MongoDB configuration: ${missing.join(", ")}. Check Vercel Environment Variables.`);
  }

  // Diagnostic: Warn if connecting to localhost in production
  if (process.env.NODE_ENV === "production" && mongoUrl.includes("localhost")) {
    console.warn("CRITICAL: MONGO_URL points to localhost in production environment!");
  }

  try {
    const client = new MongoClient(mongoUrl, {
      connectTimeoutMS: 5000, // Fail fast if connection is slow
      serverSelectionTimeoutMS: 5000
    });
    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;
    console.log(`Successfully connected to database: ${dbName}`);
    return db;
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    throw err;
  }
}

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const corsOriginsEnv = process.env.CORS_ORIGINS || "*";
const allowedOrigins = corsOriginsEnv.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Slightly more generous for cloud
  message: { detail: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ detail: "Unauthorized - No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Unauthorized - Invalid token" });
  }
};

// Database injection middleware for every request
app.use(async (req, res, next) => {
  // Skip DB for static files or if already handled (though rewriting handles this)
  if (req.path.startsWith("/_next") || req.path.includes(".")) return next();

  try {
    req.db = await connectToDatabase();
    next();
  } catch (err) {
    console.error(`[DB Error] ${req.method} ${req.url}:`, err.message);
    res.status(500).json({ 
      detail: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined 
    });
  }
});

// ---- Auth Routes ----

apiRouter.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const { password } = req.body || {};
    const db = req.db;
    const users = db.collection("users");
    const admin = await users.findOne({ username: "admin" });

    // Auto-seed if not exists (helpful for first deploy)
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(SECRET_PASSWORD, salt);
      await users.insertOne({ username: "admin", password: hashedPassword });
      return res.status(500).json({ detail: "System initialized. Please try again." });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ detail: "Invalid password" });
    }

    const token = jwt.sign({ username: admin.username, id: admin._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const setting = await db.collection("settings").findOne({ key: "theme" });
    const theme = setting && setting.value ? setting.value : "dark";

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Always secure for Vercel/Production
      sameSite: "none", // Needed for cross-origin if frontend/backend are slightly different domains
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, theme });
  } catch (err) {
    console.error("Error in /auth/login:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.get("/auth/verify", requireAuth, async (req, res) => {
  return res.json({ valid: true });
});

apiRouter.post("/auth/logout", async (req, res) => {
  res.clearCookie("token", { secure: true, sameSite: "none" });
  return res.json({ success: true });
});

// Protect all following routes
apiRouter.use(requireAuth);

// ---- API Routes Implementation (Using req.db) ----
apiRouter.get("/gallery", async (req, res) => {
  const images = await req.db.collection("galleries").find({}).sort({ timestamp: -1 }).toArray();
  res.json(images);
});

apiRouter.post("/gallery", async (req, res) => {
  const { image_data, caption = "" } = req.body || {};
  const doc = { id: uuidv4(), image_data, caption, timestamp: new Date().toISOString() };
  await req.db.collection("galleries").insertOne(doc);
  res.status(201).json(doc);
});

apiRouter.delete("/gallery/:id", async (req, res) => {
  await req.db.collection("galleries").deleteOne({ id: req.params.id });
  res.json({ success: true });
});

apiRouter.get("/achievements", async (req, res) => {
  const data = await req.db.collection("achievements").find({}).sort({ timestamp: -1 }).toArray();
  res.json(data);
});

apiRouter.post("/achievements", async (req, res) => {
  const doc = { ...req.body, id: uuidv4(), timestamp: new Date().toISOString() };
  await req.db.collection("achievements").insertOne(doc);
  res.status(201).json(doc);
});

apiRouter.delete("/achievements/:id", async (req, res) => {
  await req.db.collection("achievements").deleteOne({ id: req.params.id });
  res.json({ success: true });
});

apiRouter.get("/todos", async (req, res) => {
  const data = await req.db.collection("todos").find({}).sort({ timestamp: -1 }).toArray();
  res.json(data);
});

apiRouter.post("/todos", async (req, res) => {
  const doc = { task: req.body.task, completed: false, id: uuidv4(), timestamp: new Date().toISOString() };
  await req.db.collection("todos").insertOne(doc);
  res.status(201).json(doc);
});

apiRouter.patch("/todos/:id", async (req, res) => {
  const result = await req.db.collection("todos").findOneAndUpdate(
    { id: req.params.id },
    { $set: { completed: req.body.completed } },
    { returnDocument: "after" }
  );
  res.json(result);
});

apiRouter.delete("/todos/:id", async (req, res) => {
  await req.db.collection("todos").deleteOne({ id: req.params.id });
  res.json({ success: true });
});

apiRouter.get("/journal", async (req, res) => {
  const data = await req.db.collection("journals").find({}).sort({ timestamp: -1 }).toArray();
  res.json(data);
});

apiRouter.post("/journal", async (req, res) => {
  const doc = { ...req.body, id: uuidv4(), timestamp: new Date().toISOString() };
  await req.db.collection("journals").insertOne(doc);
  res.status(201).json(doc);
});

apiRouter.delete("/journal/:id", async (req, res) => {
  await req.db.collection("journals").deleteOne({ id: req.params.id });
  res.json({ success: true });
});

apiRouter.get("/tribute", async (req, res) => {
  const data = await req.db.collection("tributes").find({}).sort({ timestamp: -1 }).toArray();
  res.json(data);
});

apiRouter.post("/tribute", async (req, res) => {
  const doc = { ...req.body, id: uuidv4(), timestamp: new Date().toISOString() };
  await req.db.collection("tributes").insertOne(doc);
  res.status(201).json(doc);
});

apiRouter.delete("/tribute/:id", async (req, res) => {
  await req.db.collection("tributes").deleteOne({ id: req.params.id });
  res.json({ success: true });
});

apiRouter.get("/settings/theme", async (req, res) => {
  const setting = await req.db.collection("settings").findOne({ key: "theme" });
  res.json({ theme: setting?.value || "dark" });
});

apiRouter.put("/settings/theme", async (req, res) => {
  await req.db.collection("settings").updateOne(
    { key: "theme" },
    { $set: { value: req.body.theme } },
    { upsert: true }
  );
  res.json({ success: true });
});

apiRouter.get("/stats", async (req, res) => {
  const [memories, achievements, completedTodos, journals] = await Promise.all([
    req.db.collection("galleries").countDocuments(),
    req.db.collection("achievements").countDocuments(),
    req.db.collection("todos").countDocuments({ completed: true }),
    req.db.collection("journals").countDocuments(),
  ]);
  res.json({ memories, achievements, completedTodos, journals });
});

// ... Add other routes as needed (trimmed for brevity but logic is identical)
// (Journal, Achievements, Todos, etc.)

app.use("/api", apiRouter);

// Export for Vercel
module.exports = app;

// Local development server
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 8000;
  ViteExpress.listen(app, port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
