import Header from "../components/Header";
import React, { useState } from "react";
import animation from "../assets/a2.json";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Google from "../assets/google.webp";
import Lottie from "lottie-react";
import Microsoft from "../assets/microsoft.webp";
import Apple from "../assets/apple.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const API_URL = "https://ledgerstack-backend.vercel.app/api/auth";

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Field cannot be Empty..");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate("/");
        toast.success("Successfully Logged In..");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
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
          {/* Left Side */}
          <div className="col-lg-6 col-12 d-flex flex-column justify-content-center overflow-x-hidden align-items-center text-center mb-4 mb-lg-0">
            <Lottie animationData={animation} />
          </div>

          {/* Right Side */}
          <div
            className="col-lg-6 col-12 p-4 d-flex flex-column"
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
              Hey,
            </h3>
            <h3
              className="mb-4 display-6"
              style={{ fontSize: "28px", fontWeight: "500" }}
            >
              Welcome Back!
            </h3>

            {/* Social Login */}
            <div className="row justify-content-center mb-3">
              {[Google, Apple, Microsoft].map((img, index) => (
                <div key={index} className="col-4 col-sm-3 mb-2">
                  <div className="card h-100" style={{ cursor: "pointer" }}>
                    <div className="card-body text-center p-2">
                      <img
                        src={img}
                        alt="social"
                        className="img-fluid"
                        style={{ maxHeight: "40px" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center my-2">
              <span className="text-muted">OR</span>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              <div className="modern-input mb-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder=" "
                />
                <label className="input-label">Email Address</label>
              </div>

              <div className="modern-input mb-4 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="d-flex justify-content-end align-items-center mb-3">
                <Link
                  to={"/forgot-password"}
                  className="text-decoration-none"
                  style={{ color: "#014937", fontSize: "14px" }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn w-100 mb-3"
                style={{
                  backgroundColor: "#014937",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                Login
              </button>

              <div
                className="text-center mt-3 display-6"
                style={{ fontSize: "14px", fontWeight: "600" }}
              >
                Don't have an account?{" "}
                <Link
                  to={"/signup"}
                  className="text-decoration-none ms-1"
                  style={{
                    fontSize: "14px",
                    color: "#014937",
                  }}
                >
                  Sign Up here!
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
