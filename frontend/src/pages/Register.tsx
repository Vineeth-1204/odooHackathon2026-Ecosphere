import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Mail, Lock, User, Building, ShieldAlert } from "lucide-react";
import departmentService from "../services/departmentService";

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Load departments list for signup dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await departmentService.getDepartments();
        setDepartments(data.departments || []);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        departmentId: departmentId || undefined
      });
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg glass-panel shadow-glass rounded-2xl p-8 z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center font-extrabold text-2xl text-slate-950 mx-auto shadow-lg shadow-brand-500/20 mb-3.5">
            E
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Create an Account</h2>
          <p className="text-slate-400 text-sm mt-1.5">Join Ecosphere to begin tracking your ESG metrics</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="firstName"
              type="text"
              label="First Name"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              icon={<User size={16} />}
              required
              disabled={isLoading}
            />
            <Input
              id="lastName"
              type="text"
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              icon={<User size={16} />}
              required
              disabled={isLoading}
            />
          </div>

          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="jane.doe@ecosphere.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
            disabled={isLoading}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
            disabled={isLoading}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="department" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Department
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                <Building size={16} />
              </div>
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="glass-input w-full pl-11 appearance-none bg-slate-950 pr-8"
                disabled={isLoading}
              >
                <option value="">Select a Department (Optional)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Register Account
          </Button>
        </form>

        <div className="text-center mt-8 text-xs text-slate-400 border-t border-slate-900 pt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
