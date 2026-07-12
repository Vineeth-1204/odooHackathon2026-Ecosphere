import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Mail, Lock, ShieldAlert } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after success
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Visual background enhancements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Main card panel */}
      <div className="relative w-full max-w-md glass-panel shadow-glass rounded-2xl p-8 z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center font-extrabold text-2xl text-slate-950 mx-auto shadow-lg shadow-brand-500/20 mb-3.5">
            E
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Welcome to Ecosphere</h2>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to manage your ESG configurations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@ecosphere.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
            disabled={isLoading}
          />

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="text-center mt-8 text-xs text-slate-400 border-t border-slate-900 pt-6">
          New to the platform?{" "}
          <Link to="/register" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
