import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../utils/api";

const HomeLifestyleSection = ({ onCategoryClick }) => {
  const [homeItems, setHomeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        // API service returns unwrapped data array directly
        const data = await categoryAPI.getSubcategories("home-furniture");

        const items = (Array.isArray(data) ? data : []).map((cat) => ({
          id: cat._id,
          name: cat.name,
          image:
            cat.image ||
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop",
          category: "Home & Furniture",
          color: cat.color || "#8b5cf6",
          slug: cat.slug,
        }));

        setHomeItems(items);
      } catch (error) {
        console.error("Error fetching home subcategories:", error);
        setHomeItems([]);
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
          Home & Lifestyle
        </h2>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <SubCategorySection
      title="Home & Lifestyle"
      items={homeItems}
      onCategoryClick={onCategoryClick}
      route="/home"
    />
  );
};

export default HomeLifestyleSection;
