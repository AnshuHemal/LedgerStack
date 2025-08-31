import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { 
  RefreshCw, 
  AlertCircle, 
  TrendingUp, 
  Package, 
  Users, 
  Settings, 
  FileText, 
  Store,
  DollarSign,
  ShoppingCart,
  Truck,
  Calendar,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";

const Overview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    salesStats: [],
    revenueData: [],
    topProducts: [],
    recentTransactions: [],
    monthlyRevenue: [],
    customerStats: [],
    inventoryStats: [],
  });
  const [analyticsData, setAnalyticsData] = useState({
    orderTrends: [],
    productPerformance: [],
    customerAnalytics: [],
    inventoryAnalytics: [],
  });
  const [reportsData, setReportsData] = useState({
    generatedReports: [],
    reportTemplates: [],
    reportHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "https://ledgerstack-backend.vercel.app/api/dashboard";

  // Handle tab changes
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Helper function to get status colors
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#ffc107",
      confirmed: "#17a2b8",
      completed: "#28a745",
      active: "#007bff",
      inactive: "#6c757d",
      cancelled: "#dc3545",
      success: "#28a745",
      warning: "#ffc107",
      error: "#dc3545",
      in_production: "#28a745",
      ready: "#007bff",
      shipped: "#6c757d",
      delivered: "#28a745"
    };
    return statusColors[status] || "#6c757d";
  };

  // Helper function to calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Fetch data from backend APIs with error handling
      const fetchWithErrorHandling = async (url) => {
        try {
          const response = await axios.get(url, { withCredentials: true });
          return response.data.data || [];
        } catch (error) {
          console.warn(`Failed to fetch ${url}:`, error.message);
          return [];
        }
      };

      const [
        summaryRes,
        ordersStatsRes,
        productsDistributionRes,
        topProductsRes,
        recentOrdersRes,
        productsSalesPerMonthRes,
        orderTrendsRes,
        productPerformanceRes,
        customerAnalyticsRes,
        inventoryAnalyticsRes,
        generatedReportsRes,
        reportTemplatesRes,
        reportHistoryRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/summary`, { withCredentials: true }),
        axios.get(`${API_BASE}/orders-stats`, { withCredentials: true }),
        axios.get(`${API_BASE}/products-distribution`, { withCredentials: true }),
        axios.get(`${API_BASE}/top-products`, { withCredentials: true }),
        axios.get(`${API_BASE}/recent-orders`, { withCredentials: true }),
        axios.get(`${API_BASE}/products-sales-per-month`, { withCredentials: true }),
        fetchWithErrorHandling(`${API_BASE}/order-trends`),
        fetchWithErrorHandling(`${API_BASE}/product-performance`),
        fetchWithErrorHandling(`${API_BASE}/customer-analytics`),
        fetchWithErrorHandling(`${API_BASE}/inventory-analytics`),
        fetchWithErrorHandling(`${API_BASE}/generated-reports`),
        fetchWithErrorHandling(`${API_BASE}/report-templates`),
        fetchWithErrorHandling(`${API_BASE}/report-history`),
      ]);

      // Process the data
      const summary = summaryRes.data.data;
      const ordersStats = ordersStatsRes.data.data;
      const productsDistribution = productsDistributionRes.data.data;
      const topProducts = topProductsRes.data.data;
      const recentOrders = recentOrdersRes.data.data;
      const productsSalesPerMonth = productsSalesPerMonthRes.data.data;
      
      // Process Analytics data
      const orderTrends = orderTrendsRes || [];
      const productPerformance = productPerformanceRes || [];
      const customerAnalytics = customerAnalyticsRes || [];
      const inventoryAnalytics = inventoryAnalyticsRes || [];
      
      // Ensure data is properly formatted for charts
      const formattedOrderTrends = orderTrends.map(item => ({
        month: item.month,
        count: Number(item.count) || 0,
        totalAmount: Number(item.totalAmount) || 0
      }));
      
      const formattedProductPerformance = productPerformance.map(item => ({
        name: String(item.name || 'Unknown'),
        availableQuantity: Number(item.availableQuantity) || 0,
        productGroup: String(item.productGroup || 'N/A')
      }));
      
      const formattedCustomerAnalytics = customerAnalytics.map(item => ({
        name: String(item.name || 'Unknown'),
        count: Number(item.count) || 0,
        totalAmount: Number(item.totalAmount) || 0
      }));
      
      const formattedInventoryAnalytics = inventoryAnalytics.map(item => ({
        month: item.month,
        count: Number(item.count) || 0
      }));
      
      // Process Reports data
      const generatedReports = generatedReportsRes || [];
      const reportTemplates = reportTemplatesRes || [];
      const reportHistory = reportHistoryRes || [];

      // Calculate growth percentages (mock for now - you can implement actual growth calculation)
      const monthlyGrowth = 12.5; // This should be calculated from actual data
      const orderGrowth = 8.3;
      const customerGrowth = 15.2;
      const productGrowth = 5.7;

      // Transform data for charts
      const revenueData = productsDistribution.map((item, index) => ({
        name: item._id,
        value: item.count,
        color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]
      }));

      // Transform recent orders for display
      const recentTransactions = recentOrders.map(order => ({
        id: order._id,
        customer: order.company?.companyName || 'N/A',
        amount: order.totalAmount || 0,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString()
      }));

      // Transform monthly revenue data
      const monthlyRevenue = productsSalesPerMonth.map(monthData => ({
        month: monthData.month,
        revenue: monthData.totalSales * 1000, // Mock revenue calculation
        profit: monthData.totalSales * 300, // Mock profit calculation
        orders: monthData.totalSales
      }));

      // Transform top products
      const topProductsDisplay = topProducts.map(product => ({
        name: product.name,
        sales: product.availableQuantity * 1000, // Mock sales calculation
        growth: Math.random() * 20 - 5, // Mock growth
        availableQuantity: product.availableQuantity
      }));

      // Create customer stats (mock for now)
      const customerStats = [
        { category: 'New', count: Math.floor(Math.random() * 100) + 50, growth: 15.2 },
        { category: 'Returning', count: Math.floor(Math.random() * 200) + 150, growth: 8.7 },
        { category: 'VIP', count: Math.floor(Math.random() * 50) + 20, growth: 22.1 }
      ];

      // Create inventory stats
      const inventoryStats = [
        { category: 'In Stock', count: summary.totalProducts || 0, percentage: 75 },
        { category: 'Low Stock', count: Math.floor((summary.totalProducts || 0) * 0.2), percentage: 20 },
        { category: 'Out of Stock', count: Math.floor((summary.totalProducts || 0) * 0.05), percentage: 5 }
      ];

      setDashboardData({
        summary: {
          totalRevenue: (summary.totalOrders || 0) * 50000, // Mock revenue
          totalOrders: summary.totalOrders || 0,
          totalCustomers: Math.floor((summary.totalOrders || 0) * 0.8), // Mock customers
          totalProducts: summary.totalProducts || 0,
          totalGroups: summary.totalGroups || 0,
          totalSubparts: summary.totalSubparts || 0,
          totalSkus: summary.totalSkus || 0,
          monthlyGrowth,
          orderGrowth,
          customerGrowth,
          productGrowth
        },
        salesStats: ordersStats,
        revenueData,
        topProducts: topProductsDisplay,
        recentTransactions,
        monthlyRevenue,
        customerStats,
        inventoryStats
      });

      setAnalyticsData({
        orderTrends: formattedOrderTrends,
        productPerformance: formattedProductPerformance,
        customerAnalytics: formattedCustomerAnalytics,
        inventoryAnalytics: formattedInventoryAnalytics,
      });

      setReportsData({
        generatedReports,
        reportTemplates,
        reportHistory,
      });
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Render Analytics Tab
  const renderAnalytics = () => {
    return (
      <div className="analytics-section">
        <div className="row">
          <div className="col-12">
            <h4 className="mb-4">Analytics Dashboard</h4>
          </div>
        </div>
        
        <div className="row">
          <div className="col-xl-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Order Trends Analysis</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Array.isArray(analyticsData.orderTrends) && analyticsData.orderTrends.length > 0 ? analyticsData.orderTrends : dashboardData.salesStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} orders`} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-xl-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Product Performance</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Array.isArray(analyticsData.productPerformance) && analyticsData.productPerformance.length > 0 ? analyticsData.productPerformance : dashboardData.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} units`} />
                    <Legend />
                    <Bar dataKey="availableQuantity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Customer Analytics</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Array.isArray(analyticsData.customerAnalytics) && analyticsData.customerAnalytics.length > 0 ? analyticsData.customerAnalytics : dashboardData.customerStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name} ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(analyticsData.customerAnalytics.length > 0 ? analyticsData.customerAnalytics : dashboardData.customerStats).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-xl-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Inventory Analytics</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={Array.isArray(analyticsData.inventoryAnalytics) && analyticsData.inventoryAnalytics.length > 0 ? analyticsData.inventoryAnalytics : dashboardData.salesStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} items`} />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Advanced Analytics</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 border rounded">
                      <h4 className="text-primary mb-1">{dashboardData.summary.totalOrders}</h4>
                      <small className="text-muted">Total Orders</small>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 border rounded">
                      <h4 className="text-success mb-1">{dashboardData.summary.totalProducts}</h4>
                      <small className="text-muted">Total Products</small>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 border rounded">
                      <h4 className="text-info mb-1">{dashboardData.summary.totalSkus}</h4>
                      <small className="text-muted">Total SKUs</small>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 border rounded">
                      <h4 className="text-warning mb-1">{dashboardData.summary.totalSubparts}</h4>
                      <small className="text-muted">Total Subparts</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Reports Tab
  const renderReports = () => {
    return (
      <div className="reports-section">
        <div className="row">
          <div className="col-12">
            <h4 className="mb-4">Reports & Insights</h4>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <BarChart3 className="text-primary mb-3" size={48} />
                <h5>Orders Report</h5>
                <p className="text-muted">Monthly orders analysis and trends</p>
                <button className="btn btn-outline-primary btn-sm">Generate Report</button>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <PieChartIcon className="text-success mb-3" size={48} />
                <h5>Products Report</h5>
                <p className="text-muted">Product distribution and availability</p>
                <button className="btn btn-outline-success btn-sm">Generate Report</button>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <Package className="text-info mb-3" size={48} />
                <h5>Inventory Report</h5>
                <p className="text-muted">Stock levels and movement analysis</p>
                <button className="btn btn-outline-info btn-sm">Generate Report</button>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <Store className="text-warning mb-3" size={48} />
                <h5>SKU Report</h5>
                <p className="text-muted">SKU performance and analysis</p>
                <button className="btn btn-outline-warning btn-sm">Generate Report</button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Quick Actions</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <button className="btn btn-outline-primary w-100">
                      <FileText className="me-2" size={16} />
                      Export Data
                    </button>
                  </div>
                  <div className="col-md-3 mb-3">
                    <button className="btn btn-outline-secondary w-100">
                      <Calendar className="me-2" size={16} />
                      Schedule Report
                    </button>
                  </div>
                  <div className="col-md-3 mb-3">
                    <button className="btn btn-outline-info w-100">
                      <Eye className="me-2" size={16} />
                      View History
                    </button>
                  </div>
                  <div className="col-md-3 mb-3">
                    <button className="btn btn-outline-success w-100">
                      <Settings className="me-2" size={16} />
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Generated Reports</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Generated On</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(reportsData.generatedReports) && reportsData.generatedReports.length > 0 ? (
                        reportsData.generatedReports.map((report, index) => (
                          <tr key={index}>
                            <td>{report.name}</td>
                            <td>{new Date(report.generatedOn).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${report.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                {report.status}
                              </span>
                            </td>
                            <td>
                              {report.status === 'completed' ? (
                                <button className="btn btn-sm btn-outline-primary">Download</button>
                              ) : (
                                <button className="btn btn-sm btn-outline-secondary" disabled>Processing</button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No reports generated yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Report Templates</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {Array.isArray(reportsData.reportTemplates) && reportsData.reportTemplates.length > 0 ? (
                    reportsData.reportTemplates.map((template, index) => (
                      <div key={index} className="col-md-6 col-lg-3 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                          <div className="card-body">
                            <FileText className="text-primary mb-3" size={48} />
                            <h6>{template.name}</h6>
                            <p className="text-muted small">{template.description}</p>
                            <button className="btn btn-outline-primary btn-sm">Use Template</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center text-muted">
                      <p>No report templates available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // Render Overview Tab
  const renderOverview = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-5">
          <AlertCircle className="text-danger mb-3" size={48} />
          <h5>Error Loading Dashboard</h5>
          <p className="text-muted">{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="dashboard-section">
        {/* Header with Refresh Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="text-muted mb-0">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </p>
          </div>
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={refreshing ? 'spin' : ''} size={16} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-3">
            <motion.div 
              className="card border-0 shadow-sm"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Revenue</h6>
                    <h4 className="mb-0">{formatCurrency(dashboardData.summary.totalRevenue)}</h4>
                    <small className="text-success">
                      <TrendingUp size={14} className="me-1" />
                      +{dashboardData.summary.monthlyGrowth}% this month
                    </small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <DollarSign className="text-primary" size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <motion.div 
              className="card border-0 shadow-sm"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Orders</h6>
                    <h4 className="mb-0">{dashboardData.summary.totalOrders}</h4>
                    <small className="text-success">
                      <TrendingUp size={14} className="me-1" />
                      +{dashboardData.summary.orderGrowth}% this month
                    </small>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <ShoppingCart className="text-success" size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <motion.div 
              className="card border-0 shadow-sm"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Products</h6>
                    <h4 className="mb-0">{dashboardData.summary.totalProducts}</h4>
                    <small className="text-success">
                      <TrendingUp size={14} className="me-1" />
                      +{dashboardData.summary.productGrowth}% this month
                    </small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <Package className="text-warning" size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <motion.div 
              className="card border-0 shadow-sm"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total SKUs</h6>
                    <h4 className="mb-0">{dashboardData.summary.totalSkus}</h4>
                    <small className="text-success">
                      <TrendingUp size={14} className="me-1" />
                      +{dashboardData.summary.productGrowth}% this month
                    </small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <Store className="text-info" size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row mb-4">
          <div className="col-xl-8 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Monthly Orders & Revenue</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : 'Orders'
                    ]} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-xl-4 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Products by Group</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.revenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} products`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="row">
          <div className="col-xl-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Top Products (by Availability)</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Available Qty</th>
                        <th>Sales</th>
                        <th>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.topProducts.map((product, index) => (
                        <tr key={index}>
                          <td>{product.name}</td>
                          <td>{product.availableQuantity}</td>
                          <td>{formatCurrency(product.sales)}</td>
                          <td>
                            <span className={`badge ${product.growth > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h6 className="mb-0">Recent Orders</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentTransactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.id.slice(-6)}</td>
                          <td>{transaction.customer}</td>
                          <td>{formatCurrency(transaction.amount)}</td>
                          <td>
                            <span 
                              className="badge" 
                              style={{ backgroundColor: getStatusColor(transaction.status) }}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                  Dashboard Overview
                </h5>
                <p className="text-secondary1 mb-0">
                  Welcome to your business dashboard - monitor everything at a glance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="row mb-1">
          <div className="col-12">
            <div className="nav nav-tabs" id="homeTabs" role="tablist">
              <button
                className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => handleTabChange("overview")}
                type="button"
                role="tab"
              >
                Overview
              </button>
              <button
                className={`nav-link ${activeTab === "analytics" ? "active" : ""}`}
                onClick={() => handleTabChange("analytics")}
                type="button"
                role="tab"
              >
                Analytics
              </button>
              <button
                className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
                onClick={() => handleTabChange("reports")}
                type="button"
                role="tab"
              >
                Reports
              </button>

            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="row">
          <div className="col-12">
            <div className="tab-content">
              {activeTab === "overview" && renderOverview()}
              {activeTab === "analytics" && renderAnalytics()}
              {activeTab === "reports" && renderReports()}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 