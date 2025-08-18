import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProductsDisplay = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [hsnError, setHsnError] = useState("");

  const API_URL = import.meta.env.VITE_PRODUCT_URL;

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      setProducts(response.data);
    } catch (error) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
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

  useEffect(() => {
    fetchProducts();
    fetchDropdownData();
  }, []);

  const handleRowClick = (product) => {
    setProductsFormData({
      name: product.name,
      productGroupId: product.productGroupId?._id || "",
      categoryId: product.categoryId?._id || "",
      productTypeId: product.productTypeId?._id || "",
      hsn_sac_code: product.hsn_sac_code,
      sale_rate: product.sale_rate,
      purchase_rate: product.purchase_rate,
      piecesPerBox: product.piecesPerBox,
      unit: product.unit,
      gst: product.gst,
    });
    setSelectedProductId(product._id);
    setShowModal(true);
  };

  const handleProductChange = (e) => {
    setProductsFormData({
      ...productsFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    // Validate HSN/SAC code
    if (productsFormData.hsn_sac_code && !/^[0-9]{6,8}$/.test(productsFormData.hsn_sac_code)) {
      setHsnError("HSN/SAC Code must be 6-8 digits");
      return;
    }
    setHsnError("");

    try {
      const res = await axios.put(
        `${API_URL}/${selectedProductId}`,
        productsFormData
      );
      toast.success(res.data.message);
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedProductId}`);
      toast.success("Product deleted successfully");
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product");
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
              <th>Product</th>
              <th>Sale Rate</th>
              <th>Purchase Rate</th>
              <th>Pieces per Box</th>
              <th>Group</th>
              <th>Category</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod._id} onClick={() => handleRowClick(prod)}>
                <td>{prod.name}</td>
                <td>{prod.sale_rate}</td>
                <td>{prod.purchase_rate}</td>
                <td>{prod.piecesPerBox || "-"}</td>
                <td>{prod.productGroupId?.name || "-"}</td>
                <td>{prod.categoryId?.name || "-"}</td>
                <td>{prod.productTypeId?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product</h5>
              </div>
              <div className="modal-body">
                <div className="row mt-3">
                  <div className="col-12">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={productsFormData.name}
                      onChange={handleProductChange}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-lg-4">
                    <select
                      className="form-control"
                      name="productGroupId"
                      value={productsFormData.productGroupId}
                      onChange={handleProductChange}
                    >
                      <option value="">Select Product Group</option>
                      {productGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-4">
                    <select
                      className="form-control"
                      name="categoryId"
                      value={productsFormData.categoryId}
                      onChange={handleProductChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-4">
                    <select
                      className="form-control"
                      name="productTypeId"
                      value={productsFormData.productTypeId}
                      onChange={handleProductChange}
                    >
                      <option value="">Select Type</option>
                      {types.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-lg-4">
                    <label className="form-label">HSN / SAC Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      className="form-control no-spinner"
                      name="hsn_sac_code"
                      value={productsFormData.hsn_sac_code}
                      onChange={(e) => {
                        if (/^\d{0,8}$/.test(e.target.value)) {
                          handleProductChange(e);
                          setHsnError("");
                        }
                      }}
                    />
                    {hsnError && <div className="text-danger small mt-1">{hsnError}</div>}
                  </div>
                  <div className="col-lg-4">
                    <label className="form-label">GST (in %)</label>
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
                    <label className="form-label">Pieces per Box</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      name="piecesPerBox"
                      value={productsFormData.piecesPerBox}
                      onChange={handleProductChange}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-lg-4">
                    <label className="form-label">Sale Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="sale_rate"
                      value={productsFormData.sale_rate}
                      onChange={handleProductChange}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val) {
                          handleProductChange({
                            target: {
                              name: "sale_rate",
                              value: parseFloat(val).toFixed(2),
                            },
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label">Purchase Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="purchase_rate"
                      value={productsFormData.purchase_rate}
                      onChange={handleProductChange}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val) {
                          handleProductChange({
                            target: {
                              name: "purchase_rate",
                              value: parseFloat(val).toFixed(2),
                            },
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-control"
                      name="unit"
                      value={productsFormData.unit}
                      onChange={handleProductChange}
                      placeholder="(e.g. Nos., MM, kg)"
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

export default ProductsDisplay;
