// server.js
import express from "express";
import basicAuth from "express-basic-auth";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import path from "path";

(async () => {
  // --- 1) Настройка БД lowdb ---
  const dbFile = path.resolve(process.cwd(), "db.json");
  const adapter = new JSONFile(dbFile);
  // здесь задаём начальную структуру
  const defaultData = { users: [] };
  const db = new Low(adapter, defaultData);

  await db.read();
  db.data ||= defaultData;  // если файл пуст, подставит defaultData
  await db.write();         // запишет defaults в новый файл, если надо

  // --- 2) Создаём Express-сервер ---
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Basic Auth для /admin.html и /edit.html
  app.use(
    ["/admin.html", "/edit.html"],
    basicAuth({
      users: { admin: "27082048" },
      challenge: true,
      realm: "AdminPanel",
    })
  );

  // Статика
  app.use(express.static("public"));

  // CORS + JSON body
  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // --- 3) CRUD API для пользователей ---
  app.get("/api/users", async (_req, res) => {
    await db.read();
    res.json(db.data.users);
  });

  app.get("/api/users/:id", async (req, res) => {
    await db.read();
    const user = db.data.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    await db.read();
    const newUser = { id: nanoid(), ...req.body };
    db.data.users.push(newUser);
    await db.write();
    res.status(201).json(newUser);
  });

  app.put("/api/users/:id", async (req, res) => {
    await db.read();
    const idx = db.data.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    db.data.users[idx] = { id: req.params.id, ...req.body };
    await db.write();
    res.json(db.data.users[idx]);
  });

  app.delete("/api/users/:id", async (req, res) => {
    await db.read();
    db.data.users = db.data.users.filter(u => u.id !== req.params.id);
    await db.write();
    res.sendStatus(204);
  });

  // --- 4) Старт сервера ---
  app.listen(PORT, () => {
    console.log(`🚀 Admin server running at http://localhost:${PORT}`);
  });
})();
