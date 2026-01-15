import { Server } from "socket.io";
import http from "http";
import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// Store multiple sockets per user
const userSocketMap = {}; // { userId: [socketId1, socketId2] }

export function getReceiverSocketIds(userId) {
  return userSocketMap[userId] || [];
}

// Ensure uploads directory exists
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    if (!userSocketMap[userId]) userSocketMap[userId] = [];
    userSocketMap[userId].push(socket.id);
    console.log(`User ${userId} mapped to sockets:`, userSocketMap[userId]);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- WebRTC signaling ---
  socket.on("call:user", ({ to, from }) => {
    const receiverSockets = getReceiverSocketIds(to);
    receiverSockets.forEach(id => io.to(id).emit("call:incoming", { from }));
  });

  socket.on("call:signal", ({ to, data }) => {
    const receiverSockets = getReceiverSocketIds(to);
    if (receiverSockets.length) {
      receiverSockets.forEach(id => io.to(id).emit("call:signal", { from: userId, data }));
    } else {
      socket.emit("call:error", { error: "Receiver not found" });
    }
  });

  socket.on("call:end", ({ to }) => {
    const receiverSockets = getReceiverSocketIds(to);
    receiverSockets.forEach(id => io.to(id).emit("call:ended", { from: userId }));
  });

  // --- Text message ---
  socket.on("message:send", ({ to, message }) => {
    const receiverSockets = getReceiverSocketIds(to);
    receiverSockets.forEach(id => io.to(id).emit("message:receive", { from: userId, message }));
  });

  // --- File sharing ---
  socket.on("file:send", ({ to, fileName, fileData }) => {
    const receiverSockets = getReceiverSocketIds(to);
    receiverSockets.forEach(id => io.to(id).emit("file:receive", { from: userId, fileName, fileData }));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };



