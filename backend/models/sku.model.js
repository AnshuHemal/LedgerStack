import mongoose from "mongoose";

const SkuSchema = mongoose.Schema(
  {
    skuCode: {
      type: String,
      unique: true,
      trim: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductGroup",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        parts: [
          {
            subpartId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Subpart",
              required: true,
            },
            partName: {
              type: String,
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
              min: 1,
            },
            color: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    location: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      if (lastSku && lastSku.skuCode) {
        const lastNumber = parseInt(lastSku.skuCode.replace("SKU-", ""));
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      
      this.skuCode = `SKU-${nextNumber.toString().padStart(6, "0")}`;
    } catch (error) {
      console.error("Error generating SKU code:", error);
      // Fallback: generate a timestamp-based code
      this.skuCode = `SKU-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

const Sku = mongoose.model("Sku", SkuSchema);

export default Sku; 