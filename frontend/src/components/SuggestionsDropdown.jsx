import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Clock, X, Loader2 } from 'lucide-react';
import { suggestionsAPI } from '../services/api';

const SuggestionsDropdown = ({ 
  isOpen, 
  onClose, 
  searchQuery = '', 
  onSearch 
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [suggestions, setSuggestions] = useState({
    products: [],
    stores: [],
    categories: [],
    all: []
  });
  const [popularSearches, setPopularSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch suggestions based on query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions({ products: [], stores: [], categories: [], all: [] });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await suggestionsAPI.getSuggestions(searchQuery, { limit: 10, type: 'store' });
        setSuggestions(response.suggestions || { products: [], stores: [], categories: [], all: [] });
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Fetch popular/trending/recent searches on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [popularRes, trendingRes] = await Promise.all([
          suggestionsAPI.getPopularSearches(5),
          suggestionsAPI.getTrendingSearches(5)
        ]);

        setPopularSearches(popularRes.popular || []);
        setTrendingSearches(trendingRes.trending || []);

        // Try to fetch recent searches ONLY if user is logged in
        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const recentRes = await suggestionsAPI.getRecentSearches(5);
            setRecentSearches(recentRes.recent || []);
          } catch (err) {
            console.warn('Failed to fetch recent searches:', err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };

    if (isOpen && !searchQuery) {
      fetchInitialData();
    }
  }, [isOpen, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSuggestionClick = (suggestion) => {
    if (onSearch) {
      onSearch(suggestion.name);
    }

    // Navigate based on type
    switch (suggestion.type) {
      case 'product':
        navigate(`/product/${suggestion.id.replace('product_', '')}`);
        break;
      case 'store':
        navigate(`/store/${suggestion.id.replace('store_', '')}`);
        break;
      case 'category':
        navigate(`/search?category=${suggestion.name}`);
        break;
      default:
        navigate(`/search?q=${suggestion.name}`);
    }

    onClose();
  };

  const handleSearchTermClick = (term) => {
    if (onSearch) {
      onSearch(term);
    }
    navigate(`/search?q=${term}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="w-full mt-4 text-white"
    >
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 text-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Suggestions based on query */}
      {!loading && !error && searchQuery ? (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {searchQuery.length < 2 ? (
            <div className="p-6 text-center text-zinc-600 italic text-sm">
              Keep typing to search...
            </div>
          ) : suggestions.stores.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              No stores found for "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stores */}
              {suggestions.stores.length > 0 && (
                <div>
                  <div className="px-1 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Stores
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {suggestions.stores.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-white/5"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                            🏪
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm text-white">{item.name}</div>
                          {item.rating && (
                            <div className="text-xs text-amber-500">
                              ⭐ {item.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty Query State: Recent & Trending in Rows */
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Recent Searches Row */}
          {recentSearches.length > 0 && (
            <div>
              <div className="px-1 py-2 flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Recent Searches
                </div>
                <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase">
                  Clear All
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
                {recentSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchTermClick(item.query)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/5 hover:bg-white/5 hover:border-white/10 rounded-2xl text-[13px] text-zinc-300 transition-all whitespace-nowrap flex-shrink-0 active:scale-95"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches Row */}
          {trendingSearches.length > 0 && (
            <div>
              <div className="px-1 py-2 mb-2">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                  Trending Searches
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none px-1">
                {trendingSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchTermClick(item.term)}
                    className="flex flex-col items-center gap-2 w-24 flex-shrink-0 group active:scale-95 transition-transform"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-white/10 transition-colors relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.term}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-zinc-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-[11px] font-bold text-white truncate text-center">
                          {item.term}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionsDropdown;
