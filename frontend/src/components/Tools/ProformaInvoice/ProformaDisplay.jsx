import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import whatsapp from "../../../assets/whatsapp.png";
import gmail from "../../../assets/gmail.png";
import messages from "../../../assets/messages.png";

const ProformaDisplay = () => {
  const [invoices, setInvoices] = useState([]);
  const [validatedInvoices, setValidatedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [transportations, setTransportations] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState("");

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [smsNumber, setSmsNumber] = useState("");

  const handleMethodClick = (method) => {
    setSelectedMethod(method);
  };

  const [formData, setFormData] = useState({
    cash_debit: "Debit Memo",
    bill_date: new Date().toISOString().split("T")[0],
    bill_no: { bill_prefix: "Invoice ", no: 0 },
    vat_class: "Tax Invoice",
    sales_account: "",
    po_no: "",
    lr_no: "",
    transportation_account: "",
    trans_doc_no: "",
    trans_date: new Date().toISOString().split("T")[0],
    delivery_party_account: {
      gst: "",
      panNo: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      city: "",
      state: "",
      pinCode: "",
      mobileNo: "",
    },

    products: [
      {
        product: "",
        boxes: 0,
        no_of_pcs: 0,
        quantity: 0,
        unit: "",
        rate: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        discount: 0,
        discount_amt: 0,
        total_amount: 0,
      },
    ],
    total_products_amount: 0,
    freight_amount: 0,
    final_amount: 0,
    remarks: "",
  });

  axios.defaults.withCredentials = true;

  const API_URL = import.meta.env.VITE_INCOME_EXPENSES_URL;
  const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL;

  const totalBoxes = formData.products.reduce(
    (acc, prod) => acc + Number(prod.boxes || 0),
    0
  );
  const totalQuantity = formData.products.reduce(
    (acc, prod) => acc + Number(prod.boxes || 0) * Number(prod.no_of_pcs || 0),
    0
  );
  formData.final_amount =
    parseFloat(formData.total_products_amount) +
    parseFloat(formData.freight_amount);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/proforma-invoice`);
      setInvoices(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sales invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchValidatedInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/proforma-validation`);
      setValidatedInvoices(res.data.validatedInvoiceIds);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch validated invoices");
    }
  };

  const fetchData = async () => {
    try {
      const transportationRes = await axios.get(`${API_URL}/transportation`);
      const productRes = await axios.get(`${PRODUCT_URL}/`);
      setTransportations(transportationRes.data.data);
      setProducts(productRes.data);
    } catch (error) {
      console.error("Error fetching meta data:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchValidatedInvoices();
    fetchData();
  }, []);

  useEffect(() => {
    const totalAmount = formData.products.reduce((sum, prod) => {
      const boxes = parseFloat(prod.boxes) || 0;
      const pcs = parseFloat(prod.no_of_pcs) || 0;
      const rate = parseFloat(prod.rate) || 0;
      const discount = parseFloat(prod.discount) || 0;

      const quantity = boxes * pcs;
      const base = rate * quantity;
      const discountAmt = (base * discount) / 100;
      const netAmount = base - discountAmt;

      const igst = prod.igst !== null ? parseFloat(prod.igst) || 0 : 0;
      const cgst = prod.cgst !== null ? parseFloat(prod.cgst) || 0 : 0;
      const sgst = prod.sgst !== null ? parseFloat(prod.sgst) || 0 : 0;

      const gstPercentage = igst > 0 ? igst : cgst + sgst;
      const gstAmount = (netAmount * gstPercentage) / 100;

      const finalAmount = netAmount + gstAmount;

      return sum + finalAmount;
    }, 0);

    setFormData((prev) => ({
      ...prev,
      total_products_amount: parseFloat(totalAmount.toFixed(2)),
    }));
  }, [formData.products]);

  const handleRowClick = (invoice) => {
    setFormData({
      ...invoice,
      bill_date: new Date(invoice.bill_date).toISOString().split("T")[0],
      trans_date: invoice.trans_date
        ? new Date(invoice.trans_date).toISOString().split("T")[0]
        : "",
    });
    setSelectedInvoiceId(invoice._id);
    setWhatsappNumber(invoice.sales_account?.mobileNo);
    setSmsNumber(invoice.sales_account?.mobileNo);
    setEmailAddress(invoice.sales_account?.email);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "bill_no") {
      setFormData((prev) => ({
        ...prev,
        bill_no: value,
        trans_doc_no: value,
      }));
    } else if (name === "bill_no.no") {
      setFormData((prev) => {
        const newBillNo = { ...prev.bill_no, no: value };
        return {
          ...prev,
          bill_no: newBillNo,
          trans_doc_no: `${newBillNo.bill_prefix}${value}`,
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = async (e) => {
    formData.freight_amount = parseFloat(formData.freight_amount);
    formData.bill_no.no = parseInt(formData.bill_no.no);
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
      prod.boxes = parseInt(prod.boxes);
      prod.discount = parseFloat(prod.discount);
      prod.no_of_pcs = parseFloat(prod.no_of_pcs);
      prod.quantity = prod.no_of_pcs * prod.boxes;
      const igst = parseFloat(prod.igst) || 0;
      const cgst = parseFloat(prod.cgst) || 0;
      const sgst = parseFloat(prod.sgst) || 0;

      const baseAmount = prod.rate * prod.quantity;
      const discountAmt = (baseAmount * prod.discount) / 100;
      const totalGST = igst ? igst : cgst + sgst;

      const finalAmount =
        baseAmount -
        discountAmt +
        ((baseAmount - discountAmt) * totalGST) / 100;
      prod.total_amount = finalAmount;
      final_amount += finalAmount;

      prod.igst !== null ? prod.igst : 0;
      prod.cgst !== null ? prod.cgst : 0;
      prod.sgst !== null ? prod.sgst : 0;
    });
    formData.total_products_amount = final_amount;
    formData.trans_doc_no =
      formData.bill_no.bill_prefix + "" + formData.bill_no.no;
    formData.trans_date = new Date(formData.trans_date).toLocaleDateString();
    formData.bill_date = new Date(formData.bill_date).toLocaleDateString();
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/proforma-invoice/${selectedInvoiceId}`, {
        proformaInvoiceDetails: formData,
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
      await axios.delete(`${API_URL}/proforma-invoice/${selectedInvoiceId}`);
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
          boxes: "",
          no_of_pcs: "",
          rate: "",
          unit: "",
          discount: "",
          igst: null,
          cgst: null,
          sgst: null,
        },
      ],
    }));
  };

  const isLastProductRowValid = () => {
    const lastProduct = formData.products[formData.products.length - 1];
    return (
      lastProduct.product &&
      lastProduct.boxes &&
      lastProduct.no_of_pcs &&
      lastProduct.rate &&
      lastProduct.unit &&
      lastProduct.discount !== "" // allow 0%
    );
  };

  const handleRemoveProductRow = (indexToRemove) => {
    if (formData.products.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleDeliveryPartyChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      delivery_party_account: {
        ...prev.delivery_party_account,
        [name]: value,
      },
    }));
  };

  const handleConfirmDeliveryParty = () => {};

  const handleValidation = async (inv) => {
    try {
      const salesBillRes = await axios.get(`${API_URL}/sales-bill`);
      const currentBillNo = parseInt(salesBillRes.data.data.no);

      const newInvoice = {
        ...inv,
        bill_no: {
          ...inv.bill_no,
          no: currentBillNo,
        },
      };

      const res = await axios.post(`${API_URL}/sales-invoice`, newInvoice, {
        withCredentials: true,
      });

      await axios.put(`${API_URL}/sales-bill`, {
        no: currentBillNo + 1,
      });

      const proformaValidationData = {
        proformaInvoiceId: inv._id,
        validate: true,
        createdBy: inv.createdBy,
      };

      await axios.post(
        `${API_URL}/proforma-validation`,
        proformaValidationData,
        { withCredentials: true }
      );

      toast.success(`Invoice Validated: ${res.data.invoice._id}`);
      setValidatedInvoices((prev) => [...prev, inv._id]);
      fetchInvoices();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving invoice to sales:", error.message);
      toast.error("Failed to save invoice");
    }
  };

  const isValidatedInvoice = (invoiceId) => {
    return validatedInvoices.includes(invoiceId);
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
                <td>{inv.bill_no.bill_prefix + inv.bill_no.no}</td>
                <td>{inv.sales_account?.companyName || "-"}</td>
                <td>{inv.sales_account?.city || "-"}</td>
                <td>{inv.final_amount}</td>
                <td>
                  <div>
                    <button
                      className="login-button"
                      onClick={() => handleValidation(inv)}
                      disabled={isValidatedInvoice(inv._id)}
                    >
                      {isValidatedInvoice(inv._id) ? "✓" : "Validate"}
                    </button>
                  </div>
                </td>
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
                Edit Sales Invoice
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
                <div className="col-lg-3">
                  <label htmlFor="name" className="form-label">
                    Cash / Debit
                  </label>
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
                <div className="col-lg-3">
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
                <div className="col-lg-3">
                  <label htmlFor="name" className="form-label">
                    No.
                  </label>
                  <div className="input-group">
                    {/* Prefix (read-only part) */}
                    <span className="input-group-text">
                      {formData.bill_no.bill_prefix}
                    </span>

                    {/* Number (user-editable part) */}
                    <input
                      type="text"
                      name="no"
                      className="form-control"
                      placeholder="Enter number"
                      value={formData.bill_no.no}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bill_no: {
                            ...prev.bill_no,
                            no: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="col-lg-3">
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
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Account
                  </label>
                  <input
                    type="text"
                    name="no"
                    className="form-control"
                    placeholder="Enter number"
                    value={formData.sales_account?.companyName}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Delivery Party
                  </label>
                  <input
                    className="form-control"
                    name="delivery_party_account"
                    value={formData.delivery_party_account.name}
                    onClick={() => {
                      const modal = new bootstrap.Modal(
                        document.getElementById("deliveryPartyModalEdit")
                      );
                      modal.show();
                    }}
                    placeholder="Click to select delivery party"
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Transportation Details
                  </label>
                  <input
                    className="form-control"
                    // name="delivery_party_account"
                    value={
                      transportations.find(
                        (trans) => trans._id === formData.transportation_account
                      )?.name || ""
                    }
                    onClick={() => {
                      const modal = new bootstrap.Modal(
                        document.getElementById(
                          "transportationDetailsModalEdit"
                        )
                      );
                      modal.show();
                    }}
                    placeholder="Click to add Transportation Details"
                    readOnly
                  />
                </div>
              </div>

              <div className="mt-3" style={{ overflowX: "auto" }}>
                <table
                  className="modern-table sales-table text-center"
                  style={{
                    borderSpacing: "0 12px",
                    borderCollapse: "separate",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Box</th>
                      <th>No of pcs</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Rate (₹)</th>
                      <th>Dis. (%)</th>
                      <th>
                        IGST
                        <br />
                        (%)
                      </th>
                      <th>
                        CGST
                        <br />
                        (%)
                      </th>
                      <th>
                        SGST
                        <br />
                        (%)
                      </th>
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
                            name="boxes"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.boxes}
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
                            name="no_of_pcs"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.no_of_pcs}
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
                            name="quantity"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.boxes * prod.no_of_pcs}
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
                            name="discount"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={3}
                            type="text"
                            value={prod.discount}
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
                              const boxes = parseFloat(prod.boxes) || 0;
                              const pcs = parseFloat(prod.no_of_pcs) || 0;
                              const rate = parseFloat(prod.rate) || 0;
                              const quantity = boxes * pcs;

                              const discount = parseFloat(prod.discount) || 0;
                              const igst = parseFloat(prod.igst) || 0;
                              const cgst = parseFloat(prod.cgst) || 0;
                              const sgst = parseFloat(prod.sgst) || 0;

                              const baseAmount = rate * quantity;
                              const discountAmt = (baseAmount * discount) / 100;
                              const totalGST = igst ? igst : cgst + sgst;

                              const finalAmount =
                                baseAmount -
                                discountAmt +
                                ((baseAmount - discountAmt) * totalGST) / 100;
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
                      <td>{totalBoxes.toFixed(2)}</td>
                      <td></td>
                      <td>{totalQuantity.toFixed(2)}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{formData.total_products_amount.toFixed(2)}</td>
                    </tr>

                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>
                        <label htmlFor="name" className="form-label text-end">
                          Freight
                        </label>
                      </td>
                      <td>
                        <input
                          className="form-control no-spinner text-end"
                          name="freight_amount"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          type="number"
                          value={formData.freight_amount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,8}$/.test(value)) {
                              handleChange(e);
                            }
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
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

              <div>
                <button
                  type="button"
                  className="login-button"
                  onClick={() => {
                    const modal = new bootstrap.Modal(
                      document.getElementById("proformaSendingModal")
                    );
                    modal.show();
                  }}
                >
                  Send via
                </button>
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

      {/* Sending Via Modal */}
      <div
        className="modal fade"
        id="proformaSendingModal"
        tabIndex="-1"
        aria-labelledby="proformaSendingModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deliveryPartyModalEditLabel">
                Send Via
              </h5>
            </div>
            <div className="modal-body">
              <p>Choose options below to send the Proforma to your client.</p>
              <div className="d-flex align-items-center justify-content-center gap-4 mt-3">
                <div className="d-flex align-items-center justify-content-center gap-4 mt-3">
                  {/* WhatsApp option */}
                  <div
                    className="d-flex flex-column align-items-center gap-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleMethodClick("whatsapp")}
                  >
                    <img
                      src={whatsapp}
                      alt="whatsapp"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                      }}
                    />
                    <p>WhatsApp</p>
                  </div>

                  {/* Email option */}
                  <div
                    className="d-flex flex-column align-items-center gap-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleMethodClick("email")}
                  >
                    <img
                      src={gmail}
                      alt="gmail"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                      }}
                    />
                    <p>Mail</p>
                  </div>

                  {/* SMS option */}
                  <div
                    className="d-flex flex-column align-items-center gap-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleMethodClick("sms")}
                  >
                    <img
                      src={messages}
                      alt="messages"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                      }}
                    />
                    <p>SMS</p>
                  </div>
                </div>
              </div>
              {/* Conditional Inputs */}
              {selectedMethod === "whatsapp" && (
                <div className="mt-3">
                  <label htmlFor="whatsappNumber">WA No :</label>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        id="whatsappNumber"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="form-control"
                        placeholder="WhatsApp Number"
                      />
                    </div>
                    <div className="col-md-6">
                      <button className="post-button">Send</button>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "email" && (
                <div className="mt-3">
                  <label htmlFor="emailAddress">Email Address:</label>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="email"
                        id="emailAddress"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="form-control"
                        placeholder="Email Address"
                      />
                    </div>
                    <div className="col-md-6">
                      <button className="post-button">Send</button>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "sms" && (
                <div className="mt-3">
                  <label htmlFor="smsNumber">Mobile No :</label>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        id="smsNumber"
                        value={smsNumber}
                        onChange={(e) => setSmsNumber(e.target.value)}
                        className="form-control"
                        placeholder="SMS Number"
                      />
                    </div>
                    <div className="col-md-6">
                      <button className="post-button">Send</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="login-button"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      <div
        className="modal fade"
        id="deliveryPartyModalEdit"
        tabIndex="-1"
        aria-labelledby="deliveryPartyModalEditLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deliveryPartyModalEditLabel">
                Edit Delivery Party Details
              </h5>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    GSTIN No.
                  </label>
                  <input
                    type="text"
                    name="gst"
                    className="form-control"
                    value={formData.delivery_party_account.gst}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    PAN No.
                  </label>
                  <input
                    type="text"
                    name="panNo"
                    className="form-control"
                    value={formData.delivery_party_account.panNo}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label mt-3">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.delivery_party_account.name}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label mt-3">
                    Mobile No.
                  </label>
                  <input
                    type="text"
                    name="mobileNo"
                    className="form-control"
                    value={formData.delivery_party_account.mobileNo}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label mt-3">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    className="form-control"
                    value={formData.delivery_party_account.addressLine1}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label mt-3">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    className="form-control"
                    value={formData.delivery_party_account.addressLine2}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label mt-3">
                    Address Line 3
                  </label>
                  <input
                    type="text"
                    name="addressLine3"
                    className="form-control"
                    value={formData.delivery_party_account.addressLine3}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label mt-3">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.delivery_party_account.city}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label mt-3">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={formData.delivery_party_account.state}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label mt-3">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    className="form-control"
                    value={formData.delivery_party_account.pinCode}
                    onChange={handleDeliveryPartyChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="login-button"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="login-button"
                  data-bs-dismiss="modal"
                  onClick={handleConfirmDeliveryParty}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transportation Modal */}
      <div
        className="modal fade"
        id="transportationDetailsModalEdit"
        tabIndex="-1"
        aria-labelledby="transportationDetailsModalEditLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="transportationDetailsModalLabel">
                Edit Transportation Details
              </h5>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    PO. No.
                  </label>
                  <input
                    type="text"
                    name="po_no"
                    className="form-control"
                    value={formData.po_no}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Lr. No.
                  </label>
                  <input
                    type="text"
                    name="lr_no"
                    className="form-control"
                    value={formData.lr_no}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Transport
                  </label>
                  <select
                    className="form-control"
                    name="transportation_account"
                    value={formData.transportation_account}
                    onChange={handleChange}
                  >
                    <option value="">-- Select --</option>
                    {transportations.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label mt-3">
                    Doc. No.
                  </label>
                  <input
                    type="text"
                    name="trans_doc_no"
                    className="form-control"
                    value={`${formData.bill_no.bill_prefix}${formData.bill_no.no}`}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label mt-3">
                    Date
                  </label>
                  <input
                    type="date"
                    name="trans_date"
                    className="form-control"
                    value={formData.trans_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="login-button"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="login-button"
                data-bs-dismiss="modal"
                onClick={handleConfirmDeliveryParty}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaDisplay;
