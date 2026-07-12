import { Router } from "express";
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "../controllers/department.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

// Read endpoints (any authenticated user can view)
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// Write endpoints (Admins only)
router.post("/", requireRole(["ADMIN"]), createDepartment);
router.put("/:id", requireRole(["ADMIN"]), updateDepartment);
router.delete("/:id", requireRole(["ADMIN"]), deleteDepartment);

export default router;
