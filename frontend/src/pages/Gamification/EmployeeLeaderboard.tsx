import React, { useEffect, useState } from "react";
import socialService from "../../services/socialService";
import departmentService from "../../services/departmentService";
import { Trophy, Shield, Star } from "lucide-react";

export const EmployeeLeaderboard: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [allDeptsList, setAllDeptsList] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [activeTab, setActiveTab] = useState<"employees" | "departments">("employees");
  const [loading, setLoading] = useState(true);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      if (activeTab === "employees") {
        const empRes = await socialService.getEmployeeLeaderboard(selectedDept || undefined);
        setEmployees(empRes || []);
      } else {
        const deptRes = await socialService.getDepartmentLeaderboard();
        setDepartments(deptRes || []);
      }
    } catch (err) {
      console.error("Error loading leaderboards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getDepartments();
        setAllDeptsList(res.departments || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    fetchLeaderboards();
  }, [activeTab, selectedDept]);

  const topThree = activeTab === "employees" ? employees.slice(0, 3) : departments.slice(0, 3);
  const remaining = activeTab === "employees" ? employees.slice(3) : departments.slice(3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">Sustainability Leaderboard</h1>
          <p className="text-[#90998C] text-sm mt-1">See who is making the biggest eco-impact across our organization.</p>
        </div>

        {/* Tab Selection */}
        <div className="bg-white p-1 rounded-xl border border-[#E4E6DF] flex">
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "employees" ? "bg-[#1F4032] text-white shadow-sm" : "text-[#90998C] hover:text-[#24333E]"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "departments" ? "bg-[#1F4032] text-white shadow-sm" : "text-[#90998C] hover:text-[#24333E]"
            }`}
          >
            Departments
          </button>
        </div>
      </div>

      {/* Department Filter (Only for employee view) */}
      {activeTab === "employees" && (
        <div className="bg-white p-4 rounded-xl border border-[#E4E6DF] flex items-center justify-between">
          <span className="text-xs font-bold text-[#90998C] uppercase tracking-wider">Filter By Department</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-1.5 text-xs text-[#24333E] outline-none"
          >
            <option value="">All Departments</option>
            {allDeptsList.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E3A73E]" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 podium (visuallly premium) */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
              {/* Rank 2 (Silver) */}
              {topThree[1] && (
                <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] text-center space-y-4 md:order-1 h-fit md:mb-4">
                  <div className="relative w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300">
                    <Trophy className="text-[#90998C]" size={30} />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-slate-300 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#24333E]">{topThree[1].name}</h3>
                    <p className="text-xs text-[#90998C]">{activeTab === "employees" ? topThree[1].department : `Members: ${topThree[1].memberCount}`}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-[#F3F5EF] rounded-xl font-bold text-xs text-[#1F4032]">
                    {activeTab === "employees" ? `${topThree[1].xpPoints} XP` : `${topThree[1].totalXP} XP`}
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold) */}
              {topThree[0] && (
                <div className="bg-white p-8 rounded-2xl border border-[#E4E6DF] text-center space-y-4 md:order-2 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-[#FCF8E3] text-[#E3A73E] rounded-bl-xl">
                    <Star size={18} fill="#E3A73E" />
                  </div>
                  <div className="relative w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center border-2 border-[#E3A73E] shadow-sm">
                    <Trophy className="text-[#E3A73E]" size={36} />
                    <span className="absolute -top-1 -right-1 w-7 h-7 bg-[#E3A73E] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                      1
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#24333E]">{topThree[0].name}</h3>
                    <p className="text-xs text-[#90998C]">{activeTab === "employees" ? topThree[0].department : `Members: ${topThree[0].memberCount}`}</p>
                  </div>
                  <div className="px-4 py-2 bg-amber-50 rounded-xl font-bold text-sm text-[#E3A73E] w-fit mx-auto border border-amber-100">
                    {activeTab === "employees" ? `${topThree[0].xpPoints} XP` : `${topThree[0].totalXP} XP`}
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {topThree[2] && (
                <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] text-center space-y-4 md:order-3 h-fit md:mb-4">
                  <div className="relative w-16 h-16 mx-auto bg-amber-50/50 rounded-full flex items-center justify-center border-2 border-amber-600/30">
                    <Trophy className="text-amber-700" size={30} />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#24333E]">{topThree[2].name}</h3>
                    <p className="text-xs text-[#90998C]">{activeTab === "employees" ? topThree[2].department : `Members: ${topThree[2].memberCount}`}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-[#F3F5EF] rounded-xl font-bold text-xs text-[#1F4032]">
                    {activeTab === "employees" ? `${topThree[2].xpPoints} XP` : `${topThree[2].totalXP} XP`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard list */}
          {remaining.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E4E6DF] overflow-hidden">
              <div className="overflow-x-auto text-left">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F3F5EF] border-b border-[#E4E6DF] text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                      <th className="px-6 py-3.5">Rank</th>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">{activeTab === "employees" ? "Department" : "Member Count"}</th>
                      <th className="px-6 py-3.5 text-right">Total XP</th>
                      {activeTab === "employees" && <th className="px-6 py-3.5 text-center">Badges</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E6DF] text-sm text-[#24333E]">
                    {remaining.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F3F5EF]/20">
                        <td className="px-6 py-4 font-bold text-xs text-[#90998C]">#{item.rank}</td>
                        <td className="px-6 py-4 font-semibold">{item.name}</td>
                        <td className="px-6 py-4 text-xs">
                          {activeTab === "employees" ? item.department : `${item.memberCount} members`}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#1F4032]">
                          {activeTab === "employees" ? `${item.xpPoints} XP` : `${item.totalXP} XP`}
                        </td>
                        {activeTab === "employees" && (
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-500 rounded-full text-xs font-semibold border border-blue-100">
                              <Shield size={12} /> {item.badgeCount}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaderboard;
