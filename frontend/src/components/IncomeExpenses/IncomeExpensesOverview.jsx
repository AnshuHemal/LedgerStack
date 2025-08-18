import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SalesDisplay from "./SalesDisplay";
import PurchaseDisplay from "./PurchaseDisplay";
import { useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { set } from "mongoose";

const IncomeExpensesOverview = () => {
  const [selectedTab, setSelectedTab] = useState("sales-display");
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [showSalesAddModal, setShowSalesAddModal] = useState(false);
  const [showPurchaseAddModal, setShowPurchaseAddModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const INCOME_EXPENSES_URL = import.meta.env.VITE_INCOME_EXPENSES_URL;
  const ACCOUNT_URL = import.meta.env.VITE_ACCOUNT_URL;
  const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL;

  axios.defaults.withCredentials = true;

  const [form, setForm] = useState({
    cash_debit: "Debit Memo",
    bill_date: new Date().toISOString().split("T")[0],
    bill_no: { bill_prefix: "Invoice ", no: 0 },
    
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
        total_amount: 0,
      },
    ],
    total_products_amount: 0,
    freight_amount: 0,
    final_amount: 0,
    remarks: "",
  });

  const [purchaseFormData, setPurchaseFormData] = useState({
    cash_debit: "Debit Memo",
    voucher_date: new Date().toISOString().split("T")[0],
    voucher_no: 0,
    bill_date: new Date().toISOString().split("T")[0],
    bill_no: 0,
    
    purchase_account: "",
    products: [
      {
        productGroup: "",
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

  const totalBoxes = form.products.reduce(
    (acc, prod) => acc + Number(prod.boxes || 0),
    0
  );
  const totalQuantity = form.products.reduce(
    (acc, prod) => acc + Number(prod.boxes || 0) * Number(prod.no_of_pcs || 0),
    0
  );
  form.final_amount =
    parseFloat(form.total_products_amount) + parseFloat(form.freight_amount);

  const totalQuantityForPurchase = purchaseFormData.products.reduce(
    (acc, prod) => acc + Number(prod.quantity || 0),
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountRes = await axios.get(`${ACCOUNT_URL}/account-master`);
        const transportationRes = await axios.get(
          `${INCOME_EXPENSES_URL}/transportation`
        );
        const productRes = await axios.get(`${PRODUCT_URL}/`);
        setAccounts(accountRes.data);
        setProducts(productRes.data);
        setTransportations(transportationRes.data.data);

        const salesBillRes = await axios.get(
          `${INCOME_EXPENSES_URL}/sales-bill`
        );
        const currentBillNo = salesBillRes.data.data.no;
        setForm((prev) => ({
          ...prev,
          bill_no: { ...prev.bill_no, no: parseInt(currentBillNo) },
          trans_doc_no: `Invoice ${currentBillNo}`,
        }));
      } catch (error) {
        console.error("Error fetching accounts/products:", error);
      }
    };

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const accountRes = await axios.get(`${ACCOUNT_URL}/account-master`);
      const transportationRes = await axios.get(
        `${INCOME_EXPENSES_URL}/transportation`
      );
      const productRes = await axios.get(`${PRODUCT_URL}/`);
      const productGroupRes = await axios.get(`${PRODUCT_URL}/product-group`);
      setAccounts(accountRes.data);
      setProducts(productRes.data);
      setProductGroups(productGroupRes.data);
      setTransportations(transportationRes.data.data);

      const salesBillRes = await axios.get(`${INCOME_EXPENSES_URL}/sales-bill`);
      const currentBillNo = salesBillRes.data.data.no;
      setForm((prev) => ({
        ...prev,
        bill_no: { ...prev.bill_no, no: parseInt(currentBillNo) },
        trans_doc_no: `Invoice ${currentBillNo}`,
      }));
    } catch (error) {
      console.error("Error fetching accounts/products:", error);
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
    const totalAmount = form.products.reduce((sum, prod) => {
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

    setForm((prev) => ({
      ...prev,
      total_products_amount: parseFloat(totalAmount.toFixed(2)),
    }));
  }, [form.products]);

  useEffect(() => {
    const totalAmount = purchaseFormData.products.reduce((sum, prod) => {
      const quantity = parseFloat(prod.quantity) || 0;
      const rate = parseFloat(prod.rate) || 0;
      const base = rate * quantity;
      const igst = prod.igst !== null ? parseFloat(prod.igst) || 0 : 0;
      const cgst = prod.cgst !== null ? parseFloat(prod.cgst) || 0 : 0;
      const sgst = prod.sgst !== null ? parseFloat(prod.sgst) || 0 : 0;
      const gstPercentage = igst > 0 ? igst : cgst + sgst;
      const gstAmount = base * (gstPercentage / 100);
      const finalAmount = base + gstAmount;
      return sum + finalAmount;
    }, 0);
    setPurchaseFormData((prev) => ({
      ...prev,
      final_amount: parseFloat(totalAmount.toFixed(2)),
    }));
  }, [purchaseFormData.products]);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "bill_no") {
      setForm((prev) => ({
        ...prev,
        bill_no: value,
        trans_doc_no: value,
      }));
    } else if (name === "bill_no.no") {
      setForm((prev) => {
        const newBillNo = { ...prev.bill_no, no: value };
        return {
          ...prev,
          bill_no: newBillNo,
          trans_doc_no: `${newBillNo.bill_prefix}${value}`,
        };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    setPurchaseFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeliveryPartyChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      delivery_party_account: {
        ...prev.delivery_party_account,
        [name]: value,
      },
    }));
  };

  const handleProductChange = (e, index) => {
    const { name, value } = e.target;
    const updatedProducts = [...form.products];

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

    setForm((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const handlePurchaseProductChange = (e, index) => {
    const { name, value } = e.target;
    const updatedProducts = [...purchaseFormData.products];

    if (name === "product") {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct) {
        const gst = selectedProduct.gst || 0;
        const halfGST = gst / 2;

        updatedProducts[index] = {
          ...updatedProducts[index],
          product: selectedProduct._id,
          unit: selectedProduct.unit || "",
          rate: selectedProduct.purchase_rate || 0,
          igst: selectedProduct.gst_type === "IGST" ? gst : null,
          cgst: selectedProduct.gst_type === "CGST+SGST" ? halfGST : null,
          sgst: selectedProduct.gst_type === "CGST+SGST" ? halfGST : null,
        };
      }
    } else {
      updatedProducts[index][name] = value;
    }
    setPurchaseFormData((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const handleAddProductRow = () => {
    setForm((prev) => ({
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

  const handleAddProductRowForPurchase = () => {
    setPurchaseFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          productGroup: "",
          product: "",
          quantity: "",
          unit: "",
          rate: "",
          igst: null,
          cgst: null,
          sgst: null,
        },
      ],
    }));
  };

  const isLastProductRowValid = () => {
    const lastProduct = form.products[form.products.length - 1];
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

  const isLastProductRowValidForPurchase = () => {
    const lastProduct =
      purchaseFormData.products[purchaseFormData.products.length - 1];
    return (
      lastProduct.productGroup &&
      lastProduct.product &&
      lastProduct.quantity &&
      lastProduct.unit &&
      lastProduct.rate
    );
  };

  const handleRemoveProductRow = (indexToRemove) => {
    if (form.products.length === 1) return;

    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleRemovePurchaseProductRow = (indexToRemove) => {
    if (purchaseFormData.products.length === 1) return;

    setPurchaseFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleConfirmDeliveryParty = () => {};

  const handlePurchaseSubmit = async (e) => {
    purchaseFormData.voucher_no = parseInt(purchaseFormData.voucher_no);
    purchaseFormData.bill_no = parseInt(purchaseFormData.bill_no);
    let final_amount = 0;
    purchaseFormData.products.map((prod, idx) => {
      if (prod.cgst == null) {
        prod.cgst = 0;
      }
      if (prod.sgst == null) {
        prod.sgst = 0;
      }
      if (prod.igst == null) {
        prod.igst = 0;
      }
      prod.quantity = parseFloat(prod.quantity);
      prod.discount = parseFloat(prod.discount);
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
    purchaseFormData.final_amount = final_amount;
    purchaseFormData.voucher_date = new Date(
      purchaseFormData.voucher_date
    ).toLocaleDateString();
    purchaseFormData.bill_date = new Date(
      purchaseFormData.bill_date
    ).toLocaleDateString();
    e.preventDefault();
    try {
      const res = await axios.post(
        `${INCOME_EXPENSES_URL}/purchase-invoice`,
        purchaseFormData,
        {
          withCredentials: true,
        }
      );
      toast.success("Purchase Invoice Saved: " + res.data.invoice._id);
      setShowPurchaseAddModal(false);
    } catch (error) {
      console.error("Error saving invoice:", error.message);
      toast.error("Failed to save invoice");
    }
  };

  const handleSubmit = async (e) => {
    form.freight_amount = parseFloat(form.freight_amount);
    form.bill_no.no = parseInt(form.bill_no.no);
    let final_amount = 0;
    form.products.map((prod, idx) => {
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
    form.total_products_amount = final_amount;
    form.trans_doc_no = form.bill_no.bill_prefix + "" + form.bill_no.no;
    form.trans_date = new Date(form.trans_date).toLocaleDateString();
    form.bill_date = new Date(form.bill_date).toLocaleDateString();
    e.preventDefault();

    const updatedBillNo = form.bill_no.no + 1;
    try {
      const res = await axios.post(
        `${INCOME_EXPENSES_URL}/sales-invoice`,
        form,
        {
          withCredentials: true,
        }
      );
      await axios.put(`${INCOME_EXPENSES_URL}/sales-bill`, {
        no: updatedBillNo,
      });
      toast.success("Invoice Saved: " + res.data.invoice._id);
      setForm({
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
            total_amount: 0,
          },
        ],
        total_products_amount: 0,
        freight_amount: 0,
        final_amount: 0,
        remarks: "",
      });
      setShowSalesAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving invoice:", error.message);
      toast.error("Failed to save invoice");
    }
  };

  const renderContent = () => {
    if (selectedTab === "sales-display") {
      return <SalesDisplay />;
    }
    if (selectedTab === "purchase-display") {
      return <PurchaseDisplay />;
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
            Income & Expenses
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Streamline your financial flow with ease.
          </p>
        </div>

        <div className="me-3 d-flex text-center align-items-center gap-2">
          <button
            className="login-button"
            onClick={() => setShowPurchaseAddModal(true)}
          >
            + Purchase Invoice
          </button>
          <button
            className="login-button"
            onClick={() => setShowSalesAddModal(true)}
          >
            + Sales Invoice
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs d-flex gap-3">
        <button
          className={`nav-tab ${
            selectedTab === "sales-display" ? "active" : ""
          }`}
          onClick={() => {
            handleTabClick("sales-display");
          }}
        >
          Sales Display
        </button>
        <button
          className={`nav-tab ${
            selectedTab === "purchase-display" ? "active" : ""
          }`}
          onClick={() => handleTabClick("purchase-display")}
        >
          Purchase Display
        </button>
      </div>

      {renderContent()}

      {/* Modal for adding Sales Invoice */}
      <div
        className={`modal fade ${showSalesAddModal ? "show" : ""}`}
        style={{ display: showSalesAddModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Sales Invoice
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
                    value={form.cash_debit}
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
                    value={form.bill_date}
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
                      {form.bill_no.bill_prefix}
                    </span>

                    {/* Number (user-editable part) */}
                    <input
                      type="text"
                      name="no"
                      className="form-control"
                      placeholder="Enter number"
                      value={form.bill_no.no}
                      onChange={(e) =>
                        setForm((prev) => ({
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
                  <select
                    className="form-control"
                    name="sales_account"
                    value={form.sales_account}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Account --</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="name" className="form-label">
                    Delivery Party
                  </label>
                  <input
                    className="form-control"
                    name="delivery_party_account"
                    value={form.delivery_party_account.name}
                    onClick={() => {
                      const modal = new bootstrap.Modal(
                        document.getElementById("deliveryPartyModal")
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
                        (trans) => trans._id === form.transportation_account
                      )?.name || ""
                    }
                    onClick={() => {
                      const modal = new bootstrap.Modal(
                        document.getElementById("transportationDetailsModal")
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
                    {form.products.map((prod, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            name="productGroup"
                            className="form-control"
                            value={prod.productGroup}
                                                         onChange={(e) => {
                               const updatedProducts = [...form.products];
                               updatedProducts[idx] = {
                                 ...updatedProducts[idx],
                                 productGroup: e.target.value,
                                 product: "",
                                 unit: "",
                                 rate: 0,
                                 igst: null,
                                 cgst: null,
                                 sgst: null,
                               };
                               setForm((prev) => ({
                                 ...prev,
                                 products: updatedProducts,
                               }));
                               
                               // Fetch products for the selected group
                               if (e.target.value) {
                                 fetchProductsByGroup(e.target.value);
                               }
                             }}
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
                            value={prod.product}
                            onChange={(e) => handleProductChange(e, idx)}
                            disabled={!prod.productGroup}
                          >
                            <option value="">-- Select Product --</option>
                            {products
                              .filter(
                                (p) =>
                                  !form.products.some(
                                    (fp, i) => fp.product === p._id && i !== idx
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
                          {form.products.length > 1 && idx !== 0 && (
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
                      <td>{form.total_products_amount.toFixed(2)}</td>
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
                          value={form.freight_amount}
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
                      <td>{parseFloat(form.final_amount).toFixed(2)}</td>
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
                  value={form.remarks}
                  onChange={handleChange}
                />
              </div>
              <div className="d-flex gap-3 align-items-center">
                <button
                  type="button"
                  className="post-button"
                  onClick={() => {
                    setShowSalesAddModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={handleSubmit}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={handleSubmit}
                >
                  Save & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      <div
        className="modal fade"
        id="deliveryPartyModal"
        tabIndex="-1"
        aria-labelledby="deliveryPartyModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deliveryPartyModalLabel">
                Delivery Party Detail
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
                    value={form.delivery_party_account.gst}
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
                    value={form.delivery_party_account.panNo}
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
                    value={form.delivery_party_account.name}
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
                    value={form.delivery_party_account.mobileNo}
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
                    value={form.delivery_party_account.addressLine1}
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
                    value={form.delivery_party_account.addressLine2}
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
                    value={form.delivery_party_account.addressLine3}
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
                    value={form.delivery_party_account.city}
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
                    value={form.delivery_party_account.state}
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
                    value={form.delivery_party_account.pinCode}
                    onChange={handleDeliveryPartyChange}
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

      {/* Transportation Modal */}
      <div
        className="modal fade"
        id="transportationDetailsModal"
        tabIndex="-1"
        aria-labelledby="transportationDetailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="transportationDetailsModalLabel">
                Transportation Details
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
                    value={form.po_no}
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
                    value={form.lr_no}
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
                    value={form.transportation_account}
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
                    value={`${form.bill_no.bill_prefix}${form.bill_no.no}`}
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
                    value={form.trans_date}
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

      {/* Add Purchase Invoice */}
      <div
        className={`modal fade ${showPurchaseAddModal ? "show" : ""}`}
        style={{ display: showPurchaseAddModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Purchase Invoice
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
                    onChange={handlePurchaseChange}
                    value={purchaseFormData.cash_debit}
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
                    value={purchaseFormData.voucher_date}
                    onChange={handlePurchaseChange}
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
                    value={purchaseFormData.voucher_no}
                    onChange={handlePurchaseChange}
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
                    value={purchaseFormData.bill_date}
                    onChange={handlePurchaseChange}
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
                    value={purchaseFormData.bill_no}
                    onChange={handlePurchaseChange}
                  />
                </div>
                
              </div>
              <div className="row mt-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Party Account
                  </label>
                  <select
                    className="form-control"
                    name="purchase_account"
                    value={purchaseFormData.purchase_account}
                    onChange={handlePurchaseChange}
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
                      <th>Product Group</th>
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
                    {purchaseFormData.products.map((prod, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            name="productGroup"
                            className="form-control"
                            value={prod.productGroup}
                                                         onChange={(e) => {
                               const updatedProducts = [...purchaseFormData.products];
                               updatedProducts[idx] = {
                                 ...updatedProducts[idx],
                                 productGroup: e.target.value,
                                 product: "",
                                 unit: "",
                                 rate: 0,
                                 igst: null,
                                 cgst: null,
                                 sgst: null,
                               };
                               setPurchaseFormData((prev) => ({
                                 ...prev,
                                 products: updatedProducts,
                               }));
                               
                               // Fetch products for the selected group
                               if (e.target.value) {
                                 fetchProductsByGroup(e.target.value);
                               }
                             }}
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
                            value={prod.product}
                            onChange={(e) =>
                              handlePurchaseProductChange(e, idx)
                            }
                            disabled={!prod.productGroup}
                          >
                            <option value="">-- Select Product --</option>
                            {products
                              .filter(
                                (p) =>
                                  !purchaseFormData.products.some(
                                    (fp, i) => fp.product === p._id && i !== idx
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
                            name="quantity"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="text"
                            value={prod.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d{0,8}$/.test(value)) {
                                handlePurchaseProductChange(e, idx);
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
                            onChange={(e) =>
                              handlePurchaseProductChange(e, idx)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control text-end"
                            name="rate"
                            value={prod.rate}
                            onChange={(e) =>
                              handlePurchaseProductChange(e, idx)
                            }
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
                                handlePurchaseProductChange(e, idx);
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
                                handlePurchaseProductChange(e, idx);
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
                                handlePurchaseProductChange(e, idx);
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
                          {purchaseFormData.products.length > 1 &&
                            idx !== 0 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  handleRemovePurchaseProductRow(idx)
                                }
                              >
                                ✕
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td>{totalQuantityForPurchase.toFixed(2)}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{purchaseFormData.final_amount.toFixed(2)}</td>
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
                      <td>
                        {parseFloat(purchaseFormData.final_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {isLastProductRowValidForPurchase() && (
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      className="post-button"
                      onClick={handleAddProductRowForPurchase}
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
                  value={purchaseFormData.remarks}
                  onChange={handlePurchaseChange}
                />
              </div>
              <div className="d-flex gap-3 align-items-center">
                <button
                  type="button"
                  className="post-button"
                  onClick={() => {
                    setShowPurchaseAddModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={handlePurchaseSubmit}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={handlePurchaseSubmit}
                >
                  Save & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IncomeExpensesOverview;
