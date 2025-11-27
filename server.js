const express = require("express");
const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 3000;

// Host = localhost  →  talks to the MongoDB container via the exposed port
// Port = 27017      →  default MongoDB port
// User / Pass       →  admin / password (the credentials you gave the container)
const mongoUrl = "mongodb://admin:password@mongodb:27017";
const dbName = "todos";
let db;

MongoClient.connect(mongoUrl)
  .then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB →", dbName);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "photo-" + unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(express.static(__dirname));
app.use("/uploads", express.static(uploadDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/todos", async (req, res) => {
  const todos = await db.collection("todos").find().toArray();
  res.json(todos);
});

app.post("/todos", upload.single("photo"), async (req, res) => {
  const text = req.body.text?.trim();
  if (!text) return res.status(400).json({ error: "Text required" });

  const todo = {
    text,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date(),
  };

  const result = await db.collection("todos").insertOne(todo);
  todo._id = result.insertedId;
  res.json(todo);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server → http://localhost:${PORT}`);
});