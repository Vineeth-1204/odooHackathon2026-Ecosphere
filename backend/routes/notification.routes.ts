import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

router.get("/", getNotifications);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
