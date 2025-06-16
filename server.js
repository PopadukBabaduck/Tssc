// admin-panel/server.js
import express from "express";
import basicAuth from "express-basic-auth";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import path from "path";

const app = express();
const PORT = 3000;

// 1) Basic Auth для админки (ТОЛЬКО на /admin.html и /edit.html)
app.use(
  ["/admin.html", "/edit.html"],
  basicAuth({
    users: { admin: "27082048" },
    challenge: true,
    realm: "AdminPanel",
  })
);

// 2) Настраиваем раздачу статических файлов
app.use(express.static("public"));

// 3) CORS + JSON
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// 4) lowdb setup
const dbFile = path.join(process.cwd(), "db.json");
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);
await db.read();
db.data ||= { users: [] };

// 5) CRUD API
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

// 6) Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Admin server running at http://localhost:${PORT}`);
});
