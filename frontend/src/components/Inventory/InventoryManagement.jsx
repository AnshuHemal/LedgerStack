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

  // Render Dashboard
  const renderDashboard = () => (
    <div className="dashboard">
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
              <span className="badge bg-primary">
                {orders?.length || 0} Total
              </span>
            </div>
            <div className="card-body">
              {orders && orders.length > 0 ? (
                <div className="orders-list">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="order-item">
                      <div className="order-info">
                        <div className="order-number">#{order.orderNumber}</div>
                        <div
                          className="order-products"
                          style={{ marginBottom: "5px" }}
                        >
                          {order.products &&
                            order.products.slice(0, 2).map((product, index) => (
                              <div
                                key={index}
                                className="product-summary"
                                style={{
                                  fontSize: "0.9em",
                                  color: "#333",
                                  marginBottom: "2px",
                                }}
                              >
                                {product.productId?.productName ||
                                  "Unknown Product"}{" "}
                                ({product.quantityOrdered})
                            </div>
                          ))}
                          {order.products && order.products.length > 2 && (
                            <div
                              className="more-products"
                              style={{
                                fontSize: "0.8em",
                                color: "#666",
                                fontStyle: "italic",
                              }}
                            >
                              +{order.products.length - 2} more
                            </div>
                          )}
                        </div>
                        <div
                          className="order-company"
                          style={{
                            fontSize: "0.9em",
                            color: "#666",
                            fontWeight: "500",
                          }}
                        >
                          {order.companyId?.name || "Unknown Company"}
                        </div>
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
                  <span className="status-count">
                    {orders?.filter((o) => o.status === "pending")?.length || 0}
                  </span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-info"></div>
                  <span>Confirmed</span>
                  <span className="status-count">
                    {orders?.filter((o) => o.status === "confirmed")?.length ||
                      0}
                  </span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-primary"></div>
                  <span>In Production</span>
                  <span className="status-count">
                    {orders?.filter((o) => o.status === "in_production")
                      ?.length || 0}
                  </span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-success"></div>
                  <span>Ready</span>
                  <span className="status-count">
                    {orders?.filter((o) => o.status === "ready")?.length || 0}
                  </span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-info"></div>
                  <span>Shipped</span>
                  <span className="status-count">
                    {orders?.filter((o) => o.status === "shipped")?.length || 0}
                  </span>
                </div>
                <div className="status-item">
                  <div className="status-dot bg-success"></div>
                  <span>Delivered</span>
                  <span className="status-count">
                    {orders?.filter((o) => o.status === "delivered")?.length ||
                      0}
                  </span>
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
              {inventoryStatus?.products &&
              inventoryStatus.products.length > 0 ? (
                <div className="alerts-list">
                  {inventoryStatus.products
                    .filter((p) => p.stock <= (p.minStockLevel || 10))
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product._id} className="alert-item">
                        <div className="alert-icon">
                          <i className="fas fa-exclamation-circle text-warning"></i>
                        </div>
                        <div className="alert-content">
                          <div className="alert-title">
                            {product.productName}
                          </div>
                          <div className="alert-details">
                            Current Stock: <strong>{product.stock}</strong> | 
                            Min Level:{" "}
                            <strong>{product.minStockLevel || 10}</strong>
                          </div>
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
                    <div className="stat-number">
                      {machines?.filter((m) => m.status === "active")?.length ||
                        0}
                    </div>
                    <div className="stat-label">Active Machines</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon bg-success">
                    <i className="fas fa-boxes"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {inventoryStatus?.products?.reduce(
                        (sum, p) => sum + (p.boxesReady || 0),
                        0
                      ) || 0}
                    </div>
                    <div className="stat-label">Total Boxes Ready</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon bg-warning">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {orders?.filter((o) => o.status === "pending")?.length ||
                        0}
                    </div>
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

  // Render other tabs (placeholder content)
  const renderWarehouse = () => {
    const WarehouseOverview = React.lazy(() => import('../Warehouse/WarehouseOverview'));
    return (
      <div className="warehouse-section">
        <React.Suspense fallback={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
      </div>
            <p className="mt-3">Loading Warehouse...</p>
      </div>
        }>
          <WarehouseOverview />
        </React.Suspense>
    </div>
  );
  };

  const renderProducts = () => (
    <div className="products-section">
      <div className="text-center py-5">
        <i className="fas fa-box fa-3x text-muted mb-3"></i>
        <h4>Products Management</h4>
        <p className="text-muted">Products content will be implemented here</p>
      </div>
    </div>
  );

  const renderSubparts = () => {
    const SubpartsOverview = React.lazy(() => import('../Subparts/SubpartsOverview'));
    return (
    <div className="subparts-section">
        <React.Suspense fallback={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
      </div>
            <p className="mt-3">Loading Subparts...</p>
      </div>
        }>
          <SubpartsOverview />
        </React.Suspense>
    </div>
  );
  };

  const renderOrders = () => {
    const OrdersOverview = React.lazy(() => import('../Orders/OrdersOverview'));
    return (
    <div className="orders-section">
        <React.Suspense fallback={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
      </div>
            <p className="mt-3">Loading Orders...</p>
                        </div>
        }>
          <OrdersOverview />
        </React.Suspense>
    </div>
  );
  };

  const renderMachines = () => (
    <div className="machines-section">
      <div className="text-center py-5">
        <i className="fas fa-cogs fa-3x text-muted mb-3"></i>
        <h4>Machines Management</h4>
        <p className="text-muted">Machines content will be implemented here</p>
      </div>
      </div>
  );

  const renderDailyLogs = () => (
    <div className="daily-logs-section">
      <div className="text-center py-5">
        <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
        <h4>Daily Logs</h4>
        <p className="text-muted">Daily logs content will be implemented here</p>
            </div>
        </div>
  );

  return (
    <div className="pt-2">
      <div className="container-fluid">
        {/* Header Section */}
        {/* <div className="row mb-2">
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
                  Monitor your manufacturing operations at a glance
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Tabs Section */}
        <div className="row mb-1">
          <div className="col-12">
            <div className="nav nav-tabs" id="inventoryTabs" role="tablist">
              <button
                className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
                type="button"
                role="tab"
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${activeTab === "warehouse" ? "active" : ""}`}
                onClick={() => setActiveTab("warehouse")}
                type="button"
                role="tab"
              >
                Warehouse
              </button>
              <button
                className={`nav-link ${activeTab === "products" ? "active" : ""}`}
                onClick={() => setActiveTab("products")}
                type="button"
                role="tab"
              >
                Products
              </button>
              <button
                className={`nav-link ${activeTab === "subparts" ? "active" : ""}`}
                onClick={() => setActiveTab("subparts")}
                type="button"
                role="tab"
              >
                Subparts
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
                className={`nav-link ${activeTab === "machines" ? "active" : ""}`}
                onClick={() => setActiveTab("machines")}
                type="button"
                role="tab"
              >
                Machines
              </button>
              <button
                className={`nav-link ${activeTab === "daily-logs" ? "active" : ""}`}
                onClick={() => setActiveTab("daily-logs")}
                type="button"
                role="tab"
              >
                Daily Logs
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
                {activeTab === "warehouse" && renderWarehouse()}
                {activeTab === "products" && renderProducts()}
                {activeTab === "subparts" && renderSubparts()}
                {activeTab === "orders" && renderOrders()}
                {activeTab === "machines" && renderMachines()}
                {activeTab === "daily-logs" && renderDailyLogs()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
