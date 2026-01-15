
import express from "express";
import multer from "multer";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    getMessages, 
    getUsersForSidebar, 
    sendMessage 
} from "../controllers/message.controller.js";

const router = express.Router();

/**
 * MULTER CONFIGURATION
 * We use memoryStorage so the file buffer is available in req.file 
 * without saving it to a local folder on your server.
 */
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// GET: Fetch all users for the sidebar
router.get("/users", verifyJWT, getUsersForSidebar);

// GET: Fetch message history for a specific user
router.get("/:id", verifyJWT, getMessages);

/**
 * POST: Send a message (Text + File/Image)
 * 'upload.single("file")' looks for the 'file' field in your Frontend FormData.
 * This MUST match: formData.append("file", filePreview) in MessageInput.jsx.
 */
router.post("/send/:id", verifyJWT, upload.single("file"), sendMessage);

export default router;
