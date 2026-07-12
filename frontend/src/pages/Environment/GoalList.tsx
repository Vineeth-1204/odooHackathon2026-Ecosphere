import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Target, Plus, SlidersHorizontal, ArrowLeft } from "lucide-react";
import goalService from "../../services/goalService";
import departmentService from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";
import { GoalProgressCard } from "../../components/environment/GoalProgressCard";
import { Loading } from "../../components/ui/Loading";

interface Department {
  id: string;
  name: string;
}

export const GoalList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminOrManager = user?.role?.name === "ADMIN" || user?.role?.name === "MANAGER";

  const [goals, setGoals] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [goalData, deptData] = await Promise.all([
        goalService.getGoals(selectedDept, selectedStatus),
        departmentService.getDepartments()
      ]);

      setGoals(goalData.goals || []);
      setDepartments(deptData.departments || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load sustainability goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedStatus]);

  const handleEdit = (goal: any) => {
    navigate(`/admin/environment/goals/edit/${goal.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <RouterLink
        to="/admin/environment/dashboard"
        className="flex items-center gap-1.5 text-xs text-[#90998C] hover:text-[#24333E] transition-colors w-max"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </RouterLink>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#24333E] tracking-tight flex items-center gap-2">
            <Target className="text-[#1F4032]" />
            Sustainability Goals
          </h1>
          <p className="text-xs text-[#90998C] mt-1">
            Track, set limits, and measure achievements for carbon equivalent reduction targets.
          </p>
        </div>

        {isAdminOrManager && (
          <RouterLink
            to="/admin/environment/goals/create"
            className="flex items-center gap-1.5 bg-[#1F4032] text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#1F4032]/90 shadow-lg shadow-sm"
          >
            <Plus size={14} /> Set Target
          </RouterLink>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Department Filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <SlidersHorizontal size={14} className="text-[#90998C]" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="glass-input py-1.5 text-xs w-full sm:w-48 bg-white border border-[#E4E6DF]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="glass-input py-1.5 text-xs w-full sm:w-48 bg-white border border-[#E4E6DF]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACHIEVED">Achieved</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loading text="Loading targets..." />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center text-[#90998C] text-sm">
          No sustainability targets found matching the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {goals.map((goal) => (
            <GoalProgressCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              isAdminOrManager={isAdminOrManager}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default GoalList;
