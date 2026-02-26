import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Data Routes
  app.get("/api/moods", (req, res) => {
    const moods = db.prepare("SELECT * FROM moods ORDER BY timestamp ASC").all();
    res.json(moods);
  });

  app.post("/api/moods", (req, res) => {
    const { mood } = req.body;
    db.prepare("INSERT INTO moods (mood) VALUES (?)").run(mood);
    res.json({ success: true });
  });

  app.get("/api/chats", (req, res) => {
    const chats = db.prepare("SELECT * FROM chats ORDER BY timestamp ASC").all();
    res.json(chats);
  });

  app.post("/api/chats", (req, res) => {
    const { role, content } = req.body;
    db.prepare("INSERT INTO chats (role, content) VALUES (?, ?)").run(role, content);
    res.json({ success: true });
  });

  app.delete("/api/chats", (req, res) => {
    db.prepare("DELETE FROM chats").run();
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
