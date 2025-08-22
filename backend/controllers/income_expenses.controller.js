import {
  ProformaBill,
  ProformaInvoice,
  ProformaValidation,
  PurchaseInvoice,
  SalesBill,
  SalesInvoice,
  Transportation,
} from "../models/user.model.js";

// Utility function to determine GST type based on state codes
const determineGSTType = (companyGST, accountGST) => {
  if (!companyGST || !accountGST) return "IGST"; // Default to IGST if GST numbers are missing
  
  // Extract state codes (first 2 digits after the first 2 digits which are country code)
  const companyStateCode = companyGST.substring(2, 4);
  const accountStateCode = accountGST.substring(2, 4);
  
  // If state codes are the same, it's intra-state (CGST+SGST)
  // If different, it's inter-state (IGST)
  return companyStateCode === accountStateCode ? "CGST+SGST" : "IGST";
};

// Function to recalculate GST for products based on state codes
const recalculateGSTForProducts = async (products, salesAccount, deliveryPartyAccount) => {
  const { AccountMaster, Product } = await import("../models/user.model.js");
  
  // Get account details
  const account = await AccountMaster.findById(salesAccount);
  const companyGST = account?.gstin || "";
  const accountGST = deliveryPartyAccount?.gst || companyGST;
  
  const updatedProducts = [];
  
  for (const product of products) {
    if (!product.product) {
      updatedProducts.push(product);
      continue;
    }
    
    const productDetails = await Product.findById(product.product);
    if (!productDetails) {
      updatedProducts.push(product);
      continue;
    }
    
    const gst = productDetails.gst || 0;
    const gstType = determineGSTType(companyGST, accountGST);
    const halfGST = gst / 2;
    
    updatedProducts.push({
      ...product,
      igst: gstType === "IGST" ? gst : null,
      cgst: gstType === "CGST+SGST" ? halfGST : null,
      sgst: gstType === "CGST+SGST" ? halfGST : null,
    });
  }
  
  return updatedProducts;
};

export const addSalesInvoice = async (req, res) => {
  try {
    const { OutstandingReceivable } = await import("../models/user.model.js");
    
    // Fetch outstanding balance for the account
    let lastBalance = 0;
    if (req.body.sales_account) {
      const lastReceivableEntry = await OutstandingReceivable.findOne(
        { account: req.body.sales_account, createdBy: req.user.userId },
        {},
        { sort: { date: -1 } }
      );
      lastBalance = lastReceivableEntry ? lastReceivableEntry.balance : 0;
    }
    
    const currentAmt = req.body.final_amount || 0;
    
    // Calculate net balance based on last balance type
    let netBalance;
    if (lastBalance >= 0) {
      // Last balance is Credit, so net balance = current amt - last balance
      netBalance = currentAmt - lastBalance;
    } else {
      // Last balance is Debit, so net balance = current amt + last balance (last balance is negative)
      netBalance = currentAmt + lastBalance;
    }
    
    // Recalculate GST based on state codes before saving
    const updatedProducts = await recalculateGSTForProducts(
      req.body.products || [],
      req.body.sales_account,
      req.body.delivery_party_account
    );
    
    const newInvoice = new SalesInvoice({
      ...req.body,
      products: updatedProducts,
      lastBalance: lastBalance,
      currentAmt: currentAmt,
      netBalance: netBalance,
      createdBy: req.user.userId,
    });

    await newInvoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res
      .status(500)
      .json({ error: "Failed to save invoice", details: error.message });
  }
};

export const getSalesInvoice = async (req, res) => {
  try {
    const invoices = await SalesInvoice.find({ createdBy: req.user.userId })
      .populate("sales_account")
      .populate("createdBy")
      .populate("products.product");

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await SalesInvoice.findOne({
      _id: id,
      createdBy: req.user.userId,
    })
      .populate("sales_account")
      .populate("createdBy")
      .populate("products.product");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice Not found." });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSalesInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { salesInvoiceDetails } = req.body;
    const { OutstandingReceivable } = await import("../models/user.model.js");

    // Fetch outstanding balance for the account if sales_account is being updated
    let lastBalance = 0;
    if (salesInvoiceDetails.sales_account) {
      const lastReceivableEntry = await OutstandingReceivable.findOne(
        { account: salesInvoiceDetails.sales_account, createdBy: req.user.userId },
        {},
        { sort: { date: -1 } }
      );
      lastBalance = lastReceivableEntry ? lastReceivableEntry.balance : 0;
    }

    const currentAmt = salesInvoiceDetails.final_amount || 0;
    
    // Calculate net balance based on last balance type
    let netBalance;
    if (lastBalance >= 0) {
      // Last balance is Credit, so net balance = current amt - last balance
      netBalance = currentAmt - lastBalance;
    } else {
      // Last balance is Debit, so net balance = current amt + last balance (last balance is negative)
      netBalance = currentAmt + lastBalance;
    }
    
    // Recalculate GST based on state codes before updating
    const updatedProducts = await recalculateGSTForProducts(
      salesInvoiceDetails.products || [],
      salesInvoiceDetails.sales_account,
      salesInvoiceDetails.delivery_party_account
    );
    
    // Update balance information
    const updatedSalesInvoiceDetails = {
      ...salesInvoiceDetails,
      products: updatedProducts,
      lastBalance: lastBalance,
      currentAmt: currentAmt,
      netBalance: netBalance,
    };

    const updatedInvoice = await SalesInvoice.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      updatedSalesInvoiceDetails,
      { new: true }
    );

    if (!updatedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Sales Invoice Not found." });
    }

    res.status(200).json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error("Error updating sales invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSalesInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvoice = await SalesInvoice.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId,
    });

    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Sales Invoice Not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Sales Invoice deleted successfully." });
  } catch (error) {
    console.error("Error deleting sales invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProformaInvoice = async (req, res) => {
  try {
    // Recalculate GST based on state codes before saving
    const updatedProducts = await recalculateGSTForProducts(
      req.body.products || [],
      req.body.sales_account,
      req.body.delivery_party_account
    );
    
    const newInvoice = new ProformaInvoice({
      ...req.body,
      products: updatedProducts,
      createdBy: req.user.userId,
    });
    await newInvoice.save();

    res.status(201).json({
      message: "Proforma Invoice created successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error saving proforma invoice:", error);
    res.status(500).json({ error: "Failed to save proforma invoice" });
  }
};

export const getProformaInvoice = async (req, res) => {
  try {
    const invoices = await ProformaInvoice.find({ createdBy: req.user.userId })
      .populate("sales_account")
      .populate("createdBy")
      .populate("products.product");

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching proforma invoices:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProformaInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await ProformaInvoice.findOne({
      _id: id,
      createdBy: req.user.userId,
    })
      .populate("sales_account")
      .populate("createdBy")
      .populate("products.product");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Proforma Invoice Not found." });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching proforma invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProformaInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { proformaInvoiceDetails } = req.body;

    // Recalculate GST based on state codes before updating
    const updatedProducts = await recalculateGSTForProducts(
      proformaInvoiceDetails.products || [],
      proformaInvoiceDetails.sales_account,
      proformaInvoiceDetails.delivery_party_account
    );
    
    const updatedInvoiceDetails = {
      ...proformaInvoiceDetails,
      products: updatedProducts,
    };

    const updatedInvoice = await ProformaInvoice.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      updatedInvoiceDetails,
      { new: true }
    );

    if (!updatedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Proforma Invoice Not found." });
    }

    res.status(200).json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error("Error updating proforma invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProformaInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvoice = await ProformaInvoice.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId,
    });

    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Proforma Invoice Not found." });
    }

    res.status(200).json({
      success: true,
      message: "Proforma Invoice deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting proforma invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProformaBill = async (req, res) => {
  try {
    const bill = await ProformaBill.findOne();
    if (!bill) {
      return res
        .status(404)
        .json({ success: false, message: "No bill number found" });
    }
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching bill number" });
  }
};

export const updateProformaBill = async (req, res) => {
  try {
    const { no } = req.body;
    await ProformaBill.findOneAndUpdate({}, { no: no }, { new: true });
    res.json({ message: "Bill number updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating bill number" });
  }
};

export const getSalesBill = async (req, res) => {
  try {
    const bill = await SalesBill.findOne();
    if (!bill) {
      return res
        .status(404)
        .json({ success: false, message: "No bill number found" });
    }
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching bill number" });
  }
};

export const updateSalesBill = async (req, res) => {
  try {
    const { no } = req.body;
    await SalesBill.findOneAndUpdate({}, { no: no }, { new: true });
    res.json({ message: "Bill number updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating bill number" });
  }
};

export const addProformaValidation = async (req, res) => {
  try {
    const newProformaValidation = new ProformaValidation({
      proformaInvoiceId: req.body.proformaInvoiceId,
      validate: req.body.validate,
      createdBy: req.user.userId,
    });

    await newProformaValidation.save();
    res.status(201).json({
      message: "Proforma Invoice validated",
      data: newProformaValidation,
    });
  } catch (error) {
    console.error("Error saving proforma validation:", error);
    res.status(500).json({ error: "Failed to validate proforma invoice" });
  }
};

export const getValidatedInvoices = async (req, res) => {
  try {
    const validatedInvoices = await ProformaValidation.find({ validate: true })
      .populate("proformaInvoiceId")
      .exec();

    // Filter out null references and add additional safety checks
    const validatedInvoiceIds = validatedInvoices
      .filter(validation => validation.proformaInvoiceId && validation.proformaInvoiceId._id)
      .map(validation => validation.proformaInvoiceId._id);

    // Log any orphaned validation records for debugging
    const orphanedValidations = validatedInvoices.filter(validation => !validation.proformaInvoiceId);
    if (orphanedValidations.length > 0) {
      console.warn(`Found ${orphanedValidations.length} orphaned validation records (proformaInvoiceId is null)`);
      console.warn('Orphaned validation IDs:', orphanedValidations.map(v => v._id));
    }

    console.log(`Found ${validatedInvoiceIds.length} valid proforma invoices out of ${validatedInvoices.length} total validations`);
    
    res.status(200).json({ validatedInvoiceIds });
  } catch (error) {
    console.error("Error fetching validated invoices:", error);
    res.status(500).json({ error: "Failed to fetch validated invoices" });
  }
};

// Function to clean up orphaned validation records
export const cleanupOrphanedValidations = async (req, res) => {
  try {
    // Find all validation records
    const allValidations = await ProformaValidation.find({});
    
    // Check which ones have valid proforma invoice references
    const validValidations = [];
    const orphanedValidations = [];
    
    for (const validation of allValidations) {
      try {
        const proformaInvoice = await ProformaInvoice.findById(validation.proformaInvoiceId);
        if (proformaInvoice) {
          validValidations.push(validation);
        } else {
          orphanedValidations.push(validation);
        }
      } catch (err) {
        orphanedValidations.push(validation);
      }
    }
    
    if (orphanedValidations.length > 0) {
      // Delete orphaned validation records
      const orphanedIds = orphanedValidations.map(v => v._id);
      await ProformaValidation.deleteMany({ _id: { $in: orphanedIds } });
      
      console.log(`Cleaned up ${orphanedValidations.length} orphaned validation records`);
      
      res.status(200).json({ 
        success: true, 
        message: `Cleaned up ${orphanedValidations.length} orphaned validation records`,
        cleanedCount: orphanedValidations.length
      });
    } else {
      res.status(200).json({ 
        success: true, 
        message: "No orphaned validation records found",
        cleanedCount: 0
      });
    }
  } catch (error) {
    console.error("Error cleaning up orphaned validations:", error);
    res.status(500).json({ error: "Failed to cleanup orphaned validations" });
  }
};

export const addPurchaseInvoice = async (req, res) => {
  try {
    const newInvoice = new PurchaseInvoice({
      ...req.body,
      createdBy: req.user.userId,
    });
    await newInvoice.save();

    res
      .status(201)
      .json({ message: "Invoice created successfully", invoice: newInvoice });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).json({ error: "Failed to save invoice" });
  }
};

export const getPurchaseInvoice = async (req, res) => {
  try {
    const invoices = await PurchaseInvoice.find({ createdBy: req.user.userId })
      .populate("purchase_account")
      .populate("createdBy")
      .populate("products.product");

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await PurchaseInvoice.findOne({
      _id: id,
      createdBy: req.user.userId,
    })
      .populate("purchase_account")
      .populate("createdBy")
      .populate("products.product");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice Not found." });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePurchaseInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { purchaseInvoiceDetails } = req.body;

    const updatedInvoice = await PurchaseInvoice.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      purchaseInvoiceDetails,
      { new: true }
    );

    if (!updatedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase Invoice Not found." });
    }

    res.status(200).json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error("Error updating Purchase invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePurchaseInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvoice = await PurchaseInvoice.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId,
    });

    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase Invoice Not found." });
    }

    res.status(200).json({
      success: true,
      message: "Purchase Invoice deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting Purchase invoice:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTransportationDetails = async (req, res) => {
  try {
    const newTransportation = new Transportation({
      ...req.body,
      createdBy: req.user.userId,
    });

    await newTransportation.save();
    res.status(201).json({ success: true, data: newTransportation });
  } catch (error) {
    console.error("Error saving transportation details:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransportationDetails = async (req, res) => {
  try {
    const transportationDetails = await Transportation.find({
      createdBy: req.user.userId,
    });
    res.status(200).json({ success: true, data: transportationDetails });
  } catch (error) {
    console.error("Error fetching transportation details:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransportationDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const transportationDetail = await Transportation.findOne({
      _id: id,
      createdBy: req.user.userId,
    });

    if (!transportationDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Transportation Details Not found." });
    }

    res.status(200).json({ success: true, transportationDetail });
  } catch (error) {
    console.error("Error fetching transportation detail:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTransportationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { transportationDetails } = req.body;

    if (!transportationDetails || !Array.isArray(transportationDetails)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transportation details." });
    }

    const updatedTransportation = await Transportation.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      transportationDetails,
      { new: true }
    );

    if (!updatedTransportation) {
      return res
        .status(404)
        .json({ success: false, message: "Transportation Details Not found." });
    }

    res
      .status(200)
      .json({ success: true, transportation: updatedTransportation });
  } catch (error) {
    console.error("Error updating transportation details:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTransportationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTransportation = await Transportation.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId,
    });

    if (!deletedTransportation) {
      return res
        .status(404)
        .json({ success: false, message: "Transportation Details Not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Transportation deleted successfully." });
  } catch (error) {
    console.error("Error deleting transportation details:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
