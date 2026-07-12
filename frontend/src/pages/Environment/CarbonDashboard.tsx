import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Activity, Target, Box, ArrowUpRight, TrendingUp } from "lucide-react";
import carbonService from "../../services/carbonService";
import { EmissionChart } from "../../components/environment/EmissionChart";
import { CarbonTrendChart } from "../../components/environment/CarbonTrendChart";
import { GoalProgressCard } from "../../components/environment/GoalProgressCard";
import { Loading } from "../../components/ui/Loading";

export const CarbonDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await carbonService.getDashboardSummary();
      setData(summary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load carbon dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loading text="Compiling environment analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <p>{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-xs underline hover:text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, categoryBreakdown, monthlyTrend, recentGoals } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Leaf className="text-emerald-400" />
            Environmental Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time insights into your organization's carbon footprint, targets, and product profiles.
          </p>
        </div>
        <Link 
          to="/environment/transactions/create"
          className="flex items-center gap-1.5 bg-gradient-primary text-slate-950 font-bold text-xs px-4 py-2 rounded-lg bg-gradient-hover shadow-lg shadow-brand-500/15"
        >
          Log Activity <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Footprint */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Carbon Emissions</span>
            <span className="text-2xl font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">
              {summary.totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">kg CO2e logged</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Leaf size={20} />
          </div>
        </div>

        {/* Card 2: Transactions */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged Activities</span>
            <span className="text-2xl font-extrabold text-slate-100 group-hover:text-cyan-400 transition-colors tracking-tight">
              {summary.totalTransactions}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Ledger entries count</span>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Activity size={20} />
          </div>
        </div>

        {/* Card 3: Goals */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Goals</span>
            <span className="text-2xl font-extrabold text-slate-100 group-hover:text-teal-400 transition-colors tracking-tight">
              {summary.activeGoalsCount}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Sustainability limits</span>
          </div>
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
            <Target size={20} />
          </div>
        </div>

        {/* Card 4: Product footprint */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Product Footprint</span>
            <span className="text-2xl font-extrabold text-slate-100 group-hover:text-indigo-400 transition-colors tracking-tight">
              {summary.avgProductFootprint.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">kg CO2e per unit</span>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Box size={20} />
          </div>
        </div>
      </div>

      {/* Analytics Charts split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Trend chart */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              Monthly Carbon Trend
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Last 6 Months</span>
          </div>
          <CarbonTrendChart data={monthlyTrend} />
        </div>

        {/* Category breakdown */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Leaf size={16} className="text-emerald-400" />
              Emissions by Category
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Breakdown percentage</span>
          </div>
          <EmissionChart data={categoryBreakdown} />
        </div>
      </div>

      {/* Sustainability Goals section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3.5">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Target size={16} className="text-emerald-400" />
            Sustainability Targets & Goals
          </h3>
          <Link 
            to="/environment/goals" 
            className="text-xs text-brand-400 hover:text-brand-300 font-bold transition-colors"
          >
            Manage Goals
          </Link>
        </div>

        {recentGoals.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-slate-500 text-sm">
            No active sustainability targets logged.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {recentGoals.map((goal: any) => (
              <GoalProgressCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          to="/environment/transactions" 
          className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between hover:bg-slate-900/10 group"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition-colors">Carbon Ledger Transactions</span>
            <span className="text-[10px] text-slate-500">View logged carbon activities history</span>
          </div>
          <ArrowUpRight size={16} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
        </Link>
        
        <Link 
          to="/environment/emission-factors" 
          className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between hover:bg-slate-900/10 group"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition-colors">Carbon Emission Factors</span>
            <span className="text-[10px] text-slate-500">View, search, or edit system factors</span>
          </div>
          <ArrowUpRight size={16} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
        </Link>

        <Link 
          to="/environment/products" 
          className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between hover:bg-slate-900/10 group"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition-colors">Product ESG Profiles</span>
            <span className="text-[10px] text-slate-500">Manage lifecycle footprints and grades</span>
          </div>
          <ArrowUpRight size={16} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
};
export default CarbonDashboard;
