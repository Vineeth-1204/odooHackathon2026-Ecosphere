import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";
import userService from "../../services/userService";

export const UserProfile: React.FC = () => {
  const { user, updateUserInContext } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    const payload: any = {
      firstName,
      lastName,
      email
    };

    if (password && password.trim().length >= 6) {
      payload.password = password;
    }

    try {
      const res = await userService.updateUser(user.id, payload);
      updateUserInContext(res.user);
      setSuccess("Profile settings updated successfully!");
      setPassword(""); // Clear password field
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#24333E] flex items-center gap-2">
          Profile Settings <ShieldCheck className="text-[#1F4032]" size={22} />
        </h1>
        <p className="text-[#90998C] text-sm mt-1">Manage your account identity details and security credentials</p>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-brand-500/10 border border-brand-500/20 text-[#1F4032] flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Box */}
        <div className="glass-panel rounded-xl p-5 md:col-span-1 h-fit flex flex-col gap-4">
          <div className="text-center pb-4 border-b border-[#E4E6DF]">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 text-[#1F4032] flex items-center justify-center text-xl font-bold uppercase mx-auto mb-3">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <h3 className="text-sm font-bold text-[#24333E]">{user?.firstName} {user?.lastName}</h3>
            <span className="text-[10px] text-[#90998C] uppercase tracking-widest font-semibold">{user?.role?.name}</span>
          </div>

          <div className="text-xs text-[#90998C] space-y-2.5">
            <div>
              <span className="font-bold text-[#90998C] uppercase block text-[9px] tracking-wider">Department:</span>
              <span className="text-[#24333E] font-medium">{user?.department?.name || "Not assigned"}</span>
            </div>
            <div>
              <span className="font-bold text-[#90998C] uppercase block text-[9px] tracking-wider">Registered Email:</span>
              <span className="text-[#24333E] truncate block">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 md:col-span-2 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="firstName"
              type="text"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isSaving}
            />
            <Input
              id="lastName"
              type="text"
              label="Last Name"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSaving}
          />

          <Input
            id="password"
            type="password"
            label="Update Password (leave empty to keep current)"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSaving}
          />

          <Button type="submit" className="w-fit self-end mt-2" isLoading={isSaving}>
            Save Profile Settings
          </Button>
        </form>
      </div>
    </div>
  );
};
export default UserProfile;
