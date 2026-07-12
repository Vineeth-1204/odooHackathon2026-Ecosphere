import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleGuard from "../components/RoleGuard";
import { useAuth } from "../context/AuthContext";

// Layout
import DashboardLayout from "../pages/DashboardLayout";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

import AdminDashboard from "../pages/AdminDashboard";

import UserList from "../pages/Users/UserList";
import UserForm from "../pages/Users/UserForm";
import UserProfile from "../pages/Users/UserProfile";

import DepartmentList from "../pages/Departments/DepartmentList";
import CategoryList from "../pages/Categories/CategoryList";
import SettingsDashboard from "../pages/Settings";

// Environmental Module Pages
import CarbonDashboard from "../pages/Environment/CarbonDashboard";
import EmissionFactorList from "../pages/Environment/EmissionFactorList";
import EmissionFactorForm from "../pages/Environment/EmissionFactorForm";
import CarbonTransactionList from "../pages/Environment/CarbonTransactionList";
import CarbonTransactionForm from "../pages/Environment/CarbonTransactionForm";
import GoalList from "../pages/Environment/GoalList";
import GoalForm from "../pages/Environment/GoalForm";
import ProductESGProfile from "../pages/Environment/ProductESGProfile";

// Employee Portal Pages
import MyDashboard from "../pages/Dashboard/MyDashboard";
import CSREmployeeActivities from "../pages/CSR/CSREmployeeActivities";
import EmployeeChallenges from "../pages/Challenges/EmployeeChallenges";
import EmployeePolicies from "../pages/Governance/EmployeePolicies";
import EmployeeLeaderboard from "../pages/Gamification/EmployeeLeaderboard";
import EmployeeRewards from "../pages/Gamification/EmployeeRewards";
import EmployeeNotifications from "../pages/Notifications/EmployeeNotifications";

// Governance Module Pages
import PolicyList from "../pages/Governance/PolicyList";
import AuditList from "../pages/Governance/AuditList";
import ComplianceIssueList from "../pages/Governance/ComplianceIssueList";
import ReportsBuilder from "../pages/Reports/ReportsBuilder";

/**
 * Directs users to `/admin/dashboard` or `/dashboard` based on their role metadata.
 */
const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  const roleName = user?.role?.name;
  if (roleName === "ADMIN" || roleName === "MANAGER") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Dashboard Wrapper */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect from root index */}
        <Route index element={<RootRedirect />} />

        {/* ================= EMPLOYEE PORTAL ROUTES ================= */}
        <Route path="dashboard" element={
          <RoleGuard allowedRoles={["USER"]}>
            <MyDashboard />
          </RoleGuard>
        } />
        <Route path="csr" element={
          <RoleGuard allowedRoles={["USER"]}>
            <CSREmployeeActivities />
          </RoleGuard>
        } />
        <Route path="challenges" element={
          <RoleGuard allowedRoles={["USER"]}>
            <EmployeeChallenges />
          </RoleGuard>
        } />
        <Route path="policies" element={
          <RoleGuard allowedRoles={["USER"]}>
            <EmployeePolicies />
          </RoleGuard>
        } />
        <Route path="leaderboard" element={
          <RoleGuard allowedRoles={["USER"]}>
            <EmployeeLeaderboard />
          </RoleGuard>
        } />
        <Route path="rewards" element={
          <RoleGuard allowedRoles={["USER"]}>
            <EmployeeRewards />
          </RoleGuard>
        } />
        <Route path="notifications" element={
          <RoleGuard allowedRoles={["USER"]}>
            <EmployeeNotifications />
          </RoleGuard>
        } />

        {/* Profile (Shared) */}
        <Route path="profile" element={<UserProfile />} />

        {/* ================= ADMIN / MANAGER PORTAL ROUTES ================= */}
        <Route
          path="admin"
          element={
            <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
              <Outlet />
            </RoleGuard>
          }
        >
          {/* Admin Dashboard */}
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* User Management */}
          <Route path="users" element={<UserList />} />
          <Route
            path="users/create"
            element={
              <RoleGuard allowedRoles={["ADMIN"]}>
                <UserForm />
              </RoleGuard>
            }
          />
          <Route path="users/edit/:id" element={<UserForm />} />

          {/* Departments */}
          <Route path="departments" element={<DepartmentList />} />

          {/* ESG Categories */}
          <Route path="categories" element={<CategoryList />} />

          {/* System Settings */}
          <Route
            path="settings"
            element={
              <RoleGuard allowedRoles={["ADMIN"]}>
                <SettingsDashboard />
              </RoleGuard>
            }
          />

          {/* Environmental Module Routes */}
          <Route path="environment/dashboard" element={<CarbonDashboard />} />
          <Route path="environment/emission-factors" element={<EmissionFactorList />} />
          <Route
            path="environment/emission-factors/create"
            element={
              <RoleGuard allowedRoles={["ADMIN"]}>
                <EmissionFactorForm />
              </RoleGuard>
            }
          />
          <Route
            path="environment/emission-factors/edit/:id"
            element={
              <RoleGuard allowedRoles={["ADMIN"]}>
                <EmissionFactorForm />
              </RoleGuard>
            }
          />
          <Route path="environment/transactions" element={<CarbonTransactionList />} />
          <Route path="environment/transactions/create" element={<CarbonTransactionForm />} />
          <Route
            path="environment/transactions/edit/:id"
            element={
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
                <CarbonTransactionForm />
              </RoleGuard>
            }
          />
          <Route path="environment/goals" element={<GoalList />} />
          <Route path="environment/goals/create" element={<GoalForm />} />
          <Route path="environment/goals/edit/:id" element={<GoalForm />} />
          <Route path="environment/products" element={<ProductESGProfile />} />

          {/* Social & Game Routes */}
          <Route path="social/csr" element={<CSREmployeeActivities />} />
          <Route path="social/challenges" element={<EmployeeChallenges />} />

          {/* Governance Module Routes */}
          <Route path="governance/policies" element={<PolicyList />} />
          <Route path="governance/audits" element={<AuditList />} />
          <Route path="governance/compliance" element={<ComplianceIssueList />} />
          <Route path="governance/reports" element={<ReportsBuilder />} />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
