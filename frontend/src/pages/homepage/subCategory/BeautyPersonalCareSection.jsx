import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../utils/api";

const BeautyPersonalCareSection = ({ onCategoryClick }) => {
  const [beautyItems, setBeautyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getSubcategories("beauty-personal-care");
        
        const items = response.data.map((cat) => ({
          id: cat._id,
          name: cat.name,
          image: cat.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop",
          category: "Beauty & Personal Care",
          color: cat.color || "#ec4899",
          slug: cat.slug,
        }));
        
        setBeautyItems(items);
      } catch (error) {
        console.error("Error fetching beauty subcategories:", error);
        setBeautyItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  if (loading) {
    return (
      <div className="py-6 px-4">
        <h2 className="text-white text-xl font-semibold mb-4">Beauty & Personal Care</h2>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <SubCategorySection
      title="Beauty & Personal Care"
      items={beautyItems}
      onCategoryClick={onCategoryClick}
      route="/beauty"
    />
  );
};

export default BeautyPersonalCareSection;
