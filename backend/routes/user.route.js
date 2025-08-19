import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(403).json({ message: "Authentication required." });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = decoded;
    next();
  });
};

// GET profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    delete user.password;
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT profile (basic info + preferences)
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const allowed = [
      "name",
      "email",
      "profileImage",
      "skills",
      "languages",
      "walletBalance",
      "education",
      "companyDetails",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: req.user.userId } });
      if (exists) return res.status(400).json({ success: false, message: "Email already in use" });
    }
    const updated = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    const user = { ...updated.toObject(), password: undefined };
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT change password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing passwords" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "Incorrect old password" });
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

// Preferences APIs
router.get("/preferences", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    delete user.password;
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/preferences", verifyToken, async (req, res) => {
  try {
    const { name, email, companyDetails, qrCodeImage, termsAndConditions } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      const exists = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (exists) return res.status(400).json({ success: false, message: "Email already in use" });
      updates.email = email;
    }
    if (companyDetails !== undefined) {
      updates.companyDetails = companyDetails;
    }
    if (qrCodeImage !== undefined) updates.qrCodeImage = qrCodeImage; // base64 string
    if (termsAndConditions !== undefined) updates.termsAndConditions = termsAndConditions;

    const updated = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    const user = { ...updated.toObject(), password: undefined };
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

