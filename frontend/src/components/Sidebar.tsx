import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building,
  Settings,
  FolderOpen,
  Leaf,
  TrendingUp,
  Box,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  Award,
  Trophy,
  Bell,
  CheckSquare
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  const roleName = user?.role?.name;
  const isAdmin = roleName === "ADMIN";
  const isManager = roleName === "MANAGER" || isAdmin;

  const activeClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-white bg-[#1F4032] font-medium transition-all shadow-sm";
  const inactiveClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#90998C] hover:text-[#24333E] hover:bg-[#F3F5EF] transition-all";

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#E4E6DF] flex flex-col justify-between select-none">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-[#E4E6DF]">
          <div className="w-8 h-8 rounded-lg bg-[#1F4032] flex items-center justify-center font-bold text-white shadow-md">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#24333E] tracking-wide text-sm leading-tight">ECOSPHERE</span>
            <span className="text-[10px] text-[#90998C] font-bold uppercase tracking-widest leading-none">ESG PLATFORM</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin">
          {isManager ? (
            /* Admin / Manager Panel Sidebar Sections */
            <>
              {/* Core Administration Section */}
              <div className="space-y-2">
                <h4 className="px-4 text-[10px] font-bold text-[#90998C] tracking-wider uppercase">CORE ADMIN</h4>
                <div className="flex flex-col gap-1">
                  <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </NavLink>

                  <NavLink to="/admin/users" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <Users size={18} />
                    <span>Users</span>
                  </NavLink>

                  <NavLink to="/admin/departments" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <Building size={18} />
                    <span>Departments</span>
                  </NavLink>

                  <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <FolderOpen size={18} />
                    <span>Categories</span>
                  </NavLink>

                  {isAdmin && (
                    <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                      <Settings size={18} />
                      <span>Settings</span>
                    </NavLink>
                  )}
                </div>
              </div>

              {/* Environmental Section */}
              <div className="space-y-2">
                <h4 className="px-4 text-[10px] font-bold text-[#90998C] tracking-wider uppercase">ENVIRONMENT</h4>
                <div className="flex flex-col gap-1">
                  <NavLink to="/admin/environment/dashboard" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <LayoutDashboard size={18} />
                    <span>Env Dashboard</span>
                  </NavLink>

                  <NavLink to="/admin/environment/transactions" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <FileSpreadsheet size={18} />
                    <span>Carbon Ledger</span>
                  </NavLink>

                  <NavLink to="/admin/environment/emission-factors" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <Leaf size={18} />
                    <span>Emission Factors</span>
                  </NavLink>

                  <NavLink to="/admin/environment/goals" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <TrendingUp size={18} />
                    <span>Targets & Goals</span>
                  </NavLink>

                  <NavLink to="/admin/environment/products" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <Box size={18} />
                    <span>Product ESG</span>
                  </NavLink>
                </div>
              </div>

              {/* Social & Game Section */}
              <div className="space-y-2">
                <h4 className="px-4 text-[10px] font-bold text-[#90998C] tracking-wider uppercase">SOCIAL & GAME</h4>
                <div className="flex flex-col gap-1">
                  <NavLink to="/admin/social/csr" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <Users size={18} />
                    <span>CSR Activities</span>
                  </NavLink>
                  <NavLink to="/admin/social/challenges" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <Trophy size={18} />
                    <span>Challenges</span>
                  </NavLink>
                </div>
              </div>

              {/* Governance Section */}
              <div className="space-y-2">
                <h4 className="px-4 text-[10px] font-bold text-[#90998C] tracking-wider uppercase">GOVERNANCE</h4>
                <div className="flex flex-col gap-1">
                  <NavLink to="/admin/governance/policies" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <ShieldCheck size={18} />
                    <span>Policies</span>
                  </NavLink>
                  <NavLink to="/admin/governance/audits" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <CheckSquare size={18} />
                    <span>Audits</span>
                  </NavLink>
                  <NavLink to="/admin/governance/compliance" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <FileText size={18} />
                    <span>Compliance</span>
                  </NavLink>
                  <NavLink to="/admin/governance/reports" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                    <FileSpreadsheet size={18} />
                    <span>Reports Builder</span>
                  </NavLink>
                </div>
              </div>
            </>
          ) : (
            /* Employee / Standard User Panel Sidebar Section */
            <div className="space-y-2">
              <h4 className="px-4 text-[10px] font-bold text-[#90998C] tracking-wider uppercase">MY PORTAL</h4>
              <div className="flex flex-col gap-1">
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <LayoutDashboard size={18} />
                  <span>My Dashboard</span>
                </NavLink>

                <NavLink to="/csr" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <Users size={18} />
                  <span>CSR Activities</span>
                </NavLink>

                <NavLink to="/challenges" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <Trophy size={18} />
                  <span>Challenges</span>
                </NavLink>

                <NavLink to="/policies" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <ShieldCheck size={18} />
                  <span>My Policies</span>
                </NavLink>

                <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <Trophy size={18} />
                  <span>Leaderboard</span>
                </NavLink>

                <NavLink to="/rewards" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <Award size={18} />
                  <span>Rewards</span>
                </NavLink>

                <NavLink to="/notifications" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <Bell size={18} />
                  <span>Notifications</span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-[#E4E6DF] flex items-center gap-3 bg-[#F3F5EF]/50">
        <div className="w-9 h-9 rounded-full bg-[#EAF0EC] flex items-center justify-center text-[#1F4032] font-semibold uppercase text-sm border border-[#E4E6DF]">
          {user?.firstName?.charAt(0) || "U"}
        </div>
        <div className="flex-1 overflow-hidden text-left">
          <h5 className="text-xs font-semibold text-[#24333E] truncate">
            {user?.firstName} {user?.lastName}
          </h5>
          <p className="text-[10px] text-[#90998C] truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
