import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const isEmployee = user?.role?.name === "USER";

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E4E6DF] px-6 py-4 flex items-center justify-between select-none">
      {/* Welcome Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-[#90998C] hidden md:block">
          Welcome back, <span className="text-[#1F4032] font-bold">{user?.firstName || "User"}</span>
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-5">
        {/* Notifications Icon (Employee goes to /notifications, Admin stays or links to list) */}
        <Link
          to={isEmployee ? "/notifications" : "/admin/governance/compliance"}
          className="text-[#90998C] hover:text-[#1F4032] relative p-1.5 rounded-lg hover:bg-[#F3F5EF] transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C1503A] ring-2 ring-white" />
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#E4E6DF]">
          <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#EAF0EC] border border-[#1F4032]/20 flex items-center justify-center text-[#1F4032] font-bold">
              <UserIcon size={16} />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#24333E]">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[9px] text-[#90998C] font-bold uppercase tracking-wider">
                {user?.role?.name}
              </span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log Out"
            className="text-[#90998C] hover:text-[#C1503A] p-1.5 rounded-lg hover:bg-[#C1503A]/5 transition-colors ml-2"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
