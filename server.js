const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");
const dotenv = require("dotenv");
const ViteExpress = require("vite-express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// Load models
const User = require("./models/User");
const Gallery = require("./models/Gallery");
const Achievement = require("./models/Achievement");
const Todo = require("./models/Todo");
const Tribute = require("./models/Tribute");
const Setting = require("./models/Setting");
const Journal = require("./models/Journal");

dotenv.config();

const app = express();
const apiRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_change_me";
const SECRET_PASSWORD = process.env.INITIAL_PASSWORD || "vampire2024";

// MongoDB setup
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

if (!mongoUrl || !dbName) {
  console.error(
    "Missing MongoDB configuration. Please set MONGO_URL and DB_NAME in backend/.env",
  );
  process.exit(1);
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
  }),
);

app.use(morgan("dev"));

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
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

// ---- Auth Routes ----

apiRouter.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const { password } = req.body || {};
    
    // Find admin user
    const admin = await User.findOne({ username: "admin" });
    if (!admin) {
      return res.status(500).json({ detail: "System not initialized" });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ detail: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign({ username: admin.username, id: admin._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const settings = await Setting.findOne({ key: "theme" }, { _id: 0, value: 1 });
    const theme = settings && settings.value ? settings.value : "dark";

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      success: true,
      theme,
    });
  } catch (err) {
    console.error("Error in /auth/login:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.get("/auth/verify", requireAuth, async (req, res) => {
  return res.json({ valid: true });
});

apiRouter.post("/auth/logout", async (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true });
});

// Protect all following routes
apiRouter.use(requireAuth);

// ---- Gallery Routes ----

apiRouter.get("/gallery", async (req, res) => {
  try {
    const images = await Gallery.find({}, { _id: 0, __v: 0 }).sort({ timestamp: -1 }).limit(1000);
    return res.json(images);
  } catch (err) {
    console.error("Error in GET /gallery:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.post("/gallery", async (req, res) => {
  try {
    const { image_data, caption = "" } = req.body || {};
    if (!image_data) {
      return res.status(400).json({ detail: "image_data is required" });
    }

    const galleryObj = new Gallery({
      id: uuidv4(),
      image_data,
      caption,
      timestamp: new Date().toISOString(),
    });

    await galleryObj.save();
    return res.status(201).json({ ...galleryObj.toObject(), _id: undefined, __v: undefined });
  } catch (err) {
    console.error("Error in POST /gallery:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/gallery/:image_id", async (req, res) => {
  try {
    const { image_id } = req.params;
    const result = await Gallery.deleteOne({ id: image_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Image not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /gallery/:image_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// ---- Achievements Routes ----

apiRouter.get("/achievements", async (req, res) => {
  try {
    const achievements = await Achievement.find({}, { _id: 0, __v: 0 }).sort({ timestamp: -1 }).limit(1000);
    return res.json(achievements);
  } catch (err) {
    console.error("Error in GET /achievements:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.post("/achievements", async (req, res) => {
  try {
    const { title, description, image_data = null, date } = req.body || {};
    if (!title || !description || !date) {
      return res.status(400).json({ detail: "title, description and date are required" });
    }

    const achievementObj = new Achievement({
      id: uuidv4(),
      title,
      description,
      image_data,
      date,
      timestamp: new Date().toISOString(),
    });

    await achievementObj.save();
    return res.status(201).json({ ...achievementObj.toObject(), _id: undefined, __v: undefined });
  } catch (err) {
    console.error("Error in POST /achievements:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/achievements/:achievement_id", async (req, res) => {
  try {
    const { achievement_id } = req.params;
    const result = await Achievement.deleteOne({ id: achievement_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Achievement not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /achievements/:achievement_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// ---- ToDo Routes ----

apiRouter.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find({}, { _id: 0, __v: 0 }).sort({ timestamp: -1 }).limit(1000);
    return res.json(todos);
  } catch (err) {
    console.error("Error in GET /todos:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.post("/todos", async (req, res) => {
  try {
    const { task } = req.body || {};
    if (!task) {
      return res.status(400).json({ detail: "task is required" });
    }

    const todoObj = new Todo({
      id: uuidv4(),
      task,
      completed: false,
      timestamp: new Date().toISOString(),
    });

    await todoObj.save();
    return res.status(201).json({ ...todoObj.toObject(), _id: undefined, __v: undefined });
  } catch (err) {
    console.error("Error in POST /todos:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.patch("/todos/:todo_id", async (req, res) => {
  try {
    const { todo_id } = req.params;
    const { completed } = req.body || {};
    if (typeof completed !== "boolean") {
      return res.status(400).json({ detail: "completed (boolean) is required" });
    }

    const todo = await Todo.findOneAndUpdate(
      { id: todo_id },
      { $set: { completed } },
      { new: true, projection: { _id: 0, __v: 0 } }
    );

    if (!todo) {
      return res.status(404).json({ detail: "Todo not found" });
    }

    return res.json(todo);
  } catch (err) {
    console.error("Error in PATCH /todos/:todo_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/todos/:todo_id", async (req, res) => {
  try {
    const { todo_id } = req.params;
    const result = await Todo.deleteOne({ id: todo_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Todo not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /todos/:todo_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// ---- Tribute Routes ----

apiRouter.get("/tribute", async (req, res) => {
  try {
    const images = await Tribute.find({}, { _id: 0, __v: 0 }).sort({ timestamp: -1 }).limit(1000);
    return res.json(images);
  } catch (err) {
    console.error("Error in GET /tribute:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.post("/tribute", async (req, res) => {
  try {
    const { image_data, caption = "" } = req.body || {};
    if (!image_data) {
      return res.status(400).json({ detail: "image_data is required" });
    }

    const tributeObj = new Tribute({
      id: uuidv4(),
      image_data,
      caption,
      timestamp: new Date().toISOString(),
    });

    await tributeObj.save();
    return res.status(201).json({ ...tributeObj.toObject(), _id: undefined, __v: undefined });
  } catch (err) {
    console.error("Error in POST /tribute:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/tribute/:image_id", async (req, res) => {
  try {
    const { image_id } = req.params;
    const result = await Tribute.deleteOne({ id: image_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Image not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /tribute/:image_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// ---- Journal Routes ----

apiRouter.get("/journal", async (req, res) => {
  try {
    const entries = await Journal.find({}, { _id: 0, __v: 0 }).sort({ timestamp: -1 }).limit(1000);
    return res.json(entries);
  } catch (err) {
    console.error("Error in GET /journal:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.post("/journal", async (req, res) => {
  try {
    const { title, content, mood = "neutral" } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ detail: "title and content are required" });
    }

    const journalObj = new Journal({
      id: uuidv4(),
      title,
      content,
      mood,
      timestamp: new Date().toISOString(),
    });

    await journalObj.save();
    return res.status(201).json({ ...journalObj.toObject(), _id: undefined, __v: undefined });
  } catch (err) {
    console.error("Error in POST /journal:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/journal/:entry_id", async (req, res) => {
  try {
    const { entry_id } = req.params;
    const result = await Journal.deleteOne({ id: entry_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Entry not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /journal/:entry_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// ---- Stats Routes ----

apiRouter.get("/stats", async (req, res) => {
  try {
    const [galleryCount, achievementCount, todoCount, journalCount] = await Promise.all([
      Gallery.countDocuments(),
      Achievement.countDocuments(),
      Todo.countDocuments({ completed: true }),
      Journal.countDocuments()
    ]);
    return res.json({
      memories: galleryCount,
      achievements: achievementCount,
      completedTodos: todoCount,
      journals: journalCount
    });
  } catch (err) {
    console.error("Error in GET /stats:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// ---- Settings / Theme Routes ----

apiRouter.get("/settings/theme", async (req, res) => {
  try {
    const settings = await Setting.findOne({ key: "theme" }, { _id: 0, value: 1 });
    const theme = settings && settings.value ? settings.value : "dark";
    return res.json({ theme });
  } catch (err) {
    console.error("Error in GET /settings/theme:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.put("/settings/theme", async (req, res) => {
  try {
    const { theme } = req.body || {};
    if (!theme) {
      return res.status(400).json({ detail: "theme is required" });
    }

    await Setting.findOneAndUpdate(
      { key: "theme" },
      { $set: { value: theme } },
      { upsert: true, new: true }
    );

    return res.json({ theme });
  } catch (err) {
    console.error("Error in PUT /settings/theme:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

app.use("/api", apiRouter);

async function seedAdminUser() {
  try {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
      console.log("No admin user found. Creating initial admin user...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(SECRET_PASSWORD, salt);
      const admin = new User({
        username: "admin",
        password: hashedPassword
      });
      await admin.save();
      console.log("Admin user created successfully.");
    }
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }
}

async function start() {
  try {
    await mongoose.connect(`${mongoUrl}/${dbName}`);
    console.log("Connected to MongoDB via Mongoose");
    
    await seedAdminUser();

    const port = process.env.PORT ? Number(process.env.PORT) : 8000;
    ViteExpress.listen(app, port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB connection closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  console.log("MongoDB connection closed");
  process.exit(0);
});

start();
