const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "taskflow-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

// --- In-memory store ---
const users = {
  admin: { password: "admin123", name: "Admin" },
};

let tasks = [];
let nextId = 1;

// --- Auth middleware ---
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.sendFile(path.join(__dirname, "views", "login.html"));
}

// --- Auth routes ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  const isFormSubmission =
    req.headers["content-type"] &&
    req.headers["content-type"].includes("application/x-www-form-urlencoded");

  if (!user || user.password !== password) {
    if (isFormSubmission) {
      return res.redirect("/login?error=1");
    }
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.user = { username, name: user.name };

  if (isFormSubmission) {
    return res.redirect("/");
  }
  res.json({ success: true, user: { username, name: user.name } });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// --- User management ---
app.post("/api/users", (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(409).json({ error: "Username already exists" });
  }

  users[username] = { password, name: name || username };
  res.status(201).json({ success: true, user: { username, name: name || username } });
});

// --- Task API routes ---
app.get("/api/tasks", requireAuth, (req, res) => {
  const userTasks = tasks.filter((t) => t.owner === req.session.user.username);
  res.json(userTasks);
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const { title, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const validPriorities = ["low", "medium", "high"];
  const taskPriority = validPriorities.includes(priority) ? priority : "low";

  const task = {
    id: nextId++,
    title: title.trim(),
    priority: taskPriority,
    completed: false,
    owner: req.session.user.username,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(
    (t) => t.id === id && t.owner === req.session.user.username,
  );

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (req.body.completed !== undefined) {
    task.completed = Boolean(req.body.completed);
  }
  if (req.body.title !== undefined) {
    task.title = req.body.title.trim();
  }

  res.json(task);
});

app.delete("/api/tasks/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex(
    (t) => t.id === id && t.owner === req.session.user.username,
  );

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  res.json({ success: true });
});

// --- Reset endpoint (for test cleanup) ---
app.post("/api/reset", (req, res) => {
  tasks = [];
  nextId = 1;
  // Remove all users except admin
  Object.keys(users).forEach((key) => {
    if (key !== "admin") delete users[key];
  });
  res.json({ success: true });
});

// --- Login page ---
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// --- Protected app ---
app.get("/", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// --- Static files ---
app.use("/static", express.static(path.join(__dirname, "public")));

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// -- Everything else ---
app.get("/*", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`TaskFlow running on http://localhost:${PORT}`);
});
