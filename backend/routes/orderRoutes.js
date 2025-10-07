const express = require("express");
const orderRouter = express.Router();
const orderController = require("../controllers/orderController");
const { adminAuth, userAuth } = require("../middleware/auth");

// ------------------ User Routes ------------------

// Create order
orderRouter.post(
  "/",
  userAuth,
  orderController.validateOrder,
  orderController.createOrder
);

// Get current user orders
orderRouter.get("/my-orders", userAuth, orderController.getUserOrders);
orderRouter.patch('/:id/cancel', userAuth, orderController.cancelOrder);

// Get single order by ID
orderRouter.get("/:id", userAuth, orderController.getOrderById);

// ------------------ Admin Routes ------------------

// Get all orders (no ID needed)
orderRouter.get("/", adminAuth, orderController.getAllOrders);

// Update order status by ID
orderRouter.patch("/:id/status", adminAuth, orderController.updateOrderStatus);

// Delete order by ID
orderRouter.delete("/:id", adminAuth, orderController.deleteOrder);

module.exports = orderRouter;
