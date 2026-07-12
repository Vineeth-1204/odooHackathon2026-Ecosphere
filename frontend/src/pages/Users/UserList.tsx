import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { SearchBar } from "../../components/ui/SearchBar";
import { DataTable } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { Dialog } from "../../components/ui/Dialog";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Deletion Dialog State
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.name === "ADMIN";

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await userService.getUsers({
        page,
        limit: meta.limit,
        search,
        roleId: selectedRole || undefined,
        departmentId: selectedDept || undefined
      });
      setUsers(res.users || []);
      setMeta(res.meta || { page, limit: 10, total: 0, totalPages: 1 });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load users list.");
    } finally {
      setIsLoading(false);
    }
  }, [meta.limit, search, selectedRole, selectedDept]);

  const loadFilters = async () => {
    try {
      const [roleRes, deptRes] = await Promise.all([
        userService.getRoles(),
        // Direct API request or through import if departmentService available:
        import("../../services/departmentService").then((m) => m.departmentService.getDepartments())
      ]);
      setRoles(roleRes.roles || []);
      setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error("Failed to load filter roles/depts", err);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [search, selectedRole, selectedDept, fetchUsers]);

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;
    try {
      setIsDeleting(true);
      await userService.deleteUser(deleteUserId);
      setDeleteUserId(null);
      fetchUsers(meta.page);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "User Name",
      render: (item: any) => (
        <div className="font-semibold text-slate-100">
          {item.firstName} {item.lastName}
        </div>
      )
    },
    { key: "email", label: "Email Address" },
    {
      key: "role",
      label: "System Role",
      render: (item: any) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          item.role.name === "ADMIN" 
            ? "bg-red-500/10 text-red-400 border border-red-500/10" 
            : item.role.name === "MANAGER" 
            ? "bg-purple-500/10 text-purple-400 border border-purple-500/10" 
            : "bg-blue-500/10 text-blue-400 border border-blue-500/10"
        }`}>
          {item.role.name}
        </span>
      )
    },
    {
      key: "department",
      label: "Department",
      render: (item: any) => (
        <span className="text-slate-300 font-medium">
          {item.department?.name || "-"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (item: any) => {
        const isSelf = item.id === currentUser?.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Link to={`/users/edit/${item.id}`}>
              <Button variant="ghost" size="sm" className="h-8 w-8 !p-0" title="Edit User">
                <Edit size={14} className="text-slate-400 hover:text-white" />
              </Button>
            </Link>
            
            {isAdmin && !isSelf && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 !p-0 hover:bg-red-500/10"
                onClick={() => setDeleteUserId(item.id)}
                title="Delete User"
              >
                <Trash2 size={14} className="text-red-400 hover:text-red-300" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">User Accounts</h1>
          <p className="text-slate-400 text-sm mt-1">Manage platform members, assign departments, and check roles</p>
        </div>

        {isAdmin && (
          <Link to="/users/create">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add User
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 p-4 border border-slate-900 rounded-xl">
        <SearchBar
          placeholder="Search name or email..."
          value={search}
          onChange={(val) => setSearch(val)}
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="glass-input !py-1 text-xs appearance-none bg-slate-950 pr-8"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="glass-input !py-1 text-xs appearance-none bg-slate-950 pr-8"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List or Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found matching search filters."
        />
        
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          limit={meta.limit}
          totalItems={meta.total}
          onPageChange={(p) => fetchUsers(p)}
        />
      </div>

      {/* Delete Dialog */}
      <Dialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm User Deletion"
        description="Are you absolutely sure you want to remove this user account? All access will be revoked immediately. This action is irreversible."
        confirmText="Delete Account"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
export default UserList;
