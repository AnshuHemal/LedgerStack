import React, { useEffect, useState } from "react";
import axios from "axios";

const AccountLedger = () => {
  const [accounts, setAccounts] = useState([]);

  const ACCOUNT_URL = import.meta.env.VITE_ACCOUNT_URL;

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${ACCOUNT_URL}/account-master`, {
        withCredentials: true,
      });
      setAccounts(res.data);
    } catch (error) {
      console.error("Error fetching accounts:", error.message);
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
            Account Ledger
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Streamline your financial flow with ease.
          </p>
        </div>
      </div>

      <div className="table-container mt-4">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>City</th>
              <th>Opening Balance</th>
              <th>Debit Total</th>
              <th>Credit Total</th>
              <th>Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length > 0 ? (
              accounts.map((acc) => {
                const openingBalance = acc.openingBalance || 0;
                const debitTotal = acc.debitTotal || 0;
                const creditTotal = acc.creditTotal || 0;
                const closingBalance =
                  openingBalance + debitTotal - creditTotal;

                return (
                  <tr key={acc._id}>
                    <td>{acc.companyName}</td>
                    <td>{acc.city || "-"}</td>
                    <td>{openingBalance}</td>
                    <td>{debitTotal}</td>
                    <td>{creditTotal}</td>
                    <td>{closingBalance}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AccountLedger;
