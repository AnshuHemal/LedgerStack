import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
// import "./OrdersOverview.css";

const OrdersOverview = () => {
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    companyFilter: "",
    groupFilter: "",
    productFilter: "",
    statusFilter: "",
    priorityFilter: "",
  });
  const [orderFormData, setOrderFormData] = useState({
    company: "",
    products: [
      {
        groupId: "",
        productId: "",
        type: "",
        size: "",
        boxes: 1,
        status: "pending",
      },
    ],
    customerContact: "",
    deliveryDate: "",
    priority: "medium",
  });

  const ACCOUNT_URL = "http://localhost:5000/api/account";
  const PRODUCT_URL = "http://localhost:5000/api/product";
  const ORDERS_URL = "http://localhost:5000/api/orders";

  useEffect(() => {
    fetchOrders();
    fetchCompanies();
    fetchProducts();
    fetchGroups();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ORDERS_URL}`, {
        withCredentials: true,
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchCompanies(),
        fetchProducts(),
        fetchGroups()
      ]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${ACCOUNT_URL}/account-master`, {
        withCredentials: true,
      });
      setCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast.error("Failed to fetch companies");
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

  // Filter orders based on search criteria
  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const {
        searchTerm,
        companyFilter,
        groupFilter,
        productFilter,
        statusFilter,
        priorityFilter,
      } = searchFilters;

      // Search term filter (searches across all fields)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const orderNumber = order.orderNumber?.toLowerCase() || "";
        const companyName = order.company?.companyName?.toLowerCase() || "";
        const customerContact = order.customerContact?.toLowerCase() || "";
        const productNames = order.products
          .map((product) => product.productId?.name?.toLowerCase() || "")
          .join(" ");
        const groupNames = order.products
          .map(
            (product) =>
              product.productId?.productGroupId?.name?.toLowerCase() || ""
          )
          .join(" ");

        if (
          !orderNumber.includes(searchLower) &&
          !companyName.includes(searchLower) &&
          !customerContact.includes(searchLower) &&
          !productNames.includes(searchLower) &&
          !groupNames.includes(searchLower)
        ) {
          return false;
        }
      }

      // Company filter
      if (companyFilter && order.company?._id !== companyFilter) {
        return false;
      }

      // Group filter (check if any product in the order belongs to the selected group)
      if (groupFilter) {
        const hasMatchingGroup = order.products.some(
          (product) => product.productId?.productGroupId?._id === groupFilter
        );
        if (!hasMatchingGroup) {
          return false;
        }
      }

      // Product filter (check if any product in the order matches the selected product)
      if (productFilter) {
        const hasMatchingProduct = order.products.some(
          (product) => product.productId?._id === productFilter
        );
        if (!hasMatchingProduct) {
          return false;
        }
      }

      // Status filter (check if any product in the order has the selected status)
      if (statusFilter) {
        const hasMatchingStatus = order.products.some(
          (product) => product.status === statusFilter
        );
        if (!hasMatchingStatus) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter && order.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
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
      companyFilter: "",
      groupFilter: "",
      productFilter: "",
      statusFilter: "",
      priorityFilter: "",
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

  const handleDoubleClick = async (order) => {
    try {
      setSelectedOrder(order);
      setIsEditMode(true);
      
      // Set form data
      setOrderFormData({
        company: order.company?._id || "",
        products: order.products?.map(product => ({
          groupId: product.productId?.productGroupId?._id || "",
          productId: product.productId?._id || "",
          type: product.type || "",
          size: product.size || "",
          boxes: product.boxes || 1,
          status: product.status || "pending",
        })) || [],
        customerContact: order.customerContact || "",
        deliveryDate: order.deliveryDate || "",
        priority: order.priority || "medium",
      });

      // Fetch products by group for each product
      for (const product of order.products || []) {
        if (product.productId?.productGroupId?._id) {
          await fetchProductsByGroup(product.productId.productGroupId._id);
          // Wait a bit for state to update
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Increment form key to force re-render
      setFormKey(prev => prev + 1);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to load order for editing:", error);
      toast.error("Failed to load order for editing");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If company is selected, fetch and populate customer contact
    if (name === "company") {
      if (value) {
        const selectedCompany = companies.find(
          (company) => company._id === value
        );
        if (selectedCompany) {
          setOrderFormData((prev) => ({
            ...prev,
            customerContact: selectedCompany.contactPerson || "",
          }));
        }
      } else {
        // Clear customer contact when no company is selected
        setOrderFormData((prev) => ({
          ...prev,
          customerContact: "",
        }));
      }
    }
  };

  const handleProductChange = (index, field, value) => {
    setOrderFormData((prev) => ({
      ...prev,
      products: prev.products.map((product, i) => {
        if (i === index) {
          const updatedProduct = { ...product, [field]: value };

          // If group is selected, fetch products for that group
          if (field === "groupId") {
            if (value) {
              fetchProductsByGroup(value);
              // Only clear product selection if not in edit mode
              if (!isEditMode) {
                updatedProduct.productId = "";
                updatedProduct.type = "";
                updatedProduct.size = "";
              }
            }
          }

          // If product is selected, auto-fill type and size
          if (field === "productId" && value) {
            const selectedProduct = filteredProducts.find(
              (prod) => prod._id === value
            );
            if (selectedProduct) {
              // Auto-fill type from productTypeId and size from categoryId
              updatedProduct.type =
                selectedProduct.productTypeId?.name || "Standard";
              updatedProduct.size =
                selectedProduct.categoryId?.name || "Regular";
            }
          }

          return updatedProduct;
        }
        return product;
      }),
    }));
  };

  const addProduct = () => {
    setOrderFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          groupId: "",
          productId: "",
          type: "",
          size: "",
          boxes: 1,
          status: "pending",
        },
      ],
    }));
  };

  const removeProduct = (index) => {
    if (orderFormData.products.length > 1) {
      setOrderFormData((prev) => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!orderFormData.company) {
      toast.error("Please select a company");
      return;
    }

    if (!orderFormData.customerContact) {
      toast.error("Please enter customer contact");
      return;
    }

    const hasEmptyProducts = orderFormData.products.some(
      (product) =>
        !product.productId || !product.type || !product.size || !product.boxes
    );

    if (hasEmptyProducts) {
      toast.error("Please fill all product details");
      return;
    }

    try {
      setLoading(true);
      
      if (isEditMode && selectedOrder) {
        // Update existing order
        await axios.put(`${ORDERS_URL}/${selectedOrder._id}`, orderFormData, {
          withCredentials: true,
        });
        toast.success("Order updated successfully");
      } else {
        // Create new order
        await axios.post(`${ORDERS_URL}`, orderFormData, {
          withCredentials: true,
        });
        toast.success("Order created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error(isEditMode ? "Failed to update order:" : "Failed to create order:", error);
      toast.error(error.response?.data?.message || (isEditMode ? "Failed to update order" : "Failed to create order"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOrderFormData({
      company: "",
      products: [
        {
          groupId: "",
          productId: "",
          type: "",
          size: "",
          boxes: 1,
          status: "pending",
        },
      ],
      customerContact: "",
      deliveryDate: "",
      priority: "medium",
    });
    setIsEditMode(false);
    setSelectedOrder(null);
    setFormKey(prev => prev + 1);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await axios.delete(`${ORDERS_URL}/${orderId}`, {
        withCredentials: true,
      });
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order");
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Orders...</p>
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
            Orders Management
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Manage customer orders and track order status.
          </p>
        </div>

        <div className="me-3 d-flex align-items-center gap-2">
          <button className="login-button" onClick={handleRefresh} disabled={loading}>
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          </button>
          <button className="login-button" onClick={() => setShowModal(true)}>
            + Create Order
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
              placeholder="Search orders, companies..."
              style={{ fontSize: "14px" }}
            />
          </div>
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Company
            </label>
            <select
              className="form-control"
              name="companyFilter"
              value={searchFilters.companyFilter}
              onChange={handleSearchChange}
              style={{ fontSize: "14px" }}
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Group
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
              Product
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
              Status
            </label>
            <select
              className="form-control"
              name="statusFilter"
              value={searchFilters.statusFilter}
              onChange={handleSearchChange}
              style={{ fontSize: "14px" }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_production">In Production</option>
              <option value="ready">Ready</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-md-2">
            <label
              className="form-label"
              style={{ fontWeight: "500", color: "#121212" }}
            >
              Priority
            </label>
            <select
              className="form-control"
              name="priorityFilter"
              value={searchFilters.priorityFilter}
              onChange={handleSearchChange}
              style={{ fontSize: "14px" }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              Showing {getFilteredOrders().length} of {orders.length} orders
              {searchFilters.searchTerm && (
                <span style={{ marginLeft: "10px", color: "#28a745" }}>
                  • Search: "{searchFilters.searchTerm}"
                </span>
              )}
              {searchFilters.companyFilter && (
                <span style={{ marginLeft: "10px", color: "#007bff" }}>
                  • Company:{" "}
                  {
                    companies.find((c) => c._id === searchFilters.companyFilter)
                      ?.companyName
                  }
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
              {searchFilters.statusFilter && (
                <span style={{ marginLeft: "10px", color: "#e83e8c" }}>
                  • Status: {searchFilters.statusFilter}
                </span>
              )}
              {searchFilters.priorityFilter && (
                <span style={{ marginLeft: "10px", color: "#20c997" }}>
                  • Priority: {searchFilters.priorityFilter}
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              <button
                className="post-button"
                onClick={() => {
                  const filteredData = getFilteredOrders();
                  const csvContent = [
                    [
                      "Order#",
                      "Company",
                      "Customer",
                      "Product",
                      "Type",
                      "Size",
                      "Boxes",
                      "Status",
                      "Priority",
                    ],
                    ...filteredData.flatMap((order) =>
                      order.products.map((product) => [
                        order.orderNumber,
                        order.company?.companyName || "N/A",
                        order.customerContact || "N/A",
                        product.productId?.name || "N/A",
                        product.type || "N/A",
                        product.size || "N/A",
                        product.boxes || "N/A",
                        product.status || "N/A",
                        order.priority || "N/A",
                      ])
                    ),
                  ]
                    .map((row) => row.join(","))
                    .join("\n");

                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `orders_export_${
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

      {/* Orders Table */}
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
                Order#
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Company
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Customer
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Products
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#121212",
                }}
              >
                Status
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
            {getFilteredOrders().length > 0 ? (
              getFilteredOrders().map((order) => (
                <tr
                  key={order._id}
                  style={{ borderBottom: "1px solid #e9ecef", cursor: "pointer" }}
                  onDoubleClick={() => handleDoubleClick(order)}
                >
                  <td
                    style={{
                      padding: "12px",
                      verticalAlign: "top",
                      fontWeight: "500",
                      color: "#121212",
                    }}
                  >
                    {highlightText(order.orderNumber, searchFilters.searchTerm)}
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    {highlightText(
                      order.company?.companyName || "N/A",
                      searchFilters.searchTerm
                    )}
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    {highlightText(
                      order.customerContact || "N/A",
                      searchFilters.searchTerm
                    )}
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <div
                      style={{
                        maxWidth: "400px",
                      }}
                    >
                      {order.products.map((product, productIndex) => (
                        <div
                          key={productIndex}
                          style={{
                            padding: "12px",
                            marginBottom:
                              productIndex < order.products.length - 1
                                ? "12px"
                                : "0",
                            borderBottom:
                              productIndex < order.products.length - 1
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
                              {highlightText(
                                product.productId?.name || "N/A",
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
                                  product.productId?.productGroupId?.name ||
                                    "N/A",
                                  searchFilters.searchTerm
                                )}
                              </div>
                            </div>
                            <span
                              className={`status-badge status-${
                                product.status || order.status
                              }`}
                              style={{
                                fontSize: "0.75em",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontWeight: "500",
                              }}
                            >
                              {product.status || order.status}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr",
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
                                Type:
                              </strong>{" "}
                              {product.type}
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
                                Size:
                              </strong>{" "}
                              {product.size}
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
                                Boxes:
                              </strong>{" "}
                              {product.boxes}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <span className={`status-badge status-${order.status}`} style={{fontWeight: "500"}}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "top" }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteOrder(order._id)}
                      style={{ marginRight: "5px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  {orders.length === 0
                    ? "No orders found."
                    : "No orders match your search criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="createOrderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createOrderModalLabel">
                {isEditMode ? "Edit Order" : "Create New Order"}
              </h5>
            </div>
            <form key={formKey} onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="company" className="form-label">
                      Company Name *
                    </label>
                    <select
                      className="form-control"
                      id="company"
                      name="company"
                      value={orderFormData.company}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="customerContact" className="form-label">
                      Customer Name *
                      {orderFormData.company &&
                        companies.find((c) => c._id === orderFormData.company)
                          ?.contactPerson && (
                          <span
                            className="text-success ms-2"
                            style={{ fontSize: "0.8em" }}
                          >
                            ✓ Auto-filled from company
                          </span>
                        )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="customerContact"
                      name="customerContact"
                      value={orderFormData.customerContact}
                      onChange={handleInputChange}
                      required
                      placeholder=""
                      style={{
                        backgroundColor:
                          orderFormData.company &&
                          companies.find((c) => c._id === orderFormData.company)
                            ?.contactPerson
                            ? "#f8f9fa"
                            : "white",
                        borderColor:
                          orderFormData.company &&
                          companies.find((c) => c._id === orderFormData.company)
                            ?.contactPerson
                            ? "#28a745"
                            : "#ced4da",
                      }}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <label htmlFor="deliveryDate" className="form-label">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="deliveryDate"
                      name="deliveryDate"
                      value={orderFormData.deliveryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="priority" className="form-label">
                      Priority
                    </label>
                    <select
                      className="form-control"
                      id="priority"
                      name="priority"
                      value={orderFormData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Products</h6>
                {orderFormData.products.map((product, index) => (
                  <div key={index} className="row mb-3 align-items-end">
                    <div className="col-md-2">
                      <label className="form-label">Group *</label>
                      <select
                        className="form-control"
                        value={product.groupId}
                        onChange={(e) =>
                          handleProductChange(index, "groupId", e.target.value)
                        }
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
                    <div className="col-md-2">
                      <label className="form-label">Product *</label>
                      <select
                        className="form-control"
                        value={product.productId}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                        required
                        disabled={!product.groupId}
                      >
                        <option value="">
                          {product.groupId
                            ? "Select Product"
                            : "Select Group First"}
                        </option>
                        {filteredProducts
                          .filter((prod) => {
                            // Filter out products that are already selected in other rows
                            const isSelectedInOtherRows =
                              orderFormData.products.some(
                                (product, productIndex) =>
                                  productIndex !== index &&
                                  product.productId === prod._id
                              );
                            return !isSelectedInOtherRows;
                          })
                          .map((prod) => (
                            <option key={prod._id} value={prod._id}>
                              {prod.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Type *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={product.type}
                        readOnly
                        style={{
                          backgroundColor: product.productId
                            ? "#f8f9fa"
                            : "white",
                          borderColor: product.productId
                            ? "#28a745"
                            : "#ced4da",
                        }}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Size *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={product.size}
                        readOnly
                        style={{
                          backgroundColor: product.productId
                            ? "#f8f9fa"
                            : "white",
                          borderColor: product.productId
                            ? "#28a745"
                            : "#ced4da",
                        }}
                      />
                    </div>
                    <div className="col-md-1">
                      <label className="form-label">Boxes *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.boxes}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "boxes",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Status</label>
                      <select
                        className="form-control"
                        value={product.status}
                        onChange={(e) =>
                          handleProductChange(index, "status", e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_production">In Production</option>
                        <option value="ready">Ready</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-1">
                      <button
                        type="button"
                        className="post-button"
                        onClick={() => removeProduct(index)}
                        disabled={orderFormData.products.length === 1}
                        style={{ 
                          fontSize: '0.8em',
                          padding: '6px 12px',
                          marginTop: '24px'
                        }}
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
                      onClick={addProduct}
                    >
                      + Add Product
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
                  {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Order" : "Create Order")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-pending {
          background-color: #ffc107;
          color: #000;
        }
        .status-confirmed {
          background-color: #17a2b8;
          color: #fff;
        }
        .status-in_production {
          background-color: #007bff;
          color: #fff;
        }
        .status-ready {
          background-color: #28a745;
          color: #fff;
        }
        .status-shipped {
          background-color: #6f42c1;
          color: #fff;
        }
        .status-delivered {
          background-color: #20c997;
          color: #fff;
        }
        .status-cancelled {
          background-color: #dc3545;
          color: #fff;
        }
      `}</style>
    </>
  );
};

export default OrdersOverview;
