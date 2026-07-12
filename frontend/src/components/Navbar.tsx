import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
      {/* Site Logo or Section title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <span className="font-bold text-brand-400 text-lg">E</span>
        </div>
        <h2 className="text-sm font-semibold text-slate-400 hidden md:block">
          Welcome back, <span className="text-slate-100 font-bold">{user?.firstName || "User"}</span>
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-5">
        {/* Mock Notifications */}
        <button className="text-slate-400 hover:text-white relative p-1.5 rounded-lg hover:bg-slate-900 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-950" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <UserIcon size={16} />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {user?.role?.name}
              </span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log Out"
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/5 transition-colors ml-2"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
