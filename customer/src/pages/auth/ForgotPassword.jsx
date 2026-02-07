import { useState } from "react";
import { ChevronLeft, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/api/client";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");

    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/users/forgot-password", { email });
      if (response.success) {
        setIsSuccess(true);
        toast.success("Reset link sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[rgb(49,134,22)]/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[rgb(49,134,22)]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-white/60 text-sm">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[rgb(49,134,22)] text-white text-sm font-semibold py-3 rounded-xl active:bg-[rgb(49,134,22)]/90 transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(49,134,22)]/50"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgb(49,134,22)]/30 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 active:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">Reset Password</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-10 pb-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
            <p className="text-white/50 text-xs">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-white/60 uppercase tracking-wider font-semibold block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/5 rounded-xl px-3 pl-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[rgb(49,134,22)]/50 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[rgb(49,134,22)] text-white text-sm font-semibold py-3 rounded-xl active:bg-[rgb(49,134,22)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4 transition-transform group-active:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
