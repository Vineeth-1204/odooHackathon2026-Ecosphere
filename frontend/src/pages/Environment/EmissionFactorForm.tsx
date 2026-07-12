import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Leaf, Save } from "lucide-react";
import emissionService from "../../services/emissionService";
import categoryService from "../../services/categoryService";
import { Loading } from "../../components/ui/Loading";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

interface Category {
  id: string;
  name: string;
}

export const EmissionFactorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [value, setValue] = useState<number | "">("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [source, setSource] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setFetching(true);
        const catData = await categoryService.getCategories();
        setCategories(catData.categories || []);
        
        if (isEdit && id) {
          const factorData = await emissionService.getEmissionFactorById(id);
          const f = factorData.emissionFactor;
          if (f) {
            setName(f.name);
            setValue(f.value);
            setUnit(f.unit);
            setCategoryId(f.categoryId);
            setSource(f.source || "");
            setYear(f.year);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load form dependencies.");
      } finally {
        setFetching(false);
      }
    };
    bootstrap();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || value === "" || !unit || !categoryId || !year) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name,
        value: Number(value),
        unit,
        categoryId,
        source: source || undefined,
        year: Number(year)
      };

      if (isEdit && id) {
        await emissionService.updateEmissionFactor(id, payload);
      } else {
        await emissionService.createEmissionFactor(payload);
      }

      navigate("/environment/emission-factors");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving the emission factor.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loading text="Loading factor details..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/environment/emission-factors"
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors w-max"
      >
        <ArrowLeft size={14} /> Back to list
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Leaf className="text-emerald-400" size={20} />
          {isEdit ? "Modify Emission Factor" : "New Emission Factor"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isEdit 
            ? "Update properties for this emission constant." 
            : "Define a new category-linked carbon equivalent factor."}
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <Input
            id="factor-name"
            label="Factor Name (e.g. Natural Gas Grid)"
            placeholder="Electricity - Grid Power"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Value */}
            <Input
              id="factor-value"
              type="number"
              step="any"
              label="Equivalent Value (kg CO2e)"
              placeholder="0.384"
              value={value}
              onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
              required
            />

            {/* Unit */}
            <Input
              id="factor-unit"
              label="Unit of measure (e.g. kWh, liter)"
              placeholder="kWh"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="factor-category" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <select
                id="factor-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="glass-input w-full bg-slate-950 border border-slate-800 text-xs py-2"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <Input
              id="factor-year"
              type="number"
              label="Year of Assessment"
              placeholder="2026"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </div>

          {/* Source */}
          <Input
            id="factor-source"
            label="Reference Source (e.g. EPA, DEFRA)"
            placeholder="EPA Emission Factors Hub 2026"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-900 justify-end">
          <Link
            to="/environment/emission-factors"
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-900/60 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            isLoading={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-950"
          >
            <Save size={14} /> Save Factor
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EmissionFactorForm;
