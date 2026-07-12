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
  Users2,
  ShieldCheck,
  TrendingUp,
<<<<<<< HEAD
  FileText
=======
  FileText,
  Box,
  FileSpreadsheet
>>>>>>> d3e4a3e (Environmental Module)
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "ADMIN";
  const isManager = user?.role?.name === "MANAGER" || isAdmin;

  const activeClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-brand-400 bg-brand-500/10 border-l-2 border-brand-500 font-medium transition-all";
  const inactiveClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 transition-all border-l-2 border-transparent";

  return (
    <aside className="w-64 h-screen bg-slate-950 border-r border-slate-900 flex flex-col justify-between select-none">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-slate-900">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-brand-500/20">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-100 tracking-wide text-sm leading-tight">ECOSPHERE</span>
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest leading-none">ESG PLATFORM</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin">
          {/* Core Administration Section */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase">CORE ADMIN</h4>
            <div className="flex flex-col gap-1">
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              {isManager && (
                <NavLink to="/users" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <Users size={18} />
                  <span>Users</span>
                </NavLink>
              )}

              <NavLink to="/departments" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <Building size={18} />
                <span>Departments</span>
              </NavLink>

              <NavLink to="/categories" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <FolderOpen size={18} />
                <span>Categories</span>
              </NavLink>

              {isAdmin && (
                <NavLink to="/settings" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                  <Settings size={18} />
                  <span>Settings</span>
                </NavLink>
              )}
            </div>
          </div>

<<<<<<< HEAD
          {/* Environmental Module placeholders for TM2 */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase opacity-60">ENVIRONMENT (TM 2)</h4>
            <div className="flex flex-col gap-1 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 text-sm select-none">
                <Leaf size={18} />
                <span>Carbon Ledger</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 text-sm select-none">
                <TrendingUp size={18} />
                <span>Goals & ESG</span>
              </div>
=======
          {/* Environmental Module for TM2 */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase">ENVIRONMENT</h4>
            <div className="flex flex-col gap-1">
              <NavLink to="/environment/dashboard" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <LayoutDashboard size={18} />
                <span>Env Dashboard</span>
              </NavLink>

              <NavLink to="/environment/transactions" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <FileSpreadsheet size={18} />
                <span>Carbon Ledger</span>
              </NavLink>

              <NavLink to="/environment/emission-factors" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <Leaf size={18} />
                <span>Emission Factors</span>
              </NavLink>

              <NavLink to="/environment/goals" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <TrendingUp size={18} />
                <span>Targets & Goals</span>
              </NavLink>

              <NavLink to="/environment/products" className={({ isActive }) => (isActive ? activeClass : inactiveClass)}>
                <Box size={18} />
                <span>Product ESG</span>
              </NavLink>
>>>>>>> d3e4a3e (Environmental Module)
            </div>
          </div>

          {/* Social Module placeholders for TM3 */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase opacity-60">SOCIAL & GAME (TM 3)</h4>
            <div className="flex flex-col gap-1 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 text-sm select-none">
                <Users2 size={18} />
                <span>CSR & Teams</span>
              </div>
            </div>
          </div>

          {/* Governance Module placeholders for TM4 */}
          <div className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase opacity-60">GOVERNANCE (TM 4)</h4>
            <div className="flex flex-col gap-1 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 text-sm select-none">
                <ShieldCheck size={18} />
                <span>Audit & Policies</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 text-sm select-none">
                <FileText size={18} />
                <span>Summary Reports</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-900 flex items-center gap-3 bg-slate-900/10">
        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold uppercase text-sm border border-slate-700">
          {user?.firstName?.charAt(0) || "U"}
        </div>
        <div className="flex-1 overflow-hidden">
          <h5 className="text-xs font-semibold text-slate-200 truncate">
            {user?.firstName} {user?.lastName}
          </h5>
          <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
