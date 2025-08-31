import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ProductionUnitOverview = () => {
  const [productionUnits, setProductionUnits] = useState([]);
  const [units, setUnits] = useState([]);
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [subparts, setSubparts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    unitFilter: "",
    groupFilter: "",
    productFilter: "",
    dateFilter: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    unitName: "",
    isNewUnit: false,
    newUnitName: "",
    productGroup: "",
    product: "",
    part: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0], // Today's date as default
  });

  // Selected product details for auto-fill
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  const API_BASE = "https://ledgerstack-backend.vercel.app/api";
  const PRODUCTION_UNIT_URL = `${API_BASE}/production-unit`;
  const PRODUCT_URL = `${API_BASE}/product`;
  const SUBPARTS_URL = `${API_BASE}/subparts`;

  useEffect(() => {
    fetchProductionUnits();
    fetchUnits();
    fetchGroups();
  }, []);

  // Handle setting the correct part when subparts are loaded in edit mode
  useEffect(() => {
    if (isEditMode && selectedUnit && subparts.length > 0) {
      // Find the subpart that matches the selected unit's part
      const matchingSubpart = subparts.find(
        (subpart) => subpart._id === selectedUnit.part._id
      );
      if (matchingSubpart) {
        // Set the part to the selected part index from the database
        const selectedPartIndex = selectedUnit.selectedPartIndex || 0;
        setFormData((prev) => ({
          ...prev,
          part: `${matchingSubpart._id}-${selectedPartIndex}`,
        }));
      }
    }
  }, [subparts, isEditMode, selectedUnit]);

  const fetchProductionUnits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${PRODUCTION_UNIT_URL}`, {
        withCredentials: true,
      });
      setProductionUnits(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch production units:", error);
      toast.error("Failed to fetch production units");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${PRODUCTION_UNIT_URL}/units/list`, {
        withCredentials: true,
      });
      setUnits(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch units:", error);
      toast.error("Failed to fetch units");
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
      const response = await axios.get(
        `${PRODUCTION_UNIT_URL}/products/group/${groupId}`,
        {
          withCredentials: true,
        }
      );
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch products by group:", error);
      toast.error("Failed to fetch products");
    }
  };

  const fetchSubpartsByProduct = async (productId) => {
    try {
      const response = await axios.get(
        `${PRODUCTION_UNIT_URL}/subparts/product/${productId}`,
        {
          withCredentials: true,
        }
      );
      setSubparts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subparts by product:", error);
      toast.error("Failed to fetch subparts");
    }
  };

  const createNewUnit = async (unitName) => {
    try {
      const response = await axios.post(
        `${PRODUCTION_UNIT_URL}/units`,
        {
          name: unitName,
          description: `Production unit: ${unitName}`,
        },
        {
          withCredentials: true,
        }
      );

      // Add the new unit to the units list
      setUnits((prev) => [...prev, response.data.data]);
      return response.data.data;
    } catch (error) {
      console.error("Failed to create unit:", error);
      toast.error("Failed to create new unit");
      throw error;
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      searchTerm: "",
      unitFilter: "",
      groupFilter: "",
      productFilter: "",
      dateFilter: "",
    });
  };

  // Helper function to highlight search terms
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          style={{ backgroundColor: "#fff3cd", fontWeight: "bold" }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle cascading dropdowns
    if (name === "unitName") {
      if (value === "new") {
        setFormData((prev) => ({
          ...prev,
          unitName: value,
          isNewUnit: true,
          newUnitName: "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          unitName: value,
          isNewUnit: false,
          newUnitName: "",
        }));
      }
    }

    if (name === "productGroup") {
      setFormData((prev) => ({
        ...prev,
        product: "",
        part: "",
      }));
      setProducts([]);
      setSubparts([]);
      setSelectedProductDetails(null);
      if (value) {
        fetchProductsByGroup(value);
      }
    }

    if (name === "product") {
      setFormData((prev) => ({
        ...prev,
        part: "",
      }));
      setSubparts([]);
      if (value) {
        // Get product details for auto-fill
        const selectedProduct = products.find((p) => p._id === value);
        setSelectedProductDetails(selectedProduct);
        fetchSubpartsByProduct(value);
      } else {
        setSelectedProductDetails(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.product) {
      toast.error("Please select a product");
      return;
    }

    if (!formData.part) {
      toast.error("Please select a part");
      return;
    }

    // Validate quantity
    const quantity = parseInt(formData.quantity);
    if (!quantity || quantity <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }

    try {
      setLoading(true);

      let finalUnitName = formData.unitName;

      // If creating a new unit, create it first
      if (formData.isNewUnit && formData.newUnitName) {
        const newUnit = await createNewUnit(formData.newUnitName);
        finalUnitName = newUnit.name;
      }

      // Extract subpart ID and part index from the part selection (format: "subpartId-partIndex")
      const partSubpartId = formData.part.includes("-")
        ? formData.part.split("-")[0]
        : formData.part;
      const selectedPartIndex = formData.part.includes("-")
        ? parseInt(formData.part.split("-")[1])
        : 0;

      const productionUnitData = {
        unitName: finalUnitName,
        productGroup: formData.productGroup,
        product: formData.product,
        part: partSubpartId,
        selectedPartIndex,
        quantity: quantity,
        date: formData.date,
      };

      let response;
      if (isEditMode) {
        response = await axios.put(
          `${PRODUCTION_UNIT_URL}/${selectedUnit._id}`,
          productionUnitData,
          {
            withCredentials: true,
          }
        );
        toast.success("Production unit updated successfully!");
      } else {
        response = await axios.post(`${PRODUCTION_UNIT_URL}`, productionUnitData, {
          withCredentials: true,
        });
        // Use the message from the backend response
        toast.success(response.data.message || "Production unit created successfully!");
      }

      // Handle warehouse response
      if (response.data.warehouse) {
        const warehouseResult = response.data.warehouse;
        if (warehouseResult.success) {
          if (warehouseResult.isNew) {
            toast.success("New unallocated warehouse entry created");
          } else {
            toast.success("Quantity updated in warehouse");
          }
        } else {
          toast.error(`Warehouse update failed: ${warehouseResult.message}`);
        }
      }

      setShowModal(false);
      resetForm();
      fetchProductionUnits();
    } catch (error) {
      console.error("Failed to save production unit:", error);
      toast.error(
        isEditMode
          ? "Failed to update production unit"
          : "Failed to create production unit"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDoubleClick = async (unit) => {
    try {
      setSelectedUnit(unit);
      setIsEditMode(true);
      
      // Set form data
      setFormData({
        unitName: unit.unitName,
        isNewUnit: false,
        newUnitName: "",
        productGroup: unit.productGroup._id,
        product: unit.product._id,
        part: "", // Will be set after subparts are loaded
        quantity: unit.quantity.toString(),
        date: new Date(unit.date).toISOString().split("T")[0],
      });

      // Fetch related data for the form
      await fetchProductsByGroup(unit.productGroup._id);
      await fetchSubpartsByProduct(unit.product._id);
      
      // Wait a bit for state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Increment form key to force re-render
      setFormKey(prev => prev + 1);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to load production unit for editing:", error);
      toast.error("Failed to load production unit for editing");
    }
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);

    // For editing, we'll set the part to the subpart ID and let the user reselect the specific part
    setFormData({
      unitName: unit.unitName,
      isNewUnit: false,
      newUnitName: "",
      productGroup: unit.productGroup._id,
      product: unit.product._id,
      part: "", // Will be set after subparts are loaded
      quantity: unit.quantity.toString(),
      date: new Date(unit.date).toISOString().split("T")[0],
    });
    setIsEditMode(true);
    setShowModal(true);

    // Fetch related data for the form
    fetchProductsByGroup(unit.productGroup._id);
    fetchSubpartsByProduct(unit.product._id);
  };

  const handleDelete = async (unitId) => {
    if (
      window.confirm("Are you sure you want to delete this production unit?")
    ) {
      try {
        setLoading(true);
        await axios.delete(`${PRODUCTION_UNIT_URL}/${unitId}`, {
          withCredentials: true,
        });
        toast.success("Production unit deleted successfully!");
        fetchProductionUnits();
      } catch (error) {
        console.error("Failed to delete production unit:", error);
        toast.error("Failed to delete production unit");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      unitName: "",
      isNewUnit: false,
      newUnitName: "",
      productGroup: "",
      product: "",
      part: "",
      quantity: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsEditMode(false);
    setSelectedUnit(null);
    setProducts([]);
    setSubparts([]);
    setSelectedProductDetails(null);
    setFormKey((prev) => prev + 1);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProductionUnits(), fetchUnits(), fetchGroups()]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProductionUnits = () => {
    return productionUnits.filter((unit) => {
      const { searchTerm, unitFilter, groupFilter, productFilter, dateFilter } =
        searchFilters;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const unitName = unit.unitName?.toLowerCase() || "";
        const productName = unit.product?.name?.toLowerCase() || "";
        const groupName = unit.productGroup?.name?.toLowerCase() || "";

        if (
          !unitName.includes(searchLower) &&
          !productName.includes(searchLower) &&
          !groupName.includes(searchLower)
        ) {
          return false;
        }
      }

      if (unitFilter && unit.unitName !== unitFilter) {
        return false;
      }

      if (groupFilter && unit.productGroup._id !== groupFilter) {
        return false;
      }

      if (productFilter && unit.product._id !== productFilter) {
        return false;
      }

      if (dateFilter) {
        const unitDate = new Date(unit.date).toISOString().split('T')[0];
        if (unitDate !== dateFilter) {
          return false;
        }
      }

      return true;
    });
  };

  if (loading && productionUnits.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Production Units...</p>
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
            Production Unit Management
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Manage production units and track manufacturing activities.
          </p>
        </div>

        <div className="me-3 d-flex align-items-center gap-2">
          <button
            className="login-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
          </button>
          <button className="login-button" onClick={() => setShowModal(true)}>
            + Add Log
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div
        className="search-filter-section mt-4"
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef",
        }}
      >
        <div className="row">
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Search All
            </label>
            <input
              type="text"
              className="form-control"
              name="searchTerm"
              value={searchFilters.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search units, products..."
              style={{ fontSize: "14px" }}
            />
          </div>
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Filter by Unit
            </label>
            <select
              className="form-control"
              name="unitFilter"
              value={searchFilters.unitFilter}
              onChange={handleSearchChange}
              style={{ fontSize: "14px" }}
            >
              <option value="">All Units</option>
              {units.map((unit) => (
                <option key={unit._id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Filter by Group
            </label>
            <select
              className="form-control"
              name="groupFilter"
              value={searchFilters.groupFilter}
              onChange={handleSearchChange}
              style={{ fontSize: "14px" }}
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Filter by Product
            </label>
            <select
              className="form-control"
              name="productFilter"
              value={searchFilters.productFilter}
              onChange={handleSearchChange}
              style={{ fontSize: "14px" }}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Filter by Date
            </label>
            <input
              type="date"
              className="form-control"
              name="dateFilter"
              value={searchFilters.dateFilter}
              onChange={handleSearchChange}
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              Showing {getFilteredProductionUnits().length} of{" "}
              {productionUnits.length} production units
              {searchFilters.searchTerm && (
                <span style={{ marginLeft: "10px", color: "#28a745" }}>
                  • Search: "{searchFilters.searchTerm}"
                </span>
              )}
              {searchFilters.unitFilter && (
                <span style={{ marginLeft: "10px", color: "#007bff" }}>
                  • Unit: {searchFilters.unitFilter}
                </span>
              )}
              {searchFilters.groupFilter && (
                <span style={{ marginLeft: "10px", color: "#fd7e14" }}>
                  • Group:{" "}
                  {
                    groups.find((g) => g._id === searchFilters.groupFilter)
                      ?.name
                  }
                </span>
              )}
              {searchFilters.productFilter && (
                <span style={{ marginLeft: "10px", color: "#6f42c1" }}>
                  • Product:{" "}
                  {
                    products.find((p) => p._id === searchFilters.productFilter)
                      ?.name
                  }
                </span>
              )}
              {searchFilters.dateFilter && (
                <span style={{ marginLeft: "10px", color: "#20c997" }}>
                  • Date: {new Date(searchFilters.dateFilter).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              <button
                className="post-button"
                onClick={() => {
                  const filteredData = getFilteredProductionUnits();
                  const csvContent = [
                    [
                      "Unit",
                      "Date",
                      "Product",
                      "Type",
                      "Category",
                      "Part",
                      "Quantity",
                    ],
                    ...filteredData.map((unit) => [
                      unit.unitName || "N/A",
                      new Date(unit.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) || "N/A",
                      unit.product?.name || "N/A",
                      unit.productType || "N/A",
                      unit.category || "N/A",
                      unit.part?.parts?.[unit.selectedPartIndex || 0]
                        ?.partName || "N/A",
                      unit.quantity || "N/A",
                    ]),
                  ]
                    .map((row) => row.join(","))
                    .join("\n");

                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `production_units_export_${
                    new Date().toISOString().split("T")[0]
                  }.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  toast.success("Export completed!");
                }}
                style={{ fontSize: "14px" }}
              >
                Export CSV
              </button>
              <button
                className="post-button"
                onClick={clearFilters}
                style={{ fontSize: "14px" }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Production Units Table */}
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
                Unit
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Date
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
                Type
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Part
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Quantity
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
            {getFilteredProductionUnits().length > 0 ? (
              getFilteredProductionUnits().map((unit, index) => (
                <tr
                  key={unit._id}
                  style={{
                    borderBottom: "1px solid #e9ecef",
                    cursor: "pointer",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                    transition: "background-color 0.2s ease",
                  }}
                  onDoubleClick={() => handleDoubleClick(unit)}
                  onMouseEnter={(e) => {
                    e.target.closest("tr").style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    const row = e.target.closest("tr");
                    const index = Array.from(row.parentNode.children).indexOf(
                      row
                    );
                    row.style.backgroundColor =
                      index % 2 === 0 ? "#ffffff" : "#fafbfc";
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "top",
                      fontWeight: "500",
                      color: "#121212",
                    }}
                  >
                    {highlightText(unit.unitName, searchFilters.searchTerm)}
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <span style={{ color: "#121212" }}>
                      {new Date(unit.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
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
                        {highlightText(
                          unit.product?.name,
                          searchFilters.searchTerm
                        )}
                        <div
                          style={{
                            fontSize: "0.9em",
                            color: "#666",
                            fontWeight: "normal",
                            marginTop: "2px",
                          }}
                        >
                          {highlightText(
                            unit.productGroup?.name,
                            searchFilters.searchTerm
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <span
                      style={{
                        color: "#121212",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      {unit.productType}
                    </span>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <span
                      style={{
                        color: "#121212",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      {unit.category}
                    </span>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <span style={{ color: "#121212" }}>
                      {unit.part?.parts?.[unit.selectedPartIndex || 0]
                        ?.partName || "N/A"}
                      {unit.part?.parts?.[unit.selectedPartIndex || 0]
                        ?.color && (
                        <span
                          style={{
                            fontSize: "16px",
                            color: "#6c757d",
                            marginLeft: "4px",
                          }}
                        >
                          ({unit.part.parts[unit.selectedPartIndex || 0].color})
                        </span>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <span
                      style={{
                        color: "#121212",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      {unit.quantity}
                    </span>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(unit._id)}
                        style={{ fontSize: "14px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6c757d",
                    fontStyle: "italic",
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      marginBottom: "16px",
                      opacity: 0.5,
                    }}
                  >
                    🏭
                  </div>
                  <p style={{ margin: 0 }}>No production units found</p>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "14px",
                      opacity: 0.7,
                    }}
                  >
                    Create your first production unit to get started
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditMode
                    ? "Edit Production Unit"
                    : "Add New Production Unit"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit} key={formKey}>
                <div className="modal-body">
                  {/* Unit Selection */}
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="unitName" className="form-label">
                        Unit Name *
                      </label>
                      <select
                        className="form-control"
                        id="unitName"
                        name="unitName"
                        value={formData.unitName}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Select Unit</option>
                        {units.map((unit) => (
                          <option key={unit._id} value={unit.name}>
                            {unit.name}
                          </option>
                        ))}
                        <option value="new">+ New Unit</option>
                      </select>
                    </div>
                    {formData.isNewUnit && (
                      <div className="col-md-6">
                        <label htmlFor="newUnitName" className="form-label">
                          New Unit Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="newUnitName"
                          name="newUnitName"
                          value={formData.newUnitName}
                          onChange={handleFormChange}
                          required={formData.isNewUnit}
                          placeholder="Enter new unit name"
                        />
                      </div>
                    )}
                  </div>

                  {/* Product Group Selection */}
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label htmlFor="productGroup" className="form-label">
                        Product Group *
                      </label>
                      <select
                        className="form-control"
                        id="productGroup"
                        name="productGroup"
                        value={formData.productGroup}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Select Product Group</option>
                        {groups.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Product Selection */}
                  {formData.productGroup && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label htmlFor="product" className="form-label">
                          Product *
                        </label>
                        <select
                          className="form-control"
                          id="product"
                          name="product"
                          value={formData.product}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Auto-filled Product Details */}
                  {selectedProductDetails && (
                    <div className="row mt-3">
                      <div className="col-md-4">
                        <label className="form-label">Product Type</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            selectedProductDetails.productTypeId?.name || ""
                          }
                          readOnly
                          style={{ backgroundColor: "#f8f9fa" }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Category</label>
                        <input
                          type="text"
                          className="form-control"
                          value={selectedProductDetails.categoryId?.name || ""}
                          readOnly
                          style={{ backgroundColor: "#f8f9fa" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Part Selection */}
                  {formData.product && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label htmlFor="part" className="form-label">
                          Part *
                        </label>
                        <select
                          className="form-control"
                          id="part"
                          name="part"
                          value={formData.part}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">Select Part</option>
                          {subparts
                            .map((subpart) =>
                              subpart.parts?.map((part, partIndex) => (
                                <option
                                  key={`${subpart._id}-${partIndex}`}
                                  value={`${subpart._id}-${partIndex}`}
                                >
                                  {part.partName} ({part.color || "No Color"})
                                </option>
                              ))
                            )
                            .flat()}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Quantity and Date */}
                  {formData.part && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label htmlFor="quantity" className="form-label">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="quantity"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleFormChange}
                          required
                          min="1"
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="date" className="form-label">
                          Date *
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleFormChange}
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
                    {loading
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update Log"
                      : "Create Log"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        .orders-fade-in {
          animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(32px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ProductionUnitOverview;
