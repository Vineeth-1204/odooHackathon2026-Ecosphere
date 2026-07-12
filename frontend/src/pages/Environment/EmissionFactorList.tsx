import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Search, Plus, SlidersHorizontal } from "lucide-react";
import emissionService from "../../services/emissionService";
import categoryService from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";
import { EmissionFactorCard } from "../../components/environment/EmissionFactorCard";
import { Loading } from "../../components/ui/Loading";

interface Category {
  id: string;
  name: string;
}

export const EmissionFactorList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role?.name === "ADMIN";

  const [factors, setFactors] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [factorData, catData] = await Promise.all([
        emissionService.getEmissionFactors(search, selectedCategory),
        categoryService.getCategories()
      ]);
      
      setFactors(factorData.emissionFactors || []);
      setCategories(catData.categories || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load emission factors data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]); // Fetch when category changes

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleEdit = (factor: any) => {
    navigate(`/admin/environment/emission-factors/edit/${factor.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this emission factor? This could affect calculated transaction records.")) {
      return;
    }

    try {
      await emissionService.deleteEmissionFactor(id);
      setFactors(factors.filter((f) => f.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete emission factor.");
    }
  };

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#24333E] tracking-tight flex items-center gap-2">
            <Leaf className="text-[#1F4032]" />
            Emission Factors Ledger
          </h1>
          <p className="text-xs text-[#90998C] mt-1">
            Browse and manage standard carbon equivalents (kg CO2e) used for logging transactions.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/admin/environment/emission-factors/create"
            className="flex items-center gap-1.5 bg-[#1F4032] text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#1F4032]/90 shadow-lg shadow-sm"
          >
            <Plus size={14} /> Add Factor
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs flex items-center">
          <Search size={16} className="absolute left-3.5 text-[#90998C] pointer-events-none" />
          <input
            type="text"
            placeholder="Search factors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-11 pr-4 py-1.5 w-full text-xs"
          />
          <button type="submit" className="hidden" />
        </form>

        {/* Category Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <SlidersHorizontal size={14} className="text-[#90998C]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input py-1.5 text-xs w-full md:w-48 bg-white border border-[#E4E6DF]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loading text="Loading factors..." />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      ) : factors.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center text-[#90998C] text-sm">
          No emission factors found. Try modifying your search/filters or create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {factors.map((factor) => (
            <EmissionFactorCard
              key={factor.id}
              factor={factor}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default EmissionFactorList;
