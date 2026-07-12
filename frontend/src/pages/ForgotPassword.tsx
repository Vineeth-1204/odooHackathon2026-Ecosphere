import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Mail, CheckCircle2, ShieldAlert } from "lucide-react";
import authService from "../services/authService";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetToken("");
    setIsLoading(true);

    try {
      const data = await authService.forgotPassword(email);
      setSuccess(data.message || "A password reset link was sent!");
      if (data.debugResetToken) {
        setResetToken(data.debugResetToken);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md glass-panel shadow-glass rounded-2xl p-8 z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Forgot Password</h2>
          <p className="text-slate-400 text-sm mt-1.5">Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col gap-6 text-center animate-in zoom-in-95 duration-300">
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex flex-col items-center gap-3">
              <CheckCircle2 size={36} />
              <p className="text-sm font-medium leading-relaxed">{success}</p>
            </div>
            
            {resetToken && (
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-left">
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block mb-1">Developer Debug Token:</span>
                <code className="text-xs break-all text-slate-300">{resetToken}</code>
              </div>
            )}

            <Link to="/login">
              <Button className="w-full">Return to Sign In</Button>
            </Link>
          </div>
        ) : (
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

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>
        )}

        {!success && (
          <div className="text-center mt-8 text-xs text-slate-400 border-t border-slate-900 pt-6">
            Remembered your password?{" "}
            <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
