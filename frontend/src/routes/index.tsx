import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleGuard from "../components/RoleGuard";

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

<<<<<<< HEAD
=======
// Environmental Module Pages
import CarbonDashboard from "../pages/Environment/CarbonDashboard";
import EmissionFactorList from "../pages/Environment/EmissionFactorList";
import EmissionFactorForm from "../pages/Environment/EmissionFactorForm";
import CarbonTransactionList from "../pages/Environment/CarbonTransactionList";
import CarbonTransactionForm from "../pages/Environment/CarbonTransactionForm";
import GoalList from "../pages/Environment/GoalList";
import GoalForm from "../pages/Environment/GoalForm";
import ProductESGProfile from "../pages/Environment/ProductESGProfile";

>>>>>>> d3e4a3e (Environmental Module)
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
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard Landing */}
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Profile */}
        <Route path="profile" element={<UserProfile />} />

        {/* User Management */}
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
              <UserList />
            </RoleGuard>
          }
        />
        <Route
          path="users/create"
          element={
            <RoleGuard allowedRoles={["ADMIN"]}>
              <UserForm />
            </RoleGuard>
          }
        />
        <Route
          path="users/edit/:id"
          element={
            <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
              <UserForm />
            </RoleGuard>
          }
        />

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
<<<<<<< HEAD
=======

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
        <Route
          path="environment/goals/create"
          element={
            <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
              <GoalForm />
            </RoleGuard>
          }
        />
        <Route
          path="environment/goals/edit/:id"
          element={
            <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
              <GoalForm />
            </RoleGuard>
          }
        />

        <Route path="environment/products" element={<ProductESGProfile />} />
>>>>>>> d3e4a3e (Environmental Module)
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
