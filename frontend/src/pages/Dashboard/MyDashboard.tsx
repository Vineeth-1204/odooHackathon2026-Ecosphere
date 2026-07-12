import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import socialService from "../../services/socialService";
import governanceService from "../../services/governanceService";
import { Trophy, Award, Gift, Leaf, Shield, Heart, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const MyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [personalRank, setPersonalRank] = useState<any>(null);
  const [esgScores, setEsgScores] = useState<any>(null);
  const [topEmployees, setTopEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rankRes, esgRes, employeesRes] = await Promise.all([
          socialService.getMyRank(),
          governanceService.getDashboardScores(),
          socialService.getEmployeeLeaderboard()
        ]);
        setPersonalRank(rankRes);
        setEsgScores(esgRes.organizationScores);
        setTopEmployees(employeesRes?.slice(0, 5) || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndData();

    async function fetchProfileAndData() {
      await fetchData();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1F4032]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#24333E]">Hello, {user?.firstName}!</h1>
        <p className="text-[#90998C] text-sm mt-1">Here is your environmental impact and performance snapshot.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] flex items-center gap-4">
          <div className="p-3 bg-[#EAF0EC] rounded-xl text-[#1F4032]">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Rank</p>
            <h3 className="text-xl font-bold text-[#24333E] mt-0.5">
              #{personalRank?.rank || "-"} <span className="text-xs font-medium text-[#90998C]">of {personalRank?.totalParticipants || 0}</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] flex items-center gap-4">
          <div className="p-3 bg-[#FCF8E3] rounded-xl text-[#E3A73E]">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">XP Points</p>
            <h3 className="text-xl font-bold text-[#24333E] mt-0.5">{personalRank?.xpPoints || 0} XP</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] flex items-center gap-4">
          <div className="p-3 bg-[#FDF0EC] rounded-xl text-[#C1503A]">
            <Gift size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Reward Points</p>
            <h3 className="text-xl font-bold text-[#24333E] mt-0.5">{personalRank?.rewardPoints || 0} pts</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Badges Earned</p>
            <h3 className="text-xl font-bold text-[#24333E] mt-0.5">{personalRank?.badgeCount || 0} unlocked</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Org ESG Scores (Left) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E4E6DF] pb-4">
            <h3 className="text-lg font-bold text-[#24333E]">Organization ESG Status</h3>
            <span className="px-3 py-1 bg-[#EAF0EC] text-[#1F4032] text-xs font-bold rounded-full">
              Overall: {esgScores?.totalScore || 0}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F3F5EF] p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#1F4032]">
                <Leaf size={18} />
                <span className="text-sm font-bold">Environmental</span>
              </div>
              <h4 className="text-2xl font-bold text-[#24333E]">{esgScores?.environmentalScore || 0}%</h4>
            </div>

            <div className="bg-[#F3F5EF] p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#C1503A]">
                <Heart size={18} />
                <span className="text-sm font-bold">Social</span>
              </div>
              <h4 className="text-2xl font-bold text-[#24333E]">{esgScores?.socialScore || 0}%</h4>
            </div>

            <div className="bg-[#F3F5EF] p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#24333E]">
                <Shield size={18} />
                <span className="text-sm font-bold">Governance</span>
              </div>
              <h4 className="text-2xl font-bold text-[#24333E]">{esgScores?.governanceScore || 0}%</h4>
            </div>
          </div>

          {/* Quick links */}
          <div className="pt-4 border-t border-[#E4E6DF] flex flex-wrap gap-4">
            <Link to="/csr" className="flex items-center gap-1.5 text-[#C1503A] hover:underline text-xs font-bold">
              Join CSR Activities <ChevronRight size={14} />
            </Link>
            <Link to="/challenges" className="flex items-center gap-1.5 text-[#E3A73E] hover:underline text-xs font-bold">
              Complete Challenges <ChevronRight size={14} />
            </Link>
            <Link to="/policies" className="flex items-center gap-1.5 text-[#24333E] hover:underline text-xs font-bold">
              Acknowledge Policies <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Leaderboard Widget (Right) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E4E6DF] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#24333E]">Leaderboard</h3>
              <Link to="/leaderboard" className="text-[#1F4032] hover:underline text-xs font-bold">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {topEmployees.map((emp, i) => (
                <div key={emp.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center font-bold text-sm ${i === 0 ? "text-[#E3A73E]" : i === 1 ? "text-[#90998C]" : "text-[#24333E]"}`}>
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#24333E]">{emp.name}</h4>
                      <p className="text-[10px] text-[#90998C]">{emp.department}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#1F4032]">{emp.xpPoints} XP</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E4E6DF] text-center">
            <p className="text-xs text-[#90998C]">
              You need <span className="font-bold text-[#E3A73E]">50 XP</span> to pass the next rank!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;
