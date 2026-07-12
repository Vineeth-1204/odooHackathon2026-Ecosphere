import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { PrismaClient, User, Role, Department } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "ecosphere_jwt_secret_hackathon_2026_super_secure_key";

export interface AuthenticatedRequest extends Request {
  user?: User & {
    role: Role;
    department: Department | null;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        department: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
