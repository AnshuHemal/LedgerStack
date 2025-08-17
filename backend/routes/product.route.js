import express from "express";
import {
  addProduct,
  addProductCategory,
  addProductGroup,
  addProductType,
  deleteProduct,
  deleteProductCategory,
  deleteProductGroup,
  deleteProductType,
  getProduct,
  getProductById,
  getProductsByGroup,
  getProductCategory,
  getProductCategoryById,
  getProductGroup,
  getProductGroupById,
  getProductType,
  getProductTypeById,
  updateProduct,
  updateProductCategory,
  updateProductGroup,
  updateProductType,
  getProductsAvailability,
} from "../controllers/products.controller.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

// Product Group
router.post("/product-group", protect, addProductGroup);
router.get("/product-group", protect, getProductGroup);
router.get("/product-group/:id", protect, getProductGroupById);
router.put("/product-group/:id", protect, updateProductGroup);
router.delete("/product-group/:id", protect, deleteProductGroup);

// Product Type
router.post("/product-type", protect, addProductType);
router.get("/product-type", protect, getProductType);
router.get("/product-type/:id", protect, getProductTypeById);
router.put("/product-type/:id", protect, updateProductType);
router.delete("/product-type/:id", protect, deleteProductType);

// Product Category
router.post("/product-category", protect, addProductCategory);
router.get("/product-category", protect, getProductCategory);
router.get("/product-category/:id", protect, getProductCategoryById);
router.put("/product-category/:id", protect, updateProductCategory);
router.delete("/product-category/:id", deleteProductCategory);

// Product
router.post("/", protect, addProduct);
router.get("/", protect, getProduct);
router.get("/availability", protect, getProductsAvailability);
router.get("/group/:groupId", protect, getProductsByGroup);
router.get("/:id", protect, getProductById);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
