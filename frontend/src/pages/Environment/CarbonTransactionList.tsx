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
    navigate(`/environment/transactions/edit/${tx.id}`);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Leaf className="text-emerald-400" />
            Carbon Ledger Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit history of logged resource usages (electricity, fuel, flights) and their carbon footprints.
          </p>
        </div>

        <Link
          to="/environment/transactions/create"
          className="flex items-center gap-1.5 bg-gradient-primary text-slate-950 font-bold text-xs px-4 py-2 rounded-lg bg-gradient-hover shadow-lg shadow-brand-500/15"
        >
          <Plus size={14} /> Log Activity
        </Link>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-900">
          <SlidersHorizontal size={14} />
          <span>Filter Ledger Logs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="glass-input py-2 text-xs bg-slate-950 border border-slate-800"
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
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="glass-input py-2 text-xs bg-slate-950 border border-slate-800"
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
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 w-full"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 w-full"
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
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between bg-slate-900/10 border-l-4 border-emerald-500 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Leaf size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtered Cumulative Footprint</span>
            <span className="text-sm font-extrabold text-slate-200">
              {totalFilteredEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
              <span className="text-[10px] text-slate-500 font-semibold uppercase">kg CO2e</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Transactions Shown:</span>
          <p className="text-sm font-bold text-slate-300">{transactions.length}</p>
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
