import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Loading } from "../../components/ui/Loading";
import userService from "../../services/userService";
import departmentService from "../../services/departmentService";

export const UserForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [rolesRes, deptsRes] = await Promise.all([
        userService.getRoles(),
        departmentService.getDepartments()
      ]);
      setRoles(rolesRes.roles || []);
      setDepartments(deptsRes.departments || []);

      if (isEditMode && id) {
        const userRes = await userService.getUserById(id);
        const u = userRes.user;
        if (u) {
          setFirstName(u.firstName);
          setLastName(u.lastName);
          setEmail(u.email);
          setRoleId(u.roleId);
          setDepartmentId(u.departmentId || "");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load user form options");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    const payload: any = {
      firstName,
      lastName,
      email,
      roleId,
      departmentId: departmentId || null
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (isEditMode && id) {
        await userService.updateUser(id, payload);
      } else {
        if (!password) {
          setError("Password is required for new users");
          setIsSaving(false);
          return;
        }
        await userService.createUser(payload);
      }
      navigate("/users");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save user account details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading text="Fetching form configurations..." />;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Back link */}
      <Link to="/users" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors w-fit">
        <ArrowLeft size={14} />
        Back to Users List
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          {isEditMode ? "Edit User Account" : "Add New User Account"}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isEditMode ? "Modify details, edit permissions, or reset password" : "Create login credentials and set system roles"}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            id="firstName"
            type="text"
            label="First Name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isSaving}
          />
          <Input
            id="lastName"
            type="text"
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isSaving}
          />
        </div>

        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="jane.doe@ecosphere.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSaving}
        />

        <Input
          id="password"
          type="password"
          label={isEditMode ? "Reset Password (leave empty to keep current)" : "Password"}
          placeholder={isEditMode ? "••••••••" : "Min. 6 characters"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditMode}
          disabled={isSaving}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System Role
            </label>
            <select
              id="role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="glass-input w-full appearance-none bg-slate-950 pr-8"
              required
              disabled={isSaving}
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Department selector */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="department" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Department
            </label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="glass-input w-full appearance-none bg-slate-950 pr-8"
              disabled={isSaving}
            >
              <option value="">Select Department (Optional)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-5 mt-4">
          <Link to="/users">
            <Button variant="ghost" disabled={isSaving}>Cancel</Button>
          </Link>
          <Button type="submit" className="flex items-center gap-2" isLoading={isSaving}>
            <Save size={16} />
            {isEditMode ? "Update Account" : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default UserForm;
