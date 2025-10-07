const Order = require("../models/Order");
const Pizza = require("../models/Pizza");
const { validationResult, body } = require("express-validator");

// Validation middleware
exports.validateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must have at least one item"),
  body("total").isNumeric().withMessage("Total must be a number"),
  body("deliveryAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("deliveryAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("deliveryAddress.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  body("deliveryAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("deliveryAddress.zipCode")
    .trim()
    .notEmpty()
    .withMessage("ZIP code is required"),
  body("paymentMethod")
    .isIn(["card", "cash"])
    .withMessage("Invalid payment method"),
];

// ============================================
//      Create new order (User)
// ============================================
exports.createOrder = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const orderData = {
      ...req.body,
      userId: req.user._id,
      estimatedDelivery: new Date(Date.now() + 45 * 60000),
    };

    const order = new Order(orderData);
    await order.save();

    // Update pizza quantities
    for (const item of req.body.items) {
      if (item.pizzaId) {
        const pizza = await Pizza.findById(item.pizzaId);
        if (pizza) {
          pizza.quantity = Math.max(0, pizza.quantity - item.quantity);
          pizza.soldOut = pizza.quantity === 0;
          await pizza.save();
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Get user's orders (User)
// ============================================
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Get users's orders (Admin)
// ============================================
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    // Fetch orders with populated users, only non-deleted users
    let orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate({
        path: "userId",
        select: "name email isDeleted",
        match: { isDeleted: false }, // Only include non-deleted users
      });

    // Remove orders where user isDeleted=true
    orders = orders.filter((order) => order.userId !== null);

    // Recalculate total only for non-deleted users
    const total = await Order.countDocuments(query);
    const totalActiveOrders = orders.length;

    res.json({
      success: true,
      count: totalActiveOrders,
      total,
      page: parseInt(page),
      pages: Math.ceil(totalActiveOrders / limit),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Get user's order by id (User)
// ============================================
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Update Order Status (Admin)
// ============================================
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (
      ![
        "pending",
        "preparing",
        "delivering",
        "delivered",
        "cancelled",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Delete  Order (Admin)
// ============================================
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Cancel  Order (User)
// ============================================
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Only allow canceling pending orders
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only cancel pending orders",
      });
    }

    // Restore pizza quantities
    for (const item of order.items) {
      if (item.pizzaId) {
        const pizza = await Pizza.findById(item.pizzaId);
        if (pizza) {
          pizza.quantity += item.quantity;
          pizza.soldOut = false;
          await pizza.save();
        }
      }
    }

    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
