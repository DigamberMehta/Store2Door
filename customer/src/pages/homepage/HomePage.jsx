import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
        ) : (
          <StoreList
            stores={filteredStores}
            onStoreClick={onStoreClick}
            onCategoryClick={onCategoryClick}
          />
        ))}
    </div>
  );
};

export default HomePage;
