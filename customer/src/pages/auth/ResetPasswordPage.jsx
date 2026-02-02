import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/");
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const response = await axios.get(
        `http://localhost:3000/api/users/validate-reset-token/${token}`
      );

      if (response.data.success) {
        setTokenValid(true);
        setUserInfo(response.data.data);
      } else {
        toast.error("Invalid or expired reset link");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      toast.error(
        error.response?.data?.message || "Invalid or expired reset link"
      );
      setTimeout(() => navigate("/"), 2000);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/users/reset-password",
        {
          token,
          newPassword: password,
        }
      );

      if (response.data.success) {
        toast.success("Password reset successfully! Logging you in...");
        
        // Store tokens
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        // Redirect to home after 1 second
        setTimeout(() => {
          navigate("/");
          window.location.reload(); // Reload to update auth state
        }, 1000);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        error.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(49,134,22)] mx-auto mb-4"></div>
          <p className="text-white/60">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-white/50 text-sm mb-6">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-[rgb(49,134,22)] text-white font-semibold py-3 rounded-xl active:bg-[rgb(49,134,22)]/90 transition-all"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[rgb(49,134,22)]/30 font-sans flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[rgb(49,134,22)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[rgb(49,134,22)]/20">
            <Lock className="w-10 h-10 text-[rgb(49,134,22)]" />
          </div>
          <h2 className="text-3xl font-bold mb-2">
            Set New Password
          </h2>
          <p className="text-white/50 text-sm">
            Hi {userInfo?.name}, please choose a strong password for your account.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/60 uppercase tracking-wider font-semibold block">
                New Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[rgb(49,134,22)]/50 transition-all"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 active:bg-white/10 rounded-lg transition-all"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white/40" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/40" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-white/30 px-1">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/60 uppercase tracking-wider font-semibold block">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[rgb(49,134,22)]/50 transition-all"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 active:bg-white/10 rounded-lg transition-all"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-white/40" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[rgb(49,134,22)] text-white text-sm font-semibold py-3 rounded-xl active:bg-[rgb(49,134,22)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Updating Password...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
