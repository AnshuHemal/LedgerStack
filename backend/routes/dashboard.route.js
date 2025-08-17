import express from "express";
import {
  getDashboardSummary,
  getOrdersStats,
  getProductsDistribution,
  getTopProducts,
  getRecentOrders
} from "../controllers/dashboard.controller.js";
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

// Dashboard endpoints
router.get("/summary", protect, getDashboardSummary);
router.get("/orders-stats", protect, getOrdersStats);
router.get("/products-distribution", protect, getProductsDistribution);
router.get("/top-products", protect, getTopProducts);
router.get("/recent-orders", protect, getRecentOrders);

export default router; 