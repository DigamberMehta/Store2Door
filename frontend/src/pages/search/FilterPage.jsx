import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdShoppingCart,
  MdStar,
  MdFilterList,
  MdAccessTime,
  MdLocalOffer,
  MdStorefront,
} from "react-icons/md";
import { storesData } from "../homepage/store/storesData";

const FilterPage = ({ onStoreClick }) => {
  const { categoryName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get category from location state or derive from URL params
  const category = location.state?.category || {
    category:
      categoryName
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "All Stores",
    route: `/${categoryName || "stores"}`,
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  useEffect(() => {
    console.log("FilterPage category:", category);
    if (category?.route) {
      console.log("Fetching stores from:", category.route);
      fetchStores(category.route);
    }
  }, [category]);

  const fetchStores = async (route) => {
    console.log("Making API call to:", `http://localhost:5000${route}`);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000${route}`);
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Received data:", data);
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      // Fallback to central storesData if API fails
      const filtered = storesData.filter(s => 
        categoryName === "stores" || 
        categoryName === "grocery" && s.category === "grocery" ||
        categoryName === "snacks" && s.category === "food" ||
        s.category === categoryName ||
        categoryName === undefined
      );
      setStores(filtered.length > 0 ? filtered : storesData);
    } finally {
      setLoading(false);
    }
  };

  const filters = ["All", "Fast Delivery", "High Rated", "Best Offers"];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-1.5">
          <button
            className="p-2 -ml-1 active:bg-white/10 rounded-full transition-all text-white"
            onClick={handleBack}
          >
            <MdArrowBack size={24} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate leading-tight">
              {category?.category || "Stores"}
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium">
              {stores.length} outlets near you
            </p>
          </div>
        </div>
        <button className="p-2 -mr-1 active:bg-white/10 rounded-full transition-all text-white">
          <MdShoppingCart size={22} />
        </button>
      </header>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 px-2 py-3 bg-black">
        <MdFilterList className="text-lg text-white/50 flex-shrink-0" />
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                selectedFilter === filter.toLowerCase().replace(" ", "-")
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white/5 border-white/10 text-zinc-400"
              }`}
              onClick={() =>
                setSelectedFilter(filter.toLowerCase().replace(" ", "-"))
              }
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      <main className="px-2 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-1.5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 flex gap-3.5 cursor-pointer transition-all duration-300 hover:bg-white/10 border border-white/5 active:scale-[0.98]"
                onClick={() => onStoreClick && onStoreClick(store)}
              >
                {/* Left Image Section */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover rounded-xl shadow-sm"
                  />
                  {store.offer && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-white/10">
                      {store.offer}
                    </div>
                  )}
                </div>

                {/* Right Details Section */}
                <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
                  <h3 className="text-[15px] font-bold text-white truncate mb-0.5 tracking-tight font-sans">
                    {store.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[11px] mb-1">
                    <div className="flex items-center gap-0.5 bg-blue-300 px-1 py-0.5 rounded text-blue-950 text-[10px] font-bold">
                      <MdStar className="text-[10px]" />
                      <span>{store.rating}</span>
                    </div>
                    <span className="text-zinc-500 font-normal">({store.reviewCount || "1K+"})</span>
                  </div>

                  <p className="text-zinc-400 text-[11px] truncate mb-0.5 font-medium">
                    {store.categories?.slice(0, 2).join(", ")}
                  </p>

                  <p className="text-zinc-500 text-[11px] truncate font-medium">
                    {store.distance} • {store.deliveryTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FilterPage;
