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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[#C1503A]">
          <p>{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-xs underline hover:text-[#C1503A]/80 font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, categoryBreakdown, monthlyTrend, recentGoals } = data;

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#24333E] tracking-tight flex items-center gap-2">
            <Leaf className="text-[#1F4032]" />
            Environmental Analytics
          </h1>
          <p className="text-xs text-[#90998C] mt-1">
            Real-time insights into your organization's carbon footprint, targets, and product profiles.
          </p>
        </div>
        <Link 
          to="/admin/environment/transactions/create"
          className="flex items-center gap-1.5 bg-[#1F4032] hover:bg-[#1F4032]/90 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm"
        >
          Log Activity <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Footprint */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group shadow-sm bg-white border border-[#E4E6DF]">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#90998C] uppercase tracking-wider">Total Carbon Emissions</span>
            <span className="text-2xl font-extrabold text-[#24333E] group-hover:text-[#1F4032] transition-colors tracking-tight">
              {summary.totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-[#90998C] font-semibold uppercase">kg CO2e logged</span>
          </div>
          <div className="p-3 bg-[#EAF0EC] border border-[#1F4032]/10 rounded-xl text-[#1F4032]">
            <Leaf size={20} />
          </div>
        </div>

        {/* Card 2: Transactions */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group shadow-sm bg-white border border-[#E4E6DF]">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#90998C] uppercase tracking-wider">Logged Activities</span>
            <span className="text-2xl font-extrabold text-[#24333E] group-hover:text-[#1F4032] transition-colors tracking-tight">
              {summary.totalTransactions}
            </span>
            <span className="text-[10px] text-[#90998C] font-semibold uppercase">Ledger entries count</span>
          </div>
          <div className="p-3 bg-[#EAF0EC] border border-[#1F4032]/10 rounded-xl text-[#1F4032]">
            <Activity size={20} />
          </div>
        </div>

        {/* Card 3: Goals */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group shadow-sm bg-white border border-[#E4E6DF]">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#90998C] uppercase tracking-wider">Active Goals</span>
            <span className="text-2xl font-extrabold text-[#24333E] group-hover:text-[#1F4032] transition-colors tracking-tight">
              {summary.activeGoalsCount}
            </span>
            <span className="text-[10px] text-[#90998C] font-semibold uppercase">Sustainability limits</span>
          </div>
          <div className="p-3 bg-[#EAF0EC] border border-[#1F4032]/10 rounded-xl text-[#1F4032]">
            <Target size={20} />
          </div>
        </div>

        {/* Card 4: Product footprint */}
        <div className="glass-panel rounded-xl p-5 flex items-center justify-between relative overflow-hidden group shadow-sm bg-white border border-[#E4E6DF]">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#90998C] uppercase tracking-wider">Avg Product Footprint</span>
            <span className="text-2xl font-extrabold text-[#24333E] group-hover:text-[#1F4032] transition-colors tracking-tight">
              {summary.avgProductFootprint.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-[#90998C] font-semibold uppercase">kg CO2e per unit</span>
          </div>
          <div className="p-3 bg-[#EAF0EC] border border-[#1F4032]/10 rounded-xl text-[#1F4032]">
            <Box size={20} />
          </div>
        </div>
      </div>

      {/* Analytics Charts split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Trend chart */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-3 flex flex-col gap-4 bg-white border border-[#E4E6DF] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E4E6DF] pb-3">
            <h3 className="text-sm font-bold text-[#24333E] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-[#1F4032]" />
              Monthly Carbon Trend
            </h3>
            <span className="text-[10px] text-[#90998C] font-semibold uppercase">Last 6 Months</span>
          </div>
          <CarbonTrendChart data={monthlyTrend} />
        </div>

        {/* Category breakdown */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-2 flex flex-col gap-4 bg-white border border-[#E4E6DF] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E4E6DF] pb-3">
            <h3 className="text-sm font-bold text-[#24333E] uppercase tracking-wider flex items-center gap-2">
              <Leaf size={16} className="text-[#1F4032]" />
              Emissions by Category
            </h3>
            <span className="text-[10px] text-[#90998C] font-semibold uppercase">Breakdown percentage</span>
          </div>
          <EmissionChart data={categoryBreakdown} />
        </div>
      </div>

      {/* Sustainability Goals section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E6DF] pb-3.5">
          <h3 className="text-sm font-bold text-[#24333E] uppercase tracking-wider flex items-center gap-2">
            <Target size={16} className="text-[#1F4032]" />
            Sustainability Targets & Goals
          </h3>
          <Link 
            to="/admin/environment/goals" 
            className="text-xs text-[#1F4032] hover:text-[#1F4032]/80 font-bold transition-colors"
          >
            Manage Goals
          </Link>
        </div>

        {recentGoals.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-[#90998C] text-sm bg-white border border-[#E4E6DF] shadow-sm">
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
          to="/admin/environment/transactions" 
          className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between hover:bg-[#F3F5EF] bg-white border border-[#E4E6DF] shadow-sm group"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#24333E] group-hover:text-[#1F4032] transition-colors">Carbon Ledger Transactions</span>
            <span className="text-[10px] text-[#90998C]">View logged carbon activities history</span>
          </div>
          <ArrowUpRight size={16} className="text-[#90998C] group-hover:text-[#1F4032] transition-colors" />
        </Link>
        
        <Link 
          to="/admin/environment/emission-factors" 
          className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between hover:bg-[#F3F5EF] bg-white border border-[#E4E6DF] shadow-sm group"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#24333E] group-hover:text-[#1F4032] transition-colors">Carbon Emission Factors</span>
            <span className="text-[10px] text-[#90998C]">View, search, or edit system factors</span>
          </div>
          <ArrowUpRight size={16} className="text-[#90998C] group-hover:text-[#1F4032] transition-colors" />
        </Link>

        <Link 
          to="/admin/environment/products" 
          className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between hover:bg-[#F3F5EF] bg-white border border-[#E4E6DF] shadow-sm group"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#24333E] group-hover:text-[#1F4032] transition-colors">Product ESG Profiles</span>
            <span className="text-[10px] text-[#90998C]">Manage lifecycle footprints and grades</span>
          </div>
          <ArrowUpRight size={16} className="text-[#90998C] group-hover:text-[#1F4032] transition-colors" />
        </Link>
      </div>
    </div>
  );
};
export default CarbonDashboard;
