import { useState, useEffect } from "react";
import Header from "../../components/Header";
import {
  GroceryKitchenSection,
  SnacksDrinksSection,
  BeautyPersonalCareSection,
  HomeLifestyleSection,
} from "./subCategory";
import { StoreList } from "./store";
import { storeAPI, categoryAPI } from "../../utils/api";

const HomePage = ({ onStoreClick, onCategoryClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState("Srishti, E512, Khajurla");
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stores and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storesResponse, categoriesResponse] = await Promise.all([
          storeAPI.getAll({ limit: 50 }),
          categoryAPI.getAll(),
        ]);
        setStores(storesResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter stores based on search and category
  const filteredStores = stores.filter((store) => {
    const matchesCategory =
      selectedCategory === "All" ||
      store.categories?.some(
        (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
      );
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.categories?.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black pb-20">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        location={location}
      />

      <GroceryKitchenSection onCategoryClick={onCategoryClick} />
      <SnacksDrinksSection onCategoryClick={onCategoryClick} />
      <BeautyPersonalCareSection onCategoryClick={onCategoryClick} />
      <HomeLifestyleSection onCategoryClick={onCategoryClick} />

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="text-white">Loading stores...</div>
        </div>
      ) : (
        <StoreList
          stores={filteredStores}
          onStoreClick={onStoreClick}
          onCategoryClick={onCategoryClick}
        />
      )}
    </div>
  );
};

export default HomePage;
