import express from "express";
import {
  createSubpart,
  getSubparts,
  getSubpartById,
  updateSubpart,
  deleteSubpart,
  getSubpartsByProduct,
} from "../controllers/subpart.controller.js";
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

// Subpart CRUD
router.post("/", protect, createSubpart);
router.get("/", protect, getSubparts);
router.get("/product/:productId", protect, getSubpartsByProduct);
router.get("/:id", protect, getSubpartById);
router.put("/:id", protect, updateSubpart);
router.delete("/:id", protect, deleteSubpart);

export default router; 