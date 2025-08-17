import express from "express";
import {
  createSku,
  getSkus,
  getSkuById,
  updateSku,
  deleteSku,
} from "../controllers/sku.controller.js";
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

// SKU CRUD
router.post("/", protect, createSku);
router.get("/", protect, getSkus);
router.get("/:id", protect, getSkuById);
router.put("/:id", protect, updateSku);
router.delete("/:id", protect, deleteSku);

export default router; 