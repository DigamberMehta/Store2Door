import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HiOutlineSearch, HiOutlineArrowLeft, HiOutlineMicrophone } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { StoreList, storesData } from "../homepage/store";
import { storeAPI } from "../../services/api";
import SuggestionsDropdown from "../../components/SuggestionsDropdown";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRef = useRef(null);
  
  const initialQuery = searchParams.get("q") || searchParams.get("category") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Focus the search box on mount if no initial query
    if (inputRef.current && !initialQuery) {
      inputRef.current.focus();
    }
  }, [initialQuery]);

  // Sync state if URL changes
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("category");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Use atmospheric stores data by default, but fetch real data when searching
  useEffect(() => {
    const fetchResults = async () => {
      const query = searchQuery.trim();
      if (!query) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        // If it's a category search, we might want a different API call or just filter
        const category = searchParams.get("category");
        let response;
        
        if (category) {
          response = await storeAPI.getByCategory(category);
        } else {
          response = await storeAPI.search(query);
        }

        if (response.success) {
          setResults(response.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams]);

  return (
    <motion.div 
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="relative flex-1">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
              <HiOutlineSearch className="text-lg text-white/50" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for stores or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/40"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Clear
                </button>
              )}
              <HiOutlineMicrophone className="text-xl text-white/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-2">
        <AnimatePresence mode="wait">
          {!searchQuery ? (
            <motion.div
              key="suggestions-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SuggestionsDropdown
                isOpen={true}
                onClose={() => {}}
                searchQuery=""
                onSearch={(query) => setSearchQuery(query)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Real-time Results */}
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : results.length > 0 ? (
                <div className="pt-4 border-t border-white/5">
                  <div className="px-1 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Stores
                  </div>
                  <StoreList 
                    stores={results} 
                    onStoreClick={(store) => {
                      const storeNameSlug = store.name.toLowerCase().replace(/\s+/g, "-");
                      navigate(`/store/${storeNameSlug}`, { state: { store } });
                    }} 
                  />
                </div>
              ) : searchQuery.length >= 3 && (
                <div className="text-center py-10 opacity-50 text-sm">
                  No stores found matching "{searchQuery}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchPage;
