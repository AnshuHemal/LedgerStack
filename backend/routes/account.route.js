import express from "express";
import {
  addAccountGroup,
  addAccountMaster,
  deleteAccountGroup,
  deleteAccountMaster,
  getAccountGroup,
  getAccountGroupById,
  getAccountMaster,
  getAccountMasterById,
  getBankAccounts,
  updateAccountGroup,
  updateAccountMaster,
} from "../controllers/accounts.controller.js";
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

// Account Group
router.post("/account-group", protect, addAccountGroup);
router.get("/account-group", protect, getAccountGroup);
router.get("/account-group/:id", protect, getAccountGroupById);
router.put("/account-group/:id", protect, updateAccountGroup);
router.delete("/account-group/:id", protect, deleteAccountGroup);

// Account Master
router.post("/account-master", protect, addAccountMaster);
router.get("/account-master", protect, getAccountMaster);
router.get("/account-master/:id", protect, getAccountMasterById);
router.put("/account-master/:id", protect, updateAccountMaster);
router.delete("/account-master/:id", protect, deleteAccountMaster);

router.get("/bank-accounts", protect, getBankAccounts);

export default router;
