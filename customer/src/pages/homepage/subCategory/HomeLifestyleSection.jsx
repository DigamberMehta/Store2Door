import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../services/api";
import { SubCategoryShimmer } from "../../../components/shimmer";
import { useQuery } from "../../../hooks/useQuery";

const HomeLifestyleSection = ({ onCategoryClick }) => {
  const [homeItems, setHomeItems] = useState([]);

  // Use cached subcategories
  const { data, loading } = useQuery(
    () => categoryAPI.getSubcategories("home"),
    "subcategories:home",
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
          category: "Home & Furniture",
          color: cat.color || "#8b5cf6",
          slug: cat.slug,
        }));

        setHomeItems(items);
      } catch (error) {
        console.error("Error fetching home subcategories:", error);
        setHomeItems([]);
      }
    };

    fetchSubcategories();
  }, [data]);

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
