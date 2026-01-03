import Group from "../dataModels/group.model.js";
import User from "../dataModels/user.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const group = await Group.create({
      name,
      description,
      members: [...new Set([...members, req.user._id])],
      admins: [req.user._id],
      createdBy: req.user._id,
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    );
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
