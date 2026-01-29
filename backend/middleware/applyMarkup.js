import PlatformSettings from "../models/PlatformSettings.js";

/**
 * Apply platform markup to product prices
 * This middleware should be used on customer-facing product routes
 */
export const applyMarkup = async (req, res, next) => {
  // Store the original send method
  const originalSend = res.json;

  // Override the json method
  res.json = async function (data) {
    if (data && data.success && data.data) {
      try {
        // Get platform settings for markup
        const settings = await PlatformSettings.findOne({ isActive: true });
        const markupPercentage = settings?.markupPercentage || 20;
        const markupMultiplier = 1 + markupPercentage / 100;

        // Apply markup to products
        const applyMarkupToProduct = (product) => {
          if (product && typeof product.price === "number") {
            // Apply markup to base price
            product.price =
              Math.round(product.price * markupMultiplier * 100) / 100;

            // Apply markup to original price if exists
            if (product.originalPrice) {
              product.originalPrice =
                Math.round(product.originalPrice * markupMultiplier * 100) /
                100;
            }

            // Apply markup to variant price modifiers
            if (product.variants && Array.isArray(product.variants)) {
              product.variants = product.variants.map((variant) => ({
                ...variant,
                priceModifier:
                  Math.round(
                    (variant.priceModifier || 0) * markupMultiplier * 100,
                  ) / 100,
              }));
            }
          }
          return product;
        };

        // Handle single product or array of products
        if (Array.isArray(data.data)) {
          data.data = data.data.map(applyMarkupToProduct);
        } else if (data.data._id || data.data.name) {
          // Single product
          data.data = applyMarkupToProduct(data.data);
        }
      } catch (error) {
        console.error("Error applying markup:", error);
        // Continue without markup on error
      }
    }

    // Call the original send method
    originalSend.call(this, data);
  };

  next();
};

export default applyMarkup;
