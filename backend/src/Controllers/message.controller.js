import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../core/cloudinary.js";
import { getReceiverSocketIds, io } from "../core/socket.js";

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

// Send message (Text + optional file/image)
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

    let fileUrl = null;
    let fileType = null;

    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // ⭐ FIX: Determine resource type based on file type
        let resourceType = "auto"; // Default to auto-detection

        // For PDFs and documents, use "raw"
        if (req.file.mimetype === "application/pdf" || 
            req.file.mimetype.includes("document") ||
            req.file.mimetype.includes("msword") ||
            req.file.mimetype.includes("officedocument")) {
          resourceType = "raw";
        }

        console.log("📤 Uploading file:", {
          mimetype: req.file.mimetype,
          size: req.file.size,
          resourceType: resourceType
        });

        // Upload to Cloudinary with proper resource type
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          resource_type: resourceType, // ⭐ THIS IS THE KEY FIX
          folder: "chat_attachments",
          // For PDFs, you might want to add format conversion
          ...(req.file.mimetype === "application/pdf" && {
            format: "pdf",
            flags: "attachment" // This ensures it downloads instead of trying to display
          })
        });

        fileUrl = uploadResponse.secure_url;
        fileType = req.file.mimetype;

        console.log("✅ File uploaded successfully:", uploadResponse.secure_url);

      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        
        // Check if it's a 401 error
        if (uploadError.http_code === 401) {
          console.error("🔐 Authentication failed - Check your Cloudinary credentials!");
          return res.status(500).json({ 
            error: "Authentication failed with cloud storage. Please contact administrator." 
          });
        }
        
        return res.status(500).json({ 
          error: "File upload failed: " + uploadError.message 
        });
      }
    }

    const newMessage = new Message({ 
      senderId, 
      receiverId, 
      text, 
      file: fileUrl,
      fileType: fileType,
    });
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