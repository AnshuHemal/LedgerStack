import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import accountRoutes from "./routes/account.route.js";
import productRoutes from "./routes/product.route.js";
import incomeExpensesRoutes from "./routes/income_expenses.route.js";
import quickEntryRoutes from "./routes/quickentry.route.js";
import ordersRoutes from "./routes/orders.route.js";
import skuRoutes from "./routes/sku.route.js";
import subpartRoutes from "./routes/subpart.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import productionUnitRoutes from "./routes/productionUnit.route.js";

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/product", productRoutes);
app.use("/api/income-expenses", incomeExpensesRoutes);
app.use("/api/quick-entry", quickEntryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/warehouse", skuRoutes);
app.use("/api/subparts", subpartRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/production-unit", productionUnitRoutes);

app.post("/generate-pdf", (req, res) => {
  const { header, content, footer } = req.body;

  const doc = new PDFDocument();

  // Use __dirname to resolve file path
  const filePath = path.join(__dirname, "invoice.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  // Add content to the PDF
  doc.fontSize(20).text(header, { align: "center" });
  doc.fontSize(12).text(content, { align: "left" });
  doc.fontSize(10).text(footer, { align: "center" });

  doc.end();

  // Send the file to the client
  doc.on("finish", () => {
    res.download(filePath, "invoice.pdf", (err) => {
      if (err) {
        console.error("Error downloading the file", err);
        res.status(500).send("Error downloading the PDF.");
      }

      // Delete the PDF file after sending
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting the file", err);
      });
    });
  });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
