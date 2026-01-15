import Message from "../Models/message.model.js";
import Group from "../Models/group.model.js";
import { getReceiverSocketIds, io } from "../core/socket.js";

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.members.includes(req.user._id)) return res.status(403).json({ error: "Not a group member" });
    const messages = await Message.find({ groupId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.members.includes(req.user._id)) return res.status(403).json({ error: "Not a group member" });
    const newMessage = new Message({
      senderId: req.user._id,
      groupId,
      text,
      image,
    });
    await newMessage.save();
    // Emit to all group members except sender
    group.members.forEach(memberId => {
      if (String(memberId) !== String(req.user._id)) {
        const socketId = getReceiverSocketId(String(memberId));
        if (socketId) io.to(socketId).emit("newGroupMessage", newMessage);
      }
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
