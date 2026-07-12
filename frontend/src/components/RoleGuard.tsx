import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./ui/Loading";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullPage text="Verifying permissions..." />;
  }

  const userRole = user?.role?.name;

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect unauthorized users to root fallback
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
export default RoleGuard;
