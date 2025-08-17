import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orders.controller.js";
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

// Orders CRUD
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

export default router; 