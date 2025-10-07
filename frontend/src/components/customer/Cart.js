import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, currentUser } =
    useCart();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <section className="page-section">
        <div className="container text-center">
          <h2>Please login to view your cart</h2>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="page-section cart-empty">
        <div className="container text-center">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious pizzas to get started!</p>
          <Link to="/menu" className="btn btn-primary">
            Browse Menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section cart-page">
      <div className="page-header">
        <h2>Your Cart</h2>
        <div className="header-underline"></div>
      </div>
      <div className="container">
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.photoName} alt={item.name} />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>{item.ingredients}</p>
                  <span className="cart-item-price">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>$5.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${(getCartTotal() + 5).toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
