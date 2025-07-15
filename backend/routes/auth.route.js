import express from "express";
import { Otp, User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/sendEmail.js";

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "Account already exists.." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name: fullname,
      isverified: false,
    });

    generateTokenAndSetCookie(res, user._id);
    await user.save();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, code: otpCode });
    await sendOTPEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: "Account successfully created.. OTP sent to your email.",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email, code });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    await Otp.deleteOne({ email });

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Successfully Logged In",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Logout Route
router.post("/logout", async (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json({
    success: true,
    message: "Successfully Logged out..",
  });
});

// Verify Route
const verifyToken = (req, res, next) => {
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

router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token is valid, user is authenticated",
  });
});

// Get Current User
router.get("/current-user", verifyToken, async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(403).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json({
          success: true,
          message: "User fetched..",
          user: {
            ...user._doc,
            password: undefined,
          },
        });
      })
      .catch((err) => res.status(500).json({ message: err.message }));
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
});

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "Account already exists.." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, code: otpCode });
    await sendOTPEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: "OTP sent to your email..",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
