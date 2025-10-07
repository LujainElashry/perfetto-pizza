import { useState, useEffect, useCallback } from "react";
import { orderAPI } from "../../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Memoize fetchOrders with useCallback
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await orderAPI.getAllOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => {
      const updated = new Set(prev);
      if (updated.has(orderId)) updated.delete(orderId);
      else updated.add(orderId);
      return updated;
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "preparing":
        return "status-preparing";
      case "delivering":
        return "status-delivering";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Order Received";
      case "preparing":
        return "Being Prepared";
      case "delivering":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="container text-center">
          <p>Loading orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section admin-orders">
      <div className="page-header">
        <h2>Manage Orders</h2>
        <div className="header-underline"></div>
      </div>

      <div className="admin-filters">
        {[
          "all",
          "pending",
          "preparing",
          "delivering",
          "delivered",
          "cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`btn ${
              filter === status ? "btn-primary" : "btn-secondary"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order._id);
            return (
              <div
                key={order._id}
                className={`order-card ${
                  isExpanded ? "expanded" : "collapsed"
                }`}
              >
                <div
                  className="order-header"
                  onClick={() => toggleOrder(order._id)}
                >
                  <div className="order-info">
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <p className="customer-name">
                      Customer: {order.userId?.name || "Unknown"}
                    </p>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-header-right">
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <button className="expand-button" type="button">
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <div className="order-card-body">
                      <div className="order-items-section">
                        <h4>Order Items:</h4>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="order-delivery-section">
                        <h4>Delivery Information:</h4>
                        <p>{order.deliveryAddress.address}</p>
                        <p>
                          {order.deliveryAddress.city},{" "}
                          {order.deliveryAddress.zipCode}
                        </p>
                        <p>Phone: {order.deliveryAddress.phone}</p>
                        {order.notes && <p>Notes: {order.notes}</p>}
                      </div>
                    </div>

                    <div className="order-card-footer">
                      <div className="order-total">
                        <span>Total:</span>
                        <span className="total-amount">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="order-status-actions">
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "preparing")
                          }
                          className="btn-status btn-preparing"
                          disabled={["delivered", "cancelled"].includes(
                            order.status
                          )}
                        >
                          👨‍🍳 Preparing
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "delivering")
                          }
                          className="btn-status btn-delivering"
                          disabled={["delivered", "cancelled"].includes(
                            order.status
                          )}
                        >
                          🚗 Delivering
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "delivered")
                          }
                          className="btn-status btn-delivered"
                          disabled={["delivered", "cancelled"].includes(
                            order.status
                          )}
                        >
                          ✅ Delivered
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "cancelled")
                          }
                          className="btn-status btn-cancelled"
                          disabled={["delivered", "cancelled"].includes(
                            order.status
                          )}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}