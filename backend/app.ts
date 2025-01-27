import express from "express";
import cors from "cors";
import http from "http";
import { initializeWebSocketServer } from "./websocket/server";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Upgrade", "Connection"],
    credentials: true,
  })
);

initializeWebSocketServer(server);

const PORT = process.env.PORT || 9292;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
