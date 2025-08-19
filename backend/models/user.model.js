import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    isverified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: Date.now(),
    },

    companyDetails: {
      companyName: { type: String },
      address1: { type: String },
      address2: { type: String },
      authorisedPerson: { type: String },
      registeredAddress1: { type: String },
      registeredAddress2: { type: String },
      city: { type: String },
      pincode: { type: String },
      district: { type: String },
      state: { type: String },
      phone: { type: String },
      email: { type: String },
      website: { type: String },
      gstin: { type: String },
      pan: { type: String },
      bankDetails: {
        bankName: { type: String, required: true },
        accountNumber: {
          type: String,
          required: true,
          match: /^[0-9]{9,18}$/,
        },
        branch: { type: String, required: true },
        ifscCode: {
          type: String,
          required: true,
          match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
        },
      },
    },

    // Profile/Preferences fields
    profileImage: { type: String, default: "" }, // base64 or URL
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    walletBalance: { type: Number, default: 0 },
    qrCodeImage: { type: String, default: "" }, // base64 image for QR code
    termsAndConditions: { type: String, default: "" },
    education: {
      type: [
        new mongoose.Schema(
          {
            institution: { type: String },
            degree: { type: String },
            field: { type: String },
            startYear: { type: Number },
            endYear: { type: Number },
            description: { type: String },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const OtpSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 },
  },
  { timestamps: true }
);

const AccountGroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    effect: {
      type: String,
      required: true,
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

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    productGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductGroup",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    productTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductType",
      required: true,
    },
    hsn_sac_code: {
      type: String,
      required: true,
      match: /^[0-9]{6,8}$/
    },
    sale_rate: {
      type: Number,
      default: 0.0,
    },
    purchase_rate: {
      type: Number,
      default: 0.0,
    },
    piecesPerBox: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
ProductSchema.index({ productGroupId: 1 });
ProductSchema.index({ name: 1 });
ProductSchema.index({ createdBy: 1 });

const ProductGroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProductTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProductCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const TransportationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const AccountMasterSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    accountGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountGroup",
      required: true,
    },
    addressLine1: {
      type: String,
    },
    addressLine2: String,
    addressLine3: String,
    city: {
      type: String,
    },
    pinCode: {
      type: String,
    },
    state: {
      type: String,
    },
    gstin: {
      type: String,
      default: "",
    },
    panNo: {
      type: String,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
    openingBalance: {
      type: Number,
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

const SalesInvoiceSchema = mongoose.Schema(
  {
    cash_debit: {
      type: String,
      enum: ["Debit Memo", "Cash Memo"],
      default: "Debit Memo",
    },
    bill_date: {
      type: Date,
      required: true,
    },
    bill_no: {
      bill_prefix: {
        type: String,
        required: true,
      },
      no: {
        type: Number,
        required: true,
        default: 1,
      },
    },

    
    sales_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    po_no: {
      type: String,
      default: "",
    },
    lr_no: {
      type: String,
      default: "",
    },
    transportation_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
    },
    trans_doc_no: {
      type: String,
      default: "",
    },
    trans_date: {
      type: Date,
    },
    delivery_party_account: {
      gst: { type: String },
      panNo: { type: String },
      name: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      addressLine3: { type: String },
      city: { type: String },
      state: { type: String },
      pinCode: { type: String },
      mobileNo: { type: String },
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        boxes: {
          type: Number,
          required: true,
        },
        no_of_pcs: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
        },
        rate: {
          type: Number,
        },
        igst: {
          type: Number,
        },
        cgst: {
          type: Number,
        },
        sgst: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        total_amount: {
          type: Number,
        },
      },
    ],
    total_products_amount: {
      type: Number,
      default: 0,
    },
    freight_amount: {
      type: Number,
      default: 0,
    },
    final_amount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
    },
    pdf_url: {
      type: String,
      default: "",
    },
    pdf_data: { type: Buffer, select: false },
    pdf_mime: { type: String, default: "application/pdf", select: false },
    pdf_filename: { type: String, default: "" },
    // Outstanding balance tracking for Slip Book entries
    lastBalance: { type: Number, default: 0 },
    currentAmt: { type: Number, default: 0 },
    netBalance: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProformaBillSchema = mongoose.Schema({
  no: {
    type: Number,
    default: 1,
  },
});

const SalesBillSchema = mongoose.Schema({
  no: {
    type: Number,
    default: 1,
  },
});

const ProformaInvoiceSchema = mongoose.Schema(
  {
    cash_debit: {
      type: String,
      enum: ["Debit Memo", "Cash Memo"],
      default: "Debit Memo",
    },
    bill_date: {
      type: Date,
      required: true,
    },
    bill_no: {
      bill_prefix: {
        type: String,
        required: true,
      },
      no: {
        type: Number,
        required: true,
      },
    },

    
    sales_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    po_no: {
      type: String,
      default: "",
    },
    lr_no: {
      type: String,
      default: "",
    },
    transportation_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
    },
    trans_doc_no: {
      type: String,
      default: "",
    },
    trans_date: {
      type: Date,
    },
    delivery_party_account: {
      gst: { type: String },
      panNo: { type: String },
      name: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      addressLine3: { type: String },
      city: { type: String },
      state: { type: String },
      pinCode: { type: String },
      mobileNo: { type: String },
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        boxes: {
          type: Number,
          required: true,
        },
        no_of_pcs: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
        },
        rate: {
          type: Number,
        },
        igst: {
          type: Number,
        },
        cgst: {
          type: Number,
        },
        sgst: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        total_amount: {
          type: Number,
        },
      },
    ],
    total_products_amount: {
      type: Number,
      default: 0,
    },
    freight_amount: {
      type: Number,
      default: 0,
    },
    final_amount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
    },
    pdf_url: { type: String, default: "" },
    pdf_data: { type: Buffer, select: false },
    pdf_mime: { type: String, default: "application/pdf", select: false },
    pdf_filename: { type: String, default: "" },
    // Outstanding balance tracking for Slip Book entries
    lastBalance: { type: Number, default: 0 },
    currentAmt: { type: Number, default: 0 },
    netBalance: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const PurchaseInvoiceSchema = mongoose.Schema(
  {
    cash_debit: {
      type: String,
      enum: ["Debit Memo", "Cash Memo"],
      default: "Debit Memo",
    },
    voucher_date: {
      type: Date,
      required: true,
    },
    voucher_no: {
      type: Number,
      required: true,
    },
    bill_date: {
      type: Date,
      required: true,
    },
    bill_no: {
      type: Number,
      required: true,
    },
    
    purchase_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
        },
        rate: {
          type: Number,
        },
        igst: {
          type: Number,
        },
        cgst: {
          type: Number,
        },
        sgst: {
          type: Number,
        },
        total_amount: {
          type: Number,
        },
      },
    ],
    final_amount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
    },
    pdf_url: {
      type: String,
      default: "",
    },
    pdf_data: { type: Buffer, select: false },
    pdf_mime: { type: String, default: "application/pdf", select: false },
    pdf_filename: { type: String, default: "" },
    // Outstanding balance tracking for Slip Book entries
    lastBalance: { type: Number, default: 0 },
    currentAmt: { type: Number, default: 0 },
    netBalance: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProformaValidationSchema = mongoose.Schema(
  {
    proformaInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProformaInvoice",
      required: true,
    },
    validate: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const QuickEntrySchema = new mongoose.Schema(
  {
    entryType: { type: String, required: true },
    entryAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    date: { type: Date, required: true },
    day: { type: String },
    voucher_no: { type: String },
    cheque_no: { type: String },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    amount: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const OutstandingPayableSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    date: { type: Date, required: true },
    voucher_no: { type: String },
    description: { type: String },
    debitAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseInvoice",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const OutstandingReceivableSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMaster",
      required: true,
    },
    date: { type: Date, required: true },
    voucher_no: { type: String },
    description: { type: String },
    debitAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const QuickEntry = mongoose.model("QuickEntry", QuickEntrySchema);
export const OutstandingPayable = mongoose.model("OutstandingPayable", OutstandingPayableSchema);
export const OutstandingReceivable = mongoose.model("OutstandingReceivable", OutstandingReceivableSchema);
export const AccountMaster = mongoose.model(
  "AccountMaster",
  AccountMasterSchema
);
export const AccountGroup = mongoose.model("AccountGroup", AccountGroupSchema);
export const Product = mongoose.model("Product", ProductSchema);
export const ProductGroup = mongoose.model("ProductGroup", ProductGroupSchema);
export const ProductType = mongoose.model("ProductType", ProductTypeSchema);
export const ProductCategory = mongoose.model(
  "ProductCategory",
  ProductCategorySchema
);
export const Transportation = mongoose.model(
  "Transportation",
  TransportationSchema
);
export const SalesInvoice = mongoose.model("SalesInvoice", SalesInvoiceSchema);
export const PurchaseInvoice = mongoose.model(
  "PurchaseInvoice",
  PurchaseInvoiceSchema
);
export const ProformaInvoice = mongoose.model(
  "ProformaInvoice",
  ProformaInvoiceSchema
);
export const ProformaBill = mongoose.model("ProformaBill", ProformaBillSchema);
export const SalesBill = mongoose.model("SalesBill", SalesBillSchema);
export const ProformaValidation = mongoose.model(
  "ProformaValidation",
  ProformaValidationSchema
);
export const Otp = mongoose.model("Otp", OtpSchema);
export const User = mongoose.model("User", UserSchema);
