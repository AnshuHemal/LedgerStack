import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  addProformaInvoice,
  addProformaValidation,
  addPurchaseInvoice,
  addSalesInvoice,
  addTransportationDetails,
  cleanupOrphanedValidations,
  deleteProformaInvoice,
  deletePurchaseInvoice,
  deleteSalesInvoice,
  deleteTransportationDetails,
  getProformaBill,
  getProformaInvoice,
  getProformaInvoiceById,
  getPurchaseInvoice,
  getPurchaseInvoiceById,
  getSalesBill,
  getSalesInvoice,
  getSalesInvoiceById,
  getTransportationDetails,
  getTransportationDetailsById,
  getValidatedInvoices,
  updateProformaBill,
  updateProformaInvoice,
  updatePurchaseInvoice,
  updateSalesBill,
  updateSalesInvoice,
  updateTransportationDetails,
} from "../controllers/income_expenses.controller.js";

const router = express.Router();

dotenv.config();

const protect = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(403).json({ message: "Authentication required." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = decoded;
    next();
  });
};

router.post("/transportation", protect, addTransportationDetails);
router.get("/transportation", protect, getTransportationDetails);
router.get("/transportation/:id", protect, getTransportationDetailsById);
router.put("/transportation/:id", protect, updateTransportationDetails);
router.delete("/transportation/:id", protect, deleteTransportationDetails);

router.post("/sales-invoice", protect, addSalesInvoice);
router.get("/sales-invoice", protect, getSalesInvoice);
router.get("/sales-invoice/:id", protect, getSalesInvoiceById);
router.put("/sales-invoice/:id", protect, updateSalesInvoice);
router.delete("/sales-invoice/:id", protect, deleteSalesInvoice);

router.post("/purchase-invoice", protect, addPurchaseInvoice);
router.get("/purchase-invoice", protect, getPurchaseInvoice);
router.get("/purchase-invoice/:id", protect, getPurchaseInvoiceById);
router.put("/purchase-invoice/:id", protect, updatePurchaseInvoice);
router.delete("/purchase-invoice/:id", protect, deletePurchaseInvoice);

router.post("/proforma-invoice", protect, addProformaInvoice);
router.get("/proforma-invoice", protect, getProformaInvoice);
router.get("/proforma-invoice/:id", protect, getProformaInvoiceById);
router.put("/proforma-invoice/:id", protect, updateProformaInvoice);
router.delete("/proforma-invoice/:id", protect, deleteProformaInvoice);

router.get("/proforma-bill", getProformaBill);
router.put("/proforma-bill", updateProformaBill);

router.get("/sales-bill", getSalesBill);
router.put("/sales-bill", updateSalesBill);

router.post("/proforma-validation", protect, addProformaValidation);
router.get("/proforma-validation", protect, getValidatedInvoices);
router.post("/proforma-validation/cleanup", protect, cleanupOrphanedValidations);

export default router;
