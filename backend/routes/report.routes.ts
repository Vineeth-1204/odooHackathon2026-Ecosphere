import { Router } from "express";
import { getReportData, exportReportCSV } from "../controllers/report.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

router.get("/data", requireRole(["ADMIN", "MANAGER"]), getReportData);
router.get("/export", requireRole(["ADMIN", "MANAGER"]), exportReportCSV);

export default router;
