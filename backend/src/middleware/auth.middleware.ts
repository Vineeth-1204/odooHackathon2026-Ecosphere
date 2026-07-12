import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "ecosphere_jwt_secret_hackathon_2026_super_secure_key";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; departmentId?: string | null };
  file?: any;
}

/**
 * Validates JWT and attaches user payload to req.user.
 * Token must be in Authorization: Bearer <token> header.
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true }
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User no longer exists" });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role.name,
      departmentId: user.departmentId
    };
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Restrict route to specific roles (e.g. ADMIN, MANAGER).
 * Must be used after requireAuth.
 */
export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Insufficient permissions" });
      return;
    }
    next();
  };
