import mongoose from "mongoose";

const SubpartSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    parts: [
      {
        partName: {
          type: String,
          required: true,
          trim: true,
          validate: {
            validator: function(v) {
              return v && v.trim().length > 0;
            },
            message: 'Part name cannot be empty or null'
          }
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        color: {
          type: String,
          default: "Black",
          trim: true,
        },
      },
    ],
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

const Subpart = mongoose.model("Subpart", SubpartSchema);

export default Subpart; 