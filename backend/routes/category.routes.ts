import { Router } from "express";
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

// Read endpoints
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Write endpoints (Admins only)
router.post("/", requireRole(["ADMIN"]), createCategory);
router.put("/:id", requireRole(["ADMIN"]), updateCategory);
router.delete("/:id", requireRole(["ADMIN"]), deleteCategory);

export default router;
