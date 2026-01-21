import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../services/api";
import { SubCategoryShimmer } from "../../../components/shimmer";

const BeautyPersonalCareSection = ({ onCategoryClick }) => {
  const [beautyItems, setBeautyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        // API service returns unwrapped data array directly
        const data = await categoryAPI.getSubcategories("beauty-personal-care");

        const items = (Array.isArray(data) ? data : []).map((cat) => ({
          id: cat._id,
          name: cat.name,
          image: cat.image,
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
    return <SubCategoryShimmer />;
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
