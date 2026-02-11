const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables from .env in this directory
dotenv.config();

const app = express();
const apiRouter = express.Router();

// Constants mirroring server.py
const SECRET_PASSWORD = "vampire2024";
const ACCESS_TOKEN = "memory_vault_session_token";

// MongoDB setup
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

if (!mongoUrl || !dbName) {
  // Fail fast with a clear message so users know what to configure
  console.error(
    "Missing MongoDB configuration. Please set MONGO_URL and DB_NAME in backend/.env",
  );
  process.exit(1);
}

const client = new MongoClient(mongoUrl);
let db;

// Middleware
app.use(express.json({ limit: "10mb" })); // for JSON bodies (including base64 image data)

// CORS configuration similar to FastAPI CORSMiddleware
const corsOriginsEnv = process.env.CORS_ORIGINS || "*";
const allowedOrigins = corsOriginsEnv.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    credentials: true,
  }),
);

// Basic request logging
app.use(morgan("dev"));

// ---- Auth Routes ----

apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { password } = req.body || {};
    if (password !== SECRET_PASSWORD) {
      return res.status(401).json({ detail: "Invalid password" });
    }

    const settings = await db
      .collection("settings")
      .findOne({ key: "theme" }, { projection: { _id: 0 } });
    const theme = settings && settings.value ? settings.value : "dark";

    return res.json({
      success: true,
      token: ACCESS_TOKEN,
      theme,
    });
  } catch (err) {
    console.error("Error in /auth/login:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.get("/auth/verify", async (req, res) => {
  const { token } = req.query;
  if (token === ACCESS_TOKEN) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ detail: "Invalid token" });
});

// ---- Gallery Routes ----

apiRouter.get("/gallery", async (req, res) => {
  try {
    const images = await db
      .collection("gallery")
      .find({}, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    // Ensure timestamps are ISO strings
    const normalized = images.map((img) => ({
      ...img,
      timestamp:
        typeof img.timestamp === "string"
          ? img.timestamp
          : new Date(img.timestamp).toISOString(),
    }));

    return res.json(normalized);
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

    const galleryObj = {
      id: uuidv4(),
      image_data,
      caption,
      timestamp: new Date().toISOString(),
    };

    await db.collection("gallery").insertOne(galleryObj);
    return res.status(201).json(galleryObj);
  } catch (err) {
    console.error("Error in POST /gallery:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/gallery/:image_id", async (req, res) => {
  try {
    const { image_id } = req.params;
    const result = await db.collection("gallery").deleteOne({ id: image_id });
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
    const achievements = await db
      .collection("achievements")
      .find({}, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    const normalized = achievements.map((a) => ({
      ...a,
      timestamp:
        typeof a.timestamp === "string"
          ? a.timestamp
          : new Date(a.timestamp).toISOString(),
    }));

    return res.json(normalized);
  } catch (err) {
    console.error("Error in GET /achievements:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.post("/achievements", async (req, res) => {
  try {
    const { title, description, image_data = null, date } = req.body || {};
    if (!title || !description || !date) {
      return res
        .status(400)
        .json({ detail: "title, description and date are required" });
    }

    const achievementObj = {
      id: uuidv4(),
      title,
      description,
      image_data,
      date,
      timestamp: new Date().toISOString(),
    };

    await db.collection("achievements").insertOne(achievementObj);
    return res.status(201).json(achievementObj);
  } catch (err) {
    console.error("Error in POST /achievements:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/achievements/:achievement_id", async (req, res) => {
  try {
    const { achievement_id } = req.params;
    const result = await db
      .collection("achievements")
      .deleteOne({ id: achievement_id });
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
    const todos = await db
      .collection("todos")
      .find({}, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    const normalized = todos.map((t) => ({
      ...t,
      timestamp:
        typeof t.timestamp === "string"
          ? t.timestamp
          : new Date(t.timestamp).toISOString(),
    }));

    return res.json(normalized);
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

    const todoObj = {
      id: uuidv4(),
      task,
      completed: false,
      timestamp: new Date().toISOString(),
    };

    await db.collection("todos").insertOne(todoObj);
    return res.status(201).json(todoObj);
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
      return res
        .status(400)
        .json({ detail: "completed (boolean) is required" });
    }

    const result = await db.collection("todos").findOneAndUpdate(
      { id: todo_id },
      { $set: { completed } },
      {
        returnDocument: "after",
        projection: { _id: 0 },
      },
    );

    if (!result.value) {
      return res.status(404).json({ detail: "Todo not found" });
    }

    const todo = result.value;
    todo.timestamp =
      typeof todo.timestamp === "string"
        ? todo.timestamp
        : new Date(todo.timestamp).toISOString();

    return res.json(todo);
  } catch (err) {
    console.error("Error in PATCH /todos/:todo_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/todos/:todo_id", async (req, res) => {
  try {
    const { todo_id } = req.params;
    const result = await db.collection("todos").deleteOne({ id: todo_id });
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
    const images = await db
      .collection("tribute")
      .find({}, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    const normalized = images.map((img) => ({
      ...img,
      timestamp:
        typeof img.timestamp === "string"
          ? img.timestamp
          : new Date(img.timestamp).toISOString(),
    }));

    return res.json(normalized);
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

    const tributeObj = {
      id: uuidv4(),
      image_data,
      caption,
      timestamp: new Date().toISOString(),
    };

    await db.collection("tribute").insertOne(tributeObj);
    return res.status(201).json(tributeObj);
  } catch (err) {
    console.error("Error in POST /tribute:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

apiRouter.delete("/tribute/:image_id", async (req, res) => {
  try {
    const { image_id } = req.params;
    const result = await db.collection("tribute").deleteOne({ id: image_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Image not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /tribute/:image_id:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// ---- Settings / Theme Routes ----

apiRouter.get("/settings/theme", async (req, res) => {
  try {
    const settings = await db
      .collection("settings")
      .findOne({ key: "theme" }, { projection: { _id: 0 } });
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

    await db.collection("settings").updateOne(
      { key: "theme" },
      { $set: { value: theme } },
      { upsert: true },
    );

    return res.json({ theme });
  } catch (err) {
    console.error("Error in PUT /settings/theme:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
});

// Mount router at /api (like APIRouter(prefix="/api"))
app.use("/api", apiRouter);

// Graceful shutdown
async function shutdown() {
  try {
    await client.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start server after connecting to MongoDB
async function start() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");

    const port = process.env.PORT ? Number(process.env.PORT) : 8000;
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

