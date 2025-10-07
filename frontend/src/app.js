// ----------------------------
// App.js
// ----------------------------

// Imports
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

// Layout & Pages
import Layout from "./components/shared/Layout";
import Home from "./components/shared/Home";
import Menu from "./components/customer/Menu";
import About from "./components/customer/About";
import Contact from "./components/customer/Contact";
import Cart from "./components/customer/Cart";
import MyOrders from "./components/customer/MyOrders";
import Checkout from "./components/customer/Checkout";
import MyMessages from "./components/customer/MyMessages";

// Admin Pages
import Dashboard from "./components/admin/Dashboard";
import Orders from "./components/admin/Orders";
import Products from "./components/admin/Products";
import Users from "./components/admin/Users";
import Messages from "./components/admin/Messages";

// ----------------------------
// Router Setup with Future Flag
// ----------------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "menu", element: <Menu /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "orders", element: <MyOrders /> },
      { path: "messages", element: <MyMessages /> },
      { path: "admin/dashboard", element: <Dashboard /> },
      { path: "admin/orders", element: <Orders /> },
      { path: "admin/products", element: <Products /> },
      { path: "admin/users", element: <Users /> },
      { path: "admin/messages", element: <Messages /> },
    ],
  },
]);

// ----------------------------
// App Component
// ----------------------------
export default function App() {
  return (
    <CartProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </CartProvider>
  );
}
