import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, uploadMiddleware } from "../Controllers/message.controller.js";

const router = express.Router();

router.get("/users", verifyJWT, getUsersForSidebar);
router.get("/:id", verifyJWT, getMessages);

router.post("/send/:id", verifyJWT, uploadMiddleware, sendMessage);

export default router;
