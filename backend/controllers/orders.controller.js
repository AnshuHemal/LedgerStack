import Order from "../models/order.model.js";
import { AccountMaster, Product } from "../models/user.model.js";

// Create Order
export const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const newOrder = new Order(orderData);
    
    // If orderNumber is not set, generate it manually
    if (!newOrder.orderNumber) {
      const lastOrder = await Order.findOne({}, {}, { sort: { orderNumber: -1 } });
      let nextNumber = 1;
      if (lastOrder) {
        const lastNumber = parseInt(lastOrder.orderNumber.replace("ORD-", ""));
        nextNumber = lastNumber + 1;
      }
      newOrder.orderNumber = `ORD-${nextNumber.toString().padStart(6, "0")}`;
    }
    
    await newOrder.save();

    // Populate company and products for response
    await newOrder.populate([
      { path: "company", select: "companyName city" },
      { path: "products.productId", select: "name" },
    ]);

    res.status(201).json({
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get All Orders
export const getOrders = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    const orders = await Order.find({ createdBy })
      .populate("company", "companyName city")
      .populate({
        path: "products.productId",
        select: "name productGroupId",
        populate: {
          path: "productGroupId",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const createdBy = req.user.userId;

    const order = await Order.findOne({ _id: orderId, createdBy })
      .populate("company", "companyName city contactPerson mobileNo email")
      .populate("products.productId", "name sale_rate unit");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve order",
      error: error.message,
    });
  }
};

// Update Order
export const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const createdBy = req.user.userId;
    const updateData = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, createdBy },
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "company", select: "companyName city" },
      { path: "products.productId", select: "name" },
    ]);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const createdBy = req.user.userId;

    const order = await Order.findOneAndDelete({ _id: orderId, createdBy });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

 