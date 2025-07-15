import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
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

  const API_URL = "http://localhost:5000/api/auth";

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
      const response = await axios.post(
        `${API_URL}/signup`,
        {
          fullname,
          email,
          password,
        },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        toast.success("Account created successfully!");
        navigate("/");
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

              <button
                type="submit"
                className="btn w-100 mt-3"
                style={{
                  backgroundColor: "#014937",
                  color: "white",
                  fontWeight: "600",
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
    </div>
  );
};

export default Signup;
