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

const HomePage = ({ onStoreClick, onCategoryClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude, loading: locationLoading } = useUserLocation();

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

  // Fetch stores and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Build params with user location if available
        const params = { limit: 50 };
        if (latitude && longitude) {
          params.userLat = latitude;
          params.userLon = longitude;
        }

        // Fetch stores and categories separately to prevent one failure from affecting the other
        const storesResponse = await storeAPI.getAll(params);
        if (storesResponse?.data && Array.isArray(storesResponse.data)) {
          setStores(storesResponse.data);
        }

        // Fetch categories separately with its own error handling
        try {
          const categoriesResponse = await categoryAPI.getAll();
          if (categoriesResponse && Array.isArray(categoriesResponse)) {
            setCategories(categoriesResponse);
          }
        } catch (categoryError) {
          console.error("Error fetching categories:", categoryError);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [latitude, longitude]); // Re-fetch when location changes

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
        <div className="pt-4">
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
        <div className="pt-4">
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
        <div className="pt-4">
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
        <div className="pt-4">
          <CategoryProductsView 
            categoryName="Home" 
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Electronics Section */}
      {selectedCategory === "Electronics" && (
        <div className="pt-4">
          <CategoryProductsView 
            categoryName="Electronics" 
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Fashion Section */}
      {selectedCategory === "Fashion" && (
        <div className="pt-4">
          <CategoryProductsView 
            categoryName="Fashion" 
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Pharmacy Section */}
      {selectedCategory === "Pharmacy" && (
        <div className="pt-4">
          <CategoryProductsView 
            categoryName="Pharmacy" 
            onCategoryClick={onCategoryClick}
          />
        </div>
      )}

      {/* Stores - only show in "All" tab */}
      {selectedCategory === "All" && (
        loading ? (
          <StoreListShimmer />
        ) : (
          <StoreList
            stores={filteredStores}
            onStoreClick={onStoreClick}
            onCategoryClick={onCategoryClick}
          />
        )
      )}
    </div>
  );
};

export default HomePage;
