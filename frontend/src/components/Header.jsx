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
    <header className="bg-black text-white sticky top-0 z-50 shadow-2xl">
      {/* Location Bar */}
      <div className="relative px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5 text-xs cursor-pointer transition-all duration-300 hover:opacity-80 group">
          <HiOutlineLocationMarker className="text-base text-blue-300 transition-colors duration-300" />
          <span className="font-bold text-[11px] text-white">HOME - </span>
          <span className="font-normal text-[11px] text-white/90 truncate max-w-[200px]">
            {location}
          </span>
          <HiChevronDown className="text-sm ml-0.5 text-white transition-transform duration-300 group-hover:rotate-180" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative px-4 py-3 pb-4" onClick={handleSearchClick}>
        <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 gap-2 shadow-lg transition-all duration-300 cursor-pointer hover:bg-white/30">
          <HiOutlineSearch className="text-lg text-white flex-shrink-0" />
          <input
            type="text"
            readOnly={currentLocation.pathname !== "/search"}
            placeholder="Search stores, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none outline-none text-[13px] text-white font-normal bg-transparent placeholder:text-white/40 cursor-pointer"
          />
          <HiOutlineMicrophone className="text-lg text-white/80" />
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
