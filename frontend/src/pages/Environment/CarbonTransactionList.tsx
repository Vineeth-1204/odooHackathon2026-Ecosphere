import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Plus, SlidersHorizontal } from "lucide-react";
import carbonService from "../../services/carbonService";
import departmentService from "../../services/departmentService";
import categoryService from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";
import { CarbonTable } from "../../components/environment/CarbonTable";
import { Loading } from "../../components/ui/Loading";

interface Department {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export const CarbonTransactionList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminOrManager = user?.role?.name === "ADMIN" || user?.role?.name === "MANAGER";

  const [transactions, setTransactions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [txData, deptData, catData] = await Promise.all([
        carbonService.getTransactions({
          departmentId: selectedDept,
          categoryId: selectedCat,
          startDate: startDate,
          endDate: endDate
        }),
        departmentService.getDepartments(),
        categoryService.getCategories()
      ]);

      setTransactions(txData.transactions || []);
      setDepartments(deptData.departments || []);
      setCategories(catData.categories || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedCat, startDate, endDate]);

  const handleEdit = (tx: any) => {
    navigate(`/admin/environment/transactions/edit/${tx.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction entry? Goal progress contributions will be reverted.")) {
      return;
    }

    try {
      await carbonService.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete transaction.");
    }
  };

  const clearFilters = () => {
    setSelectedDept("");
    setSelectedCat("");
    setStartDate("");
    setEndDate("");
  };

  // Calculate stats on currently filtered transactions
  const totalFilteredEmissions = transactions.reduce((sum, tx) => sum + tx.emissions, 0);

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#24333E] tracking-tight flex items-center gap-2">
            <Leaf className="text-[#1F4032]" />
            Carbon Ledger Logs
          </h1>
          <p className="text-xs text-[#90998C] mt-1">
            Audit history of logged resource usages (electricity, fuel, flights) and their carbon footprints.
          </p>
        </div>

        <Link
          to="/admin/environment/transactions/create"
          className="flex items-center gap-1.5 bg-[#1F4032] text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#1F4032]/90 shadow-lg shadow-sm"
        >
          <Plus size={14} /> Log Activity
        </Link>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#90998C] uppercase tracking-wider pb-2 border-b border-[#E4E6DF]">
          <SlidersHorizontal size={14} />
          <span>Filter Ledger Logs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#90998C] uppercase tracking-wide">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="glass-input py-2 text-xs bg-white border border-[#E4E6DF]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#90998C] uppercase tracking-wide">Category</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="glass-input py-2 text-xs bg-white border border-[#E4E6DF]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#90998C] uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input py-1.5 text-xs bg-white border border-[#E4E6DF] text-[#24333E] w-full"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#90998C] uppercase tracking-wide">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input py-1.5 text-xs bg-white border border-[#E4E6DF] text-[#24333E] w-full"
            />
          </div>
        </div>

        {/* Clear Filters helper */}
        {(selectedDept || selectedCat || startDate || endDate) && (
          <button
            onClick={clearFilters}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold self-end transition-colors underline bg-transparent border-0 cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Aggregate Stats Bar */}
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between bg-white/10 border-l-4 border-emerald-500 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-[#1F4032]">
            <Leaf size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#90998C] uppercase tracking-wider">Filtered Cumulative Footprint</span>
            <span className="text-sm font-extrabold text-[#24333E]">
              {totalFilteredEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
              <span className="text-[10px] text-[#90998C] font-semibold uppercase">kg CO2e</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#90998C] font-semibold uppercase">Transactions Shown:</span>
          <p className="text-sm font-bold text-[#24333E]">{transactions.length}</p>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loading text="Retrieving ledger logs..." />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <CarbonTable
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdminOrManager={isAdminOrManager}
        />
      )}
    </div>
  );
};
export default CarbonTransactionList;
