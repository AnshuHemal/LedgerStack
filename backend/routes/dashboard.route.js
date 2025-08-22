import express from "express";
import {
  getDashboardSummary,
  getOrdersStats,
  getProductsDistribution,
  getTopProducts,
  getRecentOrders,
  getProductsSalesPerMonth,
  getOrderTrends,
  getProductPerformance,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getGeneratedReports,
  getReportTemplates,
  getReportHistory
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
router.get("/products-sales-per-month", protect, getProductsSalesPerMonth);

// Analytics endpoints
router.get("/order-trends", protect, getOrderTrends);
router.get("/product-performance", protect, getProductPerformance);
router.get("/customer-analytics", protect, getCustomerAnalytics);
router.get("/inventory-analytics", protect, getInventoryAnalytics);

// Reports endpoints
router.get("/generated-reports", protect, getGeneratedReports);
router.get("/report-templates", protect, getReportTemplates);
router.get("/report-history", protect, getReportHistory);

export default router; 