import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AccountsDisplay = () => {
  const [accounts, setAccounts] = useState([]);
  const [accountGroups, setAccountGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
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
    aadharNo: "",
    mobileNo: "",
    email: "",
    website: "",
    openingBalance: 0,
  });

  const API_URL = import.meta.env.VITE_ACCOUNT_URL;

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/account-master`);
      setAccounts(response.data);
    } catch (err) {
      setError("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/account-group`);
      setAccountGroups(response.data);
    } catch (err) {
      toast.error("Failed to fetch account groups");
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchAccountGroups();
  }, []);

  const handleRowClick = (account) => {
    setSelectedAccountId(account._id);
    setAccountFormData({
      companyName: account.companyName || "",
      accountGroup: account.accountGroup?._id || "",
      addressLine1: account.addressLine1 || "",
      addressLine2: account.addressLine2 || "",
      addressLine3: account.addressLine3 || "",
      city: account.city || "",
      state: account.state || "",
      pinCode: account.pinCode || "",
      gstin: account.gstin || "",
      panNo: account.panNo || "",
      contactPerson: account.contactPerson || "",
      aadharNo: account.aadharNo || "",
      mobileNo: account.mobileNo || "",
      email: account.email || "",
      website: account.website || "",
      openingBalance: account.openingBalance || 0,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setAccountFormData({
      ...accountFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/account-master/${selectedAccountId}`,
        accountFormData
      );
      toast.success("Account updated successfully");
      fetchAccounts();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to update account");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/account-master/${selectedAccountId}`);
      toast.success("Account deleted successfully");
      fetchAccounts();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>City</th>
              <th>Group</th>
              <th>GSTIN</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc._id} onDoubleClick={() => handleRowClick(acc)}>
                <td>{acc.companyName || "-"}</td>
                <td>{acc.city || "-"}</td>
                <td>{acc.accountGroup?.name || "-"}</td>
                <td>{acc.gstin || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Account</h5>
              </div>
              <div
                className="modal-body"
                style={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                }}
              >
                <div className="row">
                  <div className="col-6">
                    <label htmlFor="name" className="form-label">
                      Company/Firm Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="companyName"
                      value={accountFormData.companyName}
                      onChange={handleChange}
                    />
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
                      value={accountFormData.gstin}
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between align-items-center">
                <div>
                  <button
                    type="button"
                    className="login-button"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
                <div className="d-flex gap-2">
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
                    onClick={handleSave}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsDisplay;
