import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Data states
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [subparts, setSubparts] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Form data states
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    description: "",
  });
  const [machineForm, setMachineForm] = useState({
    machineName: "",
    description: "",
    status: "active",
    location: "",
    capacity: 0,
  });
  const [subpartForm, setSubpartForm] = useState({
    subpartName: "",
    producedByMachineId: "",
    stockQty: 0,
    minStockLevel: 10,
    maxStockLevel: 1000,
    unit: "pieces",
    costPerUnit: 0,
    description: "",
  });
  const [productForm, setProductForm] = useState({
    productName: "",
    categoryId: "",
    sizes: [],
    subpartsRequired: [],
    boxCapacity: 1,
    minStockLevel: 10,
    maxStockLevel: 1000,
    price: 0,
    description: "",
  });
  const [orderForm, setOrderForm] = useState({
    productId: "",
    size: "",
    quantityOrdered: 1,
    priority: "medium",
    customerName: "",
    customerContact: "",
    deliveryDate: "",
    notes: "",
  });

  // API base URL
  const API_BASE = "/api/inventory";

  // Fetch data functions
  const fetchData = async (endpoint, setter) => {
    try {
      const response = await axios.get(`${API_BASE}${endpoint}`);
      setter(response.data.data || []);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      toast.error(`Failed to fetch ${endpoint}`);
      // Set default empty array to prevent undefined errors
      setter([]);
    }
  };

  // Fetch inventory status separately
  const fetchInventoryStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/status`);
      setInventoryStatus(response.data.data || null);
    } catch (error) {
      console.error("Error fetching inventory status:", error);
      toast.error("Failed to fetch inventory status");
      setInventoryStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Monitor modal state changes for debugging
  useEffect(() => {
    // Modal state monitoring
  }, [showForm, formType]);

  // Monitor all state changes for debugging
  useEffect(() => {
    // State monitoring
  }, [
    showForm,
    formType,
    editingItem,
    categories,
    machines,
    subparts,
    products,
    orders,
  ]);

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setInitialLoading(true);
        await Promise.all([
          fetchData("/categories", setCategories),
          fetchData("/machines", setMachines),
          fetchData("/subparts", setSubparts),
          fetchData("/inventory-products", setProducts),
          fetchData("/orders", setOrders),
          fetchInventoryStatus(),
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Form submission handlers
  const handleSubmit = async (e, type, formData, endpoint, successMessage) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem) {
        await axios.put(`${API_BASE}${endpoint}/${editingItem._id}`, formData);
        toast.success(`${type} updated successfully`);
      } else {
        await axios.post(`${API_BASE}${endpoint}`, formData);
        toast.success(`${type} created successfully`);
      }

      // Reset form state
      setShowForm(false);
      setEditingItem(null);
      setFormType("");

      // Refresh data based on type
      if (type === "category") {
        fetchData("/categories", setCategories);
      } else if (type === "machine") {
        fetchData("/machines", setMachines);
      } else if (type === "subparts") {
        fetchData("/subparts", setSubparts);
      } else if (type === "product") {
        fetchData("/inventory-products", setProducts);
      } else if (type === "order") {
        fetchData("/orders", setOrders);
        fetchInventoryStatus();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      let endpoint;
      if (type === "products") {
        endpoint = "/inventory-products";
      } else {
        endpoint = `/${type}`;
      }

      await axios.delete(`${API_BASE}${endpoint}/${id}`);
      toast.success(`${type} deleted successfully`);

      // Refresh relevant data
      if (type === "categories") {
        fetchData("/categories", setCategories);
      } else if (type === "machines") {
        fetchData("/machines", setMachines);
      } else if (type === "subparts") {
        fetchData("/subparts", setSubparts);
      } else if (type === "products") {
        fetchData("/inventory-products", setProducts);
      } else if (type === "orders") {
        fetchData("/orders", setOrders);
      }

      // Refresh inventory status if needed
      if (["products", "subparts"].includes(type)) {
        fetchInventoryStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // Form open handlers
  const openForm = (type, item = null) => {
    setFormType(type);
    setEditingItem(item);
    setShowForm(true);

    if (item) {
      // Populate form with existing data
      switch (type) {
        case "category":
          setCategoryForm({
            categoryName: item.categoryName,
            description: item.description,
          });
          break;
        case "machine":
          setMachineForm({
            machineName: item.machineName,
            description: item.description,
            status: item.status,
            location: item.location,
            capacity: item.capacity,
          });
          break;
        case "subpart":
          setSubpartForm({
            subpartName: item.subpartName,
            producedByMachineId: item.producedByMachineId._id,
            stockQty: item.stockQty,
            minStockLevel: item.minStockLevel,
            maxStockLevel: item.maxStockLevel,
            unit: item.unit,
            costPerUnit: item.costPerUnit,
            description: item.description,
          });
          break;
        case "product":
          setProductForm({
            productName: item.productName,
            categoryId: item.categoryId._id,
            sizes: item.sizes,
            subpartsRequired: item.subpartsRequired,
            boxCapacity: item.boxCapacity,
            minStockLevel: item.minStockLevel,
            maxStockLevel: item.maxStockLevel,
            price: item.price,
            description: item.description,
          });
          break;
        default:
          break;
      }
    }
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormType("");

    // Reset forms
    setCategoryForm({ categoryName: "", description: "" });
    setMachineForm({
      machineName: "",
      description: "",
      status: "active",
      location: "",
      capacity: 0,
    });
    setSubpartForm({
      subpartName: "",
      producedByMachineId: "",
      stockQty: 0,
      minStockLevel: 10,
      maxStockLevel: 1000,
      unit: "pieces",
      costPerUnit: 0,
      description: "",
    });
    setProductForm({
      productName: "",
      categoryId: "",
      sizes: [],
      subpartsRequired: [],
      boxCapacity: 1,
      minStockLevel: 10,
      maxStockLevel: 1000,
      price: 0,
      description: "",
    });
    setOrderForm({
      productId: "",
      size: "",
      quantityOrdered: 1,
      priority: "medium",
      customerName: "",
      customerContact: "",
      deliveryDate: "",
      notes: "",
    });
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/status`, {
        status: newStatus,
      });
      toast.success("Order status updated");
      fetchData("/orders", setOrders);
      fetchInventoryStatus(); // Refresh inventory status after order status change
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  // Render functions
  const renderDashboard = () => (
    <div className="dashboard">
      {/* Welcome Section */}
      {/* <div className="row mb-4">
        <div className="col-12">
          <div className="welcome-card">
            <div className="welcome-content">
              <h2 className="welcome-title">Welcome to Inventory Management</h2>
              <p className="welcome-subtitle">Monitor your manufacturing operations at a glance</p>
            </div>
            <div className="welcome-icon">
              <i className="fas fa-chart-line fa-3x text-primary1"></i>
            </div>
          </div>
        </div>
      </div> */}

      {/* Key Metrics Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card metric-card-primary">
            <div className="metric-icon">
              <i className="fas fa-layer-group fa-2x"></i>
            </div>
            <div className="metric-content">
              <h3 className="metric-number">{categories?.length || 0}</h3>
              <p className="metric-label">Product Categories</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card metric-card-success">
            <div className="metric-icon">
              <i className="fas fa-cogs fa-2x"></i>
            </div>
            <div className="metric-content">
              <h3 className="metric-number">{machines?.length || 0}</h3>
              <p className="metric-label">Production Machines</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card metric-card-info">
            <div className="metric-icon">
              <i className="fas fa-puzzle-piece fa-2x"></i>
            </div>
            <div className="metric-content">
              <h3 className="metric-number">{subparts?.length || 0}</h3>
              <p className="metric-label">Subparts</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card metric-card-warning">
            <div className="metric-icon">
              <i className="fas fa-box fa-2x"></i>
            </div>
            <div className="metric-content">
              <h3 className="metric-number">{products?.length || 0}</h3>
              <p className="metric-label">Finished Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Overview */}
      <div className="row mb-4">
        <div className="col-lg-8 mb-3">
          <div className="dashboard-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="fas fa-shopping-cart me-2"></i>
                Recent Orders
              </h5>
              <span className="badge bg-primary">{orders?.length || 0} Total</span>
            </div>
            <div className="card-body">
              {orders && orders.length > 0 ? (
                <div className="orders-list">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="order-item">
                      <div className="order-info">
                        <div className="order-number">#{order.orderNumber}</div>
                        <div className="order-product">{order.productId?.productName || 'Unknown Product'}</div>
                        <div className="order-customer">{order.customerName || 'Unknown Customer'}</div>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                        <div className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="dashboard-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="fas fa-chart-pie me-2"></i>
                Order Status
              </h5>
            </div>
            <div className="card-body">
              <div className="status-breakdown">
                <div className="status-item">
                  <div className="status-dot bg-warning"></div>
                  <span>Pending</span>
                  <span className="status-count">{orders?.filter(o => o.status === 'pending')?.length || 0}</span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-info"></div>
                  <span>Processing</span>
                  <span className="status-count">{orders?.filter(o => o.status === 'processing')?.length || 0}</span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-success"></div>
                  <span>Ready</span>
                  <span className="status-count">{orders?.filter(o => o.status === 'ready')?.length || 0}</span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-primary"></div>
                  <span>Delivered</span>
                  <span className="status-count">{orders?.filter(o => o.status === 'delivered')?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="row">
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                Low Stock Alerts
              </h5>
            </div>
            <div className="card-body">
              {inventoryStatus?.products && inventoryStatus.products.length > 0 ? (
                <div className="alerts-list">
                  {inventoryStatus.products
                    .filter(p => p.stock <= (p.minStockLevel || 10))
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product._id} className="alert-item">
                        <div className="alert-icon">
                          <i className="fas fa-exclamation-circle text-warning"></i>
                        </div>
                        <div className="alert-content">
                          <div className="alert-title">{product.productName}</div>
                          <div className="alert-details">
                            Current Stock: <strong>{product.stock}</strong> | 
                            Min Level: <strong>{product.minStockLevel || 10}</strong>
                          </div>
                        </div>
                        <div className="alert-action">
                          <button 
                            onClick={() => openForm('product', product)} 
                            className="btn btn-sm btn-outline-warning"
                          >
                            Restock
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                  <p className="text-muted">All products are well stocked</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="fas fa-tachometer-alt me-2 text-info"></i>
                Production Overview
              </h5>
            </div>
            <div className="card-body">
              <div className="production-stats">
                <div className="stat-item">
                  <div className="stat-icon bg-primary">
                    <i className="fas fa-industry"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{machines?.filter(m => m.status === 'active')?.length || 0}</div>
                    <div className="stat-label">Active Machines</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon bg-success">
                    <i className="fas fa-boxes"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {inventoryStatus?.products?.reduce((sum, p) => sum + (p.boxesReady || 0), 0) || 0}
                    </div>
                    <div className="stat-label">Total Boxes Ready</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon bg-warning">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{orders?.filter(o => o.status === 'pending')?.length || 0}</div>
                    <div className="stat-label">Pending Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="categories-section">
      <div className="section-header">
        <h2></h2>
        <button
          onClick={() => openForm("category")}
          className="login-button"
        >
          Add Category
        </button>
      </div>

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.categoryName}</td>
                  <td>{category.description}</td>
                  <td>
                    <button
                      onClick={() => openForm("category", category)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("categories", category._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMachines = () => (
    <div className="machines-section">
      <div className="section-header">
        <h2></h2>
        <button
          onClick={() => openForm("machine")}
          className="login-button"
        >
          Add Machine
        </button>
      </div>

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Machine Name</th>
              <th>Status</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {machines && machines.length > 0 ? (
              machines.map((machine) => (
                <tr key={machine._id}>
                  <td>{machine.machineName}</td>
                  <td>
                    <span className={`status status-${machine.status}`}>
                      {machine.status}
                    </span>
                  </td>
                  <td>{machine.location}</td>
                  <td>{machine.capacity}</td>
                  <td>
                    <button
                      onClick={() => openForm("machine", machine)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("machines", machine._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No machines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubparts = () => (
    <div className="subparts-section">
      <div className="section-header">
        <h2></h2>
        <button
          onClick={() => openForm("subpart")}
          className="login-button"
        >
          Add Subpart
        </button>
      </div>

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Subpart Name</th>
              <th>Machine</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subparts && subparts.length > 0 ? (
              subparts.map((subpart) => (
                <tr key={subpart._id}>
                  <td>{subpart.subpartName}</td>
                  <td>{subpart.producedByMachineId?.machineName || "N/A"}</td>
                  <td>
                    <span className={subpart.isLowStock ? "warning" : ""}>
                      {subpart.stockQty}
                    </span>
                  </td>
                  <td>{subpart.unit}</td>
                  <td>
                    <span
                      className={`status status-${
                        subpart.isLowStock ? "warning" : "normal"
                      }`}
                    >
                      {subpart.isLowStock ? "Low Stock" : "Normal"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openForm("subpart", subpart)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit Stock
                    </button>
                    <button
                      onClick={() => handleDelete("subparts", subpart._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No subparts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="products-section">
      <div className="section-header">
        <h2></h2>
        <button
          onClick={() => openForm("product")}
          className="login-button"
        >
          Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Sizes</th>
              <th>Stock</th>
              <th>Boxes Ready</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product.productName}</td>
                  <td>{product.categoryId?.categoryName || "N/A"}</td>
                  <td>
                    {product.sizes?.map((s) => s.size).join(", ") || "N/A"}
                  </td>
                  <td>{product.stock}</td>
                  <td>{product.boxesReady || 0}</td>
                  <td>
                    <span
                      className={`status status-${
                        product.stockStatus || "normal"
                      }`}
                    >
                      {product.stockStatus || "Normal"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openForm("product", product)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("products", product._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="orders-section">
      <div className="section-header">
        <h2></h2>
        <button
          onClick={() => openForm("order")}
          className="login-button"
        >
          Create Order
        </button>
      </div>

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Product</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.productId?.productName || "N/A"}</td>
                  <td>{order.size}</td>
                  <td>{order.quantityOrdered}</td>
                  <td>
                    <span className={`status status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.customerName || "N/A"}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_production">In Production</option>
                      <option value="ready">Ready</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => handleDelete("orders", order._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventoryStatus = () => (
    <div className="inventory-status-section">
      <h2>Inventory Status</h2>

      {inventoryStatus &&
      inventoryStatus.products &&
      inventoryStatus.products.length > 0 ? (
        <div className="inventory-grid">
          {inventoryStatus.products.map((product) => (
            <div key={product._id} className="inventory-card">
              <h3>{product.productName}</h3>
              <p>
                <strong>Category:</strong>{" "}
                {product.categoryId?.categoryName || "N/A"}
              </p>
              <p>
                <strong>Current Stock:</strong> {product.stock}
              </p>
              <p>
                <strong>Boxes Ready:</strong> {product.boxesReady || 0}
              </p>
              <p>
                <strong>Status:</strong>
                <span
                  className={`status status-${product.stockStatus || "normal"}`}
                >
                  {product.stockStatus || "Normal"}
                </span>
              </p>

              {product.subpartsAvailability &&
                product.subpartsAvailability.length > 0 && (
                  <div className="subparts-status">
                    <h4>Subparts Availability:</h4>
                    {product.subpartsAvailability.map((subpart, index) => (
                      <div key={index} className="subpart-status">
                        <span>{subpart.subpartName}:</span>
                        <span className={subpart.isLowStock ? "warning" : ""}>
                          {subpart.availableQty} / {subpart.requiredQty}{" "}
                          {subpart.unit}
                        </span>
                        <span>→ {subpart.possibleBoxes} boxes</span>
                      </div>
                    ))}
                  </div>
                )}

              {product.limitingFactor && (
                <p className="warning">
                  <strong>Limiting Factor:</strong> {product.limitingFactor}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", padding: "20px" }}>
          No inventory status data available
        </p>
      )}
    </div>
  );

  // Render form based on type
  const renderCategoryForm = () => (
    <form
      onSubmit={(e) =>
        handleSubmit(e, "category", categoryForm, "/categories", "Category")
      }
      className="form"
    >
      <h3>{editingItem ? "Edit Category" : "Add Category"}</h3>
      <div className="form-group">
        <label>Category Name:</label>
        <input
          type="text"
          value={categoryForm.categoryName}
          onChange={(e) =>
            setCategoryForm({ ...categoryForm, categoryName: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={categoryForm.description}
          onChange={(e) =>
            setCategoryForm({ ...categoryForm, description: e.target.value })
          }
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving..." : editingItem ? "Update" : "Create"}
        </button>
        <button type="button" onClick={closeForm} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );

  const renderMachineForm = () => (
    <form
      onSubmit={(e) =>
        handleSubmit(e, "machine", machineForm, "/machines", "Machine")
      }
      className="form"
    >
      <h3>{editingItem ? "Edit Machine" : "Add Machine"}</h3>
      <div className="form-group">
        <label>Machine Name:</label>
        <input
          type="text"
          value={machineForm.machineName}
          onChange={(e) =>
            setMachineForm({ ...machineForm, machineName: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={machineForm.description}
          onChange={(e) =>
            setMachineForm({ ...machineForm, description: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Status:</label>
        <select
          value={machineForm.status}
          onChange={(e) =>
            setMachineForm({ ...machineForm, status: e.target.value })
          }
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
          <option value="broken">Broken</option>
        </select>
      </div>
      <div className="form-group">
        <label>Location:</label>
        <input
          type="text"
          value={machineForm.location}
          onChange={(e) =>
            setMachineForm({ ...machineForm, location: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Capacity:</label>
        <input
          type="number"
          value={machineForm.capacity}
          onChange={(e) =>
            setMachineForm({ ...machineForm, capacity: Number(e.target.value) })
          }
          min="0"
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving..." : editingItem ? "Update" : "Create"}
        </button>
        <button type="button" onClick={closeForm} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );

  const renderSubpartForm = () => (
    <form
      onSubmit={(e) =>
        handleSubmit(e, "subpart", subpartForm, "/subparts", "Subpart")
      }
      className="form"
    >
      <h3>{editingItem ? "Edit Subpart" : "Add Subpart"}</h3>
      <div className="form-group">
        <label>Subpart Name:</label>
        <input
          type="text"
          value={subpartForm.subpartName}
          onChange={(e) =>
            setSubpartForm({ ...subpartForm, subpartName: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Produced By Machine:</label>
        <select
          value={subpartForm.producedByMachineId}
          onChange={(e) =>
            setSubpartForm({
              ...subpartForm,
              producedByMachineId: e.target.value,
            })
          }
          required
        >
          <option value="">Select Machine</option>
          {machines.map((machine) => (
            <option key={machine._id} value={machine._id}>
              {machine.machineName} ({machine.status})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Stock Quantity:</label>
        <input
          type="number"
          value={subpartForm.stockQty}
          onChange={(e) =>
            setSubpartForm({ ...subpartForm, stockQty: Number(e.target.value) })
          }
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label>Unit:</label>
        <select
          value={subpartForm.unit}
          onChange={(e) =>
            setSubpartForm({ ...subpartForm, unit: e.target.value })
          }
        >
          <option value="pieces">Pieces</option>
          <option value="kg">Kilograms</option>
          <option value="meters">Meters</option>
          <option value="liters">Liters</option>
        </select>
      </div>
      <div className="form-group">
        <label>Min Stock Level:</label>
        <input
          type="number"
          value={subpartForm.minStockLevel}
          onChange={(e) =>
            setSubpartForm({
              ...subpartForm,
              minStockLevel: Number(e.target.value),
            })
          }
          min="0"
        />
      </div>
      <div className="form-group">
        <label>Max Stock Level:</label>
        <input
          type="number"
          value={subpartForm.maxStockLevel}
          onChange={(e) =>
            setSubpartForm({
              ...subpartForm,
              maxStockLevel: Number(e.target.value),
            })
          }
          min="0"
        />
      </div>
      <div className="form-group">
        <label>Cost Per Unit:</label>
        <input
          type="number"
          value={subpartForm.costPerUnit}
          onChange={(e) =>
            setSubpartForm({
              ...subpartForm,
              costPerUnit: Number(e.target.value),
            })
          }
          min="0"
          step="0.01"
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={subpartForm.description}
          onChange={(e) =>
            setSubpartForm({ ...subpartForm, description: e.target.value })
          }
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving..." : editingItem ? "Update" : "Create"}
        </button>
        <button type="button" onClick={closeForm} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );

  const renderProductForm = () => (
    <form
      onSubmit={(e) =>
        handleSubmit(
          e,
          "product",
          productForm,
          "/inventory-products",
          "Product"
        )
      }
      className="form"
    >
      <h3>{editingItem ? "Edit Product" : "Add Product"}</h3>
      <div className="form-group">
        <label>Product Name:</label>
        <input
          type="text"
          value={productForm.productName}
          onChange={(e) =>
            setProductForm({ ...productForm, productName: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Category:</label>
        <select
          value={productForm.categoryId}
          onChange={(e) =>
            setProductForm({ ...productForm, categoryId: e.target.value })
          }
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Box Capacity:</label>
        <input
          type="number"
          value={productForm.boxCapacity}
          onChange={(e) =>
            setProductForm({
              ...productForm,
              boxCapacity: Number(e.target.value),
            })
          }
          min="1"
          required
        />
      </div>
      <div className="form-group">
        <label>Min Stock Level:</label>
        <input
          type="number"
          value={productForm.minStockLevel}
          onChange={(e) =>
            setProductForm({
              ...productForm,
              minStockLevel: Number(e.target.value),
            })
          }
          min="0"
        />
      </div>
      <div className="form-group">
        <label>Max Stock Level:</label>
        <input
          type="number"
          value={productForm.maxStockLevel}
          onChange={(e) =>
            setProductForm({
              ...productForm,
              maxStockLevel: Number(e.target.value),
            })
          }
          min="0"
        />
      </div>
      <div className="form-group">
        <label>Price:</label>
        <input
          type="number"
          value={productForm.price}
          onChange={(e) =>
            setProductForm({ ...productForm, price: Number(e.target.value) })
          }
          min="0"
          step="0.01"
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={productForm.description}
          onChange={(e) =>
            setProductForm({ ...productForm, description: e.target.value })
          }
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving..." : editingItem ? "Update" : "Create"}
        </button>
        <button type="button" onClick={closeForm} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );

  const renderOrderForm = () => (
    <form
      onSubmit={(e) => handleSubmit(e, "order", orderForm, "/orders", "Order")}
      className="form"
    >
      <h3>Create New Order</h3>
      <div className="form-group">
        <label>Product:</label>
        <select
          value={orderForm.productId}
          onChange={(e) =>
            setOrderForm({ ...orderForm, productId: e.target.value })
          }
          required
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.productName}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Size:</label>
        <select
          value={orderForm.size}
          onChange={(e) => setOrderForm({ ...orderForm, size: e.target.value })}
          required
          disabled={!orderForm.productId}
        >
          <option value="">Select Size</option>
          {orderForm.productId &&
            products
              .find((p) => p._id === orderForm.productId)
              ?.sizes.map((size) => (
                <option key={size.size} value={size.size}>
                  {size.size}
                </option>
              ))}
        </select>
      </div>
      <div className="form-group">
        <label>Quantity Ordered:</label>
        <input
          type="number"
          value={orderForm.quantityOrdered}
          onChange={(e) =>
            setOrderForm({
              ...orderForm,
              quantityOrdered: Number(e.target.value),
            })
          }
          min="1"
          required
        />
      </div>
      <div className="form-group">
        <label>Priority:</label>
        <select
          value={orderForm.priority}
          onChange={(e) =>
            setOrderForm({ ...orderForm, priority: e.target.value })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <div className="form-group">
        <label>Customer Name:</label>
        <input
          type="text"
          value={orderForm.customerName}
          onChange={(e) =>
            setOrderForm({ ...orderForm, customerName: e.target.value })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Customer Contact:</label>
        <input
          type="text"
          value={orderForm.customerContact}
          onChange={(e) =>
            setOrderForm({ ...orderForm, customerContact: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Delivery Date:</label>
        <input
          type="date"
          value={orderForm.deliveryDate}
          onChange={(e) =>
            setOrderForm({ ...orderForm, deliveryDate: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Notes:</label>
        <textarea
          value={orderForm.notes}
          onChange={(e) =>
            setOrderForm({ ...orderForm, notes: e.target.value })
          }
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Creating..." : "Create Order"}
        </button>
        <button type="button" onClick={closeForm} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );

  // Render form based on type
  const renderForm = () => {
    let formComponent = null;

    switch (formType) {
      case "category":
        formComponent = renderCategoryForm();
        break;
      case "machine":
        formComponent = renderMachineForm();
        break;
      case "subpart":
        formComponent = renderSubpartForm();
        break;
      case "product":
        formComponent = renderProductForm();
        break;
      case "order":
        formComponent = renderOrderForm();
        break;
      default:
        formComponent = <div>No form type specified</div>;
    }

    return formComponent;
  };

  return (
    <div className="pt-2">
      <div className="container-fluid">
        {/* Header Section */}
        <div className="row mb-2">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div className="ms-lg-2">
                <h5
                  className="display-6"
                  style={{ fontSize: "25px", fontWeight: "500" }}
                >
                  Inventory Management
                </h5>
                <p className="text-secondary1 mb-0">
                  Manage your manufacturing inventory, track subparts, and fulfill
                  orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="row mb-1">
          <div className="col-12">
            <div className="nav nav-tabs" id="inventoryTabs" role="tablist">
              <button
                className={`nav-link ${
                  activeTab === "dashboard" ? "active" : ""
                }`}
                onClick={() => setActiveTab("dashboard")}
                type="button"
                role="tab"
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${
                  activeTab === "categories" ? "active" : ""
                }`}
                onClick={() => setActiveTab("categories")}
                type="button"
                role="tab"
              >
                Categories
              </button>
              <button
                className={`nav-link ${
                  activeTab === "machines" ? "active" : ""
                }`}
                onClick={() => setActiveTab("machines")}
                type="button"
                role="tab"
              >
                Machines
              </button>
              <button
                className={`nav-link ${
                  activeTab === "subparts" ? "active" : ""
                }`}
                onClick={() => setActiveTab("subparts")}
                type="button"
                role="tab"
              >
                Subparts
              </button>
              <button
                className={`nav-link ${
                  activeTab === "products" ? "active" : ""
                }`}
                onClick={() => setActiveTab("products")}
                type="button"
                role="tab"
              >
                Products
              </button>
              <button
                className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
                type="button"
                role="tab"
              >
                Orders
              </button>
              <button
                className={`nav-link ${
                  activeTab === "inventory-status" ? "active" : ""
                }`}
                onClick={() => setActiveTab("inventory-status")}
                type="button"
                role="tab"
              >
                Inventory Status
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="row">
          <div className="col-12">
            {initialLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary1" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary1">
                  Loading inventory system...
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary1" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary1">Updating data...</p>
              </div>
            ) : (
              <div className="tab-content">
                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "categories" && renderCategories()}
                {activeTab === "machines" && renderMachines()}
                {activeTab === "subparts" && renderSubparts()}
                {activeTab === "products" && renderProducts()}
                {activeTab === "orders" && renderOrders()}
                {activeTab === "inventory-status" && renderInventoryStatus()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for forms */}
      {showForm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem
                    ? `Edit ${
                        formType.charAt(0).toUpperCase() + formType.slice(1)
                      }`
                    : `Add New ${
                        formType.charAt(0).toUpperCase() + formType.slice(1)
                      }`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForm}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">{renderForm()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
