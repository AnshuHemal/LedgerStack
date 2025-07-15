import axios from "axios";
import React, { useEffect, useState } from "react";

const OutstandingPayable = () => {
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
            Outstanding Payable
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Streamline your inventory overview with ease.
          </p>
        </div>
      </div>

      <div className="table-container mt-4">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>City</th>
              <th>Person</th>
              <th>Mobile No.</th>
              <th>Email</th>
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
                    <td>{acc.contactPerson}</td>
                    <td>{acc.mobileNo || "-"}</td>
                    <td>{acc.email || "-"}</td>
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

export default OutstandingPayable;
