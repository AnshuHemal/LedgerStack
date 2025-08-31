import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import animation from "../assets/anim5.json";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import Header from "../components/Header";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [fullname, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpInput, setOtpInput] = useState(""); // OTP input state

  const [showVerifyButton, setShowVerifyButton] = useState(false); // Show "Verify Email" button
  const [otpSent, setOtpSent] = useState(false); // Track if OTP is sent

  const [agreeToTerms, setAgreeToTerms] = useState(false); // Track if the checkbox is checked

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_AUTH_URL || "https://ledgerstack-backend.vercel.app/api/auth";
  const COMPANY_URL = import.meta.env.VITE_COMPANY_URL || "https://ledgerstack-backend.vercel.app/api/company";
  const BANK_URL = import.meta.env.VITE_BANK_URL || "https://ledgerstack-backend.vercel.app/api/bank-details";

  // Company Details Modal State
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyMode, setCompanyMode] = useState("auto"); // 'auto' | 'manual'
  const [gstinInput, setGstinInput] = useState("");
  const [isFetchingGstin, setIsFetchingGstin] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    address1: "",
    address2: "",
    authorisedPerson: "",
    registeredAddress1: "",
    registeredAddress2: "",
    city: "",
    pincode: "",
    district: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    gstin: "",
    pan: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      branch: "",
      ifscCode: "",
    },
  });

  const isValidGSTIN = useMemo(() => /^[0-9A-Z]{15}$/i, []);
  const isValidPAN = useMemo(() => /^[0-9A-Z]{10}$/i, []);
  const isValidPincode = useMemo(() => /^\d{6}$/i, []);
  const isValidPhone = useMemo(() => /^\d{10}$/i, []);
  const isValidAccountNumber = useMemo(() => /^\d{9,18}$/i, []);
  const isValidIFSC = useMemo(() => /^[A-Z]{4}0[A-Z0-9]{6}$/i, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true); // Show the strength meter when focused
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false); // Hide the strength meter after transition
  };

  const validatePassword = () => {
    const criteria = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    const criteriaMessages = [
      "Password must be at least 8 characters long.",
      "Password must contain at least one uppercase letter.",
      "Password must contain at least one lowercase letter.",
      "Password must contain at least one number.",
      "Password must contain at least one special character.",
    ];

    const failedCriteria = criteria.reduce((acc, isValid, index) => {
      if (!isValid) acc.push(criteriaMessages[index]);
      return acc;
    }, []);

    if (failedCriteria.length > 0) {
      setPasswordError(failedCriteria.join(" "));
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/send-otp`,
        { email },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        setOtpSent(true);
        toast.success("OTP sent to your email!");
      } else {
        toast.error("Failed to send OTP. Try again.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/verify-otp`,
        { email, code: otpInput },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        toast.success("Email verified successfully!");
        setIsEmailVerified(true); // Mark the email as verified
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullname || !email || !password) {
      toast.error("Field cannot be Empty..");
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please verify your email before signing up.");
      return;
    }

    if (!validatePassword()) {
      toast.error(passwordError);
      return;
    }

    if (!agreeToTerms) {
      toast.error("You must agree to the terms of service and privacy policy.");
      return;
    }

    try {
      const hasAnyCompanyField = Object.entries(companyDetails).some(
        ([k, v]) =>
          k !== "bankDetails" && typeof v === "string" && v.trim() !== ""
      );
      const bd = companyDetails.bankDetails || {};
      const anyBankProvided =
        bd.bankName?.trim() ||
        bd.accountNumber?.trim() ||
        bd.branch?.trim() ||
        bd.ifscCode?.trim();

      const response = await axios.post(
        `${API_URL}/signup`,
        {
          fullname,
          email,
          password,
          companyDetails:
            hasAnyCompanyField || anyBankProvided ? companyDetails : undefined,
        },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        toast.success("Account created successfully! Default account groups have been set up.");
        navigate("/dashboard");
      } else {
        toast.error("Failed to create account.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleOpenCompanyModal = () => setShowCompanyModal(true);
  const handleCloseCompanyModal = () => setShowCompanyModal(false);

  const handleFetchGstin = async () => {
    if (!gstinInput || !isValidGSTIN.test(gstinInput)) {
      toast.error("Enter a valid 15-character GSTIN");
      return;
    }
    try {
      setIsFetchingGstin(true);
      const response = await axios.get(
        `https://sheet.gstincheck.co.in/check/36291eeb6c9ff0f2ce9588c9dcd71521/${gstinInput}`,
        { withCredentials: false }
      );
      
      if (response.data.flag !== true) {
        toast.error(response.data.message);
        return;
      }

      setCompanyDetails((prev) => ({
        ...prev,
        companyName: response.data.data.tradeNam || "",
        address1: response.data.data.pradr.addr.bnm || "",
        address2: response.data.data.pradr.addr.st || "",
        registeredAddress1: response.data.data.pradr.addr.bnm || "",
        registeredAddress2: response.data.data.pradr.addr.st || "",
        city: response.data.data.pradr.addr.dst || "",
        pincode: response.data.data.pradr.addr.pncd || "",
        district: response.data.data.pradr.addr.dst || "",
        state: response.data.data.pradr.addr.stcd || "",
        authorisedPerson: response.data.data.lgnm || "",
        phone: "",
        email: "",
        website: "",
        gstin: gstinInput,
        pan: gstinInput.slice(2, 12),
      }));
      
      toast.success("GSTIN details fetched successfully. Please review before saving.");
    } catch (err) {
      console.error("GST fetch error:", err);
      toast.error("Invalid GSTIN or unable to fetch data.");
    } finally {
      setIsFetchingGstin(false);
    }
  };

  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "ifscCode" ? value.toUpperCase() : value;
    setCompanyDetails((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: nextValue },
    }));
  };

  return (
    <div
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      <Header />
      <div
        className="container-fluid d-flex align-items-center justify-content-center section-container"
        style={{ backgroundColor: "#fff", padding: "10px" }}
      >
        <div
          className="row shadow-lg rounded bg-white p-3 w-100"
          style={{ maxWidth: "1200px" }}
        >
          {/* Left Side Section */}
          <div
            className="col-lg-6 col-12 p-4"
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <h3
              className="mb-1 display-6"
              style={{ fontSize: "24px", fontWeight: "500" }}
            >
              Let's,
            </h3>
            <h3
              className="mb-4 display-6"
              style={{ fontSize: "28px", fontWeight: "500" }}
            >
              Create Account!
            </h3>
            <form onSubmit={handleSignUp}>
              <div className="modern-input mb-4">
                <input
                  type="text"
                  className="input-field"
                  placeholder=" "
                  value={fullname}
                  required
                  onChange={(e) => setFullName(e.target.value)}
                />
                <label className="input-label">Full Name</label>
              </div>

              {/* Email Field with Verify Button */}
              <div
                className="modern-input mb-4 d-flex align-items-center"
                style={{ gap: "10px" }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isEmailVerified}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isValidEmail(e.target.value)) {
                      setShowVerifyButton(true);
                    } else {
                      setShowVerifyButton(false);
                    }
                  }}
                  className="input-field"
                  placeholder=" "
                  style={{
                    color: isEmailVerified ? "green" : "inherit",
                    flex: "1",
                  }}
                />
                <label className="input-label">Email Address</label>
                {showVerifyButton && !isEmailVerified && (
                  <button
                    type="button"
                    className="btn btn-sm w-25"
                    onClick={handleSendOtp}
                    style={{ backgroundColor: "#014937", color: "white" }}
                  >
                    Verify Email
                  </button>
                )}
              </div>

              {/* OTP Input Field (Appears only if the email is not verified) */}
              {!isEmailVerified && otpSent && (
                <div className="modern-input mb-4">
                  <input
                    type="text"
                    className="input-field"
                    placeholder=" "
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    maxLength="6"
                  />
                  <label className="input-label">Enter OTP</label>
                  <button
                    type="button"
                    className="btn btn-sm mt-2"
                    onClick={handleVerifyOtp}
                    style={{ backgroundColor: "#014937", color: "white" }}
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {/* Password Field */}
              <div className="modern-input mb-2 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus} // Trigger on focus
                  onBlur={handlePasswordBlur} // Trigger on blur
                  className="input-field"
                  placeholder=" "
                />
                <label className="input-label">Password</label>
                <span
                  onClick={handleShowPassword}
                  className="password-toggle position-absolute top-50 end-0 translate-middle-y me-2"
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </span>
              </div>

              <div
                className={`mb-3 password-strength-meter ${
                  isPasswordFocused ? "visible" : ""
                }`}
                style={{ marginTop: "10px" }}
              >
                {isPasswordFocused && (
                  <PasswordStrengthMeter password={password} />
                )}
              </div>

              {passwordError && (
                <div className="text-danger mt-2">
                  <small>{passwordError}</small>
                </div>
              )}

              {/* Terms & Conditions Checkbox */}
              <div className="my-3 d-flex justify-content-center align-items-baseline">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={agreeToTerms}
                  onChange={() => setAgreeToTerms(!agreeToTerms)}
                  required
                />
                <label htmlFor="termsCheckbox" className="ms-2">
                  Yes, I understand and agree to the{" "}
                  <a
                    href="https://example.com/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#014937" }}
                  >
                    LedgerStack Terms of Service
                  </a>
                  ,{" "}
                  <a
                    href="https://example.com/user-agreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#014937" }}
                  >
                    User Agreement
                  </a>
                  , and{" "}
                  <a
                    href="https://example.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#014937" }}
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* Add Company Details Button */}
              <button
                type="button"
                className="btn w-100 mt-3"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#014937",
                  fontWeight: "600",
                  border: "1px solid #014937",
                }}
                onClick={handleOpenCompanyModal}
              >
                Add Company Details
              </button>

              {/* Create Account Button (after company details) */}
              <button
                type="submit"
                className="btn w-100 mt-3"
                style={{
                  backgroundColor: "#014937",
                  color: "white",
                  fontWeight: "600",
                }}
                onClick={(e) => {
                  // Pre-check company details present before submit
                  const { bankDetails, ...rest } = companyDetails || {};
                  const hasCompanyFields = Object.values(rest).some(
                    (v) => typeof v === "string" && v.trim() !== ""
                  );
                  const bd = bankDetails || {};
                  const hasBankFields =
                    (bd.bankName && bd.bankName.trim() !== "") ||
                    (bd.accountNumber && bd.accountNumber.trim() !== "") ||
                    (bd.branch && bd.branch.trim() !== "") ||
                    (bd.ifscCode && bd.ifscCode.trim() !== "");
                  if (!hasCompanyFields && !hasBankFields) {
                    e.preventDefault();
                    toast.error("Please add Company Details before creating account.");
                    handleOpenCompanyModal();
                  }
                }}
              >
                Create Account
              </button>

              <div
                className="text-center mt-3 display-6"
                style={{ fontSize: "14px", fontWeight: "500" }}
              >
                Already have an account?{" "}
                <Link
                  to={"/login"}
                  className="text-decoration-none ms-1"
                  style={{
                    fontSize: "14px",
                    color: "#014937",
                  }}
                >
                  Log in now!
                </Link>
              </div>
            </form>
          </div>

          {/* Right Side Animation Section */}
          <div className="col-lg-6 col-12 d-flex flex-column justify-content-center overflow-x-hidden align-items-center text-center mb-4 mb-lg-0">
            <div className="w-100 px-3" style={{ maxWidth: "500px" }}>
              <Lottie animationData={animation} />
            </div>
          </div>
        </div>
      </div>

      {/* Company Details Modal */}
      {showCompanyModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Company Details</h5>
              </div>
              <div
                className="modal-body"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        companyMode === "auto" ? "active" : ""
                      }`}
                      onClick={() => setCompanyMode("auto")}
                    >
                      Auto Fetch using GSTIN
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        companyMode === "manual" ? "active" : ""
                      }`}
                      onClick={() => setCompanyMode("manual")}
                    >
                      Manual Entry
                    </button>
                  </li>
                </ul>

                {companyMode === "auto" ? (
                  <div>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-6">
                        <label className="form-label">GSTIN</label>
                        <input
                          type="text"
                          className="form-control"
                          value={gstinInput}
                          onChange={(e) =>
                            setGstinInput(e.target.value.toUpperCase())
                          }
                          maxLength={15}
                          placeholder="Enter 15-character GSTIN"
                        />
                      </div>
                      <div className="col-md-3">
                        <button
                          type="button"
                          className="login-button w-100"
                          onClick={handleFetchGstin}
                          disabled={isFetchingGstin}
                        >
                          {isFetchingGstin ? "Fetching..." : "Fetch"}
                        </button>
                      </div>
                    </div>

                    {/* Editable autofill form */}
                    <div className="row g-3 mt-3">
                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        <input
                          name="companyName"
                          className="form-control"
                          value={companyDetails.companyName}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Authorised Person</label>
                        <input
                          name="authorisedPerson"
                          className="form-control"
                          value={companyDetails.authorisedPerson}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Address 1 (Print Head 1)
                        </label>
                        <input
                          name="address1"
                          className="form-control"
                          value={companyDetails.address1}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Address 2 (Print Head 2)
                        </label>
                        <input
                          name="address2"
                          className="form-control"
                          value={companyDetails.address2}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">City</label>
                        <input
                          name="city"
                          className="form-control"
                          value={companyDetails.city}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Pincode</label>
                        <input
                          name="pincode"
                          className="form-control"
                          value={companyDetails.pincode}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">District</label>
                        <input
                          name="district"
                          className="form-control"
                          value={companyDetails.district}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">State</label>
                        <input
                          name="state"
                          className="form-control"
                          value={companyDetails.state}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Registered Address 1
                        </label>
                        <input
                          name="registeredAddress1"
                          className="form-control"
                          value={companyDetails.registeredAddress1}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Registered Address 2
                        </label>
                        <input
                          name="registeredAddress2"
                          className="form-control"
                          value={companyDetails.registeredAddress2}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Phone</label>
                        <input
                          name="phone"
                          className="form-control"
                          value={companyDetails.phone}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Email</label>
                        <input
                          name="email"
                          className="form-control"
                          value={companyDetails.email}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Website</label>
                        <input
                          name="website"
                          className="form-control"
                          value={companyDetails.website}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">GSTIN</label>
                        <input
                          name="gstin"
                          className="form-control"
                          value={companyDetails.gstin}
                          onChange={handleCompanyInputChange}
                          maxLength={15}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">PAN</label>
                        <input
                          name="pan"
                          className="form-control"
                          value={companyDetails.pan}
                          onChange={handleCompanyInputChange}
                          maxLength={10}
                        />
                      </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="mt-4">
                      <h6 className="mb-3">Bank Details</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">IFSC Code</label>
                          <div className="d-flex">
                            <div className="input-group">
                              <input
                                name="ifscCode"
                                className="form-control"
                                value={companyDetails.bankDetails.ifscCode}
                                onChange={handleBankInputChange}
                                placeholder="Enter 11-character IFSC"
                                maxLength={11}
                              />
                              <button
                                type="button"
                                className="login-button"
                                onClick={async () => {
                                  const code = (
                                    companyDetails.bankDetails.ifscCode || ""
                                  )
                                    .toUpperCase()
                                    .trim();
                                  if (!code || !isValidIFSC.test(code)) {
                                    toast.error(
                                      "Enter a valid IFSC (11 alphanumeric characters)."
                                    );
                                    return;
                                  }
                                  try {
                                    const resp = await axios.get(
                                      `${BANK_URL}/by-ifsc/${code}`
                                    );
                                    if (resp?.data?.success) {
                                      const { bankName, branch, city } =
                                        resp.data.data || {};
                                      setCompanyDetails((prev) => {
                                        const combinedBranch = branch
                                          ? city && !branch.includes(city)
                                            ? `${branch}, ${city}`
                                            : branch
                                          : prev.bankDetails.branch;
                                        return {
                                          ...prev,
                                          bankDetails: {
                                            ...prev.bankDetails,
                                            bankName:
                                              bankName ||
                                              prev.bankDetails.bankName,
                                            branch: combinedBranch,
                                          },
                                        };
                                      });
                                      toast.success("Bank details fetched.");
                                    } else {
                                      toast.error(
                                        resp?.data?.message ||
                                          "Failed to fetch bank info."
                                      );
                                    }
                                  } catch (err) {
                                    toast.error(
                                      err?.response?.data?.message ||
                                        "Failed to fetch bank info."
                                    );
                                  }
                                }}
                              >
                                Fetch Bank Info
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Bank Name</label>
                          <input
                            name="bankName"
                            className="form-control"
                            value={companyDetails.bankDetails.bankName}
                            onChange={handleBankInputChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Account Number</label>
                          <input
                            name="accountNumber"
                            className="form-control"
                            value={companyDetails.bankDetails.accountNumber}
                            onChange={handleBankInputChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Branch</label>
                          <input
                            name="branch"
                            className="form-control"
                            value={companyDetails.bankDetails.branch}
                            onChange={handleBankInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        <input
                          name="companyName"
                          className="form-control"
                          value={companyDetails.companyName}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Authorised Person</label>
                        <input
                          name="authorisedPerson"
                          className="form-control"
                          value={companyDetails.authorisedPerson}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Address 1 (Print Head 1)
                        </label>
                        <input
                          name="address1"
                          className="form-control"
                          value={companyDetails.address1}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Address 2 (Print Head 2)
                        </label>
                        <input
                          name="address2"
                          className="form-control"
                          value={companyDetails.address2}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Registered Address 1
                        </label>
                        <input
                          name="registeredAddress1"
                          className="form-control"
                          value={companyDetails.registeredAddress1}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Registered Address 2
                        </label>
                        <input
                          name="registeredAddress2"
                          className="form-control"
                          value={companyDetails.registeredAddress2}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">City</label>
                        <input
                          name="city"
                          className="form-control"
                          value={companyDetails.city}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Pincode</label>
                        <input
                          name="pincode"
                          className="form-control"
                          value={companyDetails.pincode}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">District</label>
                        <input
                          name="district"
                          className="form-control"
                          value={companyDetails.district}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">State</label>
                        <input
                          name="state"
                          className="form-control"
                          value={companyDetails.state}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Phone</label>
                        <input
                          name="phone"
                          className="form-control"
                          value={companyDetails.phone}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Email</label>
                        <input
                          name="email"
                          className="form-control"
                          value={companyDetails.email}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Website</label>
                        <input
                          name="website"
                          className="form-control"
                          value={companyDetails.website}
                          onChange={handleCompanyInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">GSTIN</label>
                        <input
                          name="gstin"
                          className="form-control"
                          value={companyDetails.gstin}
                          onChange={handleCompanyInputChange}
                          maxLength={15}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">PAN</label>
                        <input
                          name="pan"
                          className="form-control"
                          value={companyDetails.pan}
                          onChange={handleCompanyInputChange}
                          maxLength={10}
                        />
                      </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="mt-4">
                      <h6 className="mb-3">Bank Details</h6>
                      {/* IFSC fetch row (styled like GSTIN) */}
                      <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                          <label className="form-label">IFSC Code</label>
                          <input
                            name="ifscCode"
                            className="form-control"
                            value={companyDetails.bankDetails.ifscCode}
                            onChange={handleBankInputChange}
                            placeholder="Enter 11-character IFSC"
                            maxLength={11}
                          />
                        </div>
                        <div className="col-md-3">
                          <button
                            type="button"
                            className="login-button w-100"
                            onClick={async () => {
                              const code = (
                                companyDetails.bankDetails.ifscCode || ""
                              )
                                .toUpperCase()
                                .trim();
                              if (!code || !isValidIFSC.test(code)) {
                                toast.error(
                                  "Enter a valid IFSC (11 alphanumeric characters)."
                                );
                                return;
                              }
                              try {
                                const resp = await axios.get(
                                  `${BANK_URL}/by-ifsc/${code}`
                                );
                                if (resp?.data?.success) {
                                  const { bankName, branch, city } =
                                    resp.data.data || {};
                                  setCompanyDetails((prev) => {
                                    const combinedBranch = branch
                                      ? city && !branch.includes(city)
                                        ? `${branch}, ${city}`
                                        : branch
                                      : prev.bankDetails.branch;
                                    return {
                                      ...prev,
                                      bankDetails: {
                                        ...prev.bankDetails,
                                        bankName:
                                          bankName || prev.bankDetails.bankName,
                                        branch: combinedBranch,
                                      },
                                    };
                                  });
                                  toast.success("Bank details fetched.");
                                } else {
                                  toast.error(
                                    resp?.data?.message ||
                                      "Failed to fetch bank info."
                                  );
                                }
                              } catch (err) {
                                toast.error(
                                  err?.response?.data?.message ||
                                    "Failed to fetch bank info."
                                );
                              }
                            }}
                          >
                            Fetch Bank Info
                          </button>
                        </div>
                      </div>
                      {/* Bank fields row */}
                      <div className="row g-3 mt-2">
                        <div className="col-md-4">
                          <label className="form-label">Bank Name</label>
                          <input
                            name="bankName"
                            className="form-control"
                            value={companyDetails.bankDetails.bankName}
                            onChange={handleBankInputChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Account Number</label>
                          <input
                            name="accountNumber"
                            className="form-control"
                            value={companyDetails.bankDetails.accountNumber}
                            onChange={handleBankInputChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Branch</label>
                          <input
                            name="branch"
                            className="form-control"
                            value={companyDetails.bankDetails.branch}
                            onChange={handleBankInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="post-button"
                  onClick={handleCloseCompanyModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={() => {
                    // Validate key fields
                    if (
                      companyDetails.gstin &&
                      !isValidGSTIN.test(companyDetails.gstin)
                    ) {
                      toast.error("GSTIN must be 15 alphanumeric characters.");
                      return;
                    }
                    if (
                      companyDetails.pan &&
                      !isValidPAN.test(companyDetails.pan)
                    ) {
                      toast.error("PAN must be 10 alphanumeric characters.");
                      return;
                    }
                    if (
                      companyDetails.email &&
                      !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(
                        companyDetails.email
                      )
                    ) {
                      toast.error("Enter a valid email.");
                      return;
                    }
                    if (
                      companyDetails.pincode &&
                      !isValidPincode.test(companyDetails.pincode)
                    ) {
                      toast.error("Pincode must be 6 digits.");
                      return;
                    }
                    if (
                      companyDetails.phone &&
                      !isValidPhone.test(companyDetails.phone)
                    ) {
                      toast.error("Phone must be 10 digits.");
                      return;
                    }
                    // Optional Bank Details Validation
                    const bd = companyDetails.bankDetails || {};
                    const anyBankProvided =
                      (bd.bankName && bd.bankName.trim() !== "") ||
                      (bd.accountNumber && bd.accountNumber.trim() !== "") ||
                      (bd.branch && bd.branch.trim() !== "") ||
                      (bd.ifscCode && bd.ifscCode.trim() !== "");

                    if (anyBankProvided) {
                      if (!bd.bankName) {
                        toast.error("Bank Name is required.");
                        return;
                      }
                      if (
                        !bd.accountNumber ||
                        !isValidAccountNumber.test(bd.accountNumber)
                      ) {
                        toast.error("Account Number must be 9-18 digits.");
                        return;
                      }
                      if (!bd.branch) {
                        toast.error("Branch is required.");
                        return;
                      }
                      if (
                        !bd.ifscCode ||
                        !isValidIFSC.test(bd.ifscCode.toUpperCase())
                      ) {
                        toast.error("Invalid IFSC Code (e.g., SBIN0001234).");
                        return;
                      }
                    }
                    toast.success(
                      "Company details saved. It will be submitted with signup."
                    );
                    handleCloseCompanyModal();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
