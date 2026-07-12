import { Router } from "express";
import { getPolicies, getPolicyById, createPolicy, acknowledgePolicy } from "../controllers/policy.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Require login for all policy paths
router.use(authenticateToken);

router.get("/", getPolicies);
router.get("/:id", getPolicyById);
router.post("/", requireRole(["ADMIN", "MANAGER"]), createPolicy);
router.post("/:id/acknowledge", acknowledgePolicy);

export default router;
