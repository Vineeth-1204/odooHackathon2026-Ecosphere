import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Mail, Lock, ShieldAlert } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after success (default to root "/" for role-based routing)
  const from = location.state?.from?.pathname || "/";

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#F3F5EF] select-none">
      {/* Visual background enhancements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#1F4032]/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#E3A73E]/5 blur-[80px] pointer-events-none" />

      {/* Main card panel */}
      <div className="relative w-full max-w-md bg-white border border-[#E4E6DF] shadow-md rounded-2xl p-8 z-10 text-left">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1F4032] flex items-center justify-center font-extrabold text-2xl text-white mx-auto shadow-sm mb-3.5">
            E
          </div>
          <h2 className="text-2xl font-bold text-[#24333E] tracking-tight">Welcome to Ecosphere</h2>
          <p className="text-[#90998C] text-sm mt-1.5">Sign in to access your ESG portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-[#C1503A] flex items-start gap-3 text-sm animate-in fade-in duration-200">
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

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#1F4032] hover:underline transition-colors">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-[#1F4032] text-white text-sm font-semibold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-8 text-xs text-[#90998C] border-t border-[#E4E6DF] pt-6">
          New to the platform?{" "}
          <Link to="/register" className="font-bold text-[#1F4032] hover:underline transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
