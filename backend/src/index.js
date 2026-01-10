import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

import { connectDB } from "./core/db.js";
import authRoutes from "./Routes/auth.route.js";
import messageRoutes from "./Routes/message.route.js";
import groupRoutes from "./Routes/group.route.js";
import { app, server } from "./core/socket.js";

dotenv.config();

const PORT = process.env.PORT || 9001;
const __dirname = path.resolve();

  //  Ensure uploads directory:-
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Created 'uploads/' directory");
}


  //  Global Middlewares:-
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

/* =========================
   Serve Uploaded Files
   (MUST be before routes)
========================= */
app.use("/uploads", (req, res, next) => {
  console.log(`Serving file: ${req.path}`);
  next();
});
app.use("/uploads", express.static(uploadsDir));

  //  API Routes:-
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

  //  Production Frontend:-
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

  //  Start Server:-
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
  connectDB();
});
