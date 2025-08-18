import axios from "axios";

// Validate GSTIN format: exactly 15 alphanumeric
const isValidGstin = (gstin) => /^[0-9A-Z]{15}$/i.test(gstin);

export const fetchGstinDetails = async (req, res) => {
  try {
    const { gstin } = req.params;

    if (!gstin || !isValidGstin(gstin)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GSTIN. It must be 15 alphanumeric characters.",
      });
    }

    // NOTE: Replace with your actual API key via env var
    const API_KEY = process.env.GSTINCHECK_API_KEY || "d88b4e7bd31574a632015c02bc221198";
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GSTIN API key is not configured.",
      });
    }

    // Prefer simple sheet endpoint; fallback to common API or env override
    const urls = [];
    if (process.env.GSTINCHECK_BASE_URL) {
      // Use env-provided base as-is, append gstin as query if it looks like a base URL
      const base = process.env.GSTINCHECK_BASE_URL.trim();
      if (base.includes("{API_KEY}") || base.includes("{GSTIN}")) {
        urls.push(base.replace("{API_KEY}", API_KEY).replace("{GSTIN}", gstin));
      } else if (base.includes("sheet.gstincheck.co.in/check")) {
        urls.push(`${base.replace(/\/$/, "")}/${API_KEY}/${gstin}`);
      } else {
        const joiner2 = base.includes("?") ? "&" : "?";
        urls.push(`${base}${joiner2}gstin=${gstin}`);
      }
    } else {
      urls.push(`https://sheet.gstincheck.co.in/check/${API_KEY}/${gstin}`);
      urls.push(`https://api.gstincheck.co.in/commonapi/gettaxpayer?gstin=${gstin}`);
    }

    let response;
    let lastError;
    for (const url of urls) {
      try {
        if (url.includes("sheet.gstincheck.co.in/check")) {
          response = await axios.get(url, {
            headers: { Accept: "application/json" },
            timeout: 15000,
            validateStatus: () => true,
          });
        } else {
          // Try multiple header variants for other providers
          const headerVariants = [
            { Authorization: API_KEY, Accept: "application/json" },
            { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
            { "x-api-key": API_KEY, Accept: "application/json" },
          ];
          for (const headers of headerVariants) {
            response = await axios.get(url, {
              headers,
              timeout: 15000,
              validateStatus: () => true,
            });
            if (response.status === 200) break;
            lastError = response;
          }
        }
        if (response && response.status === 200) break;
      } catch (err) {
        lastError = err?.response || err;
      }
    }

    if (!response || response.status !== 200) {
      const status = response?.status || lastError?.status || 502;
      const payload = response?.data || lastError?.data || { error: String(lastError) };
      return res.status(status).json({
        success: false,
        message:
          payload?.message ||
          payload?.error ||
          `Upstream GSTIN API error (status ${status}). Check API key and endpoint (GSTINCHECK_BASE_URL).`,
        upstream: payload,
      });
    }

    const raw = response?.data || {};

    // Some providers wrap details under .data or return arrays
    const data = Array.isArray(raw) ? raw[0] : (raw?.data || raw);

    const pick = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== "") || "";

    // Attempt to split a single-line address into two parts if needed
    const fullAddr = pick(
      data?.adr,
      data?.address,
      data?.principal_place_address,
      data?.pradr?.addr?.bnm && `${data?.pradr?.addr?.bnm} ${data?.pradr?.addr?.st}`
    );
    let address1 = pick(data?.pradr?.addr?.st, data?.address1, fullAddr);
    let address2 = pick(data?.pradr?.addr?.loc, data?.address2);
    if (!address2 && fullAddr && address1 === fullAddr) {
      const parts = String(fullAddr).split(",");
      if (parts.length > 1) {
        address1 = parts.slice(0, Math.ceil(parts.length / 2)).join(",").trim();
        address2 = parts.slice(Math.ceil(parts.length / 2)).join(",").trim();
      }
    }

    const mapped = {
      companyName: pick(data?.tradeNam, data?.tradeName, data?.lgnm, data?.legalName, data?.legal_name),
      address1,
      address2,
      city: pick(data?.pradr?.addr?.city, data?.city, data?.pradr?.addr?.dst, data?.district),
      pincode: pick(data?.pradr?.addr?.pncd && String(data?.pradr?.addr?.pncd), data?.pincode && String(data?.pincode)),
      district: pick(data?.pradr?.addr?.dst, data?.district),
      state: pick(data?.pradr?.addr?.stcd, data?.state, data?.stateCode),
      registeredAddress1: address1,
      registeredAddress2: address2,
      authorisedPerson: pick(data?.ctb, data?.authorized_signatory, data?.authorisedPerson),
      phone: pick(data?.phone, data?.mobile),
      email: pick(data?.email, data?.mail),
      website: pick(data?.website, data?.web),
      gstin: gstin,
      pan: pick(data?.pan, data?.panNo, data?.PAN),
    };

    return res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch GSTIN details",
      upstream: error?.response?.data,
    });
  }
};

