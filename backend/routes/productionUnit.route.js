import express from "express";
import {
  getProductionUnits,
  getProductionUnit,
  createProductionUnit,
  updateProductionUnit,
  deleteProductionUnit,
  getUnits,
  createUnit,
  getProductsByGroup,
  getSubpartsByProduct,
} from "../controllers/productionUnit.controller.js";
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

// Production Unit CRUD routes
router.get("/", protect, getProductionUnits);
router.get("/:id", protect, getProductionUnit);
router.post("/", protect, createProductionUnit);
router.put("/:id", protect, updateProductionUnit);
router.delete("/:id", protect, deleteProductionUnit);

// Unit management routes
router.get("/units/list", protect, getUnits);
router.post("/units", protect, createUnit);

// Related data routes
router.get("/products/group/:groupId", protect, getProductsByGroup);
router.get("/subparts/product/:productId", protect, getSubpartsByProduct);

export default router;