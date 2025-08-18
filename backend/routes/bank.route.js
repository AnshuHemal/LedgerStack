import express from "express";
import { getBankDetailsByIfsc } from "../controllers/bank.controller.js";

const router = express.Router();

// Public endpoint (no auth needed) to support signup flow
router.get("/by-ifsc/:ifsc", getBankDetailsByIfsc);

export default router;

