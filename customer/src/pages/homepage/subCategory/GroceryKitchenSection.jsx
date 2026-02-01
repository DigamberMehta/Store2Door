import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../services/api";
import { SubCategoryShimmer } from "../../../components/shimmer";
import { useQuery } from "../../../hooks/useQuery";

const GroceryKitchenSection = ({ onCategoryClick }) => {
  const [groceryItems, setGroceryItems] = useState([]);

  // Use cached subcategories
  const { data, loading } = useQuery(
    () => categoryAPI.getSubcategories("grocery"),
    "subcategories:grocery",
    { ttl: 10 * 60 * 1000 },
  );

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!data) return;
      try {
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
        setGroceryItems([]);
      }
    };

    fetchSubcategories();
  }, [data]);

  if (loading) {
    return <SubCategoryShimmer />;
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
