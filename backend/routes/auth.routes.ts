import { Router } from "express";
import { register, login, getProfile, forgotPassword } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// Protected Routes
router.get("/me", authenticateToken, getProfile);

export default router;
