import React, { useState, useEffect } from "react";
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
} from "recharts";
import { motion } from "framer-motion";
import { RefreshCw, AlertCircle, TrendingUp, Package, Users, Settings, FileText, Store } from "lucide-react";

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    ordersStats: [],
    productsDistribution: [],
    topProducts: [],
    recentOrders: [],
    productsSalesPerMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "http://localhost:5000/api/dashboard";

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
      in_production: "#28a745",
      ready: "#007bff",
      shipped: "#6c757d",
      delivered: "#28a745",
      cancelled: "#dc3545"
    };
    return statusColors[status] || "#6c757d";
  };

  // Helper function to safely render text
  const safeRenderText = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value === null || value === undefined) return "N/A";
    if (typeof value === 'object') {
      if (value.name) return value.name;
      if (value._id) return `ID: ${value._id}`;
      return "Object";
    }
    return "Unknown";
  };

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const [
        summaryRes,
        ordersStatsRes,
        productsDistributionRes,
        topProductsRes,
        recentOrdersRes,
        productsSalesPerMonthRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/summary`, { withCredentials: true }),
        axios.get(`${API_BASE}/orders-stats`, { withCredentials: true }),
        axios.get(`${API_BASE}/products-distribution`, { withCredentials: true }),
        axios.get(`${API_BASE}/top-products`, { withCredentials: true }),
        axios.get(`${API_BASE}/recent-orders`, { withCredentials: true }),
        axios.get(`${API_BASE}/products-sales-per-month`, { withCredentials: true }),
      ]);

      setDashboardData({
        summary: summaryRes.data.data,
        ordersStats: ordersStatsRes.data.data,
        productsDistribution: productsDistributionRes.data.data,
        topProducts: topProductsRes.data.data,
        recentOrders: recentOrdersRes.data.data,
        productsSalesPerMonth: productsSalesPerMonthRes.data.data,
      });
      
      // Debug: Log the recent orders data structure
      console.log("Recent Orders Data:", recentOrdersRes.data.data);
      if (recentOrdersRes.data.data[0]) {
        console.log("Sample Order Structure:", recentOrdersRes.data.data[0]);
        console.log("Sample Order Products:", recentOrdersRes.data.data[0].products);
        console.log("Sample Order Company:", recentOrdersRes.data.data[0].company);
        
        // Log detailed product information
        if (recentOrdersRes.data.data[0].products && recentOrdersRes.data.data[0].products.length > 0) {
          console.log("Sample Product Details:", {
            productId: recentOrdersRes.data.data[0].products[0].productId,
            productName: recentOrdersRes.data.data[0].products[0].productName,
            boxes: recentOrdersRes.data.data[0].products[0].boxes,
            type: typeof recentOrdersRes.data.data[0].products[0].productId
          });
        }
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ 
          height: "32px", 
          width: "200px", 
          backgroundColor: "#e3e6f0", 
          borderRadius: "8px",
          marginBottom: "24px"
        }} />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              height: "120px",
              backgroundColor: "#e3e6f0",
              borderRadius: "12px",
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
          ))}
        </div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px",
        marginBottom: "32px",
      }}>
        {[1, 2].map((i) => (
          <div key={i} style={{
            height: "400px",
            backgroundColor: "#e3e6f0",
            borderRadius: "12px",
            animation: "pulse 1.5s ease-in-out infinite"
          }} />
        ))}
      </div>
      <div style={{
        height: "400px",
        backgroundColor: "#e3e6f0",
        borderRadius: "12px",
        marginBottom: "32px",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <div style={{
        height: "400px",
        backgroundColor: "#e3e6f0",
        borderRadius: "12px",
        marginBottom: "32px",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <div style={{
        height: "400px",
        backgroundColor: "#e3e6f0",
        borderRadius: "12px",
        marginBottom: "32px",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div style={{ 
      textAlign: "center", 
      padding: "50px",
      background: "white",
      borderRadius: "12px",
      margin: "24px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      <AlertCircle size={48} color="#e74a3b" style={{ marginBottom: "16px" }} />
      <h3 style={{ color: "#121212", marginBottom: "16px" }}>Something went wrong</h3>
      <p style={{ color: "#6c757d", marginBottom: "24px" }}>{error}</p>
      <button
        onClick={handleRefresh}
        style={{
          background: "#4e73df",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => e.target.style.background = "#2e59d9"}
        onMouseLeave={(e) => e.target.style.background = "#4e73df"}
      >
        Try Again
      </button>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          padding: "32px",
          color: "white",
          marginBottom: "32px",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "700" }}>
              Welcome to Your Inventory Dashboard
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>
              Monitor your manufacturing operations and track key metrics at a glance
            </p>
          </div>
          <div style={{ fontSize: "48px", opacity: 0.8 }}>📊</div>
        </div>
      </motion.div>

      {/* Header with refresh button */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "24px" 
      }}>
        <div>
          <h2 style={{ margin: "0 0 8px 0", color: "#121212", fontWeight: "600" }}>
            Dashboard Overview
          </h2>
          {lastUpdated && (
            <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "white",
            border: "1px solid #e3e6f0",
            borderRadius: "8px",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.target.style.borderColor = "#4e73df"}
          onMouseLeave={(e) => e.target.style.borderColor = "#e3e6f0"}
        >
          <RefreshCw 
            size={20} 
            color="#4e73df" 
            style={{ 
              transform: refreshing ? "rotate(360deg)" : "rotate(0deg)",
              transition: "transform 0.5s linear"
            }} 
          />
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {[
            {
              title: "Total Products",
              value: dashboardData.summary.totalProducts || 0,
              color: "#4e73df",
              icon: <Package size={24} color="#4e73df" />,
              trend: "+12%",
            },
            {
              title: "Total Groups",
              value: dashboardData.summary.totalGroups || 0,
              color: "#1cc88a",
              icon: <Users size={24} color="#1cc88a" />,
              trend: "+5%",
            },
            {
              title: "Total Subparts",
              value: dashboardData.summary.totalSubparts || 0,
              color: "#36b9cc",
              icon: <Settings size={24} color="#36b9cc" />,
              trend: "+8%",
            },
            {
              title: "Total Orders",
              value: dashboardData.summary.totalOrders || 0,
              color: "#f6c23e",
              icon: <FileText size={24} color="#f6c23e" />,
              trend: "+15%",
            },
            {
              title: "Total SKUs",
              value: dashboardData.summary.totalSkus || 0,
              color: "#e74a3b",
              icon: <Store size={24} color="#e74a3b" />,
              trend: "+3%",
            },
            {
              title: "Total Sales (YTD)",
              value: dashboardData.productsSalesPerMonth?.reduce((total, month) => total + (month.totalSales || 0), 0) || 0,
              color: "#9c27b0",
              icon: <TrendingUp size={24} color="#9c27b0" />,
              trend: "+18%",
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e3e6f0",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              whileHover={{
                transform: "translateY(-4px)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              }}
            >
              {/* Background accent */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: card.color,
              }} />
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: "#858796",
                      fontSize: "14px",
                      fontWeight: "500",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {card.title}
                  </p>
                  <h3
                    style={{
                      color: "#121212",
                      fontSize: "28px",
                      fontWeight: "700",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {card.value.toLocaleString()}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <TrendingUp size={16} color="#1cc88a" />
                    <span style={{ color: "#1cc88a", fontSize: "12px", fontWeight: "500" }}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${card.color}15`,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Orders per Month Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e3e6f0",
          }}
        >
          <h3 style={{ marginBottom: "20px", color: "#121212", fontSize: "18px", fontWeight: "600" }}>
            Orders per Month ({new Date().getFullYear()})
          </h3>
          {dashboardData.ordersStats && dashboardData.ordersStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.ordersStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e6f0" />
                <XAxis dataKey="month" stroke="#858796" />
                <YAxis stroke="#858796" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e3e6f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                  }}
                  formatter={(value, name) => [`${value} orders`, 'Orders']}
                  labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                />
                <Bar dataKey="count" fill="#4e73df" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: "300px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#6c757d",
              fontStyle: "italic",
              background: "#f8f9fc",
              borderRadius: "8px",
              border: "2px dashed #dee2e6"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📊</div>
                <p style={{ margin: 0 }}>No order data available for this year</p>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.7 }}>
                  Orders will appear here once they are created
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Products Distribution Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e3e6f0",
          }}
        >
          <h3 style={{ marginBottom: "20px", color: "#121212", fontSize: "18px", fontWeight: "600" }}>
            Products Distribution by Group
          </h3>
          {dashboardData.productsDistribution && dashboardData.productsDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.productsDistribution}
                  cx="50%"
                  cy="50%"
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboardData.productsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e3e6f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: "300px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#6c757d",
              fontStyle: "italic",
              background: "#f8f9fc",
              borderRadius: "8px",
              border: "2px dashed #dee2e6"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>🏷️</div>
                <p style={{ margin: 0 }}>No product distribution data available</p>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.7 }}>
                  Products will appear here once they are grouped
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Products Sales per Month - Scatter Plot with Line */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e3e6f0",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", color: "#121212", fontSize: "18px", fontWeight: "600" }}>
              Products Sales per Month ({new Date().getFullYear()})
            </h3>

          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>Total Sales (YTD)</p>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#4e73df" }}>
                {dashboardData.productsSalesPerMonth?.reduce((total, month) => total + (month.totalSales || 0), 0) || 0} units
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>Best Month</p>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1cc88a" }}>
                {dashboardData.productsSalesPerMonth?.reduce((best, month) => 
                  month.totalSales > (best?.totalSales || 0) ? month : best
                )?.month || "N/A"}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>Products Tracked</p>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#f6c23e" }}>
                {dashboardData.productsSalesPerMonth[0]?.products?.length || 0}
              </p>
            </div>
          </div>
        </div>
        {dashboardData.productsSalesPerMonth && dashboardData.productsSalesPerMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dashboardData.productsSalesPerMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e6f0" />
              <XAxis 
                dataKey="month" 
                stroke="#858796"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#858796"
                label={{ 
                  value: 'Total Sales Quantity', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#858796' }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e3e6f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
                formatter={(value, name, props) => {
                  if (name === 'Total Sales Trend') {
                    return [`${value} units`, 'Total Sales'];
                  }
                  return [`${value} units`, name];
                }}
                labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const monthData = dashboardData.productsSalesPerMonth.find(m => m.month === label);
                    return (
                      <div style={{
                        backgroundColor: "white",
                        border: "1px solid #e3e6f0",
                        borderRadius: "8px",
                        padding: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                      }}>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#121212" }}>
                          {label} {new Date().getFullYear()}
                        </p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ 
                            margin: "4px 0", 
                            color: entry.color,
                            fontSize: "14px"
                          }}>
                            {entry.name}: {entry.value} units
                          </p>
                        ))}
                        {monthData && monthData.products.length > 0 && (
                          <div style={{ 
                            marginTop: "8px", 
                            paddingTop: "8px", 
                            borderTop: "1px solid #e3e6f0" 
                          }}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6c757d" }}>
                              Products sold:
                            </p>
                            {monthData.products.slice(0, 3).map((product, idx) => (
                              <p key={idx} style={{ 
                                margin: "2px 0", 
                                fontSize: "11px", 
                                color: "#6c757d" 
                              }}>
                                • {product.productName}: {product.quantity} units
                              </p>
                            ))}
                            {monthData.products.length > 3 && (
                              <p style={{ 
                                margin: "2px 0", 
                                fontSize: "11px", 
                                color: "#6c757d", 
                                fontStyle: "italic" 
                              }}>
                                ... and {monthData.products.length - 3} more
                              </p>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px"
                }}
              />
              
              {/* Line for total sales trend */}
              <Line 
                type="monotone" 
                dataKey="totalSales" 
                stroke="#4e73df" 
                strokeWidth={4}
                dot={{ fill: "#4e73df", strokeWidth: 2, r: 8 }}
                activeDot={{ r: 10, stroke: "#4e73df", strokeWidth: 3, fill: "#fff" }}
                name="Total Sales Trend"
                strokeDasharray="0"
              />
              
              {/* Scatter plot for individual products */}
              {dashboardData.productsSalesPerMonth[0]?.products?.map((product, productIndex) => {
                const colors = [
                  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
                  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
                ];
                const color = colors[productIndex % colors.length];
                
                return (
                  <Line
                    key={product.productId}
                    type="monotone"
                    dataKey={(dataPoint) => {
                      const productData = dataPoint.products.find(p => p.productId === product.productId);
                      return productData ? productData.quantity : 0;
                    }}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ 
                      fill: color, 
                      strokeWidth: 2, 
                      r: 6 
                    }}
                    activeDot={{ 
                      r: 8, 
                      stroke: color, 
                      strokeWidth: 3, 
                      fill: "#fff" 
                    }}
                    name={product.productName}
                    connectNulls={false}
                    strokeDasharray="8,4"
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: "400px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "#6c757d",
            fontStyle: "italic",
            background: "#f8f9fc",
            borderRadius: "8px",
            border: "2px dashed #dee2e6"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📈</div>
              <p style={{ margin: 0 }}>No sales data available for this year</p>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.7 }}>
                Sales data will appear here once orders are processed
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Top Products Chart */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e3e6f0",
          marginBottom: "32px",
        }}
      >
        <h3 style={{ marginBottom: "20px", color: "#121212", fontSize: "18px", fontWeight: "600" }}>
          Top 5 Products by Available Quantity
        </h3>
        {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e6f0" />
              <XAxis
                dataKey="name"
                stroke="#858796"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#858796" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e3e6f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="availableQuantity" fill="#1cc88a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
                  ) : (
            <div style={{ 
              height: "300px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#6c757d",
              fontStyle: "italic",
              background: "#f8f9fc",
              borderRadius: "8px",
              border: "2px dashed #dee2e6"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📦</div>
                <p style={{ margin: 0 }}>No product availability data available</p>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.7 }}>
                  Product availability will appear here once inventory is tracked
                </p>
              </div>
            </div>
          )}
      </motion.div>

      {/* Recent Orders Table */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e3e6f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#121212", fontSize: "18px", fontWeight: "600" }}>
            Recent Orders
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", color: "#121212" }}>
              Showing last {dashboardData.recentOrders?.length || 0} orders
            </span>
            <span style={{ fontSize: "14px", color: "#121212" }}>
              Total Products: {dashboardData.recentOrders?.reduce((total, order) => 
                total + (order.products?.length || 0), 0
              ) || 0}
            </span>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e3e6f0",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ 
                backgroundColor: "#f8f9fc",
                borderBottom: "2px solid #e3e6f0"
              }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #e3e6f0",
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
                    borderBottom: "1px solid #e3e6f0",
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
                    borderBottom: "1px solid #e3e6f0",
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
                    borderBottom: "1px solid #e3e6f0",
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
                    borderBottom: "1px solid #e3e6f0",
                    fontWeight: "600",
                    color: "#121212",
                  }}
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      borderBottom: "1px solid #e3e6f0",
                      transition: "background-color 0.2s ease",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                    }}
                    onMouseEnter={(e) => {
                      e.target.closest("tr").style.backgroundColor = "#f8f9fc";
                    }}
                    onMouseLeave={(e) => {
                      e.target.closest("tr").style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#fafbfc";
                    }}
                  >
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
                        {safeRenderText(order.orderNumber)}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "16px" }}>
                      {(() => {
                        // Check if company is populated with companyName
                        if (order.company && typeof order.company === 'object' && order.company.companyName) {
                          return order.company.companyName;
                        }
                        // Check if company is a string (direct name)
                        if (typeof order.company === 'string') {
                          return order.company;
                        }
                        // Check if company has _id but no name (populated but missing name)
                        if (order.company && typeof order.company === 'object' && order.company._id) {
                          console.log("Company object:", order.company);
                          console.log("Company object keys:", Object.keys(order.company));
                          // Try to get company name from different possible fields
                          if (order.company.companyName) {
                            return order.company.companyName;
                          }
                          if (order.company.name) {
                            return order.company.name;
                          }
                          if (order.company.accountName) {
                            return order.company.accountName;
                          }
                          return "Company ID: " + order.company._id;
                        }
                        return "N/A";
                      })()}
                    </td>
                    <td style={{ padding: "12px", fontSize: "16px" }}>
                      <div style={{ maxWidth: "300px" }}>
                        {Array.isArray(order.products) && order.products.length > 0 ? (
                          order.products.map((product, productIndex) => (
                            <div
                              key={productIndex}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "4px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              <span style={{ fontWeight: "500", marginRight: "8px" }}>
                                {(() => {
                                  // Try to get product name from different possible sources
                                  if (product.productId && typeof product.productId === 'object' && product.productId.name) {
                                    return product.productId.name;
                                  }
                                  if (product.productId && typeof product.productId === 'string') {
                                    return product.productId;
                                  }
                                  if (product.productName) {
                                    return product.productName;
                                  }
                                  if (product.name) {
                                    return product.name;
                                  }
                                  return "Unknown Product";
                                })()}
                              </span>
                              <span style={{ color: "#121212", fontSize: "14px" }}>
                                ({product.boxes || 0} boxes)
                              </span>
                            </div>
                          ))
                        ) : (
                          <span style={{ color: "#6c757d", fontStyle: "italic" }}>
                            No products
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          backgroundColor: getStatusColor(order.status),
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "15px",
                          fontWeight: "500",
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ color: "#121212", fontSize: "16px" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: "40px 24px",
                      textAlign: "center",
                      color: "#6c757d",
                      fontStyle: "italic",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📋</div>
                      <p style={{ margin: 0, fontSize: "16px" }}>No recent orders found</p>
                      <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.7 }}>
                        Orders will appear here once they are created
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
