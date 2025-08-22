import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const QuickEntryOverview = () => {
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [entryType, setEntryType] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [entries, setEntries] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    date: "",
    day: "",
    voucher_no: "",
    cheque_no: "",
    account: "",
    amount: "",
  });

  axios.defaults.withCredentials = true;

  const API_URL = import.meta.env.VITE_QUICK_ENTRY_URL;
  const ACCOUNT_URL = import.meta.env.VITE_ACCOUNT_URL;

  useEffect(() => {
    fetchBankAccounts();
    fetchAllAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const res = await axios.get(`${ACCOUNT_URL}/bank-accounts`);
      setAccounts(res.data.data);
    } catch (err) {
      console.error("Error fetching bank accounts", err);
    }
  };

  const fetchAllAccounts = async () => {
    try {
      const res = await axios.get(`${ACCOUNT_URL}/account-master`);
      setAllAccounts(res.data);
    } catch (err) {
      console.error("Error fetching all accounts", err);
    }
  };

  const fetchQuickEntries = async (entryType, entryAccount) => {
    try {
      const res = await axios.get(`${API_URL}/`, {
        params: { entryType, entryAccount },
      });
      setEntries(res.data.data);
    } catch (err) {
      console.error("Error fetching quick entries", err);
    }
  };

  const handleEntryTypeChange = (e) => {
    const value = e.target.value;
    setEntryType(value);
    if (value && selectedAccount) {
      fetchQuickEntries(value, selectedAccount);
    }
  };

  const handleAccountChange = (e) => {
    const value = e.target.value;
    setSelectedAccount(value);
    if (value && entryType) {
      fetchQuickEntries(entryType, value);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "date") {
      const date = new Date(value);
      const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
      updatedForm.day = weekday;
    }

    setForm(updatedForm);
  };

  const handleAddEntry = async () => {
    if (
      !form.date ||
      !form.account ||
      !form.amount ||
      !entryType ||
      !selectedAccount
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    setAdding(true);
    try {
      const response = await axios.post(`${API_URL}/add`, {
        ...form,
        amount: Number(form.amount),
        entryType,
        entryAccount: selectedAccount,
      });

      // Show success message with outstanding balance information if available
      if (response.data.success && response.data.data.outstandingInfo) {
        const { lastBalance, currentAmt, netBalance } = response.data.data.outstandingInfo;
        toast.success(
          `Entry added successfully! Last Balance: ₹${Math.abs(lastBalance).toFixed(2)} ${lastBalance >= 0 ? 'Credit' : 'Debit'}, Current Amt: ₹${Math.round(currentAmt).toFixed(2)}, Net Balance: ₹${Math.abs(netBalance).toFixed(2)} ${netBalance >= 0 ? 'Credit' : 'Debit'}`
        );
      } else {
        toast.success("Entry added successfully!");
      }

      setForm({
        date: "",
        day: "",
        voucher_no: "",
        cheque_no: "",
        account: "",
        amount: "",
      });

      fetchQuickEntries(entryType, selectedAccount);
    } catch (err) {
      console.error("Error adding entry", err.message);
      toast.error("Failed to add entry.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="child__container d-flex justify-content-between align-items-start">
        <div className="ms-lg-2">
          <h5
            className="display-6"
            style={{ fontSize: "25px", fontWeight: "500" }}
          >
            Quick Entry
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Streamline your financial flow with ease.
          </p>
        </div>
      </div>

      <div className="child__container row ms-md-2">
        <div className="col-md-4">
          <label className="form-label">Entry Type</label> <br />
          <select
            className="select-dropdown"
            onChange={handleEntryTypeChange}
            value={entryType}
          >
            <option value="">-- Select Entry Type --</option>
            <option value="Cheque Book">Bank Payment (Cheque Book)</option>
            <option value="slip book">Bank Receipt (Slip Book)</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Select Account</label> <br />
          <select
            className="select-dropdown"
            onChange={handleAccountChange}
            value={selectedAccount}
          >
            <option value="">-- Select Account --</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.companyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container mt-4">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Voucher No.</th>
              <th>Cheque No.</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Last Balance</th>
              <th>Current Amt</th>
              <th>Net Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? (
              entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.day}</td>
                  <td>{entry.voucher_no || "-"}</td>
                  <td>{entry.cheque_no || "-"}</td>
                  <td>{entry.account?.companyName || "N/A"}</td>
                  <td>{entry.amount}</td>
                  <td>
                    {entry.lastBalance !== undefined ? (
                      <span className="text-primary">
                        ₹{Math.abs(entry.lastBalance).toFixed(2)} {entry.lastBalance >= 0 ? 'Credit' : 'Debit'}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {entry.currentAmt !== undefined ? (
                      <span className="text-success">
                        ₹{Math.round(entry.currentAmt).toFixed(2)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {entry.netBalance !== undefined ? (
                      <span className="text-info">
                        ₹{Math.abs(entry.netBalance).toFixed(2)} {entry.netBalance >= 0 ? 'Credit' : 'Debit'}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No entries to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="container mt-4 border rounded p-3">
        <h6 className="mb-3">Add New Entry</h6>
        <div className="row">
          <div className="col-md-2">
            <label>Date</label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={form.date}
              onChange={handleFormChange}
              disabled={adding}
            />
          </div>
          <div className="col-md-2">
            <label>Day</label>
            <input
              type="text"
              name="day"
              className="form-control"
              value={form.day}
              readOnly
            />
          </div>
          <div className="col-md-2">
            <label>Voucher No</label>
            <input
              type="text"
              name="voucher_no"
              className="form-control"
              value={form.voucher_no}
              onChange={handleFormChange}
              disabled={adding}
            />
          </div>
          <div className="col-md-2">
            <label>Cheque No</label>
            <input
              type="text"
              name="cheque_no"
              className="form-control"
              value={form.cheque_no}
              onChange={handleFormChange}
              disabled={adding}
            />
          </div>
          <div className="col-md-2">
            <label>Account</label>
            <select
              name="account"
              className="form-control"
              value={form.account}
              onChange={handleFormChange}
              disabled={adding}
            >
              <option value="">-- Select --</option>
              {allAccounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.companyName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              value={form.amount}
              onChange={handleFormChange}
              disabled={adding}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-success"
            onClick={handleAddEntry}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add Entry"}
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickEntryOverview;
