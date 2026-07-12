import { Router } from "express";
import { getAudits, getAuditById, createAudit, updateAudit, deleteAudit } from "../controllers/audit.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

router.get("/", getAudits);
router.get("/:id", getAuditById);
router.post("/", requireRole(["ADMIN", "MANAGER"]), createAudit);
router.put("/:id", requireRole(["ADMIN", "MANAGER"]), updateAudit);
router.delete("/:id", requireRole(["ADMIN", "MANAGER"]), deleteAudit);

export default router;
