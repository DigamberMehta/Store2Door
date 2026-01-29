import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    // Markup percentage to apply to store manager prices
    markupPercentage: {
      type: Number,
      default: 20,
      min: [0, "Markup percentage cannot be negative"],
      max: [100, "Markup percentage cannot exceed 100%"],
    },

    // Platform commission percentage (if needed in future)
    commissionPercentage: {
      type: Number,
      default: 0,
      min: [0, "Commission percentage cannot be negative"],
      max: [100, "Commission percentage cannot exceed 100%"],
    },

    // Minimum order value
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure only one active settings document exists
platformSettingsSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false },
    );
  }
  next();
});

const PlatformSettings = mongoose.model(
  "PlatformSettings",
  platformSettingsSchema,
);

export default PlatformSettings;
