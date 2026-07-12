import React, { useState, useEffect } from "react";
import { Plus, Building, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Dialog } from "../../components/ui/Dialog";
import { Loading } from "../../components/ui/Loading";
import DepartmentCard from "../../components/DepartmentCard";
import DepartmentForm from "./DepartmentForm";
import departmentService from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";

export const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.role?.name === "ADMIN";

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog State
  const [deleteDeptId, setDeleteDeptId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await departmentService.getDepartments();
      setDepartments(res.departments || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateClick = () => {
    setSelectedDept(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (dept: any) => {
    setSelectedDept(dept);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: { name: string; description: string }) => {
    try {
      setIsSaving(true);
      if (selectedDept) {
        await departmentService.updateDepartment(selectedDept.id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      setIsFormOpen(false);
      fetchDepartments();
    } catch (err: any) {
      console.error(err);
      throw err; // Form internal validation will display it
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDeptId) return;
    try {
      setIsDeleting(true);
      await departmentService.deleteDepartment(deleteDeptId);
      setDeleteDeptId(null);
      fetchDepartments();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete department.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Departments <Building className="text-brand-400" size={22} />
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure company divisions and track department member counts</p>
        </div>

        {isAdmin && (
          <Button className="flex items-center gap-2" onClick={handleCreateClick}>
            <Plus size={16} />
            Create Department
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
        <Loading text="Retrieving departments..." />
      ) : departments.length === 0 ? (
        <div className="glass-panel py-16 text-center text-slate-400 rounded-xl">
          <div className="text-sm font-medium">No departments registered.</div>
          {isAdmin && (
            <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateClick}>
              Add the first one
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              isAdmin={isAdmin}
              onEdit={() => handleEditClick(dept)}
              onDelete={() => setDeleteDeptId(dept.id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedDept ? "Edit Department" : "Create New Department"}
      >
        <DepartmentForm
          initialData={selectedDept}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isSaving={isSaving}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteDeptId}
        onClose={() => setDeleteDeptId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        description="Are you sure you want to remove this department? Any associated users will have their department assignment reset to null. This action cannot be undone."
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
export default DepartmentList;
