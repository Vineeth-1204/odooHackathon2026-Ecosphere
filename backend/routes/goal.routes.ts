import { Router } from "express";
import { getGoals, getGoalById, createGoal, updateGoal, deleteGoal } from "../controllers/goal.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth to all endpoints
router.use(authenticateToken);

// Read endpoints
router.get("/", getGoals);
router.get("/:id", getGoalById);

// Write endpoints (Admins and Managers only)
router.post("/", requireRole(["ADMIN", "MANAGER"]), createGoal);
router.put("/:id", requireRole(["ADMIN", "MANAGER"]), updateGoal);
router.delete("/:id", requireRole(["ADMIN", "MANAGER"]), deleteGoal);

export default router;
