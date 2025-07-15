import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  addQuickEntries,
  getQuickEntries,
} from "../controllers/quickentry.controller.js";

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

router.post("/add", protect, addQuickEntries);
router.get("/", protect, getQuickEntries);

export default router;
