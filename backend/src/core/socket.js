import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- WebRTC signaling events ---
  socket.on("call:user", ({ to, from }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:incoming", { from });
    }
  });

  socket.on("call:signal", ({ to, data }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:signal", { from: userId, data });
    }
  });

  socket.on("call:end", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:ended", { from: userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
