import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { messageAPI } from "../../services/api";

export default function Contact() {
  const navigate = useNavigate();
  const { currentUser } = useCart();

  const [formData, setFormData] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("Please login to send a message");
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await messageAPI.createMessage(formData);

      if (response.success) {
        setSuccess(true);
        setFormData({ subject: "", message: "" });
        setTimeout(() => navigate("/messages"), 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  return (
    <section className="page-section contact-page">
      <div className="contact-container">
        {/* Header */}
        <div className="page-header">
          <h2>Get in Touch</h2>
          <div className="header-underline"></div>
          <p className="page-subtitle">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <div className="contact-form-card">
            <h2 className="form-title">Send a Message</h2>
            <p className="form-description">
              Fill out the form below and we'll get back to you as soon as
              possible.
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && (
              <div className="alert alert-success">
                Message sent successfully! Redirecting...
              </div>
            )}
            {!currentUser && (
              <div className="alert alert-warning">
                Please login to send a message
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What would you like to discuss?"
                  className="form-input"
                  required
                  disabled={!currentUser || loading}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Tell us more about your inquiry..."
                  className="form-textarea"
                  required
                  disabled={!currentUser || loading}
                  maxLength={1000}
                ></textarea>
                <div className="character-count">
                  {formData.message.length} / 1000
                </div>
              </div>

              <button
                type="submit"
                className={`form-submit-btn ${loading ? "loading" : ""}`}
                disabled={!currentUser || loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              {currentUser && (
                <p className="form-footer">
                  View your messages in{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/messages")}
                    className="form-link"
                  >
                    My Messages
                  </button>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-info-wrapper">
          <div className="info-cards-grid">
            <div className="info-card">
              <div className="info-card-icon location-icon">📍</div>
              <div className="info-card-content">
                <h3 className="info-card-title">Visit Us</h3>
                <p className="info-card-text">123 Pizza Street</p>
                <p className="info-card-text">New York, NY 10001</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon phone-icon">📞</div>
              <div className="info-card-content">
                <h3 className="info-card-title">Call Us</h3>
                <p className="info-card-text">(974) 33060010</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon email-icon">✉️</div>
              <div className="info-card-content">
                <h3 className="info-card-title">Email Us</h3>
                <p className="info-card-text">perfetto@gmail.com</p>
                <p className="info-card-text-small">Reply within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
