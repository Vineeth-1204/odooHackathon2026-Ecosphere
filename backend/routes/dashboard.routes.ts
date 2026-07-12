import { Router } from "express";
import { getESGScores, getDashboardKPIs } from "../controllers/dashboard.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

router.get("/scores", getESGScores);
router.get("/kpis", getDashboardKPIs);

export default router;
