import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductsDisplay from "./ProductsDisplay";
import ProductsGroup from "./ProductsGroup";
import axios from "axios";
import toast from "react-hot-toast";
import ProductsCategory from "./ProductsCategory";
import ProductsType from "./ProductsType";

const ProductsOverview = ({ handleLinkClick }) => {
  const [selectedTab, setSelectedTab] = useState("products");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
  });
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [productTypeFormData, setProductTypeFormData] = useState({
    name: "",
  });

  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productsFormData, setProductsFormData] = useState({
    name: "",
    productGroupId: "",
    categoryId: "",
    productTypeId: "",
    hsn_sac_code: "",
    sale_rate: 0.0,
    purchase_rate: 0.0,
    piecesPerBox: "",
    unit: "",
    gst: "",
  });
  const [productGroups, setProductGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState("");
  const [hsnError, setHsnError] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_PRODUCT_URL;

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [groups, categories, types] = await Promise.all([
          axios.get(`${API_URL}/product-group`),
          axios.get(`${API_URL}/product-category`),
          axios.get(`${API_URL}/product-type`),
        ]);

        setProductGroups(groups.data);
        setCategories(categories.data);
        setTypes(types.data);
      } catch (err) {
        toast.error("Failed to fetch product meta data" + err.message);
      }
    };

    fetchMeta();
  }, []);

  const fetchData = async () => {
    try {
      const [groups, categories, types] = await Promise.all([
        axios.get(`${API_URL}/product-group`),
        axios.get(`${API_URL}/product-category`),
        axios.get(`${API_URL}/product-type`),
      ]);

      setProductGroups(groups.data);
      setCategories(categories.data);
      setTypes(types.data);
    } catch (err) {
      toast.error("Failed to fetch product meta data" + err.message);
    }
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const renderContent = () => {
    if (selectedTab === "products") {
      return (
        <div>
          <ProductsDisplay />
        </div>
      );
    }
    if (selectedTab === "productGroup") {
      return (
        <div>
          <ProductsGroup />
        </div>
      );
    }
    if (selectedTab === "productType") {
      return (
        <div>
          <ProductsType />
        </div>
      );
    }
    if (selectedTab === "productCategory") {
      return (
        <div>
          <ProductsCategory />
        </div>
      );
    }
  };

  const handleAddProduct = async () => {
    // Validate HSN/SAC code
    if (productsFormData.hsn_sac_code && !/^[0-9]{6,8}$/.test(productsFormData.hsn_sac_code)) {
      setHsnError("HSN/SAC Code must be 6-8 digits");
      return;
    }
    setHsnError("");

    try {
      await axios.post(`${API_URL}/`, productsFormData);
      toast.success("Product added successfully");
      setProductsFormData({
        name: "",
        productGroupId: "",
        categoryId: "",
        productTypeId: "",
        hsn_sac_code: "",
        sale_rate: "",
        purchase_rate: "",
        piecesPerBox: "",
        unit: "",
        gst: "",
      });
      setShowProductsModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    }
  };

  const handleAddProductGroup = async () => {
    try {
      await axios.post(`${API_URL}/product-group`, formData);

      toast.success(`${formData.name} Group added..`);
      setFormData({ name: "" });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(
        err.response ? err.response.data.message : "Something went wrong"
      );
    }
  };

  const handleAddProductType = async () => {
    try {
      const API_URL = import.meta.env.VITE_PRODUCT_URL;
      await axios.post(`${API_URL}/product-type`, productTypeFormData);

      toast.success(`${productTypeFormData.name} Type added..`);
      setProductTypeFormData({ name: "" });
      setShowProductTypeModal(false);
      fetchData();
    } catch (err) {
      setError(
        err.response ? err.response.data.message : "Something went wrong"
      );
    }
  };

  const handleAddProductCategory = async () => {
    try {
      const API_URL = import.meta.env.VITE_PRODUCT_URL;
      await axios.post(`${API_URL}/product-category`, categoryFormData);

      toast.success(`${categoryFormData.name} Category added..`);
      setCategoryFormData({ name: "" });
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      setError(
        err.response ? err.response.data.message : "Something went wrong"
      );
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (e) => {
    setCategoryFormData({
      ...categoryFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductTypeChange = (e) => {
    setProductTypeFormData({
      ...productTypeFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductChange = (e) => {
    setProductsFormData({
      ...productsFormData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="child__container d-flex justify-content-between align-items-start">
        <div className="ms-lg-2">
          <h5
            className="display-6"
            style={{ fontSize: "25px", fontWeight: "500" }}
          >
            Product Master
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Manages your inventory settings and preferences.
          </p>
        </div>

        <div className="me-3 d-flex text-center align-items-center gap-2">
          <button
            className="login-button"
            onClick={() => setShowCategoryModal(true)}
          >
            + Category
          </button>
          <button
            className="login-button"
            onClick={() => setShowProductTypeModal(true)}
          >
            + Product Type
          </button>
          <button className="login-button" onClick={() => setShowModal(true)}>
            + Product Group
          </button>
          <button
            className="login-button"
            onClick={() => setShowProductsModal(true)}
          >
            + Product
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs d-flex gap-3">
        <button
          className={`nav-tab ${selectedTab === "products" ? "active" : ""}`}
          onClick={() => handleTabClick("products")}
        >
          Products
        </button>
        <button
          className={`nav-tab ${
            selectedTab === "productGroup" ? "active" : ""
          }`}
          onClick={() => handleTabClick("productGroup")}
        >
          Product Group
        </button>
        <button
          className={`nav-tab ${selectedTab === "productType" ? "active" : ""}`}
          onClick={() => handleTabClick("productType")}
        >
          Product Type
        </button>
        <button
          className={`nav-tab ${
            selectedTab === "productCategory" ? "active" : ""
          }`}
          onClick={() => handleTabClick("productCategory")}
        >
          Category
        </button>
      </div>

      {renderContent()}

      {/* Modal for adding Product */}
      <div
        className={`modal fade ${showProductsModal ? "show" : ""}`}
        style={{ display: showProductsModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Product
              </h5>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="row mt-3">
                <div className="col-12">
                  <label htmlFor="name" className="form-label">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={productsFormData.name}
                    onChange={handleProductChange}
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-lg-4">
                  <select
                    className="select-dropdown"
                    name="productGroupId"
                    value={productsFormData.productGroupId}
                    onChange={handleProductChange}
                  >
                    <option value="" disabled>
                      Select Product Group
                    </option>
                    {productGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-4">
                  <select
                    className="select-dropdown"
                    name="categoryId"
                    value={productsFormData.categoryId}
                    onChange={handleProductChange}
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-4">
                  <select
                    className="select-dropdown"
                    name="productTypeId"
                    value={productsFormData.productTypeId}
                    onChange={handleProductChange}
                  >
                    <option value="" disabled>
                      Select Product Type
                    </option>
                    {types.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-lg-4">
                  <label htmlFor="name" className="form-label">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    className="form-control no-spinner"
                    id="hsn_sac_code"
                    name="hsn_sac_code"
                    value={productsFormData.hsn_sac_code}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,8}$/.test(value)) {
                        handleProductChange(e);
                        setHsnError("");
                      }
                    }}
                  />
                  {hsnError && <div className="text-danger small mt-1">{hsnError}</div>}
                </div>
                <div className="col-lg-4">
                  <label htmlFor="name" className="form-label">
                    GST (in %)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    className="form-control no-spinner"
                    id="gst"
                    name="gst"
                    value={productsFormData.gst}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,8}$/.test(value)) {
                        handleProductChange(e);
                      }
                    }}
                  />
                </div>
                <div className="col-lg-4">
                  <label htmlFor="piecesPerBox" className="form-label">
                    Pieces per Box
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    id="piecesPerBox"
                    name="piecesPerBox"
                    value={productsFormData.piecesPerBox}
                    onChange={handleProductChange}
                    required
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-lg-4">
                  <label htmlFor="sale_rate" className="form-label">
                    Sale Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="sale_rate"
                    name="sale_rate"
                    value={productsFormData.sale_rate}
                    onChange={handleProductChange}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const formatted = parseFloat(value).toFixed(2);
                        handleProductChange({
                          target: {
                            name: "sale_rate",
                            value: formatted,
                          },
                        });
                      }
                    }}
                  />
                </div>

                <div className="col-lg-4">
                  <label htmlFor="purchase_rate" className="form-label">
                    Purchase Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="purchase_rate"
                    name="purchase_rate"
                    value={productsFormData.purchase_rate}
                    onChange={handleProductChange}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const formatted = parseFloat(value).toFixed(2);
                        handleProductChange({
                          target: {
                            name: "purchase_rate",
                            value: formatted,
                          },
                        });
                      }
                    }}
                  />
                </div>

                <div className="col-lg-4">
                  <label htmlFor="name" className="form-label">
                    Unit
                  </label>
                  <input
                    type="string"
                    maxLength={8}
                    className="form-control"
                    id="name"
                    placeholder="(e.g. Nos., MM, kg)"
                    name="unit"
                    value={productsFormData.unit}
                    onChange={handleProductChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="login-button"
                onClick={() => {
                  setShowProductsModal(false);
                  setProductsFormData({
                    name: "",
                    productGroupId: "",
                    categoryId: "",
                    productTypeId: "",
                    hsn_sac_code: "",
                    sale_rate: 0.0,
                    purchase_rate: 0.0,
                    piecesPerBox: "",
                    unit: "",
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="login-button"
                onClick={handleAddProduct}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding Product Group */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Product Group
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
                onClick={handleAddProductGroup}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding Product Category */}
      <div
        className={`modal fade ${showCategoryModal ? "show" : ""}`}
        style={{ display: showCategoryModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Product Category
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
                  value={categoryFormData.name}
                  onChange={handleCategoryChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="login-button"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="login-button"
                onClick={handleAddProductCategory}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding Product Type */}
      <div
        className={`modal fade ${showProductTypeModal ? "show" : ""}`}
        style={{ display: showProductTypeModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Product Type
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
                  value={productTypeFormData.name}
                  onChange={handleProductTypeChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="login-button"
                onClick={() => {
                  setShowProductTypeModal(false);
                  setProductTypeFormData({ name: "" });
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="login-button"
                onClick={handleAddProductType}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsOverview;
