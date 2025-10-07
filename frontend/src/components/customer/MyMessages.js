import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { messageAPI } from "../../services/api";

export default function MyMessages() {
  const { currentUser } = useCart();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const pollingInterval = useRef(null);

  // Memoize fetchMessages with useCallback
  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await messageAPI.getMyMessages();
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

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
    if (currentUser) {
      fetchMessages();
      // Start polling every 5 seconds
      pollingInterval.current = setInterval(() => {
        fetchMessages(true); // Silent refresh
      }, 5000);
    }

    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [currentUser, fetchMessages]);

  // Refresh selected message when it changes
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
      
      // Update the message in the list to mark as read
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, unreadByUser: false } : msg
        )
      );
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSending(true);
      await messageAPI.replyToMessage(selectedMessage._id, replyText);
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "status-pending", text: "Pending" },
      replied: { class: "status-replied", text: "Replied" },
      closed: { class: "status-closed", text: "Closed" },
    };
    return badges[status] || badges.pending;
  };

  if (!currentUser) {
    return (
      <section className="page-section">
        <div className="container text-center">
          <h2>Please login to view messages</h2>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </section>
    );
  }

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
    <section className="page-section messages-page">
      <div className="page-header">
        <h2>My Messages</h2>
        <div className="header-underline"></div>
        <Link to="/contact" className="btn btn-primary">
          Send New Message
        </Link>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet</p>
              <Link to="/contact" className="btn btn-secondary">
                Send your first message
              </Link>
            </div>
          ) : (
            messages.map((msg) => {
              const badge = getStatusBadge(msg.status);
              return (
                <div
                  key={msg._id}
                  className={`message-item ${
                    selectedMessage?._id === msg._id ? "active" : ""
                  } ${msg.unreadByUser ? "unread" : ""}`}
                  onClick={() => handleSelectMessage(msg._id)}
                >
                  <div className="message-item-header">
                    <h4>
                      {msg.subject}
                      {msg.unreadByUser && <span className="unread-indicator"></span>}
                    </h4>
                    <span className={`message-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
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
                  <p className="message-date-full">
                    Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`message-badge ${
                    getStatusBadge(selectedMessage.status).class
                  }`}
                >
                  {getStatusBadge(selectedMessage.status).text}
                </span>
              </div>

              <div className="message-thread">
                {/* Original Message */}
                <div className="message-bubble user-message">
                  <div className="message-sender">
                    <strong>You</strong>
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

              {/* User Reply Form - Only if not closed */}
              {selectedMessage.status !== "closed" ? (
                <div className="message-reply-form">
                  <h4>Reply</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows="3"
                  />
                  <button
                    onClick={handleReply}
                    className="btn btn-primary"
                    disabled={sending || !replyText.trim()}
                  >
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              ) : (
                <div className="message-closed-notice">
                  This conversation has been closed by admin.
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