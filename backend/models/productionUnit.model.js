import mongoose from "mongoose";

const productionUnitSchema = new mongoose.Schema(
  {
    unitName: {
      type: String,
      required: true,
      trim: true,
    },
    productGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductGroup",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subpart",
      required: true,
    },
    selectedPartIndex: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better query performance
productionUnitSchema.index({ unitName: 1, date: -1 });
productionUnitSchema.index({ productGroup: 1 });
productionUnitSchema.index({ product: 1 });

// Create compound unique index to prevent duplicate entries for same unit, product, part, and date
productionUnitSchema.index(
  { unitName: 1, product: 1, part: 1, date: 1 }, 
  { unique: true }
);

const ProductionUnit = mongoose.model("ProductionUnit", productionUnitSchema);

export default ProductionUnit;