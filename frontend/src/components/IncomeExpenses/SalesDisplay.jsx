import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { generateInvoicePDF } from "../../utils/generateInvoicePDF";

const SalesInvoicesDisplay = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [transportations, setTransportations] = useState([]);
  const [products, setProducts] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const [formData, setFormData] = useState({
    cash_debit: "Debit Memo",
    bill_date: new Date().toISOString().split("T")[0],
    bill_no: { bill_prefix: "Invoice ", no: "" },

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
        productGroup: "",
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
      const res = await axios.get(`${API_URL}/sales-invoice`);
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
      const transportationRes = await axios.get(`${API_URL}/transportation`);
      const productRes = await axios.get(`${PRODUCT_URL}/`);
      const productGroupRes = await axios.get(`${PRODUCT_URL}/product-group`);
      setTransportations(transportationRes.data.data);
      setProducts(productRes.data);
      setProductGroups(productGroupRes.data);
    } catch (error) {
      console.error("Error fetching meta data:", error);
    }
  };

  const fetchProductsByGroup = async (groupId) => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/group/${groupId}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products by group:", error);
      toast.error("Failed to fetch products for selected group");
    }
  };

  useEffect(() => {
    fetchInvoices();
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

  const handleRowClick = async (invoice) => {
    // Process products to set productGroup based on product information
    const processedProducts = await Promise.all(
      invoice.products.map(async (prod) => {
        if (prod.product && prod.product.productGroupId) {
          // If product has group info, set it
          return {
            ...prod,
            productGroup:
              prod.product.productGroupId._id || prod.product.productGroupId,
          };
        } else if (prod.product) {
          // Try to find the product and get its group
          try {
            const productResponse = await axios.get(
              `${PRODUCT_URL}/${prod.product._id || prod.product}`
            );
            if (productResponse.data && productResponse.data.productGroupId) {
              return {
                ...prod,
                productGroup:
                  productResponse.data.productGroupId._id ||
                  productResponse.data.productGroupId,
              };
            }
          } catch (error) {
            console.error("Error fetching product details:", error);
          }
        }
        return prod;
      })
    );

    setFormData({
      ...invoice,
      products: processedProducts,
      bill_date: new Date(invoice.bill_date).toISOString().split("T")[0],
      trans_date: invoice.trans_date
        ? new Date(invoice.trans_date).toISOString().split("T")[0]
        : "",
    });
    setSelectedInvoiceId(invoice._id);
    setShowModal(true);

    // Fetch products for all product groups in the invoice
    const uniqueGroups = [
      ...new Set(processedProducts.map((p) => p.productGroup).filter(Boolean)),
    ];
    if (uniqueGroups.length > 0) {
      // Fetch products for the first group to populate the dropdown
      await fetchProductsByGroup(uniqueGroups[0]);
    }
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
    if (e) e.preventDefault();

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

    try {
      await axios.put(`${API_URL}/sales-invoice/${selectedInvoiceId}`, {
        salesInvoiceDetails: formData,
      });
      toast.success("Invoice updated!");
      fetchInvoices();
      setShowModal(false);
      return true; // Return success status
    } catch (err) {
      console.error(err);
      toast.error("Failed to update invoice" + err.message);
      return false; // Return failure status
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/sales-invoice/${selectedInvoiceId}`);
      toast.success("Invoice deleted!");
      fetchInvoices();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice");
    }
  };

  const handleSaveAndPrint = async () => {
    try {
      // First save the invoice
      const saveSuccess = await handleEdit();

      // Then request backend to generate & store PDF and open its URL
      if (saveSuccess && formData) {
        try {
          const resp = await axios.get(
            `http://localhost:5000/api/pdf/generate/${selectedInvoiceId}`,
            {
              withCredentials: true,
            }
          );
          if (resp?.data?.success && resp?.data?.url) {
            window.open(resp.data.url, "_blank");
            toast.success("Invoice saved and PDF ready!");
          } else {
            throw new Error("Invalid response from server");
          }
        } catch (error) {
          console.error("Error generating PDF URL:", error);
          toast.error("Invoice saved but PDF generation failed");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save invoice or generate PDF");
    }
  };

  const handleProductChange = (e, index) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];

    if (name === "productGroup") {
      // Clear the selected product and related fields when group changes
      updatedProducts[index] = {
        ...updatedProducts[index],
        productGroup: value,
        product: "",
        unit: "",
        rate: 0,
        igst: null,
        cgst: null,
        sgst: null,
      };

      // Fetch products for the selected group
      if (value) {
        fetchProductsByGroup(value);
      }

      setFormData((prev) => ({
        ...prev,
        products: updatedProducts,
      }));
      return;
    }

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
          productGroup: "",
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
      lastProduct.productGroup &&
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

  const handleCopyDeliveryFromCompany = () => {
    try {
      const company = formData.sales_account || {};
      const updatedParty = {
        gst: company.gstin || "",
        panNo: company.panNo || "",
        name: company.companyName || "",
        addressLine1: company.addressLine1 || "",
        addressLine2: company.addressLine2 || "",
        addressLine3: company.addressLine3 || "",
        city: company.city || "",
        state: company.state || "",
        pinCode: company.pinCode || "",
        mobileNo: company.mobileNo || "",
      };
      setFormData((prev) => ({
        ...prev,
        delivery_party_account: updatedParty,
      }));
      toast.success("Delivery Party set from Company Details");
    } catch (err) {
      toast.error("Failed to copy company details");
    }
  };

  const handleConfirmDeliveryParty = () => {};

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

              <div className="mt-3 proforma-table-container">
                <table
                  className="modern-table proforma-table text-center"
                  style={{
                    borderSpacing: "0 12px",
                    borderCollapse: "separate",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Product Group</th>
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
                        <td>
                          <select
                            name="productGroup"
                            className="form-control"
                            value={prod.productGroup || ""}
                            onChange={(e) => handleProductChange(e, idx)}
                          >
                            <option value="">-- Select Product Group --</option>
                            {productGroups.map((group) => (
                              <option key={group._id} value={group._id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            name="product"
                            className="form-control"
                            value={prod.product?._id || prod.product || ""}
                            onChange={(e) => handleProductChange(e, idx)}
                            disabled={!prod.productGroup}
                          >
                            <option value="">-- Select Product --</option>
                            {products
                              .filter(
                                (p) =>
                                  !formData.products.some(
                                    (fp, i) =>
                                      (fp.product?._id || fp.product) ===
                                        p._id && i !== idx
                                  )
                              )
                              .map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name}
                                </option>
                              ))}
                          </select>
                        </td>

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
                  className="post-button"
                  onClick={() => {
                    try {
                      // Generate PDF without saving
                      const pdfData = {
                        ...formData,
                        products: formData.products.map((product) => {
                          if (
                            product.product &&
                            typeof product.product === "string"
                          ) {
                            const fullProduct = products.find(
                              (p) => p._id === product.product
                            );
                            return {
                              ...product,
                              product: fullProduct || product.product,
                            };
                          }
                          return product;
                        }),
                      };
                      generateInvoicePDF(pdfData);
                      toast.success("PDF generated successfully!");
                    } catch (error) {
                      console.error("Error generating PDF:", error);
                      toast.error("Failed to generate PDF");
                    }
                  }}
                >
                  Generate PDF
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
                  onClick={handleSaveAndPrint}
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
              <button
                type="button"
                className="post-button"
                onClick={handleCopyDeliveryFromCompany}
                title="Copy company account details to Delivery Party"
              >
                Same as Company Details
              </button>
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

export default SalesInvoicesDisplay;
