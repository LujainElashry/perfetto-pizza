import Main from "./Main";
import PopularPizzaList from "./PopularPizzaList";
import AdminDashboard from "../admin/Dashboard";
import { useCart } from "../../context/CartContext";

export default function Home() {
  const { currentUser } = useCart();

  // Show Admin Dashboard only if user is logged in and role = admin
  if (currentUser && currentUser.role === "admin") {
    return <AdminDashboard />;
  }

  // Show normal homepage for guests and normal users
  return (
    <div className="App">
      <Main />
      <PopularPizzaList />
    </div>
  );
}
