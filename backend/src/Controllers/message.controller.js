import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import multer from "multer";
import path from "path";
import { getReceiverSocketIds, io } from "../core/socket.js"; // updated import

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) cb(null, true);
    else cb(new Error("Invalid file type. Only images and documents allowed."));
  }
});

export const uploadMiddleware = upload.single("file");

// Get all other users for sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("getUsersForSidebar error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages between logged-in user and another user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!userToChatId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ error: "Invalid user ID" });

    const userExists = await User.findById(userToChatId);
    if (!userExists) return res.status(404).json({ error: "User not found" });

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send message (text + optional file) and emit to all receiver sockets
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !req.file) {
      return res.status(400).json({ error: "Message must contain text or a file." });
    }

    if (!receiverId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ error: "Invalid receiver ID." });

    let fileUrl;
    if (req.file) {
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const newMessage = new Message({ senderId, receiverId, text, file: fileUrl });
    await newMessage.save();

    // Emit message to all receiver sockets
    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach(socketId => {
      io.to(socketId).emit("newMessage", newMessage);
    });

    // Optional: emit to sender's other sockets (multi-tab support)
    const senderSockets = getReceiverSocketIds(senderId);
    senderSockets.forEach(socketId => {
      if (!receiverSockets.includes(socketId)) {
        io.to(socketId).emit("newMessage", newMessage);
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

