import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Handle tab changes
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'dashboard') {
      navigate('/inventory/manage');
    } else {
      navigate(`/inventory/manage/${tabName}`);
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

  // Handle URL-based tab switching
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const tabFromUrl = pathSegments[pathSegments.length - 1];
    
    // Define valid tabs
    const validTabs = ['warehouse', 'products', 'subparts', 'orders', 'machines', 'daily-logs'];
    
    if (validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      // Default to dashboard if no valid tab in URL (base URL /inventory/manage)
      setActiveTab('dashboard');
    }
  }, [location.pathname, navigate]);

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
  const renderDashboard = () => {
    const DashboardOverview = React.lazy(() => import("../Dashboard/DashboardOverview"));
    return (
      <div className="dashboard-section">
        <React.Suspense fallback={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading Dashboard...</p>
          </div>
        }>
          <DashboardOverview />
        </React.Suspense>
      </div>
    );
  };

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

  const renderProducts = () => {
    const ProductsOverview = React.lazy(() => import('../Products/ProductsOverview'));
    return (
      <div className="products-section">
        <React.Suspense fallback={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
      </div>
            <p className="mt-3">Loading Products...</p>
      </div>
        }>
          <ProductsOverview />
        </React.Suspense>
    </div>
  );
  };

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
                onClick={() => handleTabChange("dashboard")}
                type="button"
                role="tab"
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${activeTab === "warehouse" ? "active" : ""}`}
                onClick={() => handleTabChange("warehouse")}
                type="button"
                role="tab"
              >
                Warehouse
              </button>
              <button
                className={`nav-link ${activeTab === "products" ? "active" : ""}`}
                onClick={() => handleTabChange("products")}
                type="button"
                role="tab"
              >
                Products
              </button>
              <button
                className={`nav-link ${activeTab === "subparts" ? "active" : ""}`}
                onClick={() => handleTabChange("subparts")}
                type="button"
                role="tab"
              >
                Subparts
              </button>
              <button
                className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => handleTabChange("orders")}
                type="button"
                role="tab"
              >
                Orders
              </button>
              <button
                className={`nav-link ${activeTab === "machines" ? "active" : ""}`}
                onClick={() => handleTabChange("machines")}
                type="button"
                role="tab"
              >
                Production Unit
              </button>
              <button
                className={`nav-link ${activeTab === "daily-logs" ? "active" : ""}`}
                onClick={() => handleTabChange("daily-logs")}
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
