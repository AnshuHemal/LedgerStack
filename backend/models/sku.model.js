import mongoose from "mongoose";

const SkuSchema = mongoose.Schema(
  {
    skuCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductGroup",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    subparts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subpart",
        required: true,
      },
    ],
    location: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: ["pieces", "boxes", "kg", "liters", "meters", "other"],
      default: "pieces",
    },
    customUnit: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate SKU code if not provided
SkuSchema.pre("save", async function (next) {
  if (this.isNew && !this.skuCode) {
    try {
      const lastSku = await this.constructor.findOne(
        {},
        {},
        { sort: { skuCode: -1 } }
      );
      
      let nextNumber = 1;
      if (lastSku) {
        const lastNumber = parseInt(lastSku.skuCode.replace("SKU-", ""));
        nextNumber = lastNumber + 1;
      }
      
      this.skuCode = `SKU-${nextNumber.toString().padStart(6, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Sku = mongoose.model("Sku", SkuSchema);

export default Sku; 