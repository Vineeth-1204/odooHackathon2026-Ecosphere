import React, { useState, useEffect } from "react";
import { Plus, FolderOpen, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Dialog } from "../../components/ui/Dialog";
import { Loading } from "../../components/ui/Loading";
import CategoryCard from "../../components/CategoryCard";
import CategoryForm from "./CategoryForm";
import categoryService from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.role?.name === "ADMIN";

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog State
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await categoryService.getCategories();
      setCategories(res.categories || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateClick = () => {
    setSelectedCat(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (cat: any) => {
    setSelectedCat(cat);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: { name: string; description: string }) => {
    try {
      setIsSaving(true);
      if (selectedCat) {
        await categoryService.updateCategory(selectedCat.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCatId) return;
    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(deleteCatId);
      setDeleteCatId(null);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            ESG Categories <FolderOpen className="text-brand-400" size={22} />
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure ESG and carbon scope categories used throughout the application modules</p>
        </div>

        {isAdmin && (
          <Button className="flex items-center gap-2" onClick={handleCreateClick}>
            <Plus size={16} />
            Create Category
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <Loading text="Retrieving ESG categories..." />
      ) : categories.length === 0 ? (
        <div className="glass-panel py-16 text-center text-slate-400 rounded-xl">
          <div className="text-sm font-medium">No configuration categories set up yet.</div>
          {isAdmin && (
            <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateClick}>
              Create Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isAdmin={isAdmin}
              onEdit={() => handleEditClick(cat)}
              onDelete={() => setDeleteCatId(cat.id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCat ? "Edit ESG Category" : "Create New Category"}
      >
        <CategoryForm
          initialData={selectedCat}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      {/* Delete confirmation Dialog */}
      <Dialog
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete ESG Category"
        description="Are you sure you want to remove this category? This might affect records bound to this configuration category. This action is permanent."
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
export default CategoryList;
