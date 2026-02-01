import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../services/api";
import { SubCategoryShimmer } from "../../../components/shimmer";
import { useQuery } from "../../../hooks/useQuery";

const BeautyPersonalCareSection = ({ onCategoryClick }) => {
  const [beautyItems, setBeautyItems] = useState([]);

  // Use cached subcategories
  const { data, loading } = useQuery(
    () => categoryAPI.getSubcategories("beauty"),
    "subcategories:beauty",
    { ttl: 10 * 60 * 1000 },
  );

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!data) return;
      try {
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
      }
    };

    fetchSubcategories();
  }, [data]);

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
