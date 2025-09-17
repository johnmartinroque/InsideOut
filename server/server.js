{
  /*  
  
  const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Express server 123 123 🚀");
});

// Example API route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

  
  */
}
{
  /* 
  
  const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// ESP32 details
const ESP32_IP = "http://192.168.100.169/";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Express server 🚀");
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// ---- ESP32 Monitor ----
let esp32Status = "disconnected";

async function checkESP32() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(ESP32_IP, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      if (esp32Status !== "connected") {
        console.log("✅ ESP32 Connected");
      }
      esp32Status = "connected";
    } else {
      throw new Error("Bad response");
    }
  } catch (error) {
    if (esp32Status !== "disconnected") {
      console.log("❌ ESP32 Disconnected");
    }
    esp32Status = "disconnected";
  }
}

// Check every 5 seconds
setInterval(checkESP32, 5000);

// API to get current status
app.get("/api/esp32-status", (req, res) => {
  res.json({ status: esp32Status });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

  
  */
}

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // allow all clients, adjust for security later
  },
});

const PORT = 5000;

// ESP32 details
const ESP32_IP = "http://192.168.100.169/";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Express server 🚀");
});

// ---- ESP32 Monitor ----
let esp32Status = "disconnected";

async function checkESP32() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(ESP32_IP, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      if (esp32Status !== "connected") {
        console.log("✅ ESP32 Connected");
        io.emit("esp32-status", "connected"); // 🔴 emit status
      }
      esp32Status = "connected";
    } else {
      throw new Error("Bad response");
    }
  } catch (error) {
    if (esp32Status !== "disconnected") {
      console.log("❌ ESP32 Disconnected");
      io.emit("esp32-status", "disconnected"); // 🔴 emit status
    }
    esp32Status = "disconnected";
  }
}

// Check every 5 seconds
setInterval(checkESP32, 5000);

// ---- Socket.IO ----
io.on("connection", (socket) => {
  console.log("⚡ Client connected");

  // Send current status immediately
  socket.emit("esp32-status", esp32Status);

  socket.on("disconnect", () => {
    console.log("⚡ Client disconnected");
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
