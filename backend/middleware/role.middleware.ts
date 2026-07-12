import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Authentication required." });
    }

    const hasRole = allowedRoles.includes(req.user.role.name);
    if (!hasRole) {
      return res.status(403).json({
        message: `Forbidden. Access requires one of the following roles: ${allowedRoles.join(", ")}`
      });
    }

    next();
  };
}
