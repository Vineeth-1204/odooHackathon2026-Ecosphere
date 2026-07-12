import { Router } from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth to all endpoints
router.use(authenticateToken);

// Read endpoints
router.get("/", getProducts);
router.get("/:id", getProductById);

// Write endpoints (Admins and Managers only)
router.post("/", requireRole(["ADMIN", "MANAGER"]), createProduct);
router.put("/:id", requireRole(["ADMIN", "MANAGER"]), updateProduct);
router.delete("/:id", requireRole(["ADMIN", "MANAGER"]), deleteProduct);

export default router;
