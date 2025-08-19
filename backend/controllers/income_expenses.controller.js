import {
  ProformaBill,
  ProformaInvoice,
  ProformaValidation,
  PurchaseInvoice,
  SalesBill,
  SalesInvoice,
  Transportation,
} from "../models/user.model.js";

export const addSalesInvoice = async (req, res) => {
  try {
    const newInvoice = new SalesInvoice({
      ...req.body,
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

    const updatedInvoice = await SalesInvoice.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      salesInvoiceDetails,
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
    const newInvoice = new ProformaInvoice({
      ...req.body,
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

    const updatedInvoice = await ProformaInvoice.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      proformaInvoiceDetails,
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
