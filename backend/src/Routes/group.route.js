import express from "express";
import { createGroup, getUserGroups, addGroupMember, removeGroupMember } from "../controllers/group.controller.js";
import { getGroupMessages, sendGroupMessage } from "../controllers/groupMessage.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/create", verifyJWT, createGroup);
router.get("/my-groups", verifyJWT, getUserGroups);
router.post("/add-member", verifyJWT, addGroupMember);
router.post("/remove-member", verifyJWT, removeGroupMember);

// Group messages
router.get("/:groupId/messages", verifyJWT, getGroupMessages);
router.post("/:groupId/messages", verifyJWT, sendGroupMessage);

export default router;
