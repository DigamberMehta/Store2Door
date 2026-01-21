import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../services/api";
import { SubCategoryShimmer } from "../../../components/shimmer";

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
          image: cat.image,
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
    return <SubCategoryShimmer />;
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
