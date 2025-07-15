import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const PurchaseDisplay = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const [formData, setFormData] = useState({
    cash_debit: "Debit Memo",
    voucher_date: new Date().toISOString().split("T")[0],
    voucher_no: 0,
    bill_date: new Date().toISOString().split("T")[0],
    bill_no: 0,
    vat_class: "Tax Invoice",
    purchase_account: "",
    products: [
      {
        product: "",
        quantity: 0,
        unit: "",
        rate: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        total_amount: 0,
      },
    ],
    final_amount: 0,
    remarks: "",
  });

  axios.defaults.withCredentials = true;

  const API_URL = import.meta.env.VITE_INCOME_EXPENSES_URL;
  const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL;

  const totalQuantity = formData.products.reduce(
    (acc, prod) => acc + Number(prod.quantity || 0),
    0
  );

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/purchase-invoice`);
      setInvoices(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sales invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const productRes = await axios.get(`${PRODUCT_URL}/`);
      setProducts(productRes.data);
    } catch (error) {
      console.error("Error fetching meta data:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchData();
  }, []);

  useEffect(() => {
    const totalAmount = formData.products.reduce((sum, prod) => {
      const rate = parseFloat(prod.rate) || 0;
      const quantity = parseFloat(prod.quantity) || 0;
      const base = rate * quantity;

      const igst = prod.igst !== null ? parseFloat(prod.igst) || 0 : 0;
      const cgst = prod.cgst !== null ? parseFloat(prod.cgst) || 0 : 0;
      const sgst = prod.sgst !== null ? parseFloat(prod.sgst) || 0 : 0;

      const gstPercentage = igst > 0 ? igst : cgst + sgst;
      const gstAmount = (base * gstPercentage) / 100;

      const finalAmount = base + gstAmount;

      return sum + finalAmount;
    }, 0);

    setFormData((prev) => ({
      ...prev,
      final_amount: parseFloat(totalAmount.toFixed(2)),
    }));
  }, [formData.products]);

  const handleRowClick = (invoice) => {
    setFormData({
      ...invoice,
      bill_date: new Date(invoice.bill_date).toISOString().split("T")[0],
      voucher_date: new Date(invoice.voucher_date).toISOString().split("T")[0],
    });
    setSelectedInvoiceId(invoice._id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (e) => {
    formData.bill_no = parseInt(formData.bill_no);
    let final_amount = 0;
    formData.products.map((prod, idx) => {
      if (prod.cgst == null) {
        prod.cgst = 0;
      }
      if (prod.sgst == null) {
        prod.sgst = 0;
      }
      if (prod.igst == null) {
        prod.igst = 0;
      }
      prod.quantity = parseFloat(prod.quantity) || 0;
      const igst = parseFloat(prod.igst) || 0;
      const cgst = parseFloat(prod.cgst) || 0;
      const sgst = parseFloat(prod.sgst) || 0;

      const baseAmount = prod.rate * prod.quantity;
      const totalGST = igst ? igst : cgst + sgst;

      const finalAmount = baseAmount + (baseAmount * totalGST) / 100;
      prod.total_amount = finalAmount;
      final_amount += finalAmount;

      prod.igst !== null ? prod.igst : 0;
      prod.cgst !== null ? prod.cgst : 0;
      prod.sgst !== null ? prod.sgst : 0;
    });
    formData.bill_date = new Date(formData.bill_date).toLocaleDateString();
    formData.voucher_date = new Date(
      formData.voucher_date
    ).toLocaleDateString();
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/purchase-invoice/${selectedInvoiceId}`, {
        salesInvoiceDetails: formData,
      });
      toast.success("Invoice updated!");
      fetchInvoices();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update invoice" + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/purchase-invoice/${selectedInvoiceId}`);
      toast.success("Invoice deleted!");
      fetchInvoices();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice");
    }
  };

  const handleProductChange = (e, index) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];

    if (name === "product") {
      const selectedProduct = products.find((p) => p._id === value);

      if (selectedProduct) {
        const gst = selectedProduct.gst || 0;
        const halfGST = gst / 2;

        updatedProducts[index] = {
          ...updatedProducts[index],
          product: selectedProduct._id,
          unit: selectedProduct.unit || "",
          rate: selectedProduct.sale_rate || 0,
          igst: selectedProduct.gst_type === "IGST" ? gst : null,
          cgst: selectedProduct.gst_type === "CGST+SGST" ? halfGST : null,
          sgst: selectedProduct.gst_type === "CGST+SGST" ? halfGST : null,
        };
      }
    } else {
      updatedProducts[index][name] = value;
    }

    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const handleAddProductRow = () => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product: "",
          rate: "",
          unit: "",
          igst: null,
          cgst: null,
          sgst: null,
        },
      ],
    }));
  };

  const isLastProductRowValid = () => {
    const lastProduct = formData.products[formData.products.length - 1];
    return lastProduct.product && lastProduct.rate && lastProduct.unit;
  };

  const handleRemoveProductRow = (indexToRemove) => {
    if (formData.products.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div>
      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>C/D</th>
              <th>Voucher No</th>
              <th>Bill No</th>
              <th>Account</th>
              <th>City</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} onDoubleClick={() => handleRowClick(inv)}>
                <td>{new Date(inv.bill_date).toLocaleDateString()}</td>
                <td>{inv.cash_debit}</td>
                <td>{inv.voucher_no}</td>
                <td>{inv.bill_no}</td>
                <td>{inv.purchase_account?.companyName || "-"}</td>
                <td>{inv.purchase_account?.city || "-"}</td>
                <td>{inv.final_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Edit Purchase Invoice
              </h5>
            </div>
            <div
              className="modal-body"
              style={{
                maxHeight: "100vh",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Cash / Debit
                  </label>{" "}
                  <br />
                  <select
                    className="select-dropdown"
                    name="cash_debit"
                    onChange={handleChange}
                    value={formData.cash_debit}
                  >
                    <option value="Debit Memo">Debit Memo</option>
                    <option value="Cash Memo">Cash Memo</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Voucher Date:
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    name="voucher_date"
                    value={formData.voucher_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Voucher No.
                  </label>

                  <input
                    type="text"
                    name="voucher_no"
                    className="form-control"
                    placeholder="Enter number"
                    value={formData.voucher_no}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Bill Date:
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    name="bill_date"
                    value={formData.bill_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Bill No.
                  </label>

                  <input
                    type="text"
                    name="bill_no"
                    className="form-control"
                    value={formData.bill_no}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    VAT Class
                  </label>
                  <select
                    className="select-dropdown"
                    name="vat_class"
                    onChange={handleChange}
                    value={formData.vat_class}
                  >
                    <option value="Tax Invoice">Tax Invoice</option>
                    <option value="Retail/Bill of Supplier">
                      Retail/Bill of Supplier
                    </option>
                    <option value="Other Invoice">Other Invoice</option>
                  </select>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Party Account
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-control"
                    placeholder="Enter number"
                    value={formData.purchase_account?.companyName}
                  />
                </div>
              </div>

              <div className="mt-3" style={{ overflowX: "auto" }}>
                <table
                  className="modern-table purchase-table text-center"
                  style={{
                    borderSpacing: "0 12px",
                    borderCollapse: "separate",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Rate (₹)</th>
                      <th>IGST (%)</th>
                      <th>CGST (%)</th>
                      <th>SGST (%)</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((prod, idx) => (
                      <tr key={idx}>
                        <select
                          name="product"
                          className="form-control"
                          value={prod.product?._id || prod.product || ""}
                          onChange={(e) => handleProductChange(e, idx)}
                        >
                          <option value="">-- Select Product --</option>
                          {products
                            .filter(
                              (p) =>
                                !formData.products.some(
                                  (fp, i) =>
                                    (fp.product?._id || fp.product) === p._id &&
                                    i !== idx
                                )
                            )
                            .map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name}
                              </option>
                            ))}
                        </select>

                        <td>
                          <input
                            className="form-control no-spinner text-end"
                            name="quantity"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d{0,8}$/.test(value)) {
                                handleProductChange(e, idx);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control text-end"
                            name="unit"
                            value={prod.unit}
                            onChange={(e) => handleProductChange(e, idx)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control text-end"
                            name="rate"
                            value={prod.rate}
                            onChange={(e) => handleProductChange(e, idx)}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control no-spinner text-end"
                            name="igst"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.igst !== null ? prod.igst : 0}
                            disabled={prod.igst === null}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d{0,8}$/.test(value)) {
                                handleProductChange(e, idx);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control no-spinner text-end"
                            name="cgst"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.cgst !== null ? prod.cgst : 0}
                            disabled={prod.cgst === null}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d{0,8}$/.test(value)) {
                                handleProductChange(e, idx);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control no-spinner text-end"
                            name="sgst"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.sgst !== null ? prod.sgst : 0}
                            disabled={prod.sgst === null}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d{0,8}$/.test(value)) {
                                handleProductChange(e, idx);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control no-spinner text-end"
                            name="total_amount"
                            type="text"
                            value={(() => {
                              const rate = parseFloat(prod.rate) || 0;
                              const quantity = parseFloat(prod.quantity) || 0;

                              const igst = parseFloat(prod.igst) || 0;
                              const cgst = parseFloat(prod.cgst) || 0;
                              const sgst = parseFloat(prod.sgst) || 0;

                              const baseAmount = rate * quantity;
                              const totalGST = igst ? igst : cgst + sgst;

                              const finalAmount =
                                baseAmount + (baseAmount * totalGST) / 100;
                              return finalAmount.toFixed(2);
                            })()}
                            readOnly
                          />
                        </td>
                        <td>
                          {formData.products.length > 1 && idx !== 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveProductRow(idx)}
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td></td>
                      <td>{totalQuantity.toFixed(2)}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{formData.final_amount.toFixed(2)}</td>
                    </tr>

                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>
                        <label htmlFor="name" className="form-label text-end">
                          Bill Amt.
                        </label>
                      </td>
                      <td>{parseFloat(formData.final_amount).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                {isLastProductRowValid() && (
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      className="post-button"
                      onClick={handleAddProductRow}
                    >
                      + Add Product
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer d-flex gap-3 align-items-center justify-content-between">
              <div className="d-flex gap-2 align-items-center">
                <label htmlFor="name" className="form-label text-end p-0 m-0">
                  Remarks:
                </label>
                <input
                  type="text"
                  name="remarks"
                  className="form-control"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex gap-3 align-items-center">
                <button
                  type="button"
                  className="post-button"
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={handleEdit}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={handleEdit}
                >
                  Save & Print
                </button>
                <button
                  type="button"
                  className="post-button"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDisplay;
