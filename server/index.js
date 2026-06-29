require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Frontend URL
const CLIENT_URL =
  process.env.CLIENT_URL ||
  "https://water-notification-system-6vgf1iznz-sriramj03s-projects.vercel.app";

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("io", io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/water", require("./routes/water"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/neighbors", require("./routes/neighbors"));
app.use("/api/emergency", require("./routes/emergency"));
app.use("/api/help", require("./routes/help"));
app.use("/api/admin", require("./routes/admin"));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Water Notification Backend is Running",
    timestamp: new Date(),
  });
});

// Socket
require("./sockets/socketHandler")(io);

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed Frontend: ${CLIENT_URL}`);
});
