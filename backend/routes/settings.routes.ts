import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

// Read endpoints (any logged-in user can check settings like site_name or ESG weights)
router.get("/", getSettings);

// Update endpoint (Admins only)
router.put("/", requireRole(["ADMIN"]), updateSettings);

export default router;
