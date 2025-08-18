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
import companyRoutes from "./routes/company.route.js";
import bankRoutes from "./routes/bank.route.js";

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import puppeteer from "puppeteer";

// Get __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

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

// Serve static assets from public (including generated PDFs under /pdfs)
app.use(express.static(path.join(__dirname, "../public")));

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
app.use("/api/company", companyRoutes);
app.use("/api/bank-details", bankRoutes);

app.get("/api/pdf/generate/:entryId", async (req, res) => {
  try {
    const entryId = req.params.entryId;
    // Try to find invoice across collections by id and current user
    const token = req.cookies.access_token;
    let userId = null;
    try {
      const jwt = (await import("jsonwebtoken")).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch {}

    const { SalesInvoice, PurchaseInvoice, Transportation, AccountMaster } = await import(
      "./models/user.model.js"
    );
    const baseFilter = userId
      ? { _id: entryId, createdBy: userId }
      : { _id: entryId };
    let entry = await SalesInvoice.findOne(baseFilter)
      .populate("sales_account")
      .populate("transportation_account")
      .populate("products.product");
    if (!entry) {
      entry = await PurchaseInvoice.findOne(baseFilter)
        .populate("purchase_account")
        .populate("products.product");
    }
    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    }

    // Prefer invoiceTemp.html if present, fallback to invoiceTemplate.html
    let templatePath = path.join(
      __dirname,
      "../frontend/public/invoiceTemp.html"
    );
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(
        __dirname,
        "../frontend/public/invoiceTemplate.html"
      );
    }
    let html = fs.readFileSync(templatePath, "utf-8");

    // Simple placeholder replacements with regex-escape
    const escapeForRegex = (pattern) =>
      String(pattern).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const replace = (s, find, val) =>
      s.replace(new RegExp(escapeForRegex(find), "g"), val ?? "");
    html = replace(
      html,
      "{{companyName}}",
      entry.sales_account?.companyName ||
        entry.purchase_account?.companyName ||
        ""
    );

    // Helpers
    const formatDate = (d) => {
      if (!d) return "";
      try {
        return new Date(d).toLocaleDateString("en-GB");
      } catch {
        return String(d);
      }
    };
    const joinAddress = (p) => {
      if (!p) return "";
      const parts = [
        p.addressLine1,
        p.addressLine2,
        p.addressLine3,
        p.city,
        p.state,
        p.pinCode,
      ].filter(Boolean);
      return parts.join(", ");
    };
    const stateCodes = {
      Gujarat: "24",
      "Tamil Nadu": "33",
      Maharashtra: "27",
      Karnataka: "29",
      Telangana: "36",
      "Andhra Pradesh": "37",
      Kerala: "32",
      Delhi: "07",
      "Uttar Pradesh": "09",
      "Madhya Pradesh": "23",
      Rajasthan: "08",
      Punjab: "03",
      Haryana: "06",
      "West Bengal": "19",
      Bihar: "10",
      Odisha: "21",
      Assam: "18",
      Jharkhand: "20",
      Chhattisgarh: "22",
      Uttarakhand: "05",
      "Himachal Pradesh": "02",
      "Jammu and Kashmir": "01",
      Goa: "30",
      Sikkim: "11",
      "Arunachal Pradesh": "12",
      Manipur: "14",
      Meghalaya: "17",
      Mizoram: "15",
      Nagaland: "13",
      Tripura: "16",
    };
    const getStateCode = (name) => (name ? stateCodes[name] || "" : "");
    const numberToWords = (amount) => {
      if (amount === 0) return "Zero Rupees Only";
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];
      const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];
      const lessThanThousand = (num) => {
        if (num === 0) return "";
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100)
          return (
            tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
          );
        return (
          ones[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100 ? " " + lessThanThousand(num % 100) : "")
        );
      };
      const convert = (num) => {
        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000);
        const remainder = num % 1000;
        let res = "";
        if (crore) res += lessThanThousand(crore) + " Crore ";
        if (lakh) res += lessThanThousand(lakh) + " Lakh ";
        if (thousand) res += lessThanThousand(thousand) + " Thousand ";
        if (remainder) res += lessThanThousand(remainder);
        return res.trim();
      };
      const rupees = Math.floor(amount);
      const paise = Math.round((amount - rupees) * 100);
      let result = convert(rupees) + " Rupees";
      if (paise > 0) result += " " + convert(paise) + " Paise";
      return result + " Only";
    };

    // Dates and IDs
    const invoiceNo =
      entry.bill_no && typeof entry.bill_no === "object"
        ? `${entry.bill_no.bill_prefix || ""}${entry.bill_no.no || ""}`
        : String(entry.bill_no || "");
    const invoiceDate = formatDate(
      entry.bill_date || entry.voucher_date || Date.now()
    );
    html = replace(html, "{{invoiceNo}}", invoiceNo);
    html = replace(html, "{{date}}", invoiceDate);
    // Transportation name (handle both AccountMaster and Transportation refs)
    let transportName = "";
    let transportId = null;
    const transVal = entry.transportation_account;
    if (transVal && typeof transVal === "object") {
      if (typeof transVal.name === "string" && transVal.name) {
        transportName = transVal.name;
      } else if (typeof transVal.companyName === "string" && transVal.companyName) {
        transportName = transVal.companyName;
      } else if (transVal._id) {
        transportId = transVal._id;
      }
    } else if (transVal) {
      transportId = transVal;
    }
    if (!transportName && transportId) {
      try {
        const t = await Transportation.findById(transportId);
        if (t && t.name) transportName = t.name;
      } catch {}
    }
    if (!transportName && transportId) {
      try {
        const acc = await AccountMaster.findById(transportId);
        if (acc && acc.companyName) transportName = acc.companyName;
      } catch {}
    }
    html = replace(html, "{{transport}}", transportName);
    html = replace(html, "{{orderNo}}", entry.po_no || "");
    html = replace(html, "{{lrNo}}", entry.lr_no || "");
    html = replace(html, "{{lrDate}}", formatDate(entry.trans_date));

    // Receiver and Consignee (use delivery_party_account for both)
    const party = entry.delivery_party_account || {};
    const receiverState = party.state || "";
    const receiverStatecode = getStateCode(receiverState);
    html = replace(html, "{{receiverName}}", party.name || "");
    html = replace(html, "{{receiverAddress}}", joinAddress(party));
    html = replace(html, "{{receiverState}}", receiverState);
    html = replace(html, "{{receiverStatecode}}", receiverStatecode);
    html = replace(html, "{{receiverGst}}", party.gst || "");

    html = replace(html, "{{consigneeName}}", party.name || "");
    html = replace(html, "{{consigneeAddress}}", joinAddress(party));
    html = replace(html, "{{consigneeState}}", receiverState);
    html = replace(html, "{{consigneeStatecode}}", receiverStatecode);
    html = replace(html, "{{consigneeGst}}", party.gst || "");

    // Metadata state and code (top bar)
    html = replace(html, "{{state}}", receiverState);
    html = replace(html, "{{stCode}}", receiverStatecode);

    // Build product rows for invoiceTemp.html
    const products = Array.isArray(entry.products) ? entry.products : [];
    const productRows = products
      .map((prod, idx) => {
        const productName = prod.product?.name || "";
        const hsn = prod.product?.hsn_sac_code || prod.product?.hsn || "";
        const boxes = prod.boxes != null ? Number(prod.boxes) : 0;
        const noOfPcs = prod.no_of_pcs != null ? Number(prod.no_of_pcs) : 0;
        const quantity =
          prod.quantity != null ? Number(prod.quantity) : boxes * noOfPcs;
        const rate = prod.rate ?? 0;
        const discount = prod.discount ?? 0;
        const igst = prod.igst ?? 0;
        const cgst = prod.cgst ?? 0;
        const sgst = prod.sgst ?? 0;
        const base = Number(rate) * Number(quantity);
        const discountAmt = (base * Number(discount)) / 100;
        const gstPct = igst > 0 ? igst : Number(cgst) + Number(sgst);
        const amount =
          base - discountAmt + ((base - discountAmt) * Number(gstPct)) / 100;
        return `
        <tr style="text-align:center">
          <td class="num" style="width:12px">${idx + 1}.</td>
          <td class="text-left">
            <strong style="margin:0;padding:0">${productName}</strong>
          </td>
          <td class="num">${hsn}</td>
          <td class="num">${boxes}</td>
          <td class="num">${quantity}</td>
          <td class="num">${Number(rate).toFixed(2)}</td>
          <td class="num">${Number(discount) || 0}%</td>
          <td class="num">${Number(igst) || 0}%</td>
          <td class="num">${Number(cgst) || 0}%</td>
          <td class="num">${Number(sgst) || 0}%</td>
          <td class="num">${amount.toFixed(2)}</td>
        </tr>
      `;
      })
      .join("\n");
    html = html.replace("<!-- PRODUCTS_PLACEHOLDER -->", productRows);

    // Totals and amounts
    const totalBoxes = products.reduce(
      (acc, p) => acc + Number(p.boxes || 0),
      0
    );
    const totalQuantity = products.reduce((acc, p) => {
      if (p.quantity != null) return acc + Number(p.quantity || 0);
      return acc + Number(p.boxes || 0) * Number(p.no_of_pcs || 0);
    }, 0);
    const subTotal = Number(entry.total_products_amount || 0);
    const freight = Number(entry.freight_amount || 0);
    const gross = subTotal + freight;
    const invoiceTotal = Math.round(gross);
    const roundOff = invoiceTotal - gross;

    html = replace(html, "{{totalBoxes}}", String(totalBoxes));
    html = replace(html, "{{totalQuantity}}", String(totalQuantity));
    html = replace(html, "{{subTotal}}", gross.toFixed(2));
    html = replace(html, "{{roundOff}}", roundOff.toFixed(2));
    html = replace(html, "{{invoiceTotal}}", invoiceTotal.toFixed(2));
    html = replace(html, "{{amountInWords}}", numberToWords(invoiceTotal));

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: puppeteer.executablePath && puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    // Use print media to apply @media print CSS in the template
    await page.emulateMediaType("print");
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "6mm", right: "6mm", bottom: "6mm", left: "6mm" },
      preferCSSPageSize: true,
    });
    await browser.close();

    // Ensure a storage directory exists for PDFs
    const pdfDir = path.join(__dirname, "../public/pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Save PDF to disk
    const fileName = `entry_${entryId}_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Persist URL into the document
    const publicBase =
      process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
    const pdfUrl = `${publicBase}/pdfs/${fileName}`;

    if (entry.sales_account) {
      await SalesInvoice.findByIdAndUpdate(entry._id, { pdf_url: pdfUrl });
    } else if (entry.purchase_account) {
      await PurchaseInvoice.findByIdAndUpdate(entry._id, { pdf_url: pdfUrl });
    }

    // Expose the static directory for serving PDFs (set once at boot ideally)

    return res.json({ success: true, url: pdfUrl });
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
