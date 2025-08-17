import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const WarehouseOverview = () => {
  const [skus, setSkus] = useState([]);
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subparts, setSubparts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [skuFormData, setSkuFormData] = useState({
    group: "",
    product: "",
    subparts: [],
    location: "",
    quantity: 0,
    unit: "pieces",
    customUnit: "",
  });

  const PRODUCT_URL = "http://localhost:5000/api/product";
  const SUBPARTS_URL = "http://localhost:5000/api/subparts";
  const WAREHOUSE_URL = "http://localhost:5000/api/warehouse";

  useEffect(() => {
    fetchSkus();
    fetchGroups();
    fetchProducts();
  }, []);

  const fetchSkus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${WAREHOUSE_URL}`, {
        withCredentials: true,
      });
      setSkus(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch SKUs:", error);
      toast.error("Failed to fetch SKUs");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/product-group`, {
        withCredentials: true,
      });
      setGroups(response.data || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to fetch groups");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${PRODUCT_URL}`, {
        withCredentials: true,
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const fetchProductsByGroup = async (groupId) => {
    try {
      const response = await axios.get(`${PRODUCT_URL}/group/${groupId}`, {
        withCredentials: true,
      });
      setFilteredProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch products by group:", error);
      toast.error("Failed to fetch products by group");
    }
  };

  const fetchSubpartsByProduct = async (productId) => {
    try {
      const response = await axios.get(`${SUBPARTS_URL}/product/${productId}`, {
        withCredentials: true,
      });
      setSubparts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch subparts by product:", error);
      toast.error("Failed to fetch subparts by product");
    }
  };

  const handleSubpartChange = (subpartId, isChecked) => {
    setSkuFormData((prev) => ({
      ...prev,
      subparts: isChecked
        ? [...prev.subparts, subpartId]
        : prev.subparts.filter((id) => id !== subpartId),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSkuFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle dependent dropdowns
    if (name === "group") {
      if (value) {
        fetchProductsByGroup(value);
        // Clear product and subparts when group changes
        setSkuFormData((prev) => ({
          ...prev,
          product: "",
          subparts: [],
        }));
        setSubparts([]);
      } else {
        setFilteredProducts([]);
        setSkuFormData((prev) => ({
          ...prev,
          product: "",
          subparts: [],
        }));
        setSubparts([]);
      }
    }

    if (name === "product") {
      if (value) {
        fetchSubpartsByProduct(value);
        // Clear subparts when product changes
        setSkuFormData((prev) => ({
          ...prev,
          subparts: [],
        }));
      } else {
        setSubparts([]);
        setSkuFormData((prev) => ({
          ...prev,
          subparts: [],
        }));
      }
    }

    // Clear custom unit when switching away from "other"
    if (name === "unit" && value !== "other") {
      setSkuFormData((prev) => ({
        ...prev,
        customUnit: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!skuFormData.group || !skuFormData.product || !skuFormData.location) {
      toast.error("Please fill all required fields");
      return;
    }

    // Check if subparts exist for the selected product
    if (subparts.length === 0) {
      toast.error("Please add subparts for this product first");
      return;
    }

    // Check if at least one subpart is selected
    if (skuFormData.subparts.length === 0) {
      toast.error("Please select at least one subpart");
      return;
    }

    // Validate custom unit if "other" is selected
    if (skuFormData.unit === "other" && !skuFormData.customUnit) {
      toast.error("Please enter a custom unit when selecting 'Other'");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${WAREHOUSE_URL}`, skuFormData, {
        withCredentials: true,
      });

      toast.success("SKU created successfully");
      setShowModal(false);
      resetForm();
      fetchSkus();
    } catch (error) {
      console.error("Failed to create SKU:", error);
      toast.error(error.response?.data?.message || "Failed to create SKU");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSkuFormData({
      group: "",
      product: "",
      subparts: [],
      location: "",
      quantity: 0,
      unit: "pieces",
      customUnit: "",
    });
    setFilteredProducts([]);
    setSubparts([]);
  };

  const handleDeleteSku = async (skuId) => {
    if (!window.confirm("Are you sure you want to delete this SKU?")) {
      return;
    }

    try {
      await axios.delete(`${WAREHOUSE_URL}/${skuId}`, {
        withCredentials: true,
      });
      toast.success("SKU deleted successfully");
      fetchSkus();
    } catch (error) {
      console.error("Failed to delete SKU:", error);
      toast.error("Failed to delete SKU");
    }
  };

  if (loading && skus.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Warehouse...</p>
      </div>
    );
  }

  return (
    <>
      <div className="child__container d-flex justify-content-between align-items-start orders-fade-in">
        <div className="ms-lg-2">
          <h5
            className="display-6"
            style={{ fontSize: "25px", fontWeight: "500" }}
          >
            Warehouse Management
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Manage warehouse inventory and track SKU status.
          </p>
        </div>

        <div className="me-3 d-flex align-items-center gap-2">
          <button className="login-button" onClick={() => setShowModal(true)}>
            + Add SKU
          </button>
        </div>
      </div>

      {/* SKUs Table */}
      <div className="table-container mt-4" style={{ overflowX: 'auto' }}>
        <table className="responsive-table" style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#121212' }}>SKU#</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#121212' }}>Group</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#121212' }}>Product</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#121212' }}>Subparts</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#121212' }}>Location</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#121212' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#121212' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skus.length > 0 ? (
              skus.map((sku) => (
                <tr key={sku._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '12px', verticalAlign: 'top', fontWeight: '500', color: '#121212' }}>{sku.skuCode}</td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>{sku.group?.name || "N/A"}</td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>{sku.product?.name || "N/A"}</td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    <div style={{ maxWidth: '300px' }}>
                      {sku.subparts && sku.subparts.length > 0 ? (
                        sku.subparts.map((subpart, index) => (
                          <div key={index} style={{
                            padding: '8px',
                            marginBottom: index < sku.subparts.length - 1 ? '4px' : '0',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            border: '1px solid #e9ecef',
                            fontSize: '0.85em'
                          }}>
                            {subpart.parts && subpart.parts.length > 0 ? (
                              subpart.parts.map((part, partIndex) => (
                                <div key={partIndex} style={{ marginBottom: partIndex < subpart.parts.length - 1 ? '2px' : '0' }}>
                                  {part.partName} ({part.quantity} {part.color})
                                </div>
                              ))
                            ) : (
                              <span style={{ color: '#6c757d' }}>No parts defined</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#6c757d' }}>No subparts</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>{sku.location}</td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px'
                    }}>
                      <span style={{ 
                        fontWeight: '500', 
                        color: '#28a745'
                      }}>
                        {sku.quantity}
                      </span>
                      <span style={{ fontSize: '0.85em', color: '#6c757d' }}>
                        {sku.unit === 'other' ? sku.customUnit : sku.unit}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteSku(sku._id)}
                      style={{ marginRight: "5px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No SKUs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create SKU Modal */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="createSkuModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createSkuModalLabel">
                Create New SKU
              </h5>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="group" className="form-label">
                      Group *
                    </label>
                    <select
                      className="form-control"
                      id="group"
                      name="group"
                      value={skuFormData.group}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Group</option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="product" className="form-label">
                      Product *
                    </label>
                    <select
                      className="form-control"
                      id="product"
                      name="product"
                      value={skuFormData.product}
                      onChange={handleInputChange}
                      required
                      disabled={!skuFormData.group}
                    >
                      <option value="">{skuFormData.group ? "Select Product" : "Select Group First"}</option>
                      {filteredProducts.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-12">
                    <label className="form-label">
                      Subparts *
                    </label>
                    {skuFormData.product ? (
                      subparts.length > 0 ? (
                        <div style={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '10px'
                        }}>
                          {subparts.map((subpart) => (
                            <div key={subpart._id} style={{ marginBottom: '10px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                <input
                                  type="checkbox"
                                  checked={skuFormData.subparts.includes(subpart._id)}
                                  onChange={(e) => handleSubpartChange(subpart._id, e.target.checked)}
                                  style={{ marginRight: '8px' }}
                                />
                                <span style={{ fontWeight: '500' }}>Subpart #{subpart._id.slice(-6)}</span>
                              </label>
                              {subpart.parts && subpart.parts.length > 0 && (
                                <div style={{ marginLeft: '20px', fontSize: '0.9em', color: '#666' }}>
                                  {subpart.parts.map((part, index) => (
                                    <div key={index}>
                                      • {part.partName} ({part.quantity} {part.color})
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          color: '#6c757d'
                        }}>
                          Please add subparts for this product first
                        </div>
                      )
                    ) : (
                      <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        color: '#6c757d'
                      }}>
                        Select a product to view available subparts
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-4">
                    <label htmlFor="location" className="form-label">
                      Location *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={skuFormData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter unique location"
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="quantity" className="form-label">
                      Current Quantity
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      name="quantity"
                      value={skuFormData.quantity}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="unit" className="form-label">
                      Unit
                    </label>
                    <select
                      className="form-control"
                      id="unit"
                      name="unit"
                      value={skuFormData.unit}
                      onChange={handleInputChange}
                    >
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                      <option value="kg">Kilograms</option>
                      <option value="liters">Liters</option>
                      <option value="meters">Meters</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {skuFormData.unit === "other" && (
                  <div className="row mt-3">
                    <div className="col-md-4">
                      <label htmlFor="customUnit" className="form-label">
                        Custom Unit *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="customUnit"
                        name="customUnit"
                        value={skuFormData.customUnit}
                        onChange={handleInputChange}
                        placeholder="Enter custom unit (e.g., bags, rolls, sets)"
                        required
                      />
                    </div>
                  </div>
                )}


              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="post-button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create SKU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default WarehouseOverview; 