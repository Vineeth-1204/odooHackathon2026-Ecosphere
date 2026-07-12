import React, { useState, useEffect } from "react";
import { Users, Building2, FolderOpen, Sliders, Database, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import userService from "../services/userService";
import departmentService from "../services/departmentService";
import categoryService from "../services/categoryService";
import settingsService from "../services/settingsService";
import { Loading } from "../components/ui/Loading";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    deptsCount: 0,
    catsCount: 0,
    settingsCount: 0
  });
  const [settingsObj, setSettingsObj] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, deptsRes, catsRes, settingsRes] = await Promise.all([
        userService.getUsers({ limit: 1 }),
        departmentService.getDepartments(),
        categoryService.getCategories(),
        settingsService.getSettings()
      ]);

      setStats({
        usersCount: usersRes.meta?.total || 0,
        deptsCount: deptsRes.departments?.length || 0,
        catsCount: catsRes.categories?.length || 0,
        settingsCount: settingsRes.settings?.length || 0
      });

      setSettingsObj(settingsRes.settingsObject || {});
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard statistics. Please ensure backend PostgreSQL server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <Loading text="Assembling administrative stats..." />;
  }

  const envWeight = parseFloat(settingsObj["esg_score_weight_environmental"]) || 0.4;
  const socWeight = parseFloat(settingsObj["esg_score_weight_social"]) || 0.3;
  const govWeight = parseFloat(settingsObj["esg_score_weight_governance"]) || 0.3;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Admin Dashboard <Sparkles className="text-brand-400" size={20} />
          </h1>
          <p className="text-slate-400 text-sm mt-1">Platform-wide statistics and settings control panel</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400">
          <Database size={14} className="text-brand-500" />
          <span>PostgreSQL Database:</span>
          <span className="text-brand-400 font-bold flex items-center gap-1 pl-1">
            <CheckCircle size={10} className="fill-brand-500/20" /> Connected
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Users Card */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Users</span>
            <span className="text-3xl font-extrabold text-slate-100">{stats.usersCount}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-brand-500/10 text-brand-400">
            <Users size={22} />
          </div>
        </div>

        {/* Departments Card */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Departments</span>
            <span className="text-3xl font-extrabold text-slate-100">{stats.deptsCount}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Building2 size={22} />
          </div>
        </div>

        {/* Categories Card */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ESG Categories</span>
            <span className="text-3xl font-extrabold text-slate-100">{stats.catsCount}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-teal-500/10 text-teal-400">
            <FolderOpen size={22} />
          </div>
        </div>

        {/* Settings Card */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Toggles</span>
            <span className="text-3xl font-extrabold text-slate-100">{stats.settingsCount}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Sliders size={22} />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ESG Weights Chart Panel (Visual Tailwind Component) */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-2 flex flex-col gap-5">
          <div>
            <h3 className="text-base font-bold text-slate-100">Overall ESG Weights Setup</h3>
            <p className="text-xs text-slate-400 mt-1">Configured weights used by the scoring engine to evaluate departments</p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {/* Environmental */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Environmental
                </span>
                <span className="text-slate-200">{(envWeight * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${envWeight * 100}%` }} />
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Social & Team Play
                </span>
                <span className="text-slate-200">{(socWeight * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${socWeight * 100}%` }} />
              </div>
            </div>

            {/* Governance */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500" /> Governance Policies
                </span>
                <span className="text-slate-200">{(govWeight * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${govWeight * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Weights configured dynamically in system settings.</span>
            <span className="font-semibold text-brand-400">Total Sum: {((envWeight + socWeight + govWeight) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Feature Toggles Status Card */}
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-4">Feature Toggles</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">Public Registration</span>
                  <span className="text-[10px] text-slate-500">Allow users to sign up via Register page</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  settingsObj["allow_user_registration"] === "true" 
                    ? "bg-brand-500/10 text-brand-400" 
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {settingsObj["allow_user_registration"] === "true" ? "ACTIVE" : "DISABLED"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">Maintenance Mode</span>
                  <span className="text-[10px] text-slate-500">Lock non-admins out of the backend</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  settingsObj["maintenance_mode"] === "true" 
                    ? "bg-red-500/10 text-red-400" 
                    : "bg-brand-500/10 text-brand-400"
                }`}>
                  {settingsObj["maintenance_mode"] === "true" ? "MAINTENANCE" : "ONLINE"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">System Name</span>
                  <span className="text-[10px] text-slate-500">Global display branding header</span>
                </div>
                <span className="text-xs text-slate-200 font-medium">
                  {settingsObj["site_name"] || "Ecosphere"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-6 border-t border-slate-900 mt-4 leading-normal">
            To update these features, navigate to the **Settings** control panel on the sidebar.
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
