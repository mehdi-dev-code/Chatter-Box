import User from "../dataModels/user.model.js";
import Message from "../dataModels/message.model.js";

import cloudinary from "../core/cloudinary.js";
import { getReceiverSocketId, io } from "../core/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Validate userToChatId format
    if (!userToChatId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate that user exists
    const userExists = await User.findById(userToChatId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate that either text or image is provided
    if (!text && !image) {
      return res.status(400).json({ error: "Message must contain text or image" });
    }

    if (!receiverId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid receiver ID" });
    }

    let imageUrl;
    if (image) {
      if (!image.startsWith('data:image')) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
