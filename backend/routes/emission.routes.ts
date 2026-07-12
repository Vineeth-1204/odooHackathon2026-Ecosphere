import { Router } from "express";
import { getEmissionFactors, getEmissionFactorById, createEmissionFactor, updateEmissionFactor, deleteEmissionFactor } from "../controllers/emission.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth to all endpoints
router.use(authenticateToken);

// Read endpoints (accessible by all authenticated users)
router.get("/", getEmissionFactors);
router.get("/:id", getEmissionFactorById);

// Write endpoints (Admins only)
router.post("/", requireRole(["ADMIN"]), createEmissionFactor);
router.put("/:id", requireRole(["ADMIN"]), updateEmissionFactor);
router.delete("/:id", requireRole(["ADMIN"]), deleteEmissionFactor);

export default router;
