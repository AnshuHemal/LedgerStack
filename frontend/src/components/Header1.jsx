import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { NavLink } from "react-router-dom";
import logo from "../assets/ledgerstack.jpg";

const Header1 = () => {
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
              <li className="nav-item dropdown">
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
              </li>
            </ul>
          </div>
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
