import { useState } from "react";
import {
  HiOutlineSearch,
  HiOutlineMicrophone,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiChevronDown,
} from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { CategoryFilter } from "../pages/homepage/category";

const Header = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  location = "Srishti, E512, Khajurla",
}) => {
  const navigate = useNavigate();
  const currentLocation = useLocation();

  const handleSearchClick = () => {
    if (currentLocation.pathname !== "/search") {
      navigate("/search");
    }
  };

  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50 shadow-2xl">
      {/* Glass overlay for enhanced effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

      <div className="relative flex justify-between items-center px-2 py-3">
        <div className="flex-1">
          <span className="block text-[10px] font-medium text-white/90 mb-0.5 uppercase tracking-tight">
            Delivery in 10 minutes
          </span>
          <div className="flex items-center gap-1.5 text-xs cursor-pointer transition-all duration-300 hover:text-blue-300 group">
            <HiOutlineLocationMarker className="text-base text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
            <span className="font-bold text-[11px]">HOME - </span>
            <span className="font-normal text-[11px] truncate max-w-[200px]">
              {location}
            </span>
            <HiChevronDown className="text-sm ml-0.5 transition-transform duration-300 group-hover:rotate-180" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <button className="bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer p-2 rounded-xl transition-all duration-300 flex items-center justify-center hover:bg-white/20 hover:scale-105 hover:border-white/30 active:scale-95 group">
            <HiOutlineBell className="text-lg text-white" />
          </button>
          <button onClick={() => navigate("/setting")} className="bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer p-2 rounded-xl transition-all duration-300 flex items-center justify-center hover:bg-white/20 hover:scale-105 hover:border-white/30 active:scale-95 group">
            <HiOutlineUser className="text-lg text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative px-2 py-1 pb-3" onClick={handleSearchClick}>
        <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2.5 gap-2 shadow-lg transition-all duration-300 cursor-pointer hover:bg-white/10 hover:border-white/30">
          <HiOutlineSearch className="text-lg text-white/60 flex-shrink-0" />
          <input
            type="text"
            readOnly={currentLocation.pathname !== "/search"}
            placeholder="Search stores, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none outline-none text-[13px] text-white font-normal bg-transparent placeholder:text-white/40 cursor-pointer"
          />
          <HiOutlineMicrophone className="text-lg text-white/60" />
        </div>
      </div>

      <div className="px-2 pb-2">
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
    </header>
  );
};

export default Header;
