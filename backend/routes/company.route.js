import express from "express";
import { fetchGstinDetails } from "../controllers/company.controller.js";

const router = express.Router();

// Public endpoint – used before authentication during signup
router.get("/fetch-gstin/:gstin", fetchGstinDetails);

export default router;

