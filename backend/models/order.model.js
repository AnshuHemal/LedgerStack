import mongoose from "mongoose";

const OrderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: "TEMP-000000", // Add a default value for debugging
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        boxes: {
          type: Number,
          required: true,
          min: 1,
        },
        status: {
          type: String,
          enum: ["pending", "confirmed", "in_production", "ready", "shipped", "delivered", "cancelled"],
          default: "pending",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_production", "ready", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    customerContact: {
      type: String,
      required: true,
    },
    deliveryDate: {
      type: Date,
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

// Auto-generate order number before saving
OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastOrder = await this.constructor.findOne(
        {},
        {},
        { sort: { orderNumber: -1 } }
      );
      
      let nextNumber = 1;
      if (lastOrder) {
        const lastNumber = parseInt(lastOrder.orderNumber.replace("ORD-", ""));
        nextNumber = lastNumber + 1;
      }
      
      this.orderNumber = `ORD-${nextNumber.toString().padStart(6, "0")}`;
    } catch (error) {
      console.error("Error in pre-save hook:", error);
      return next(error);
    }
  } else {
  }
  next();
});

// Add a simpler pre-save hook as backup
OrderSchema.pre("save", function (next) {
  next();
});

// Also add a pre-validate hook as backup
OrderSchema.pre("validate", function (next) {
  if (this.isNew && !this.orderNumber) {
    console.log("Pre-validate hook: orderNumber is missing, will be generated in pre-save");
  }
  next();
});

// Add a post-save hook to verify the orderNumber was set
OrderSchema.post("save", function (doc) {
  console.log("Post-save hook: Order saved with orderNumber:", doc.orderNumber);
});

// Check if model already exists to avoid compilation issues
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order; 