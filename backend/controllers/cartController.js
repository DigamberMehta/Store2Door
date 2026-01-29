import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

/**
 * Calculate tip options based on bill amount
 * GET /api/cart/tip-options
 */
export const getTipOptions = async (req, res) => {
  try {
    const { billAmount } = req.query;

    if (!billAmount || isNaN(billAmount) || billAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid bill amount is required",
      });
    }

    const amount = parseFloat(billAmount);

    // Calculate tip percentages
    const tipOptions = [
      {
        label: "10%",
        percentage: 10,
        amount: Math.round((amount * 10) / 100),
      },
      {
        label: "20%",
        percentage: 20,
        amount: Math.round((amount * 20) / 100),
      },
      {
        label: "30%",
        percentage: 30,
        amount: Math.round((amount * 30) / 100),
      },
    ];

    res.json({
      success: true,
      data: {
        billAmount: amount,
        tipOptions,
      },
    });
  } catch (error) {
    console.error("Error calculating tip options:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate tip options",
      error: error.message,
    });
  }
};

/**
 * Get user's active cart
 * GET /api/cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Use findOneAndUpdate with upsert to avoid duplicate key errors
    let cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
      .populate("items.productId", "name images price discount isAvailable")
      .populate("items.storeId", "name slug")
      .populate("storeId", "name logo address");

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      productId,
      storeId,
      quantity = 1,
      selectedVariant,
      customizations,
      specialInstructions,
    } = req.body;

    // Validate required fields
    if (!productId || !storeId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and Store ID are required",
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isAvailable || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      });
    }

    // Get store details
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Calculate price - use retailPrice (customer-facing price with markup)
    let unitPrice = product.retailPrice || product.price; // fallback for backward compatibility
    let discountedPrice = null;

    if (
      product.discount > 0 &&
      (product.originalRetailPrice || product.originalPrice)
    ) {
      discountedPrice = unitPrice;
    }

    // Add variant price modifier if applicable (apply markup to modifier)
    if (selectedVariant && selectedVariant.priceModifier) {
      const markupMultiplier = 1 + (product.markupPercentage || 20) / 100;
      const retailPriceModifier =
        selectedVariant.priceModifier * markupMultiplier;
      unitPrice += retailPriceModifier;
      if (discountedPrice) {
        discountedPrice += retailPriceModifier;
      }
    }

    // Add customizations cost (apply markup to wholesale customization costs)
    let customizationsCost = 0;
    if (customizations && customizations.length > 0) {
      const markupMultiplier = 1 + (product.markupPercentage || 20) / 100;
      customizationsCost = customizations.reduce(
        (sum, custom) => sum + (custom.additionalCost || 0) * markupMultiplier,
        0,
      );
      unitPrice += customizationsCost;
      if (discountedPrice) {
        discountedPrice += customizationsCost;
      }
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      cart = new Cart({ userId });
    }

    try {
      // Add item to cart (this will handle single-store validation)
      await cart.addItem({
        productId: product._id,
        storeId: store._id,
        storeName: store.name,
        name: product.name,
        description: product.shortDescription || product.description,
        image: product.images[0]?.url || "",
        quantity,
        unitPrice,
        discountedPrice,
        selectedVariant,
        customizations,
        specialInstructions,
        isAvailable: product.isAvailable,
        stockQuantity: product.inventory?.quantity || 0,
        markupPercentage: product.markupPercentage || 20,
      });

      await cart.save();

      // Populate cart for response
      await cart.populate("items.productId", "name images price isAvailable");
      await cart.populate("items.storeId", "name slug");
      await cart.populate("storeId", "name logo address");

      res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
        data: cart,
      });
    } catch (error) {
      // Handle single-store constraint error
      if (error.message.includes("different stores")) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: "DIFFERENT_STORE",
          data: {
            currentStoreName: cart.storeName,
            currentStoreId: cart.storeId,
            newStoreName: store.name,
            newStoreId: store._id,
          },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/items/:itemId
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    await cart.updateItemQuantity(itemId, quantity);
    await cart.save();

    await cart.populate("items.productId", "name images price isAvailable");
    await cart.populate("items.storeId", "name slug");
    await cart.populate("storeId", "name logo address");

    res.json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    await cart.removeItem(itemId);
    await cart.save();

    await cart.populate("items.productId", "name images price isAvailable");
    await cart.populate("items.storeId", "name slug");
    await cart.populate("storeId", "name logo address");

    res.json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    await cart.clearCart();
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

/**
 * Apply coupon to cart
 * POST /api/cart/coupon
 */
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    // Find active cart
    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or empty",
      });
    }

    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot apply coupon to empty cart",
      });
    }

    // Find coupon in database
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is valid for this user
    const userValidation = coupon.canUserUse(userId);
    if (!userValidation.valid) {
      return res.status(400).json({
        success: false,
        message: userValidation.message,
      });
    }

    // Check minimum order value
    if (cart.subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of R${coupon.minOrderValue} required for this coupon`,
      });
    }

    // Check if coupon is for first order only
    if (coupon.firstOrderOnly) {
      const previousOrders = await Order.countDocuments({
        customerId: userId,
        status: { $ne: "cancelled" },
      });
      if (previousOrders > 0) {
        return res.status(400).json({
          success: false,
          message: "This coupon is valid for first order only",
        });
      }
    }

    // Check store applicability
    if (
      coupon.applicableStores &&
      coupon.applicableStores.length > 0 &&
      cart.storeId
    ) {
      const isStoreApplicable = coupon.applicableStores.some(
        (storeId) => storeId.toString() === cart.storeId.toString(),
      );
      if (!isStoreApplicable) {
        return res.status(400).json({
          success: false,
          message: "This coupon is not applicable for this store",
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "free_delivery") {
      discountAmount = 0; // Will be handled at checkout for delivery fee
    } else {
      discountAmount = coupon.calculateDiscount(cart.subtotal);
    }

    // Apply coupon to cart
    cart.appliedCoupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discountAmount,
      expiresAt: coupon.validUntil,
    };

    await cart.save();

    // Populate cart details
    await cart.populate("items.productId", "name images price isAvailable");
    await cart.populate("storeId", "name logo address");

    res.json({
      success: true,
      message: `Coupon applied! You save R${discountAmount}`,
      data: cart,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};

/**
 * Remove coupon from cart
 * DELETE /api/cart/coupon
 */
export const removeCoupon = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    if (!cart.appliedCoupon || !cart.appliedCoupon.code) {
      return res.status(400).json({
        success: false,
        message: "No coupon applied to remove",
      });
    }

    // Remove coupon
    cart.appliedCoupon = undefined;
    await cart.save();

    // Populate cart details
    await cart.populate("items.productId", "name images price isAvailable");
    await cart.populate("storeId", "name logo address");

    res.json({
      success: true,
      message: "Coupon removed successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove coupon",
      error: error.message,
    });
  }
};
