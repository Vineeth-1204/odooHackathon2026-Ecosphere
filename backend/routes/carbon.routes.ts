import { Router } from "express";
import { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction, getDashboardSummary } from "../controllers/carbon.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth to all endpoints
router.use(authenticateToken);

// Aggregate metrics (must be declared BEFORE :id)
router.get("/dashboard", getDashboardSummary);

// Standard CRUD
router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.post("/", createTransaction);

// Only ADMIN and MANAGER can modify or delete existing transaction logs
router.put("/:id", requireRole(["ADMIN", "MANAGER"]), updateTransaction);
router.delete("/:id", requireRole(["ADMIN", "MANAGER"]), deleteTransaction);

export default router;
