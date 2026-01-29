import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Info } from "lucide-react";
import toast from "react-hot-toast";
import productAPI from "../../services/api/product.api";
import cartAPI from "../../services/api/cart.api";
import ProductHeader from "./ProductHeader";
import ProductInfo from "./ProductInfo";
import RatingsReviews from "./RatingsReviews";
import AddToCartBar from "./AddToCartBar";
import StoreConflictModal from "../../components/StoreConflictModal";

const ProductDetailPage = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [pendingCartItem, setPendingCartItem] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id, slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id, slug);
      setProduct(response.data); // Extract data from response
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);

      const currentVariant = product.variants?.[selectedVariant];
      const selectedVariantData = currentVariant
        ? {
            name: currentVariant.name,
            value: currentVariant.value,
            priceModifier: currentVariant.priceModifier || 0,
          }
        : null;

      await cartAPI.addToCart({
        productId: product._id,
        storeId: product.storeId,
        quantity,
        selectedVariant: selectedVariantData,
      });

      // Trigger cart update by dispatching custom event
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Show success toast
      toast.success(
        `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart!`,
        {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(49,134,22,0.3)",
          },
        },
      );
    } catch (error) {
      if (error.response?.data?.code === "DIFFERENT_STORE") {
        // This is not an error - show modal for user to choose
        setConflictData(error.response.data.data);
        setPendingCartItem({
          productId: product._id,
          storeId: product.storeId,
          quantity,
          selectedVariant: selectedVariantData,
        });
        setShowConflictModal(true);
      } else {
        // Actual error - show message from backend
        const errorMessage =
          error.response?.data?.message ||
          "Failed to add to cart. Please try again.";
        toast.error(errorMessage, {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(239,68,68,0.3)",
          },
        });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleKeepCurrentCart = () => {
    setShowConflictModal(false);
    setConflictData(null);
    setPendingCartItem(null);
    toast("Kept your current cart items", {
      duration: 2000,
      position: "top-center",
      icon: <Info className="w-4 h-4 text-blue-400" />,
      style: {
        background: "#1a1a1a",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
      },
    });
  };

  const handleReplaceCart = async () => {
    try {
      setAddingToCart(true);
      // Clear the cart first
      await cartAPI.clearCart();

      // Add the new item
      await cartAPI.addToCart(pendingCartItem);

      // Trigger cart update
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      setShowConflictModal(false);
      setConflictData(null);
      setPendingCartItem(null);

      toast.success(
        `Added ${pendingCartItem.quantity} ${pendingCartItem.quantity === 1 ? "item" : "items"} to cart!`,
        {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(49,134,22,0.3)",
          },
        },
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update cart. Please try again.";
      toast.error(errorMessage, {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid rgba(239,68,68,0.3)",
        },
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgb(49,134,22)] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <h2 className="text-xl font-bold mb-2">Product not found</h2>
        <p className="text-white/60 mb-4">
          The product you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[rgb(49,134,22)] rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  const currentVariant = product.variants?.[selectedVariant];
  const basePrice = product.retailPrice || product.price;
  const markupMultiplier = 1 + (product.markupPercentage || 20) / 100;
  const currentPrice = currentVariant
    ? basePrice + (currentVariant.priceModifier || 0) * markupMultiplier
    : basePrice;
  // Use originalRetailPrice (which includes markup) for customer display
  const originalRetailPrice =
    product.originalRetailPrice || product.originalPrice;
  const originalPrice =
    currentVariant && originalRetailPrice
      ? originalRetailPrice +
        (currentVariant.priceModifier || 0) * markupMultiplier
      : originalRetailPrice;

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const totalReviews = product.totalReviews || 0;
  const avgRating = product.averageRating || 0;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <ProductHeader />

      <ProductInfo
        product={product}
        currentPrice={currentPrice}
        originalPrice={originalPrice}
        avgRating={avgRating}
        totalReviews={totalReviews}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
      />

      <RatingsReviews
        product={product}
        avgRating={avgRating}
        totalReviews={totalReviews}
      />

      <AddToCartBar
        quantity={quantity}
        currentPrice={currentPrice}
        addingToCart={addingToCart}
        isAvailable={product.isAvailable}
        onQuantityChange={handleQuantityChange}
        onAddToCart={handleAddToCart}
      />

      {/* Store Conflict Modal */}
      <StoreConflictModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        currentStoreName={conflictData?.currentStoreName}
        newStoreName={conflictData?.newStoreName}
        onKeepCurrent={handleKeepCurrentCart}
        onReplaceCart={handleReplaceCart}
      />
    </div>
  );
};

export default ProductDetailPage;
