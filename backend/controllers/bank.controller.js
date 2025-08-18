import axios from "axios";

const isValidIfsc = (ifsc) => /^[A-Z0-9]{11}$/i.test(ifsc);

export const getBankDetailsByIfsc = async (req, res) => {
  try {
    const ifscRaw = String(req.params.ifsc || "").trim();
    const ifsc = ifscRaw.toUpperCase();

    if (!ifsc || !isValidIfsc(ifsc)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC. It must be 11 alphanumeric characters.",
      });
    }

    // Default to Razorpay public IFSC API (no key required)
    const urls = [];
    if (process.env.IFSC_API_BASE_URL) {
      const base = process.env.IFSC_API_BASE_URL.trim();
      if (base.includes("{IFSC}")) {
        urls.push(base.replace("{IFSC}", ifsc));
      } else if (base.endsWith("/")) {
        urls.push(`${base}${ifsc}`);
      } else {
        urls.push(`${base}/${ifsc}`);
      }
    } else {
      urls.push(`https://ifsc.razorpay.com/${ifsc}`);
    }

    let response;
    let lastError;
    for (const url of urls) {
      try {
        response = await axios.get(url, {
          headers: { Accept: "application/json" },
          timeout: 15000,
          validateStatus: () => true,
        });
        if (response.status === 200) break;
        lastError = response;
      } catch (err) {
        lastError = err?.response || err;
      }
    }

    if (!response || response.status !== 200) {
      const status = response?.status || lastError?.status || 502;
      const payload = response?.data || lastError?.data || { error: String(lastError) };
      return res.status(status).json({
        success: false,
        message: payload?.message || payload?.error || `Upstream IFSC API error (status ${status}).`,
        upstream: payload,
      });
    }

    const data = response?.data || {};
    const mapped = {
      bankName: data?.BANK || data?.bank || data?.bank_name || "",
      branch: data?.BRANCH || data?.branch || data?.bank_branch || "",
      city: data?.CITY || data?.city || "",
      state: data?.STATE || data?.state || "",
      address: data?.ADDRESS || data?.address || "",
    };

    return res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.message || error?.message || "Failed to fetch IFSC details",
      upstream: error?.response?.data,
    });
  }
};

