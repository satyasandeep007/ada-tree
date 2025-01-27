import express from "express";
import http from "http";
import { initializeWebSocketServer } from "./websocket/server";

const app = express();
const server = http.createServer(app);

initializeWebSocketServer(server);

const PORT = process.env.PORT || 9292;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
