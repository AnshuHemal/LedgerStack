import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  getOutstandingPayable,
  getOutstandingReceivable,
  getOutstandingBalance,
} from "../controllers/outstanding.controller.js";

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

// Get all outstanding payable entries for a user
router.get("/payable", protect, getOutstandingPayable);

// Get all outstanding receivable entries for a user
router.get("/receivable", protect, getOutstandingReceivable);

// Get outstanding balance for a specific account
router.get("/balance/:accountId", protect, getOutstandingBalance);

export default router; 