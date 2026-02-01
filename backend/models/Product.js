import mongoose from "mongoose";

// Variant sub-schema for product options
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Variant name is required"],
    trim: true,
    maxlength: 100,
  },
  value: {
    type: String,
    required: [true, "Variant value is required"],
    trim: true,
    maxlength: 100,
  },
  priceModifier: {
    type: Number,
    default: 0,
    min: [0, "Price modifier cannot be negative"],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

// Nutrition information sub-schema (for food products)
const nutritionSchema = new mongoose.Schema({
  calories: {
    type: Number,
    min: 0,
  },
  protein: {
    type: Number,
    min: 0,
  },
  carbohydrates: {
    type: Number,
    min: 0,
  },
  fat: {
    type: Number,
    min: 0,
  },
  fiber: {
    type: Number,
    min: 0,
  },
  sugar: {
    type: Number,
    min: 0,
  },
  sodium: {
    type: Number,
    min: 0,
  },
  servingSize: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  servingsPerContainer: {
    type: Number,
    min: 1,
  },
});

// Product specifications sub-schema (flexible for any product type)
const specificationsSchema = new mongoose.Schema({
  // Common basic fields (optional)
  brand: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  model: {
    type: String,
    trim: true,
    maxlength: 100,
  },

  // Flexible custom specifications - can handle any product type
  customSpecs: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        // e.g., "Screen Size", "Fabric Type", "Author", "Voltage", etc.
      },
      value: {
        type: mongoose.Schema.Types.Mixed, // Can be string, number, array, etc.
        required: true,
      },
      unit: {
        type: String,
        trim: true,
        maxlength: 20,
        // e.g., "inches", "grams", "volts", "pages", etc.
      },
      dataType: {
        type: String,
        enum: ["string", "number", "boolean", "array", "object"],
        default: "string",
      },
      isFilterable: {
        type: Boolean,
        default: true, // Can this spec be used for filtering?
      },
      displayOrder: {
        type: Number,
        default: 0, // Order to display specs
      },
    },
  ],

  // Key Features - Simple dynamic key-value pairs
  keyFeatures: [
    {
      key: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        // e.g., "Battery Life", "Screen Type", "Processor", etc.
      },
      value: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        // e.g., "Up to 24 hours", "AMOLED Display", "Snapdragon 888"
      },
    },
  ],

  // Legacy fixed fields (for backward compatibility)
  color: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  size: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ["cm", "inch", "m"],
      default: "cm",
    },
  },
  material: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  warranty: {
    type: String,
    trim: true,
    maxlength: 100,
  },
});

// Inventory tracking sub-schema
const inventorySchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, "Low stock threshold cannot be negative"],
  },
  sku: {
    type: String,
    trim: true,
    uppercase: true,
  },
  barcode: {
    type: String,
    trim: true,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  expiryDate: {
    type: Date,
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: 200,
  },
});

// Main product schema
const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Store Reference
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
    },

    // Categorization
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: 100,
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
      },
    ],

    // Pricing - Two-tier pricing model
    wholesalePrice: {
      type: Number,
      // Optional - can be provided directly or populated from 'price' field for backward compatibility
      min: [0, "Wholesale price cannot be negative"],
    },
    retailPrice: {
      type: Number,
      // Not required - auto-calculated in pre-save hook from wholesalePrice + markup
      min: [0, "Retail price cannot be negative"],
      index: true,
    },
    // Legacy field for backward compatibility - maps to wholesalePrice
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    // Original prices (for sales/discounts)
    originalWholesalePrice: {
      type: Number,
      min: [0, "Original wholesale price cannot be negative"],
    },
    originalRetailPrice: {
      type: Number,
      min: [0, "Original retail price cannot be negative"],
    },
    // Legacy field - kept for backward compatibility
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    markupPercentage: {
      type: Number,
      default: 20,
      min: [0, "Markup percentage cannot be negative"],
    },
    currency: {
      type: String,
      default: "ZAR",
      uppercase: true,
      enum: ["ZAR"],
      maxlength: 3,
    },

    // Product Media
    images: [
      {
        url: {
          type: String,
          required: [true, "Image URL is required"],
          trim: true,
        },
        alt: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    video: {
      type: String,
      trim: true,
    },

    // Product Variants
    variants: [variantSchema],

    // Product Details
    nutrition: nutritionSchema,
    specifications: specificationsSchema,

    // Inventory Management
    inventory: inventorySchema,

    // Product Attributes
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isHalal: {
      type: Boolean,
      default: false,
    },
    isKosher: {
      type: Boolean,
      default: false,
    },
    isDairyFree: {
      type: Boolean,
      default: false,
    },
    isNutFree: {
      type: Boolean,
      default: false,
    },

    // Age and Safety
    minimumAge: {
      type: Number,
      min: 0,
      max: 100,
    },
    requiresIDVerification: {
      type: Boolean,
      default: false,
    },
    isPrescriptionRequired: {
      type: Boolean,
      default: false,
    },
    isFragile: {
      type: Boolean,
      default: false,
    },

    // Availability
    isActive: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableTo: {
      type: Date,
    },

    // Preparation and Delivery
    preparationTime: {
      type: Number, // in minutes
      default: 15,
      min: [1, "Preparation time must be at least 1 minute"],
      max: [240, "Preparation time cannot exceed 240 minutes"],
    },

    // Ratings and Reviews
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Sales Statistics
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // SEO
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // Special Offers
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOnSale: {
      type: Boolean,
      default: false,
      index: true,
    },
    saleStartDate: {
      type: Date,
    },
    saleEndDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for performance
productSchema.index({ storeId: 1, isActive: 1, isAvailable: 1 });
productSchema.index({ categoryId: 1, subcategory: 1, isActive: 1 });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ averageRating: -1, totalReviews: -1 });
productSchema.index({ totalSold: -1, isActive: 1 });
productSchema.index({ createdAt: -1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isOnSale: 1, isActive: 1 });

// Text search index with compound for performance
productSchema.index({
  name: "text",
  description: "text",
  shortDescription: "text",
  tags: "text",
  category: "text",
  subcategory: "text",
});

// Compound index for text search with filters
productSchema.index({ isActive: 1, popularity: -1, averageRating: -1 });

// Sparse indexes for optional fields
productSchema.index({ "inventory.sku": 1 }, { sparse: true });
productSchema.index({ "inventory.barcode": 1 }, { sparse: true });

// Pre-save middleware
productSchema.pre("save", function (next) {
  // Generate slug from name if not provided
  if (!this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      this._id.toString().slice(-6);
  }

  // Backward compatibility: if price is set but not wholesalePrice, use price as wholesalePrice
  if (this.price && !this.wholesalePrice) {
    this.wholesalePrice = this.price;
  }

  // Calculate retailPrice from wholesalePrice with markup
  if (
    this.wholesalePrice &&
    (this.isModified("wholesalePrice") || this.isNew)
  ) {
    const markupMultiplier = 1 + (this.markupPercentage || 20) / 100;
    this.retailPrice =
      Math.round(this.wholesalePrice * markupMultiplier * 100) / 100;
  }

  // Calculate originalRetailPrice from originalWholesalePrice with markup
  if (
    this.originalWholesalePrice &&
    (this.isModified("originalWholesalePrice") || this.isNew)
  ) {
    const markupMultiplier = 1 + (this.markupPercentage || 20) / 100;
    this.originalRetailPrice =
      Math.round(this.originalWholesalePrice * markupMultiplier * 100) / 100;
  }

  // Backward compatibility: if originalPrice is set, treat as originalWholesalePrice
  if (this.originalPrice && !this.originalWholesalePrice) {
    this.originalWholesalePrice = this.originalPrice;
    const markupMultiplier = 1 + (this.markupPercentage || 20) / 100;
    this.originalRetailPrice =
      Math.round(this.originalPrice * markupMultiplier * 100) / 100;
  }

  // Sync price field with wholesalePrice for backward compatibility
  if (this.wholesalePrice) {
    this.price = this.wholesalePrice;
  }

  // Calculate discount based on wholesale prices (for store manager view)
  if (
    this.originalWholesalePrice &&
    this.originalWholesalePrice > this.wholesalePrice
  ) {
    this.discount = Math.round(
      ((this.originalWholesalePrice - this.wholesalePrice) /
        this.originalWholesalePrice) *
        100,
    );
  } else if (this.originalPrice && this.originalPrice > this.wholesalePrice) {
    // Legacy fallback
    this.discount = Math.round(
      ((this.originalPrice - this.wholesalePrice) / this.originalPrice) * 100,
    );
  }

  // Set sale status based on dates
  const now = new Date();
  if (this.saleStartDate && this.saleEndDate) {
    this.isOnSale = now >= this.saleStartDate && now <= this.saleEndDate;
  }

  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter((img) => img.isPrimary);
    if (primaryImages.length > 1) {
      this.images.forEach((img, index) => {
        if (index > 0) img.isPrimary = false;
      });
    } else if (primaryImages.length === 0) {
      this.images[0].isPrimary = true;
    }
  }

  next();
});

// Instance methods
productSchema.methods.populateCategory = function () {
  return this.populate("categoryId", "name description icon image attributes");
};
// Method to add custom specification
productSchema.methods.addCustomSpec = function (
  name,
  value,
  unit = null,
  dataType = "string",
  isFilterable = true,
  displayOrder = 0,
) {
  if (!this.specifications) {
    this.specifications = {};
  }
  if (!this.specifications.customSpecs) {
    this.specifications.customSpecs = [];
  }

  // Remove existing spec with same name
  this.specifications.customSpecs = this.specifications.customSpecs.filter(
    (spec) => spec.name !== name,
  );

  // Add new spec
  this.specifications.customSpecs.push({
    name,
    value,
    unit,
    dataType,
    isFilterable,
    displayOrder,
  });

  // Sort by display order
  this.specifications.customSpecs.sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  return this;
};

// Method to get custom specification by name
productSchema.methods.getCustomSpec = function (name) {
  if (!this.specifications?.customSpecs) return null;
  return this.specifications.customSpecs.find((spec) => spec.name === name);
};

// Method to get all filterable specs
productSchema.methods.getFilterableSpecs = function () {
  if (!this.specifications?.customSpecs) return [];
  return this.specifications.customSpecs.filter((spec) => spec.isFilterable);
};
// Static methods
productSchema.statics.findByCategory = function (categoryId, options = {}) {
  return this.find({
    categoryId,
    isActive: true,
    isAvailable: true,
    ...options,
  }).populate("categoryId", "name description icon image");
};

productSchema.statics.findWithCategories = function (
  filter = {},
  options = {},
) {
  return this.find(
    {
      isActive: true,
      isAvailable: true,
      ...filter,
    },
    null,
    options,
  )
    .populate("categoryId", "name description icon image attributes")
    .populate(
      "storeId",
      "name averageRating deliveryFee estimatedDeliveryTime",
    );
};

// Search products by custom specifications
productSchema.statics.findByCustomSpecs = function (specs = {}, options = {}) {
  const query = { isActive: true, isAvailable: true };

  // Build query for custom specs
  Object.entries(specs).forEach(([specName, specValue]) => {
    query[`specifications.customSpecs`] = {
      $elemMatch: {
        name: specName,
        value: specValue,
      },
    };
  });

  return this.find(query, null, options)
    .populate("categoryId", "name description icon image")
    .populate("storeId", "name averageRating deliveryFee");
};

// Get unique specification names for a category (for filters)
productSchema.statics.getSpecificationsByCategory = function (categoryId) {
  return this.aggregate([
    { $match: { categoryId, isActive: true } },
    { $unwind: "$specifications.customSpecs" },
    {
      $group: {
        _id: "$specifications.customSpecs.name",
        dataType: { $first: "$specifications.customSpecs.dataType" },
        unit: { $first: "$specifications.customSpecs.unit" },
        values: { $addToSet: "$specifications.customSpecs.value" },
        count: { $sum: 1 },
      },
    },
    { $match: { "specifications.customSpecs.isFilterable": true } },
    { $sort: { count: -1 } },
  ]);
};

const Product = mongoose.model("Product", productSchema);

export default Product;
