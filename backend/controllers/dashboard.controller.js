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