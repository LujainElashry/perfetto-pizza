import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../services/api";
export default function Checkout() {
  const { cart, getCartTotal, clearCart, currentUser } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  if (!currentUser || cart.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber.trim())
        newErrors.cardNumber = "Card number is required";
      if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Invalid card number";
      }
      if (!formData.expiryDate.trim())
        newErrors.expiryDate = "Expiry date is required";
      if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
      if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = "Invalid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          pizzaId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          photoName: item.photoName,
          ingredients: item.ingredients,
        })),
        total: getCartTotal() + 5,
        deliveryAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await orderAPI.create(orderData);

      if (response.success) {
        clearCart();
        alert("Order placed successfully!");
        navigate("/orders");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
      console.error("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section checkout-page">
      <div className="page-header">
        <h2>Checkout</h2>
        <div className="header-underline"></div>
      </div>
      <div className="container">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-grid">
            <div className="checkout-main">
              <div className="checkout-section">
                <h3>Delivery Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? "error" : ""}
                    />
                    {errors.fullName && (
                      <span className="error-text">{errors.fullName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                      className={errors.phone ? "error" : ""}
                    />
                    {errors.phone && (
                      <span className="error-text">{errors.phone}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Street Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Apt 4B"
                    className={errors.address ? "error" : ""}
                  />
                  {errors.address && (
                    <span className="error-text">{errors.address}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? "error" : ""}
                    />
                    {errors.city && (
                      <span className="error-text">{errors.city}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={errors.zipCode ? "error" : ""}
                    />
                    {errors.zipCode && (
                      <span className="error-text">{errors.zipCode}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="checkout-section">
                <h3>Payment Method</h3>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleChange}
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === "cash"}
                      onChange={handleChange}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>

                {formData.paymentMethod === "card" && (
                  <div className="card-details">
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number *</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={errors.cardNumber ? "error" : ""}
                      />
                      {errors.cardNumber && (
                        <span className="error-text">{errors.cardNumber}</span>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date *</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className={errors.expiryDate ? "error" : ""}
                        />
                        {errors.expiryDate && (
                          <span className="error-text">
                            {errors.expiryDate}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="cvv">CVV *</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength="4"
                          className={errors.cvv ? "error" : ""}
                        />
                        {errors.cvv && (
                          <span className="error-text">{errors.cvv}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-section">
                <h3>Special Instructions (Optional)</h3>
                <div className="form-group">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any special requests for your order..."
                  />
                </div>
              </div>
            </div>

            <div className="checkout-sidebar">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cart.map((item) => (
                    <div key={item._id} className="summary-item">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>$5.00</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${(getCartTotal() + 5).toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
