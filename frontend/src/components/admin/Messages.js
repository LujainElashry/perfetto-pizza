import { useState, useEffect, useRef, useCallback } from "react";
import { messageAPI } from "../../services/api";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const pollingInterval = useRef(null);

  // Memoize fetchMessages with useCallback
  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const status = filter === "all" ? null : filter;
      const response = await messageAPI.getAllMessages(status);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter]);

  // Memoize refreshSelectedMessage with useCallback
  const refreshSelectedMessage = useCallback(async () => {
    if (!selectedMessage) return;

    try {
      const response = await messageAPI.getMessageById(selectedMessage._id);
      setSelectedMessage(response.data);
      
      // Update the message in the list
      setMessages(prev =>
        prev.map(msg =>
          msg._id === response.data._id ? response.data : msg
        )
      );
    } catch (error) {
      console.error("Error refreshing message:", error);
    }
  }, [selectedMessage]);

  useEffect(() => {
    fetchMessages();
    pollingInterval.current = setInterval(() => {
      fetchMessages(true); 
    }, 5000);
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (selectedMessage) {
      const refreshInterval = setInterval(() => {
        refreshSelectedMessage();
      }, 5000);

      return () => clearInterval(refreshInterval);
    }
  }, [selectedMessage, refreshSelectedMessage]);

  const handleSelectMessage = async (messageId) => {
    try {
      const response = await messageAPI.getMessageById(messageId);
      setSelectedMessage(response.data);
      setReplyText("");
      
      // Update the message in the list to mark as read by admin
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, unreadByAdmin: false } : msg
        )
      );
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSending(true);
      await messageAPI.adminReply(selectedMessage._id, replyText);
      setReplyText("");

      // Refresh message
      const response = await messageAPI.getMessageById(selectedMessage._id);
      setSelectedMessage(response.data);
      fetchMessages();
      alert("Reply sent successfully!");
    } catch (error) {
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await messageAPI.updateMessageStatus(selectedMessage._id, status);
      const response = await messageAPI.getMessageById(selectedMessage._id);
      setSelectedMessage(response.data);
      fetchMessages();
      alert("Status updated successfully");
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "status-pending", text: "Pending" },
      replied: { class: "status-replied", text: "Replied" },
      closed: { class: "status-closed", text: "Closed" },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="container text-center">
          <p>Loading messages...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section admin-messages-page">
      <div className="page-header">
        <h2>Customer Messages</h2>
        <div className="header-underline"></div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          <div className="admin-filters">
            <button
              onClick={() => setFilter("all")}
              className={`btn ${
                filter === "all" ? "btn-primary" : "btn-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`btn ${
                filter === "pending" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("replied")}
              className={`btn ${
                filter === "replied" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Replied
            </button>
            <button
              onClick={() => setFilter("closed")}
              className={`btn ${
                filter === "closed" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Closed
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages found</p>
            </div>
          ) : (
            messages.map((msg) => {
              const badge = getStatusBadge(msg.status);
              return (
                <div
                  key={msg._id}
                  className={`message-item ${
                    selectedMessage?._id === msg._id ? "active" : ""
                  } ${msg.unreadByAdmin ? "unread" : ""}`}
                  onClick={() => handleSelectMessage(msg._id)}
                >
                  <div className="message-item-header">
                    <h4>
                      {msg.subject}
                      {msg.unreadByAdmin && <span className="unread-indicator"></span>}
                    </h4>
                    <span className={`message-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="message-from">From: {msg.userName}</p>
                  <p className="message-preview">
                    {msg.message.substring(0, 60)}...
                  </p>
                  <span className="message-date">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="message-detail-header">
                <div>
                  <h3>{selectedMessage.subject}</h3>
                  <p className="message-customer-info">
                    From: {selectedMessage.userName} (
                    {selectedMessage.userEmail})
                  </p>
                  <p className="message-date-full">
                    Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="status-control-inline">
                  <label>Status:</label>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="message-thread">
                {/* Original Message */}
                <div className="message-bubble user-message">
                  <div className="message-sender">
                    <strong>{selectedMessage.userName}</strong>
                    <span>
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p>{selectedMessage.message}</p>
                </div>

                {/* Replies */}
                {selectedMessage.replies.map((reply, index) => (
                  <div
                    key={index}
                    className={`message-bubble ${
                      reply.isAdmin ? "admin-message" : "user-message"
                    }`}
                  >
                    <div className="message-sender">
                      <strong>{reply.senderName}</strong>
                      <span>{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Admin Reply Form */}
              {selectedMessage.status !== "closed" && (
                <div className="message-reply-form">
                  <h4>Reply to Customer</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to customer..."
                    rows="4"
                  />
                  <button
                    onClick={handleAdminReply}
                    className="btn btn-primary"
                    disabled={sending || !replyText.trim()}
                  >
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              )}

              {selectedMessage.status === "closed" && (
                <div className="message-closed-notice">
                  This conversation is closed. Change status to reopen.
                </div>
              )}
            </>
          ) : (
            <div className="empty-detail">
              <p>Select a message to view conversation</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}