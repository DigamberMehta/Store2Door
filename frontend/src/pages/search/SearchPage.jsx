import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HiOutlineSearch, HiOutlineArrowLeft, HiOutlineMicrophone } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { StoreList } from "../homepage/store";
import { suggestionsAPI } from "../../services/api";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRef = useRef(null);
  
  const initialQuery = searchParams.get("q") || searchParams.get("category") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spellingCorrections, setSpellingCorrections] = useState([]);

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

  // Fetch suggestions and store results (combined in single API call)
  useEffect(() => {
    const fetchResults = async () => {
      const query = searchQuery.trim();
      if (!query || query.length < 2) {
        setResults([]);
        setSpellingCorrections([]);
        return;
      }

      try {
        setLoading(true);
        
        // Single API call - get suggestions which includes store data
        const suggestionsResponse = await suggestionsAPI.getSuggestions(query, { limit: 10, type: 'store' });
        
        // Extract corrections if available
        if (suggestionsResponse.suggestions?.corrections) {
          setSpellingCorrections(suggestionsResponse.suggestions.corrections);
        } else {
          setSpellingCorrections([]);
        }

        // Extract stores from suggestions response
        if (suggestionsResponse.suggestions?.stores) {
          // Convert suggestion format to store format for display
          const stores = suggestionsResponse.suggestions.stores.map(suggestion => ({
            _id: suggestion.id?.replace('store_', ''),
            name: suggestion.name,
            description: suggestion.description,
            image: suggestion.image,
            rating: suggestion.rating,
            category: suggestion.category
          }));
          setResults(stores);
        } else {
          setResults([]);
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
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
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
          {searchQuery.length >= 2 ? (
            <motion.div
              key="search-results"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Spelling Corrections */}
              {spellingCorrections.length > 0 && (
                <div className="px-2 py-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[11px] text-zinc-500 mb-2">
                    Did you mean?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {spellingCorrections.map((correction, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(correction.suggestion)}
                        className="px-3 py-1.5 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-colors"
                      >
                        {correction.suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Store Results */}
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : results.length > 0 ? (
                <div className="pt-2">
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
              ) : (
                <div className="text-center py-20 opacity-50 text-sm">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineSearch className="w-8 h-8 text-white/20" />
                  </div>
                  No stores found matching "{searchQuery}"
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <HiOutlineSearch className="w-12 h-12 text-white/10" />
              </div>
              <h3 className="text-xl font-semibold text-white/80 mb-2">Search door2door</h3>
              <p className="text-sm text-white/30 max-w-[240px] leading-relaxed mx-auto">
                Discover local stores, fresh groceries, and the best deals near you
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchPage;
