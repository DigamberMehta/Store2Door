import mongoose from "mongoose";

const deliverySettingsSchema = new mongoose.Schema(
  {
    // Distance tiers for delivery charges
    distanceTiers: [
      {
        maxDistance: {
          type: Number,
          required: true,
          min: 0,
        },
        charge: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    
    // Maximum delivery distance (stores beyond this won't be shown)
    maxDeliveryDistance: {
      type: Number,
      required: true,
      default: 7,
      min: 0,
    },
    
    // Currency symbol
    currency: {
      type: String,
      default: "R",
      trim: true,
    },
    
    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active settings document exists
deliverySettingsSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const DeliverySettings = mongoose.model("DeliverySettings", deliverySettingsSchema);

export default DeliverySettings;
