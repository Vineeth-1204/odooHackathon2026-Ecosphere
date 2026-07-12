import { Router } from "express";
import { getComplianceIssues, getComplianceIssueById, createComplianceIssue, updateComplianceIssue, resolveComplianceIssue } from "../controllers/compliance.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

router.get("/", getComplianceIssues);
router.get("/:id", getComplianceIssueById);
router.post("/", requireRole(["ADMIN", "MANAGER"]), createComplianceIssue);
router.put("/:id", requireRole(["ADMIN", "MANAGER"]), updateComplianceIssue);
router.put("/:id/resolve", resolveComplianceIssue);

export default router;
