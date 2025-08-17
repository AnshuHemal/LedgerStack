import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [activeTab, setActiveTab] = useState("dashboard");

  // Handle tab changes
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'dashboard') {
      navigate('/inventory/manage');
    } else {
      navigate(`/inventory/manage/${tabName}`);
    }
  };

  // Handle URL-based tab switching
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const tabFromUrl = pathSegments[pathSegments.length - 1];
    
    // Define valid tabs
    const validTabs = ['warehouse', 'products', 'subparts', 'orders', 'machines'];
    
    if (validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      // Default to dashboard if no valid tab in URL (base URL /inventory/manage)
      setActiveTab('dashboard');
    }
  }, [location.pathname, navigate]);

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

  const renderMachines = () => {
    const ProductionUnitOverview = React.lazy(() => import('../ProductionUnit/ProductionUnitOverview'));
    return (
      <div className="machines-section">
        <React.Suspense fallback={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading Production Units...</p>
          </div>
        }>
          <ProductionUnitOverview />
        </React.Suspense>
      </div>
    );
  };



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

            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="row">
          <div className="col-12">
            <div className="tab-content">
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "warehouse" && renderWarehouse()}
              {activeTab === "products" && renderProducts()}
              {activeTab === "subparts" && renderSubparts()}
              {activeTab === "orders" && renderOrders()}
              {activeTab === "machines" && renderMachines()}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
