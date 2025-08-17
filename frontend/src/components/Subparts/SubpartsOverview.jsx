import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SubpartsOverview = () => {
  const [subparts, setSubparts] = useState([]);
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubpart, setSelectedSubpart] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    groupFilter: "",
    productFilter: "",
    partNameFilter: "",
  });
  const [subpartFormData, setSubpartFormData] = useState({
    group: "",
    product: "",
    parts: [
      {
        partName: "",
        quantity: 1,
        color: "Black",
      },
    ],
  });

  const PRODUCT_URL = "http://localhost:5000/api/product";
  const SUBPARTS_URL = "http://localhost:5000/api/subparts";

  useEffect(() => {
    fetchSubparts();
    fetchProducts();
    fetchGroups();
  }, []);

  const fetchSubparts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SUBPARTS_URL}`, {
        withCredentials: true,
      });
      setSubparts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subparts:", error);
      toast.error("Failed to fetch subparts");
    } finally {
      setLoading(false);
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

  // Filter subparts based on search criteria
  const getFilteredSubparts = () => {
    return subparts.filter((subpart) => {
      const { searchTerm, groupFilter, productFilter, partNameFilter } = searchFilters;
      
      // Search term filter (searches across all fields)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const productName = subpart.product?.name?.toLowerCase() || "";
        const groupName = subpart.product?.productGroupId?.name?.toLowerCase() || "";
        const partNames = subpart.parts.map(part => part.partName.toLowerCase()).join(" ");
        
        if (!productName.includes(searchLower) && 
            !groupName.includes(searchLower) && 
            !partNames.includes(searchLower)) {
          return false;
        }
      }
      
      // Group filter
      if (groupFilter && subpart.product?.productGroupId?._id !== groupFilter) {
        return false;
      }
      
      // Product filter
      if (productFilter && subpart.product?._id !== productFilter) {
        return false;
      }
      
      // Part name filter
      if (partNameFilter) {
        const partNameLower = partNameFilter.toLowerCase();
        const hasMatchingPart = subpart.parts.some(part => 
          part.partName.toLowerCase().includes(partNameLower)
        );
        if (!hasMatchingPart) {
          return false;
        }
      }
      
      return true;
    });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      searchTerm: "",
      groupFilter: "",
      productFilter: "",
      partNameFilter: "",
    });
  };

  // Helper function to highlight search terms
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: '#fff3cd', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubpartFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If group is selected, fetch products for that group
    if (name === "group") {
      if (value) {
        fetchProductsByGroup(value);
        // Clear product selection when group changes
        setSubpartFormData((prev) => ({
          ...prev,
          product: "",
        }));
      } else {
        setFilteredProducts([]);
        setSubpartFormData((prev) => ({
          ...prev,
          product: "",
        }));
      }
    }
  };

  const handlePartChange = (index, field, value) => {
    setSubpartFormData((prev) => ({
      ...prev,
      parts: prev.parts.map((part, i) => {
        if (i === index) {
          return { ...part, [field]: value };
        }
        return part;
      }),
    }));
  };

  const addPart = () => {
    setSubpartFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          partName: "",
          quantity: 1,
          color: "Black",
        },
      ],
    }));
  };

  const removePart = (index) => {
    if (subpartFormData.parts.length > 1) {
      setSubpartFormData((prev) => ({
        ...prev,
        parts: prev.parts.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!subpartFormData.product) {
      toast.error("Please select a product");
      return;
    }

    const hasEmptyParts = subpartFormData.parts.some(
      (part) => !part.partName || !part.quantity
    );

    if (hasEmptyParts) {
      toast.error("Please fill all part details");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${SUBPARTS_URL}`, subpartFormData, {
        withCredentials: true,
      });

      toast.success("Subpart created successfully");
      setShowModal(false);
      resetForm();
      fetchSubparts();
    } catch (error) {
      console.error("Failed to create subpart:", error);
      toast.error(error.response?.data?.message || "Failed to create subpart");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubpartFormData({
      group: "",
      product: "",
      parts: [
        {
          partName: "",
          quantity: 1,
          color: "Black",
        },
      ],
    });
    setFilteredProducts([]);
  };

  const handleDeleteSubpart = async (subpartId) => {
    if (!window.confirm("Are you sure you want to delete this subpart?")) {
      return;
    }

    try {
      await axios.delete(`${SUBPARTS_URL}/${subpartId}`, {
        withCredentials: true,
      });
      toast.success("Subpart deleted successfully");
      fetchSubparts();
    } catch (error) {
      console.error("Failed to delete subpart:", error);
      toast.error("Failed to delete subpart");
    }
  };

  if (loading && subparts.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Subparts...</p>
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
            Subparts Management
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Manage subparts and components of products.
          </p>
        </div>

        <div className="me-3 d-flex align-items-center gap-2">
          <button className="login-button" onClick={() => setShowModal(true)}>
            + Create Subpart
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section mt-4" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        <div className="row">
          <div className="col-md-3">
            <label className="form-label" style={{ fontWeight: '500', color: '#121212' }}>
              Search All
            </label>
            <input
              type="text"
              className="form-control"
              name="searchTerm"
              value={searchFilters.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products, groups, parts..."
              style={{ fontSize: '14px' }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label" style={{ fontWeight: '500', color: '#121212' }}>
              Filter by Group
            </label>
            <select
              className="form-control"
              name="groupFilter"
              value={searchFilters.groupFilter}
              onChange={handleSearchChange}
              style={{ fontSize: '14px' }}
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" style={{ fontWeight: '500', color: '#121212' }}>
              Filter by Product
            </label>
            <select
              className="form-control"
              name="productFilter"
              value={searchFilters.productFilter}
              onChange={handleSearchChange}
              style={{ fontSize: '14px' }}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" style={{ fontWeight: '500', color: '#121212' }}>
              Filter by Part Name
            </label>
            <input
              type="text"
              className="form-control"
              name="partNameFilter"
              value={searchFilters.partNameFilter}
              onChange={handleSearchChange}
              placeholder="Search part names..."
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Showing {getFilteredSubparts().length} of {subparts.length} subparts
              {searchFilters.searchTerm && (
                <span style={{ marginLeft: '10px', color: '#28a745' }}>
                  • Search: "{searchFilters.searchTerm}"
                </span>
              )}
              {searchFilters.groupFilter && (
                <span style={{ marginLeft: '10px', color: '#007bff' }}>
                  • Group: {groups.find(g => g._id === searchFilters.groupFilter)?.name}
                </span>
              )}
              {searchFilters.productFilter && (
                <span style={{ marginLeft: '10px', color: '#fd7e14' }}>
                  • Product: {products.find(p => p._id === searchFilters.productFilter)?.name}
                </span>
              )}
              {searchFilters.partNameFilter && (
                <span style={{ marginLeft: '10px', color: '#6f42c1' }}>
                  • Part: "{searchFilters.partNameFilter}"
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              <button
                className="post-button"
                onClick={() => {
                  const filteredData = getFilteredSubparts();
                  const csvContent = [
                    ['Group', 'Product', 'Part Name', 'Quantity', 'Color'],
                    ...filteredData.flatMap(subpart => 
                      subpart.parts.map(part => [
                        subpart.product?.productGroupId?.name || 'N/A',
                        subpart.product?.name || 'N/A',
                        part.partName,
                        part.quantity,
                        part.color
                      ])
                    )
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `subparts_export_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  toast.success('Export completed!');
                }}
                style={{ fontSize: '14px' }}
              >
                Export CSV
              </button>
              <button
                className="post-button"
                onClick={clearFilters}
                style={{ fontSize: '14px' }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subparts Table */}
      <div className="table-container mt-4" style={{ overflowX: "auto" }}>
        <table
          className="responsive-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Group
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Product
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Parts
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {getFilteredSubparts().length > 0 ? (
              getFilteredSubparts().map((subpart) => (
                <tr
                  key={subpart._id}
                  style={{ borderBottom: "1px solid #e9ecef" }}
                >
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "top",
                      fontWeight: "500",
                      color: "#121212",
                    }}
                  >
                    {highlightText(subpart.product?.productGroupId?.name || "N/A", searchFilters.searchTerm)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "top",
                      fontWeight: "500",
                      color: "#121212",
                    }}
                  >
                    {highlightText(subpart.product?.name || "N/A", searchFilters.searchTerm)}
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <div
                      style={{
                        maxWidth: "400px",
                      }}
                    >
                      {subpart.parts.map((part, partIndex) => (
                        <div
                          key={partIndex}
                          style={{
                            padding: "12px",
                            marginBottom:
                              partIndex < subpart.parts.length - 1
                                ? "12px"
                                : "0",
                            borderBottom:
                              partIndex < subpart.parts.length - 1
                                ? "1px solid #e9ecef"
                                : "none",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "8px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "500",
                                color: "#121212",
                                fontSize: "1em",
                              }}
                            >
                              {highlightText(part.partName, searchFilters.searchTerm || searchFilters.partNameFilter)}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px",
                              fontSize: "0.85em",
                              color: "#666",
                            }}
                          >
                            <div
                              style={{
                                padding: "6px 8px",
                                backgroundColor: "#fff",
                                borderRadius: "4px",
                              }}
                            >
                              <strong
                                style={{ color: "#121212", fontWeight: "500" }}
                              >
                                Quantity:
                              </strong>{" "}
                              {part.quantity}
                            </div>
                            <div
                              style={{
                                padding: "6px 8px",
                                backgroundColor: "#fff",
                                borderRadius: "4px",
                              }}
                            >
                              <strong
                                style={{ color: "#121212", fontWeight: "500" }}
                              >
                                Color:
                              </strong>{" "}
                              {part.color}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteSubpart(subpart._id)}
                      style={{ marginRight: "5px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  {subparts.length === 0
                    ? "No subparts found."
                    : "No subparts match your search criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Subpart Modal */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="createSubpartModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createSubpartModalLabel">
                Create New Subpart
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
                      value={subpartFormData.group}
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
                      value={subpartFormData.product}
                      onChange={handleInputChange}
                      required
                      disabled={!subpartFormData.group}
                    >
                      <option value="">{subpartFormData.group ? "Select Product" : "Select Group First"}</option>
                      {filteredProducts.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Parts</h6>
                {subpartFormData.parts.map((part, index) => (
                  <div key={index} className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Part Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={part.partName}
                        onChange={(e) =>
                          handlePartChange(index, "partName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Quantity *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={part.quantity}
                        onChange={(e) =>
                          handlePartChange(index, "quantity", parseInt(e.target.value))
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Color</label>
                      <input
                        type="text"
                        className="form-control"
                        value={part.color}
                        onChange={(e) =>
                          handlePartChange(index, "color", e.target.value)
                        }
                        placeholder="Black"
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="post-button"
                        onClick={() => removePart(index)}
                        disabled={subpartFormData.parts.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="row">
                  <div className="col-12">
                    <button
                      type="button"
                      className="post-button"
                      onClick={addPart}
                    >
                      + Add Part
                    </button>
                  </div>
                </div>
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
                  {loading ? "Creating..." : "Create Subpart"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubpartsOverview; 