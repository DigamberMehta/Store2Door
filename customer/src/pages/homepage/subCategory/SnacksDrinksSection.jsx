import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../services/api";
import { SubCategoryShimmer } from "../../../components/shimmer";
import { useQuery } from "../../../hooks/useQuery";

const SnacksDrinksSection = ({ onCategoryClick }) => {
  const [snacksItems, setSnacksItems] = useState([]);

  // Use cached subcategories
  const { data, loading } = useQuery(
    () => categoryAPI.getSubcategories("snacks"),
    "subcategories:snacks",
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
          category: "Snacks & Drinks",
          color: cat.color || "#f59e0b",
          slug: cat.slug,
        }));

        setSnacksItems(items);
      } catch (error) {
        console.error("Error fetching snacks subcategories:", error);
        setSnacksItems([]);
      }
    };

    fetchSubcategories();
  }, [data]);

  if (loading) {
    return <SubCategoryShimmer />;
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
