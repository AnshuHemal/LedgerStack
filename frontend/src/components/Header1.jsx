import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/ledgerstack.jpg";
import { BsCircleFill } from "react-icons/bs";
import { LuCircleUser, LuSettings } from "react-icons/lu";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const Header1 = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = "https://ledgerstack-backend.vercel.app/api/auth";

  // Add CSS animation for spinner
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/current-user`, {
          withCredentials: true,
        });

        if (response.data.success && response.data.user) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [API_URL]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on the profile icon or its children
      const profileIcon = event.target.closest("[data-profile-icon]");
      if (profileIcon) {
        return; // Don't close if clicking on the profile icon
      }

      // Close dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      navigate("/login");
      toast.success("Successfully Logged out!");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  // Helper function to get user initials for profile image
  const getUserInitials = (user) => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top bg-white shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand me-auto" href="#">
          <img src={logo} alt="LedgerStack Logo" height={50} />
        </a>

        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
              <img src={logo} alt="LedgerStack Logo" height={50} />
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-center flex-grow-1 pe-3">
              <li className="nav-item">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    "nav-link mx-lg-2" + (isActive ? " active" : "")
                  }
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/inventory/manage"
                  className={({ isActive }) =>
                    "nav-link mx-lg-2" + (isActive ? " active" : "")
                  }
                >
                  Inventory
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link mx-lg-2" href="#">
                  Masters
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      to="/accounts"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Account Master
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/products"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Product Master
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/income-expenses"
                  className={({ isActive }) =>
                    "nav-link mx-lg-2" + (isActive ? " active" : "")
                  }
                >
                  Income & Expenses
                </NavLink>
              </li>

              {/* Tools Dropdown */}
              <li className="nav-item dropdown">
                <a className="nav-link mx-lg-2" href="#">
                  Tools
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      to="/proforma-invoice"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Proforma Invoice
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/quick-entry"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Quick Entry
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <NavLink
                      to="/outstanding-payable"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Outstanding Payable
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/outstanding-receivable"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Outstanding Receivable
                    </NavLink>
                  </li>
                </ul>
              </li>

              {/* Ledger Dropdown */}
              {/* <li className="nav-item dropdown">
                <a className="nav-link mx-lg-2" href="#">
                  Ledger
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      to="/account-ledger"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Account Ledger
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/product-ledger"
                      className={({ isActive }) =>
                        "dropdown-item" + (isActive ? " active" : "")
                      }
                    >
                      Product Ledger
                    </NavLink>
                  </li>
                </ul>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Profile Section */}
        <div className="d-flex align-items-center gap-3 me-3">
          {/* Profile Image with Online Status */}
          {loading ? (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                height: 32,
                width: 32,
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
              }}
              data-profile-icon
              onClick={(e) => toggleDropdown(e)}
            >
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div
              className="position-relative"
              style={{ cursor: "pointer" }}
              data-profile-icon
              onClick={(e) => toggleDropdown(e)}
            >
              <div
                className="position-relative"
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#014937",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
                title={`${currentUser?.name || "User"}${
                  currentUser?.role ? ` - ${currentUser.role}` : ""
                }`}
              >
                {getUserInitials(currentUser)}
              </div>
            </div>
          )}

          {/* Dropdown Menu */}
          {showDropdown && (
            <div ref={dropdownRef} className="profile-dropdown shadow-sm">
              <div className="profile-header d-flex align-items-center gap-3">
                <div className="flex-grow-1">
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>
                    {loading ? "Loading..." : currentUser?.name || "User"}
                  </div>
                  <div className="text-muted" style={{ fontSize: "14px" }}>
                    {currentUser?.email || "user@example.com"}
                  </div>
                </div>
              </div>
              <div className="dropdown-divider mb-2" />
              <NavLink
                to="/preferences"
                className="dropdown-item"
                onClick={closeDropdown}
              >
                <LuSettings
                  style={{ width: "20px", height: "18px" }}
                  className="me-2"
                />
                Profile & Account settings
              </NavLink>

              <div className="dropdown-divider my-2" />
              <a
                className="dropdown-item text-danger"
                onClick={(e) => {
                  handleLogout(e);
                  closeDropdown();
                }}
              >
                <FiLogOut
                  style={{ width: "20px", height: "18px" }}
                  className="me-2 logout-icon"
                />
                Log out
              </a>
            </div>
          )}
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Header1;
