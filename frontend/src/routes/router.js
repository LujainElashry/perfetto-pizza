//--------------------------- Router.js ------------------------------------------
// imports
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/shared/Layout";
import Home from "./components/shared/Home";
import Menu from "./components/customer/Menu";
import About from "./components/customer/About";
import Contact from "./components/customer/Contact";
import Dashboard from "./components/admin/Dashboard";
import Orders from "./components/admin/Orders";
import Products from "./components/admin/Products";
import Users from "./components/admin/Users";
import MyMessages from "./components/customer/MyMessages";
import Messages from "./components/admin/Messages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      /** Normal user routes */
      {
        path: "menu",
        element: <Menu />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "messages",
        element: <MyMessages />,
      },

      /**  Admin routes */

      {
        path: "admin/dashboard",
        element: <Dashboard />,
      },
      {
        path: "admin/orders",
        element: <Orders />,
      },
      {
        path: "admin/products",
        element: <Products />,
      },
      {
        path: "admin/users",
        element: <Users />,
      },
      {
        path: "admin/messages",
        element: <Messages />,
      },
    ],
  },
]);

export default router;
