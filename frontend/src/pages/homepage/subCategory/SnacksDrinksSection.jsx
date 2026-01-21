import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../utils/api";

const SnacksDrinksSection = ({ onCategoryClick }) => {
  const [snacksItems, setSnacksItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        // API service returns unwrapped data array directly
        const data = await categoryAPI.getSubcategories("snacks-drinks");

        const items = (Array.isArray(data) ? data : []).map((cat) => ({
          id: cat._id,
          name: cat.name,
          image:
            cat.image ||
            "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&auto=format&fit=crop",
          category: "Snacks & Drinks",
          color: cat.color || "#f59e0b",
          slug: cat.slug,
        }));

        setSnacksItems(items);
      } catch (error) {
        console.error("Error fetching snacks subcategories:", error);
        setSnacksItems([]);
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
          Snacks & Drinks
        </h2>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <SubCategorySection
      title="Snacks & Drinks"
      items={snacksItems}
      onCategoryClick={onCategoryClick}
      route="/snacks"
    />
  );
};

export default SnacksDrinksSection;
