import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../apiControllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", verifyJWT, updateProfile);

router.get("/check", verifyJWT, checkAuth);

export default router;
