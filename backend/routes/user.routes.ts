import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, getRoles } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Apply auth middleware to all endpoints
router.use(authenticateToken);

// Roles helper endpoint
router.get("/roles", requireRole(["ADMIN", "MANAGER"]), getRoles);

// CRUD
router.get("/", requireRole(["ADMIN", "MANAGER"]), getUsers);
router.get("/:id", getUserById);
router.post("/", requireRole(["ADMIN"]), createUser);
router.put("/:id", updateUser); // Internally restricts non-admin from updating others or editing roles
router.delete("/:id", requireRole(["ADMIN"]), deleteUser);

export default router;
