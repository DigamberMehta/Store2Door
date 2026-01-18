import { Home, Wallet, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/",
      isActive: (path) => path === "/" || path === "/deliveries" || path === "/order-detail"
    },
    { 
      icon: Wallet, 
      label: "Wallet", 
      path: "/wallet",
      isActive: (path) => path.startsWith("/wallet") || path === "/withdrawals" || path === "/activities"
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/profile",
      isActive: (path) => path.startsWith("/profile")
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom,16px)] z-[100]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item, index) => {
          const isActive = item.isActive(location.pathname);
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-4 transition-all outline-none focus:outline-none focus:ring-0 select-none touch-none ${
                isActive
                  ? "text-blue-300 scale-105"
                  : "text-zinc-600 active:text-zinc-400"
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <item.icon className={`w-4.5 h-4.5 transition-transform ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
              <span className={`text-[9px] font-bold tracking-tight uppercase ${isActive ? "opacity-100" : "opacity-60"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
