import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ProductsOverview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    groupFilter: "",
    categoryFilter: "",
    typeFilter: "",
  });
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const API_BASE = "http://localhost:5000/api/product";

  useEffect(() => {
    fetchProductsAvailability();
    fetchMetaData();
  }, []);

  const fetchMetaData = async () => {
    try {
      const [groupsRes, categoriesRes, typesRes] = await Promise.all([
        axios.get(`${API_BASE}/product-group`, { withCredentials: true }),
        axios.get(`${API_BASE}/product-category`, { withCredentials: true }),
        axios.get(`${API_BASE}/product-type`, { withCredentials: true }),
      ]);

      setGroups(groupsRes.data);
      setCategories(categoriesRes.data);
      setTypes(typesRes.data);
    } catch (error) {
      console.error("Error fetching meta data:", error);
    }
  };

  const fetchProductsAvailability = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/availability`, {
        withCredentials: true,
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products availability:", error);
      toast.error("Failed to fetch products availability");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      searchTerm: "",
      groupFilter: "",
      categoryFilter: "",
      typeFilter: "",
    });
  };

  const getFilteredProducts = () => {
    return products.filter((product) => {
      const matchesSearch =
        !searchFilters.searchTerm ||
        product.name
          .toLowerCase()
          .includes(searchFilters.searchTerm.toLowerCase()) ||
        (product.productGroupId?.name &&
          product.productGroupId.name
            .toLowerCase()
            .includes(searchFilters.searchTerm.toLowerCase())) ||
        (product.categoryId?.name &&
          product.categoryId.name
            .toLowerCase()
            .includes(searchFilters.searchTerm.toLowerCase())) ||
        (product.productTypeId?.name &&
          product.productTypeId.name
            .toLowerCase()
            .includes(searchFilters.searchTerm.toLowerCase()));

      const matchesGroup =
        !searchFilters.groupFilter ||
        product.productGroupId?._id === searchFilters.groupFilter;

      const matchesCategory =
        !searchFilters.categoryFilter ||
        product.categoryId?._id === searchFilters.categoryFilter;

      const matchesType =
        !searchFilters.typeFilter ||
        product.productTypeId?._id === searchFilters.typeFilter;

      return matchesSearch && matchesGroup && matchesCategory && matchesType;
    });
  };

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

  const exportToCSV = () => {
    const filteredProducts = getFilteredProducts();
    const csvContent = [
      [
        "Product",
        "Group",
        "Category",
        "Type",
        "Available Quantity",
        "Subparts Required",
      ],
      ...filteredProducts.map((product) => [
        product.name,
        product.productGroupId?.name || "",
        product.categoryId?.name || "",
        product.productTypeId?.name || "",
        product.availableQuantity,
        product.subpartsRequired
          ?.map((part) => `${part.partName} (${part.quantityNeeded}, ${part.remainingQuantity} remaining)`)
          .join(", ") || "None",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_availability.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const getFilterSummary = () => {
    const filteredCount = getFilteredProducts().length;
    const totalCount = products.length;

    let summary = `Showing ${filteredCount} of ${totalCount} products`;

    if (searchFilters.searchTerm) {
      summary += ` • Search: "${searchFilters.searchTerm}"`;
    }
    if (searchFilters.groupFilter) {
      const groupName = groups.find(
        (g) => g._id === searchFilters.groupFilter
      )?.name;
      summary += ` • Group: ${groupName}`;
    }
    if (searchFilters.categoryFilter) {
      const categoryName = categories.find(
        (c) => c._id === searchFilters.categoryFilter
      )?.name;
      summary += ` • Category: ${categoryName}`;
    }
    if (searchFilters.typeFilter) {
      const typeName = types.find(
        (t) => t._id === searchFilters.typeFilter
      )?.name;
      summary += ` • Type: ${typeName}`;
    }

    return summary;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading products availability...</p>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  if (loading && products.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Products...</p>
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
            Products Availability
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            View product availability based on subparts and warehouse stock.
          </p>
        </div>

        <div className="me-3 d-flex align-items-center gap-2">
          <button className="login-button" onClick={fetchProductsAvailability}>
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
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
        }}
      >
        <div className="row">
          <div className="col-md-3">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Search
            </label>
            <input
              type="text"
              className="form-control"
              name="searchTerm"
              value={searchFilters.searchTerm}
              onChange={(e) => handleSearchChange("searchTerm", e.target.value)}
              placeholder="Search across all fields..."
              style={{ fontSize: "14px" }}
            />
          </div>
          <div className="col-md-3">
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
              onChange={(e) =>
                handleSearchChange("groupFilter", e.target.value)
              }
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
          <div className="col-md-3">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Filter by Category
            </label>
            <select
              className="form-control"
              name="categoryFilter"
              value={searchFilters.categoryFilter}
              onChange={(e) =>
                handleSearchChange("categoryFilter", e.target.value)
              }
              style={{ fontSize: "14px" }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Filter by Type
            </label>
            <select
              className="form-control"
              name="typeFilter"
              value={searchFilters.typeFilter}
              onChange={(e) => handleSearchChange("typeFilter", e.target.value)}
              style={{ fontSize: "14px" }}
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              {getFilterSummary()}
            </div>
            <div className="d-flex gap-2">
              <button
                className="post-button"
                onClick={exportToCSV}
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

      {/* Products Table */}
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
                Pieces
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Subparts Required
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  <p style={{ color: "#6c757d", margin: 0 }}>
                    {searchFilters.searchTerm ||
                    searchFilters.groupFilter ||
                    searchFilters.categoryFilter ||
                    searchFilters.typeFilter
                      ? "No products match your search criteria"
                      : "No products found"}
                  </p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  style={{
                    borderBottom: "1px solid #dee2e6",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.closest("tr").style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.target.closest("tr").style.backgroundColor = "white";
                  }}
                >
                  <td style={{ padding: "12px" }}>
                    {highlightText(product.name, searchFilters.searchTerm)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {highlightText(
                      product.productGroupId?.name || "N/A",
                      searchFilters.searchTerm
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {highlightText(
                      product.categoryId?.name || "N/A",
                      searchFilters.searchTerm
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {highlightText(
                      product.productTypeId?.name || "N/A",
                      searchFilters.searchTerm
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        color: "#121212",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      {product.availableQuantity}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {product.subpartsRequired &&
                    product.subpartsRequired.length > 0 ? (
                      <div style={{ maxWidth: "400px" }}>
                        {product.subpartsRequired.map((part, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "8px",
                              padding: "8px",
                              backgroundColor: "#f8f9fc",
                              borderRadius: "4px",
                              borderLeft: "3px solid #4e73df",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: "600",
                                color: "#4e73df",
                                marginBottom: "4px",
                              }}
                            >
                              {part.partName}
                            </span>
                            <span
                              style={{
                                fontSize: "14px",
                                color: "#121212",
                                marginBottom: "4px",
                              }}
                            >
                              ({part.quantityNeeded} needed,{" "}
                              {part.availableInWarehouse} available)
                            </span>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "10px",
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor:
                                    part.productsPossible > 0
                                      ? "#d4edda"
                                      : "#f8d7da",
                                  color:
                                    part.productsPossible > 0
                                      ? "#155724"
                                      : "#721c24",
                                  padding: "2px 6px",
                                  borderRadius: "3px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  alignSelf: "flex-start",
                                }}
                              >
                                {part.productsPossible} possible
                              </span>
                              <span
                                style={{
                                  backgroundColor: "#e2e3e5",
                                  color: "#495057",
                                  padding: "2px 6px",
                                  borderRadius: "3px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  alignSelf: "flex-start",
                                }}
                              >
                                {part.remainingQuantity} remaining
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#6c757d" }}>
                        No subparts defined
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProductsOverview;
