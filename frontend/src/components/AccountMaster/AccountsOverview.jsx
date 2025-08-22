import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountsDisplay from "./AccountsDisplay";
import AccountsGroup from "./AccountsGroup";
import axios from "axios";
import toast from "react-hot-toast";

const AccountsOverview = () => {
  const [selectedTab, setSelectedTab] = useState("accounts");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    effect: "",
  });
  const [accountGroups, setAccountGroups] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    companyName: "",
    accountGroup: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    state: "",
    pinCode: "",
    gstin: "",
    panNo: "",
    contactPerson: "",
    mobileNo: "",
    email: "",
    website: "",
    openingBalance: 0,
  });
  const [radioSelected, setRadioSelected] = useState("fetchDetails");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_ACCOUNT_URL;

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/account-group`, {
          withCredentials: true,
        });
        setAccountGroups(response.data);
      } catch (error) {
        console.error("Failed to fetch account group:", error.message);
      }
    };

    fetchData(); // Call the async function
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/account-group`, {
        withCredentials: true,
      });
      setAccountGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch account group:", error.message);
    }
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const renderContent = () => {
    if (selectedTab === "accounts") {
      return (
        <div>
          <AccountsDisplay />
        </div>
      );
    }
    if (selectedTab === "accountGroup") {
      return (
        <div>
          <AccountsGroup />
        </div>
      );
    }
  };

  const handleAddAccountGroup = async () => {
    try {
      await axios.post(`${API_URL}/account-group`, formData, {
        withCredentials: true,
      });
      toast.success(`${formData.name} added..`);
      setError("");
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(
        err.message ? err.response.data.message : "Something went wrong"
      );
    }
  };

  const handleAddAccount = async () => {
    try {
      await axios.post(`${API_URL}/account-master`, accountFormData, {
        withCredentials: true,
      });
      toast.success("Account added successfully..");
      fetchData();
      setError("");
      setAccountFormData({
        companyName: "",
        accountGroup: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        city: "",
        state: "",
        pinCode: "",
        gstin: "",
        panNo: "",
        contactPerson: "",
        mobileNo: "",
        email: "",
        website: "",
        openingBalance: 0,
        createdBy: "",
      });

      setShowAccountModal(false);
    } catch (err) {
      setError(
        err.response ? err.response.data.message : "Something went wrong"
      );
    }
  };

  const handleGSTINVerifyBtn = async () => {
    if (accountFormData.gstin === "" || accountFormData.gstin.length === 0) {
      toast.error("Please add GSTIN number to fetch details.");
    } else {
      try {
        const response = await axios.get(
          `https://sheet.gstincheck.co.in/check/36291eeb6c9ff0f2ce9588c9dcd71521/${accountFormData.gstin}`,
          { withCredentials: false }
        );
        if (response.data.flag !== true) {
          toast.error(response.data.message);
          return;
        }

        setAccountFormData({
          companyName: response.data.data.tradeNam,
          gstin: accountFormData.gstin,
          panNo: accountFormData.gstin.slice(2, 12),
          addressLine1: response.data.data.pradr.addr.bnm,
          addressLine2: response.data.data.pradr.addr.st,
          addressLine3: response.data.data.pradr.addr.loc,
          city: response.data.data.pradr.addr.dst,
          state: response.data.data.pradr.addr.stcd,
          pinCode: response.data.data.pradr.addr.pncd,
          contactPerson: response.data.data.lgnm,
        });

        toast.success("GST Details fetched..");
      } catch (error) {
        toast.error("Invalid GSTIN or unable to fetch data.");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccountChange = (e) => {
    setAccountFormData({
      ...accountFormData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="child__container d-flex justify-content-between align-items-start accounts-fade-in">
        <div className="ms-lg-2">
          <h5
            className="display-6"
            style={{ fontSize: "25px", fontWeight: "500" }}
          >
            Account Master
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Manages your accounts settings and preferences.
          </p>
        </div>

        <div className="me-3 d-flex align-items-center gap-2">
          <button className="login-button" onClick={() => setShowModal(true)}>
            + Acc. Group
          </button>
          <button
            className="login-button"
            onClick={() => setShowAccountModal(true)}
          >
            + Account
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs d-flex gap-3 accounts-fade-in">
        <button
          className={`nav-tab ${selectedTab === "accounts" ? "active" : ""}`}
          onClick={() => handleTabClick("accounts")}
        >
          Accounts
        </button>
        <button
          className={`nav-tab ${
            selectedTab === "accountGroup" ? "active" : ""
          }`}
          onClick={() => handleTabClick("accountGroup")}
        >
          Acc. Group
        </button>
      </div>

      {renderContent()}

      {/* Modal for adding Account Group */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-animate">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Account Group
              </h5>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="effect" className="form-label">
                  Effect
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="effect"
                  name="effect"
                  value={formData.effect}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="login-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="login-button"
                onClick={handleAddAccountGroup}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding Account */}
      <div
        className={`modal fade ${showAccountModal ? "show" : ""}`}
        style={{
          display: showAccountModal ? "block" : "none",
          zIndex: "1056",
        }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-animate">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Account
              </h5>
            </div>
            <div
              className="modal-body"
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="row">
                <div className="col-6">
                  <div>
                    <p>GSTIN No.</p>
                    <input
                      type="radio"
                      name="radioField"
                      checked={radioSelected === "fetchDetails"}
                      onChange={() => setRadioSelected("fetchDetails")}
                    />{" "}
                    Fetch Company Details Automatically. <br />
                    <input
                      type="radio"
                      name="radioField"
                      checked={radioSelected === "manual"}
                      onChange={() => setRadioSelected("manual")}
                    />{" "}
                    No, I want to add manually.
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="name" className="form-label">
                    Enter GSTIN No.
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="gstin"
                    value={accountFormData.gstin.toUpperCase()}
                    onChange={handleAccountChange}
                  />

                  <div className="text-start my-2">
                    {radioSelected === "fetchDetails" && (
                      <button
                        className="login-button"
                        onClick={handleGSTINVerifyBtn}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <hr className="my-3" />

              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  color: "#014937",
                }}
                className="display-6"
              >
                Company Profile
              </h5>

              <div className="row mt-3">
                <div className="col-12">
                  <label htmlFor="name" className="form-label">
                    Company/Firm Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="companyName"
                    value={accountFormData.companyName}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-6">
                  <label htmlFor="name" className="form-label">
                    Person Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="contactPerson"
                    value={accountFormData.contactPerson}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>
                <div className="col-6">
                  <label htmlFor="name" className="form-label">
                    PAN No.
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="panNo"
                    value={accountFormData.panNo}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="addressLine1"
                    value={accountFormData.addressLine1}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>
                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="addressLine2"
                    value={accountFormData.addressLine2}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>

                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    Address Line 3
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="addressLine3"
                    value={accountFormData.addressLine3}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    State
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="state"
                    value={accountFormData.state}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>
                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="city"
                    value={accountFormData.city}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>

                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    Pincode
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="pinCode"
                    value={accountFormData.pinCode}
                    onChange={handleAccountChange}
                    disabled={radioSelected === "fetchDetails"}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    Mobile No.
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="mobileNo"
                    value={accountFormData.mobileNo}
                    onChange={handleAccountChange}
                  />
                </div>
                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    E-mail
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="email"
                    value={accountFormData.email}
                    onChange={handleAccountChange}
                  />
                </div>

                <div className="col-4">
                  <label htmlFor="name" className="form-label">
                    Website
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="website"
                    value={accountFormData.website}
                    onChange={handleAccountChange}
                  />
                </div>
              </div>
              <hr className="my-3" />

              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  color: "#014937",
                }}
                className="display-6"
              >
                Account Group
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <select
                    className="select-dropdown"
                    onChange={handleAccountChange}
                    value={accountFormData.accountGroup}
                    name="accountGroup"
                  >
                    <option value="" disabled>
                      Select Account Group
                    </option>
                    {accountGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-center gap-2 justify-content-center">
                  <label className="form-label p-0 m-0">Opening Bal.</label>
                  <input
                    type="number"
                    className="form-control"
                    id="name"
                    style={{ width: "150px" }}
                    name="openingBalance"
                    value={parseFloat(accountFormData.openingBalance)}
                    onChange={handleAccountChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="login-button"
                onClick={() => {
                  setShowAccountModal(false);
                  setAccountFormData({
                    companyName: "",
                    accountGroup: "",
                    addressLine1: "",
                    addressLine2: "",
                    addressLine3: "",
                    city: "",
                    state: "",
                    pinCode: "",
                    gstin: "",
                    panNo: "",
                    contactPerson: "",
                    aadharNo: "",
                    mobileNo: "",
                    email: "",
                    website: "",
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="login-button"
                onClick={handleAddAccount}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Animation Styles */}
      <style>{`
        .accounts-fade-in {
          animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(32px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .modal-animate {
          animation: modalPopIn 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes modalPopIn {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(32px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default AccountsOverview;
