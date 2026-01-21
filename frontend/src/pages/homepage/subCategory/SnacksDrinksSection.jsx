import { useState, useEffect } from "react";
import SubCategorySection from "./SubCategorySection";
import { categoryAPI } from "../../../services/api";
import { SubCategoryShimmer } from "../../../components/shimmer";

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
          image: cat.image,
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
