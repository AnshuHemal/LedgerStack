import axios from "axios";
import React, { useEffect, useState } from "react";

const OutstandingReceivable = () => {
  const [outstandingData, setOutstandingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutstandingReceivable();
  }, []);

  const fetchOutstandingReceivable = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/outstanding/receivable`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setOutstandingData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching outstanding receivable:", error.message);
    } finally {
      setLoading(false);
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
            Outstanding Receivable
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Track outstanding amounts owed by customers and clients. Cheque entries show as DEBIT (money coming in).
          </p>
        </div>
      </div>

      <div className="table-container mt-4">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>City</th>
                <th>Person</th>
                <th>Mobile No.</th>
                <th>Email</th>
                <th>Current Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outstandingData.length > 0 ? (
                outstandingData.map((item) => (
                  <tr key={item.account._id}>
                    <td>{item.account.companyName || "-"}</td>
                    <td>{item.account.city || "-"}</td>
                    <td>{item.account.contactPerson || "-"}</td>
                    <td>{item.account.mobileNo || "-"}</td>
                    <td>{item.account.email || "-"}</td>
                    <td className={item.currentBalance > 0 ? "text-danger" : "text-success"}>
                      ₹{Math.abs(item.currentBalance).toFixed(2)}
                      {item.currentBalance > 0 ? " (Debit - Money Owed)" : " (Credit - Money Received)"}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          // Show detailed entries for this account
                          console.log("Entries for account:", item.entries);
                        }}
                      >
                        View Details
                      </button>
                      </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No outstanding receivable entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};
export default OutstandingReceivable;
