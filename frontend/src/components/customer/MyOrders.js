import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { orderAPI } from "../../services/api";

export default function MyOrders() {
  const { currentUser } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? Pizza quantities will be restored."
      )
    ) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      const response = await orderAPI.cancelOrder(orderId);

      if (response.success) {
        alert("Order cancelled successfully!");
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
      console.error("Error canceling order:", error);
    } finally {
      setCancellingOrder(null);
    }
  };

  if (!currentUser) {
    return (
      <section className="page-section">
        <div className="container text-center">
          <h2>Please login to view your orders</h2>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </section>
    );
  }

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (orders.length === 0) {
    return (
      <section className="page-section orders-empty">
        <div className="container text-center">
          <div className="empty-orders-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>Start ordering some delicious pizza!</p>
          <Link to="/menu" className="btn btn-primary">
            Browse Menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section orders-page">
      <div className="page-header">
        <h2>My Orders</h2>
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
      <div className="container">
        <div className="orders-list">
          {orders
            .filter((order) => filter === "all" || order.status === filter)
            .map((order) => {
              const isExpanded = expandedOrders.has(order._id);
              const canCancel = order.status === "pending";

              return (
                <div
                  key={order._id}
                  className={`order-card ${
                    isExpanded ? "expanded" : "collapsed"
                  }`}
                >
                  {/* Order Header - Always Visible */}
                  <div
                    className="order-header"
                    onClick={() => toggleOrder(order._id)}
                  >
                    <div className="order-info">
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <p className="order-date">
                        {formatDate(order.createdAt)}
                      </p>
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

                  {/* Order Details - Collapsible */}
                  {isExpanded && (
                    <div className="order-details">
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <img src={item.photoName} alt={item.name} />
                            <div className="order-item-details">
                              <h4>{item.name}</h4>
                              <p>Quantity: {item.quantity}</p>
                            </div>
                            <span className="order-item-price">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="delivery-info">
                          <h4>Delivery Address</h4>
                          <p>{order.deliveryAddress.address}</p>
                          <p>
                            {order.deliveryAddress.city},{" "}
                            {order.deliveryAddress.zipCode}
                          </p>
                          <p>Phone: {order.deliveryAddress.phone}</p>
                        </div>

                        <div className="order-total">
                          <span>Total Amount</span>
                          <span className="total-amount">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {canCancel && (
                        <div className="order-actions">
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="btn-cancel-order"
                            disabled={cancellingOrder === order._id}
                          >
                            {cancellingOrder === order._id
                              ? "Cancelling..."
                              : "❌ Cancel Order"}
                          </button>
                          <p className="cancel-note">
                            You can only cancel orders that are still pending
                          </p>
                        </div>
                      )}

                      {/* Order Tracking */}
                      {order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                          <div className="order-tracking">
                            <div className="tracking-bar">
                              <div
                                className={`tracking-step ${
                                  [
                                    "pending",
                                    "preparing",
                                    "delivering",
                                    "delivered",
                                  ].includes(order.status)
                                    ? "active"
                                    : ""
                                }`}
                              >
                                <div className="step-icon">📝</div>
                                <span>Received</span>
                              </div>
                              <div
                                className={`tracking-step ${
                                  [
                                    "preparing",
                                    "delivering",
                                    "delivered",
                                  ].includes(order.status)
                                    ? "active"
                                    : ""
                                }`}
                              >
                                <div className="step-icon">👨‍🍳</div>
                                <span>Preparing</span>
                              </div>
                              <div
                                className={`tracking-step ${
                                  ["delivering", "delivered"].includes(
                                    order.status
                                  )
                                    ? "active"
                                    : ""
                                }`}
                              >
                                <div className="step-icon">🚗</div>
                                <span>Delivering</span>
                              </div>
                              <div
                                className={`tracking-step ${
                                  order.status === "delivered" ? "active" : ""
                                }`}
                              >
                                <div className="step-icon">✅</div>
                                <span>Delivered</span>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
