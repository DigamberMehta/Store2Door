import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../utils/api";

const GroceryKitchenSection = ({ onCategoryClick }) => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        // API service returns unwrapped data array directly
        const data = await categoryAPI.getSubcategories("grocery-kitchen");

        // Transform API data to match component format
        const items = (Array.isArray(data) ? data : []).map((cat) => ({
          id: cat._id,
          name: cat.name,
          image: cat.image,
          category: "Grocery & Kitchen",
          color: cat.color || "#3b82f6",
          slug: cat.slug,
        }));

        setGroceryItems(items);
      } catch (error) {
        console.error("Error fetching grocery subcategories:", error);
        // Fallback to empty array on error
        setGroceryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  if (loading) {
    return (
      <div className="py-6 px-4">
        <h2 className="text-white text-xl font-semibold mb-4">
          Grocery & Kitchen
        </h2>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <SubCategorySection
      title="Grocery & Kitchen"
      items={groceryItems}
      onCategoryClick={onCategoryClick}
      route="/grocery"
    />
  );
};

export default GroceryKitchenSection;
