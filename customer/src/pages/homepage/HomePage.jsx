import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker } from "react-icons/hi";
import Header from "../../components/Header";
import {
  GroceryKitchenSection,
  SnacksDrinksSection,
  BeautyPersonalCareSection,
  HomeLifestyleSection,
} from "./subCategory";
import { CategoryProductsSection, CategoryProductsView } from "./category";
import { StoreList } from "./store";
import { storeAPI, categoryAPI } from "../../services/api";
import { StoreListShimmer } from "../../components/shimmer";
import { useUserLocation } from "../../hooks/useUserLocation";
import { useQuery } from "../../hooks/useQuery";

const HomePage = ({ onStoreClick, onCategoryClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [stores, setStores] = useState([]);
  const { latitude, longitude, loading: locationLoading } = useUserLocation();

  // Use caching hook for categories (stable data, 10 min TTL)
  const { data: categories, loading: categoriesLoading } = useQuery(
    () => categoryAPI.getAll(),
    "categories",
    { ttl: 10 * 60 * 1000 }, // Cache for 10 minutes
  );

  // Use caching hook for stores (varies by location, 5 min TTL)
  const { data: storesData, loading: storesLoading } = useQuery(
    async () => {
      const params = { limit: 50 };
      if (latitude && longitude) {
        params.userLat = latitude;
        params.userLon = longitude;
      }
      return storeAPI.getAll(params);
    },
    `stores:${latitude}:${longitude}`,
    { ttl: 5 * 60 * 1000 }, // Cache for 5 minutes
  );

  const loading = categoriesLoading || storesLoading || locationLoading;

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", selectedCategory);
    }
    setSearchParams(searchParams, { replace: true });
  }, [selectedCategory]);

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, []);

  // Extract stores from response
  useEffect(() => {
    if (storesData?.data && Array.isArray(storesData.data)) {
      setStores(storesData.data);
    }
  }, [storesData]);

  // Filter stores based on category
  const filteredStores = stores.filter((store) => {
    const matchesCategory =
      selectedCategory === "All" ||
      store.categories?.some(
        (cat) => cat.toLowerCase() === selectedCategory.toLowerCase(),
      );
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black pb-20">
      <Header
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        loading={loading}
      />

      {/* Grocery Section */}
      {selectedCategory === "All" && (
        <>
          <GroceryKitchenSection onCategoryClick={onCategoryClick} />
          <CategoryProductsSection
            parentSlug="grocery"
            title="Grocery & Kitchen"
            selectedCategory={selectedCategory}
            showTitle={true}
            onCategoryClick={onCategoryClick}
          />
        </>
      )}
      {selectedCategory === "Grocery" && (
        <div className="pt-1">
          <CategoryProductsView
            categoryName="Grocery"
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Snacks Section */}
      {selectedCategory === "All" && (
        <>
          <SnacksDrinksSection onCategoryClick={onCategoryClick} />
          <CategoryProductsSection
            parentSlug="snacks-drinks"
            title="Snacks & Drinks"
            selectedCategory={selectedCategory}
            showTitle={true}
            onCategoryClick={onCategoryClick}
          />
        </>
      )}
      {selectedCategory === "Snacks" && (
        <div className="pt-1">
          <CategoryProductsView
            categoryName="Snacks"
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Beauty Section */}
      {selectedCategory === "All" && (
        <>
          <BeautyPersonalCareSection onCategoryClick={onCategoryClick} />
          <CategoryProductsSection
            parentSlug="beauty-personal-care"
            title="Beauty & Personal Care"
            selectedCategory={selectedCategory}
            showTitle={true}
            onCategoryClick={onCategoryClick}
          />
        </>
      )}
      {selectedCategory === "Beauty" && (
        <div className="pt-1">
          <CategoryProductsView
            categoryName="Beauty"
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Home Section */}
      {selectedCategory === "All" && (
        <>
          <HomeLifestyleSection onCategoryClick={onCategoryClick} />
          <CategoryProductsSection
            parentSlug="home-lifestyle"
            title="Home & Lifestyle"
            selectedCategory={selectedCategory}
            showTitle={true}
            onCategoryClick={onCategoryClick}
          />
        </>
      )}
      {selectedCategory === "Home" && (
        <div className="pt-1">
          <CategoryProductsView
            categoryName="Home"
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Electronics Section */}
      {selectedCategory === "Electronics" && (
        <div className="pt-1">
          <CategoryProductsView
            categoryName="Electronics"
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Fashion Section */}
      {selectedCategory === "Fashion" && (
        <div className="pt-1">
          <CategoryProductsView
            categoryName="Fashion"
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Pharmacy Section */}
      {selectedCategory === "Pharmacy" && (
        <div className="pt-1">
          <CategoryProductsView
            categoryName="Pharmacy"
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Stores - only show in "All" tab */}
      {selectedCategory === "All" &&
        (loading ? (
          <StoreListShimmer />
        ) : filteredStores.length > 0 ? (
          <StoreList
            stores={filteredStores}
            onStoreClick={onStoreClick}
            onCategoryClick={onCategoryClick}
          />
        ) : (
          <div className="px-4 py-10 text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-[rgb(49,134,22)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[rgb(49,134,22)]/20">
                <HiOutlineLocationMarker className="w-8 h-8 text-[rgb(49,134,22)]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">No Stores Nearby</h3>
              <p className="text-white/50 text-sm mb-6">
                {latitude && longitude 
                  ? "We couldn't find any stores within 7km of your current location."
                  : "We couldn't detect your location. Please check your browser settings or add an address manually."}
              </p>
              <button 
                onClick={() => navigate("/profile/addresses")}
                className="w-full bg-[rgb(49,134,22)] text-white font-semibold py-3 rounded-xl active:bg-[rgb(49,134,22)]/90 transition-all"
              >
                Add Address Manually
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default HomePage;
