import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineMicrophone,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiChevronDown,
} from "react-icons/hi";
import { CategoryFilter } from "../pages/homepage/category";
import { CategoryFilterShimmer } from "./shimmer";
import { customerProfileAPI } from "../services/api";
import { useUserLocation } from "../hooks/useUserLocation";

const Header = ({
  selectedCategory,
  setSelectedCategory,
  categories = [],
  loading = false,
}) => {
  const navigate = useNavigate();
  const { latitude, longitude, address: detectedAddress, error: locationError } = useUserLocation();
  const [addressData, setAddressData] = useState({
    label: null,
    address: null,
  });

  useEffect(() => {
    fetchDefaultAddress();
  }, []);

  const fetchDefaultAddress = async () => {
    try {
      const response = await customerProfileAPI.getAddresses();
      if (response.success) {
        const defaultAddr = response.data.addresses?.find(
          (addr) => addr._id === response.data.defaultAddress,
        );
        if (defaultAddr) {
          setAddressData({
            label: defaultAddr.label,
            address: `${defaultAddr.street}, ${defaultAddr.city}`,
          });
        }
      }
    } catch (error) {
      // Silently handle - user may not have saved address yet
    }
  };

  const getDisplayAddress = () => {
    // 1. Priority: User's saved default address
    if (addressData.label && addressData.address) {
      return (
        <>
          <span className="font-bold text-xs uppercase text-[rgb(49,134,22)]">
            {addressData.label} -{" "}
          </span>
          <span className="font-normal text-xs truncate max-w-[150px]">
            {addressData.address}
          </span>
        </>
      );
    }

    // 2. Priority: Real-time detected address string
    if (detectedAddress) {
      return (
        <span className="font-normal text-xs flex items-center gap-1.5">
          <span className="bg-[rgb(49,134,22)]/20 text-[rgb(49,134,22)] px-1.5 py-0.5 rounded-[4px] text-[10px] uppercase font-bold tracking-tighter">Nearby</span>
          <span className="text-white/80 truncate max-w-[200px]">{detectedAddress}</span>
        </span>
      );
    }

    // 3. Priority: Coordinates if address string is pending
    if (latitude && longitude) {
      return (
        <span className="font-normal text-xs flex items-center gap-1">
          <span className="bg-blue-400/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tighter">Locating...</span>
        </span>
      );
    }

    if (locationError) {
      return <span className="font-normal text-xs text-red-400/70">Location permission required</span>;
    }

    return <span className="font-normal text-xs text-white/50">Add delivery address</span>;
  };

  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50 shadow-2xl">
      {/* Glass overlay for enhanced effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

      <div className="relative flex justify-between items-center px-4 py-3">
        <div className="flex-1">
          <div
            className="flex items-center gap-2 text-xs md:text-sm cursor-pointer transition-all duration-300 hover:text-blue-300 group"
            onClick={() => navigate("/profile/addresses")}
          >
            <HiOutlineLocationMarker className="text-lg text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
            {getDisplayAddress()}
            <HiChevronDown className="text-base ml-0.5 transition-transform duration-300 group-hover:rotate-180" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center hover:bg-white/20 hover:scale-105 hover:border-white/30 active:scale-95 group">
            <HiOutlineBell className="text-xl text-white group-hover:animate-pulse" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center hover:bg-white/20 hover:scale-105 hover:border-white/30 active:scale-95 group"
          >
            <HiOutlineUser className="text-xl text-white group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative px-4 py-2 pb-3">
        <div
          onClick={() => navigate("/search")}
          className="flex items-center bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-2.5 gap-3 shadow-lg transition-all duration-300 focus-within:bg-black/40 focus-within:border-white/40 focus-within:shadow-xl hover:bg-black/35 cursor-pointer"
        >
          <HiOutlineSearch className="text-xl text-white/80 flex-shrink-0 transition-colors duration-300 group-focus-within:text-white" />
          <div className="flex-1 text-sm text-white/60 font-light">
            Search for stores, products...
          </div>
          <button className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-all duration-300 flex-shrink-0 hover:scale-110 hover:bg-white/10 rounded-lg active:scale-95 group">
            <HiOutlineMicrophone className="text-xl text-white/80 group-hover:text-white transition-colors duration-300" />
          </button>
        </div>
      </div>

      {loading ? (
        <CategoryFilterShimmer />
      ) : (
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
      )}
    </header>
  );
};

export default Header;
