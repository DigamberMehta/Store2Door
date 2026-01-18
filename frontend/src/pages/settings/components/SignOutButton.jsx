import { LogOut } from "lucide-react";

const SignOutButton = ({ isAuthenticated, isLoggingOut, onLogout }) => {
  if (!isAuthenticated) return null;

  return (
    <button
      className="w-full bg-white/5 backdrop-blur-2xl rounded-xl border border-white/5 p-3 active:bg-white/10 transition-all text-left group"
      onClick={onLogout}
      disabled={isLoggingOut}
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
          <LogOut className="w-4 h-4 text-white/60 group-active:text-white" />
        </div>
        <span className="text-white/70 font-medium text-xs">
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </span>
      </div>
    </button>
  );
};

export default SignOutButton;
