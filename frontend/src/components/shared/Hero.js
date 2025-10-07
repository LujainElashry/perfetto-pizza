import { useState } from "react";
import { useCart } from "../../context/CartContext";
import AuthModal from "./AuthModal";

export default function Hero() {
  const { currentUser, setUser } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogin = (user) => {
    setUser(user);
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    setIsAuthOpen(false); // close modal after login
  };

  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Authentic Italian cuisine</h1>
        <p>
          From our stone oven to your table. Organic ingredients, authentic
          recipes, and flavors that transport you straight to Italy.
        </p>

        {/* Show button only if user is not logged in */}
        {!currentUser && (
          <button
            className="btn btn-primary"
            onClick={() => setIsAuthOpen(true)}
          >
            Order Now
          </button>
        )}
      </div>
      {/* Auth Modal same as Nav */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />
      <div className="hero-image">
        <img src="images/pizza-hero.png" alt="hero-image" />
      </div>
    </section>
  );
}
