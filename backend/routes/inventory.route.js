import express from "express";
import {
  // Category controllers
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  
  // Machine controllers
  createMachine,
  getAllMachines,
  updateMachine,
  deleteMachine,
  
  // Subpart controllers
  createSubpart,
  getAllSubparts,
  updateSubpartStock,
  deleteSubpart,
  
  // Inventory Product controllers
  createProduct,
  getAllProducts,
  updateProduct,
  updateProductStock,
  deleteProduct,
  
  // Inventory status
  getInventoryStatus,
  
  // Order controllers
  createOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from "../controllers/inventory.controller.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

// Authentication middleware
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

// ==================== CATEGORY ROUTES ====================
router.post("/categories", protect, createCategory);
router.get("/categories", protect, getAllCategories);
router.put("/categories/:id", protect, updateCategory);
router.delete("/categories/:id", protect, deleteCategory);

// ==================== MACHINE ROUTES ====================
router.post("/machines", protect, createMachine);
router.get("/machines", protect, getAllMachines);
router.put("/machines/:id", protect, updateMachine);
router.delete("/machines/:id", protect, deleteMachine);

// ==================== SUBPART ROUTES ====================
router.post("/subparts", protect, createSubpart);
router.get("/subparts", protect, getAllSubparts);
router.put("/subparts/:id/stock", protect, updateSubpartStock);
router.delete("/subparts/:id", protect, deleteSubpart);

// ==================== INVENTORY PRODUCT ROUTES ====================
router.post("/inventory-products", protect, createProduct);
router.get("/inventory-products", protect, getAllProducts);
router.put("/inventory-products/:id", protect, updateProduct);
router.put("/inventory-products/:id/stock", protect, updateProductStock);
router.delete("/inventory-products/:id", protect, deleteProduct);

// ==================== INVENTORY STATUS ROUTES ====================
router.get("/status", protect, getInventoryStatus);

// ==================== ORDER ROUTES ====================
router.post("/orders", protect, createOrder);
router.get("/orders", protect, getAllOrders);
router.put("/orders/:id/status", protect, updateOrderStatus);
router.delete("/orders/:id", protect, deleteOrder);

export default router;
