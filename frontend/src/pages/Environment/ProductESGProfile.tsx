import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Search, Plus, SlidersHorizontal, Edit, Trash2, Save, ArrowLeft } from "lucide-react";
import productService from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { Loading } from "../../components/ui/Loading";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  carbonFootprint: number;
  waterFootprint?: number;
  wasteGenerated?: number;
  recyclability?: number;
  materialSourcing?: string;
  esgGrade: string;
}

export const ProductESGProfile: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrManager = user?.role?.name === "ADMIN" || user?.role?.name === "MANAGER";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  // Modal Control
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [carbonFootprint, setCarbonFootprint] = useState<number | "">("");
  const [waterFootprint, setWaterFootprint] = useState<number | "">("");
  const [wasteGenerated, setWasteGenerated] = useState<number | "">("");
  const [recyclability, setRecyclability] = useState<number | "">("");
  const [materialSourcing, setMaterialSourcing] = useState("");
  const [esgGrade, setEsgGrade] = useState("A");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts(search, selectedGrade);
      setProducts(data.products || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load product profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGrade]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalError(null);
    setName("");
    setSku("");
    setDescription("");
    setCarbonFootprint("");
    setWaterFootprint("");
    setWasteGenerated("");
    setRecyclability("");
    setMaterialSourcing("");
    setEsgGrade("A");
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setModalError(null);
    setName(p.name);
    setSku(p.sku);
    setDescription(p.description || "");
    setCarbonFootprint(p.carbonFootprint);
    setWaterFootprint(p.waterFootprint !== null && p.waterFootprint !== undefined ? p.waterFootprint : "");
    setWasteGenerated(p.wasteGenerated !== null && p.wasteGenerated !== undefined ? p.wasteGenerated : "");
    setRecyclability(p.recyclability !== null && p.recyclability !== undefined ? p.recyclability : "");
    setMaterialSourcing(p.materialSourcing || "");
    setEsgGrade(p.esgGrade);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || carbonFootprint === "" || !esgGrade) {
      setModalError("Please fill out all required fields.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);

      const payload = {
        name,
        sku,
        description: description || undefined,
        carbonFootprint: Number(carbonFootprint),
        waterFootprint: waterFootprint !== "" ? Number(waterFootprint) : undefined,
        wasteGenerated: wasteGenerated !== "" ? Number(wasteGenerated) : undefined,
        recyclability: recyclability !== "" ? Number(recyclability) : undefined,
        materialSourcing: materialSourcing || undefined,
        esgGrade
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || "Failed to save product profile.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product ESG profile?")) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete product profile.");
    }
  };

  // Helper to color-code ESG Grade badges
  const getGradeBadge = (grade: string) => {
    const configs: Record<string, string> = {
      A: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      B: "bg-green-500/10 text-green-400 border-green-500/30",
      C: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      D: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      E: "bg-red-500/10 text-red-400 border-red-500/30",
      F: "bg-rose-950/40 text-rose-500 border-rose-500/30"
    };
    return configs[grade.toUpperCase()] || "bg-slate-800 text-slate-400 border-slate-700";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Link */}
      <Link
        to="/environment/dashboard"
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors w-max"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Box className="text-emerald-400" />
            Product ESG Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log and review lifecycle ecological impacts, footprints, and ratings of manufactured goods.
          </p>
        </div>

        {isAdminOrManager && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-gradient-primary text-slate-950 font-bold text-xs px-4 py-2 rounded-lg bg-gradient-hover shadow-lg shadow-brand-500/15 cursor-pointer"
          >
            <Plus size={14} /> Add Product
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-11 pr-4 py-1.5 w-full text-xs"
          />
          <button type="submit" className="hidden" />
        </form>

        {/* ESG Grade filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <SlidersHorizontal size={14} className="text-slate-500" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="glass-input py-1.5 text-xs w-full sm:w-48 bg-slate-950 border border-slate-800"
          >
            <option value="">All ESG Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="E">Grade E</option>
            <option value="F">Grade F</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loading text="Loading product ledger..." />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center text-slate-500 text-sm">
          No product profiles cataloged.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-slate-900 bg-slate-950/20 scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/20 text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">
                <th className="px-5 py-4">Product SKU</th>
                <th className="px-5 py-4">Product Name</th>
                <th className="px-5 py-4 text-center">ESG Grade</th>
                <th className="px-5 py-4 text-right">Carbon Footprint</th>
                <th className="px-5 py-4 text-right">Water Footprint</th>
                <th className="px-5 py-4 text-right">Waste Generated</th>
                <th className="px-5 py-4 text-right">Recyclability</th>
                <th className="px-5 py-4">Sourcing</th>
                {isAdminOrManager && <th className="px-5 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-emerald-400 whitespace-nowrap">{p.sku}</td>
                  <td className="px-5 py-3.5 max-w-xs truncate font-medium" title={p.name}>
                    {p.name}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-center">
                    <span className={`px-3 py-0.5 rounded border text-[10px] font-black ${getGradeBadge(p.esgGrade)}`}>
                      {p.esgGrade}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap font-medium">
                    {p.carbonFootprint} <span className="text-[9px] text-slate-500">kg CO2e</span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap text-slate-400">
                    {p.waterFootprint !== null && p.waterFootprint !== undefined 
                      ? `${p.waterFootprint} L` 
                      : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap text-slate-400">
                    {p.wasteGenerated !== null && p.wasteGenerated !== undefined 
                      ? `${p.wasteGenerated} kg` 
                      : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap font-semibold text-slate-200">
                    {p.recyclability !== null && p.recyclability !== undefined 
                      ? `${p.recyclability}%` 
                      : "-"}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-medium">
                    {p.materialSourcing || "Standard"}
                  </td>
                  {isAdminOrManager && (
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Creation/Editing Drawer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in p-4 select-none">
          <div className="glass-panel w-full max-w-lg rounded-xl shadow-2xl shadow-brand-500/5 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-900 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-100 tracking-tight flex items-center gap-2 text-sm uppercase">
                <Box className="text-emerald-400" size={16} />
                {editingProduct ? "Edit Product ESG Profile" : "Catalog Product ESG"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleModalSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {modalError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs">
                  {modalError}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SKU */}
                  <Input
                    id="prod-sku"
                    label="Product SKU"
                    placeholder="ECO-PRO-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />

                  {/* Name */}
                  <Input
                    id="prod-name"
                    label="Product Name"
                    placeholder="Recycled Aluminum Water Bottle"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1 w-full">
                  <label htmlFor="prod-desc" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Product Description
                  </label>
                  <textarea
                    id="prod-desc"
                    placeholder="Describe product ESG details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input h-16 text-xs w-full py-2 bg-slate-950/60 border border-slate-800 focus:border-brand-500 outline-none rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Carbon footprint */}
                  <Input
                    id="prod-carbon"
                    type="number"
                    step="any"
                    label="Carbon footprint (kg CO2e/unit)"
                    placeholder="1.25"
                    value={carbonFootprint}
                    onChange={(e) => setCarbonFootprint(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                  />

                  {/* ESG Grade */}
                  <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="prod-grade" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      ESG Grade
                    </label>
                    <select
                      id="prod-grade"
                      value={esgGrade}
                      onChange={(e) => setEsgGrade(e.target.value)}
                      required
                      className="glass-input w-full bg-slate-950 border border-slate-800 text-xs py-2"
                    >
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                      <option value="D">Grade D</option>
                      <option value="E">Grade E</option>
                      <option value="F">Grade F</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Water footprint */}
                  <Input
                    id="prod-water"
                    type="number"
                    step="any"
                    label="Water (Liters)"
                    placeholder="12.5"
                    value={waterFootprint}
                    onChange={(e) => setWaterFootprint(e.target.value === "" ? "" : Number(e.target.value))}
                  />

                  {/* Waste footprint */}
                  <Input
                    id="prod-waste"
                    type="number"
                    step="any"
                    label="Waste (kg)"
                    placeholder="0.05"
                    value={wasteGenerated}
                    onChange={(e) => setWasteGenerated(e.target.value === "" ? "" : Number(e.target.value))}
                  />

                  {/* Recyclability */}
                  <Input
                    id="prod-recyclable"
                    type="number"
                    label="Recyclable (%)"
                    placeholder="85"
                    value={recyclability}
                    onChange={(e) => setRecyclability(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                {/* Sourcing */}
                <Input
                  id="prod-sourcing"
                  label="Material Sourcing details"
                  placeholder="e.g. 100% Post-consumer Recycled Aluminum"
                  value={materialSourcing}
                  onChange={(e) => setMaterialSourcing(e.target.value)}
                />
              </div>

              {/* Modal buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-900 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isLoading={modalLoading}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-950"
                >
                  <Save size={14} /> Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductESGProfile;
