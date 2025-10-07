import { createContext, useState, useContext, useEffect } from "react";
import { userAPI } from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = userAPI.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const savedCart = JSON.parse(
        sessionStorage.getItem(`cart_${user.id}`) || "[]"
      );
      setCart(savedCart);
    } else {
      setCart([]);
    }
  }, []);

  const addToCart = (pizza) => {
    if (!currentUser) return;

    const existingItem = cart.find((item) => item._id === pizza._id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((item) =>
        item._id === pizza._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...pizza, quantity: 1 }];
    }

    setCart(newCart);
    sessionStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(newCart));
  };

  const removeFromCart = (pizzaId) => {
    const newCart = cart.filter((item) => item._id !== pizzaId);
    setCart(newCart);
    if (currentUser) {
      sessionStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(newCart));
    }
  };

  const updateQuantity = (pizzaId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(pizzaId);
      return;
    }

    const newCart = cart.map((item) =>
      item._id === pizzaId ? { ...item, quantity } : item
    );
    setCart(newCart);
    if (currentUser) {
      sessionStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(newCart));
    }
  };

  const clearCart = () => {
    setCart([]);
    if (currentUser) {
      sessionStorage.removeItem(`cart_${currentUser.id}`);
    }
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
