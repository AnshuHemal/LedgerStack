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
      ] = await Promise.all([
        axios.get(`${API_BASE}/summary`, { withCredentials: true }),
        axios.get(`${API_BASE}/orders-stats`, { withCredentials: true }),
        axios.get(`${API_BASE}/products-distribution`, { withCredentials: true }),
        axios.get(`${API_BASE}/top-products`, { withCredentials: true }),
        axios.get(`${API_BASE}/recent-orders`, { withCredentials: true }),
      ]);

      setDashboardData({
        summary: summaryRes.data.data,
        ordersStats: ordersStatsRes.data.data,
        productsDistribution: productsDistributionRes.data.data,
        topProducts: topProductsRes.data.data,
        recentOrders: recentOrdersRes.data.data,
      });
      
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
      <h3 style={{ color: "#2c3e50", marginBottom: "16px" }}>Something went wrong</h3>
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
          <h2 style={{ margin: "0 0 8px 0", color: "#2c3e50", fontWeight: "600" }}>
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
                      color: "#2c3e50",
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
          <h3 style={{ marginBottom: "20px", color: "#2c3e50", fontSize: "18px", fontWeight: "600" }}>
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
          <h3 style={{ marginBottom: "20px", color: "#2c3e50", fontSize: "18px", fontWeight: "600" }}>
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
        <h3 style={{ marginBottom: "20px", color: "#2c3e50", fontSize: "18px", fontWeight: "600" }}>
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
        <h3 style={{ marginBottom: "20px", color: "#2c3e50", fontSize: "18px", fontWeight: "600" }}>
          Recent Orders
        </h3>
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
              <tr style={{ backgroundColor: "#f8f9fc" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #e3e6f0",
                    fontWeight: "600",
                    color: "#2c3e50",
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
                    color: "#2c3e50",
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
                    color: "#2c3e50",
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
                    color: "#2c3e50",
                  }}
                >
                  Total Quantity
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #e3e6f0",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      borderBottom: "1px solid #e3e6f0",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.closest("tr").style.backgroundColor = "#f8f9fc";
                    }}
                    onMouseLeave={(e) => {
                      e.target.closest("tr").style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {order.orderNumber}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.company?.name || "N/A"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ maxWidth: "300px" }}>
                        {order.products?.map((product, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "4px",
                              padding: "4px 8px",
                              backgroundColor: "#f8f9fc",
                              borderRadius: "4px",
                              fontSize: "12px",
                            }}
                          >
                            <span style={{ fontWeight: "500", marginRight: "8px" }}>
                              {product.productId?.name || "Unknown Product"}
                            </span>
                            <span style={{ color: "#6c757d" }}>
                              ({product.quantity} boxes)
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {order.products?.reduce((total, product) => total + (product.quantity || 0), 0)}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ color: "#6c757d", fontSize: "14px" }}>
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
