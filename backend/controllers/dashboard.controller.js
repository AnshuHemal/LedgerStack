import { Product, AccountMaster } from "../models/user.model.js";
import Order from "../models/order.model.js";
import Sku from "../models/sku.model.js";
import Subpart from "../models/subpart.model.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const productFilter = userId ? { createdBy: userId } : {};
    const subpartFilter = userId ? { createdBy: userId } : {};
    const orderFilter = userId ? { createdBy: userId } : {};
    const skuFilter = userId ? { createdBy: userId } : {};

    const [
      totalProducts,
      totalGroups,
      totalSubparts,
      totalOrders,
      totalSkus
    ] = await Promise.all([
      Product.countDocuments(productFilter),
      Product.distinct("productGroupId", productFilter).then(ids => ids.length),
      Subpart.countDocuments(subpartFilter),
      Order.countDocuments(orderFilter),
      Sku.countDocuments(skuFilter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalGroups,
        totalSubparts,
        totalOrders,
        totalSkus
      }
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard summary",
      error: error.message
    });
  }
};

// Get orders statistics grouped by month
export const getOrdersStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of current year
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st of current year

    const userId = req.user?.userId;
    const ordersStats = await Order.aggregate([
      {
        $match: Object.assign(
          { createdAt: { $gte: startDate, $lte: endDate } },
          userId ? { createdBy: new (await import('mongoose')).default.Types.ObjectId(userId) } : {}
        )
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Fill in missing months with 0 count
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const completeStats = monthNames.map((month, index) => {
      const monthData = ordersStats.find(stat => stat._id === index + 1);
      return {
        month,
        count: monthData ? monthData.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: completeStats
    });
  } catch (error) {
    console.error("Orders stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders statistics",
      error: error.message
    });
  }
};

// Get products distribution across groups
export const getProductsDistribution = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const distribution = await Product.aggregate([
      ...(userId
        ? [{ $match: { createdBy: new (await import('mongoose')).default.Types.ObjectId(userId) } }]
        : []),
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "group"
        }
      },
      {
        $unwind: "$group"
      },
      {
        $group: {
          _id: "$group.name",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error("Products distribution error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products distribution",
      error: error.message
    });
  }
};

// Get top 5 products by available quantity
export const getTopProducts = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const products = await Product.find(userId ? { createdBy: userId } : {}).populate("productGroupId categoryId productTypeId");
    
    const productsWithAvailability = [];

    for (const product of products) {
      const subparts = await Subpart.find({ product: product._id });
      
      if (subparts.length === 0) {
        productsWithAvailability.push({
          ...product.toObject(),
          availableQuantity: 0
        });
        continue;
      }

      let minAvailableQuantity = Infinity;
      const subpartsRequired = [];

      for (const subpart of subparts) {
        for (const part of subpart.parts) {
          const skus = await Sku.find({
            "products.parts.subpartId": subpart._id,
            "products.parts.partName": part.partName
          });

          let totalPartQuantity = 0;
          for (const sku of skus) {
            for (const skuProduct of sku.products) {
              for (const skuPart of skuProduct.parts) {
                if (skuPart.subpartId.toString() === subpart._id.toString() && 
                    skuPart.partName === part.partName) {
                  totalPartQuantity += skuPart.quantity || 0;
                }
              }
            }
          }

          const productsPossibleWithPart = Math.floor(totalPartQuantity / part.quantity);
          
          subpartsRequired.push({
            partName: part.partName,
            color: part.color,
            quantityNeeded: part.quantity,
            availableInWarehouse: totalPartQuantity,
            productsPossible: productsPossibleWithPart
          });

          if (productsPossibleWithPart < minAvailableQuantity) {
            minAvailableQuantity = productsPossibleWithPart;
          }
        }
      }

      if (minAvailableQuantity === Infinity) {
        minAvailableQuantity = 0;
      }

      productsWithAvailability.push({
        ...product.toObject(),
        availableQuantity: minAvailableQuantity
      });
    }

    // Sort by available quantity and get top 5
    const topProducts = productsWithAvailability
      .sort((a, b) => b.availableQuantity - a.availableQuantity)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top products",
      error: error.message
    });
  }
};

// Get recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const recentOrders = await Order.find(userId ? { createdBy: userId } : {})
      .populate({
        path: "company",
        select: "companyName",
        model: AccountMaster
      })
      .populate("products.productId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: recentOrders
    });
  } catch (error) {
    console.error("Recent orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent orders",
      error: error.message
    });
  }
};

// Get products sales per month
export const getProductsSalesPerMonth = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of current year
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st of current year

    const userId = req.user?.userId;
    const salesData = await Order.aggregate([
      {
        $match: Object.assign(
          {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ["confirmed", "in_production", "ready", "shipped", "delivered"] }
          },
          userId ? { createdBy: new (await import('mongoose')).default.Types.ObjectId(userId) } : {}
        )
      },
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            productId: "$products.productId",
            productName: "$product.name"
          },
          totalQuantity: { $sum: "$products.quantity" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.month",
          products: {
            $push: {
              productId: "$_id.productId",
              productName: "$_id.productName",
              quantity: "$totalQuantity",
              orders: "$totalOrders"
            }
          },
          totalSales: { $sum: "$totalQuantity" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Fill in missing months with 0 data
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const completeSalesData = monthNames.map((month, index) => {
      const monthData = salesData.find(data => data._id === index + 1);
      return {
        month,
        monthNumber: index + 1,
        products: monthData ? monthData.products : [],
        totalSales: monthData ? monthData.totalSales : 0
      };
    });



    res.status(200).json({
      success: true,
      data: completeSalesData
    });
  } catch (error) {
    console.error("Products sales per month error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products sales per month",
      error: error.message
    });
  }
};

// Get order trends for analytics
export const getOrderTrends = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const userId = req.user?.userId;
    const orderTrends = await Order.aggregate([
      {
        $match: Object.assign(
          { createdAt: { $gte: startDate, $lte: endDate } },
          userId ? { createdBy: new (await import('mongoose')).default.Types.ObjectId(userId) } : {}
        )
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const completeTrends = monthNames.map((month, index) => {
      const monthData = orderTrends.find(trend => trend._id === index + 1);
      return {
        month,
        count: monthData ? monthData.count : 0,
        totalAmount: monthData ? monthData.totalAmount : 0
      };
    });

    res.status(200).json({
      success: true,
      data: completeTrends
    });
  } catch (error) {
    console.error("Order trends error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order trends",
      error: error.message
    });
  }
};

// Get product performance analytics
export const getProductPerformance = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const productPerformance = await Product.find(userId ? { createdBy: userId } : {})
      .populate("productGroupId")
      .limit(10)
      .lean();

    const performanceData = productPerformance.map(product => ({
      name: product.name,
      availableQuantity: product.availableQuantity || 0,
      productGroup: product.productGroupId?.name || 'N/A',
      createdAt: product.createdAt
    }));

    res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error("Product performance error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product performance",
      error: error.message
    });
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const customerAnalytics = await Order.aggregate([
      ...(userId
        ? [{ $match: { createdBy: new (await import('mongoose')).default.Types.ObjectId(userId) } }]
        : []),
      {
        $lookup: {
          from: "accountmasters",
          localField: "company",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $unwind: "$customer"
      },
      {
        $group: {
          _id: "$customer.companyName",
          orderCount: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { orderCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const analyticsData = customerAnalytics.map(customer => ({
      name: customer._id,
      count: customer.orderCount,
      totalAmount: customer.totalAmount
    }));

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error("Customer analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer analytics",
      error: error.message
    });
  }
};

// Get inventory analytics
export const getInventoryAnalytics = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const inventoryAnalytics = await Product.aggregate([
      ...(userId
        ? [{ $match: { createdBy: new (await import('mongoose')).default.Types.ObjectId(userId) } }]
        : []),
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const completeAnalytics = monthNames.map((month, index) => {
      const monthData = inventoryAnalytics.find(analytics => analytics._id === index + 1);
      return {
        month,
        count: monthData ? monthData.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: completeAnalytics
    });
  } catch (error) {
    console.error("Inventory analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory analytics",
      error: error.message
    });
  }
};

// Get generated reports
export const getGeneratedReports = async (req, res) => {
  try {
    // Mock data for generated reports - you can implement actual report storage
    const generatedReports = [
      {
        name: "Monthly Orders Report",
        generatedOn: new Date(),
        status: "completed",
        type: "orders"
      },
      {
        name: "Product Availability Report",
        generatedOn: new Date(Date.now() - 86400000), // 1 day ago
        status: "completed",
        type: "products"
      },
      {
        name: "Inventory Status Report",
        generatedOn: new Date(Date.now() - 172800000), // 2 days ago
        status: "processing",
        type: "inventory"
      }
    ];

    res.status(200).json({
      success: true,
      data: generatedReports
    });
  } catch (error) {
    console.error("Generated reports error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching generated reports",
      error: error.message
    });
  }
};

// Get report templates
export const getReportTemplates = async (req, res) => {
  try {
    // Mock data for report templates - you can implement actual template storage
    const reportTemplates = [
      {
        name: "Orders Summary",
        description: "Monthly orders summary with trends",
        type: "orders"
      },
      {
        name: "Product Performance",
        description: "Product availability and performance metrics",
        type: "products"
      },
      {
        name: "Inventory Status",
        description: "Current inventory levels and alerts",
        type: "inventory"
      },
      {
        name: "Customer Analysis",
        description: "Customer behavior and preferences",
        type: "customers"
      }
    ];

    res.status(200).json({
      success: true,
      data: reportTemplates
    });
  } catch (error) {
    console.error("Report templates error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report templates",
      error: error.message
    });
  }
};

// Get report history
export const getReportHistory = async (req, res) => {
  try {
    // Mock data for report history - you can implement actual history storage
    const reportHistory = [
      {
        name: "Orders Report - January 2024",
        generatedOn: new Date(),
        status: "completed",
        size: "2.5 MB"
      },
      {
        name: "Products Report - December 2023",
        generatedOn: new Date(Date.now() - 2592000000), // 30 days ago
        status: "completed",
        size: "1.8 MB"
      }
    ];

    res.status(200).json({
      success: true,
      data: reportHistory
    });
  } catch (error) {
    console.error("Report history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report history",
      error: error.message
    });
  }
};