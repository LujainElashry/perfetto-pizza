import { useCart } from "../../context/CartContext";

export default function PizzaItem({ pizza }) {
  const { addToCart, currentUser } = useCart();

  const handleAddToCart = () => {
    if (!currentUser) {
      alert("Please login to add items to cart");
      return;
    }
    if (pizza.soldOut) {
      alert("This pizza is currently sold out");
      return;
    }
    addToCart(pizza);
  };

  return (
    <div className={`pizza-item ${pizza.soldOut ? "sold-out" : ""}`}>
      <img src={pizza.photoName} alt={pizza.name} />
      <div>
        <h3>{pizza.name}</h3>
        <p>{pizza.ingredients}</p>
        
        <div className="price-cart-container">
          <span className="price">
            {pizza.soldOut ? "Sold Out" : `$${pizza.price}`}
          </span>
          {!pizza.soldOut && (
            <button 
              className="btn-cart-icon" 
              aria-label="Add to cart"
              onClick={handleAddToCart}
            >
              <span className="mdi--cart"></span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
