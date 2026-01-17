import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSearch, HiOutlineArrowLeft, HiOutlineMicrophone } from "react-icons/hi";
import { StoreList, storesData } from "../homepage/store";

const SearchPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Focus the search box on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Show all stores regardless of search query during design mode
    setResults(storesData);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-2 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 active:bg-white/10 rounded-full transition-all"
          >
            <HiOutlineArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
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

      {/* Results Section */}
      <div className="px-2 py-4">
        {searchQuery.trim() === "" ? (
          <div className="flex flex-col items-center justify-center pt-32 opacity-20">
            <HiOutlineSearch className="w-20 h-20 mb-4" />
            <p className="text-[11px] font-medium tracking-widest uppercase">Start typing to search</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <StoreList 
              stores={results} 
              onStoreClick={(store) => {
                const storeNameSlug = store.name.toLowerCase().replace(/\s+/g, "-");
                navigate(`/store/${storeNameSlug}`, { state: { store } });
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
