import { useEffect, useState } from "react";
import PizzaItem from "../shared/PizzaItem";
import { pizzaAPI } from "../../services/api";

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name"); // name, price-low, price-high
  const [showSoldOut, setShowSoldOut] = useState(true);

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const response = await pizzaAPI.getAll();
      setPizzas(response.data);
    } catch (err) {
      setError("Failed to load pizzas");
      console.error("Error fetching pizzas:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedPizzas = () => {
    let filtered = [...pizzas];
    if (!showSoldOut) {
      filtered = filtered.filter((pizza) => pizza.soldOut !== true);
    }

    // Sort pizzas
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  const filteredPizzas = getFilteredAndSortedPizzas();

  if (loading) {
    return (
      <section className="menu">
        <div className="loading-spinner">Loading pizzas...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="menu">
        <div className="error-message">{error}</div>
      </section>
    );
  }

  return (
    <section className="page-section menu-page">
      <div className="page-header">
        <h2>Our Menu</h2>
        <div className="header-underline"></div>
        <p className="page-subtitle">
          Handcrafted perfection from our stone oven. Artisan pizzas made with
          organic ingredients, baked to golden perfection daily.
        </p>
      </div>

      {/* Filter and Sort Controls */}
      <div className="menu-controls">
        <div className="sort-control">
          <label htmlFor="sort-select">Sort by: </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
          </select>
        </div>

        <div className="filter-control">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showSoldOut}
              onChange={(e) => setShowSoldOut(e.target.checked)}
            />
            <span>Show sold out items</span>
          </label>
        </div>
      </div>

      {filteredPizzas.length > 0 ? (
        <div className="pizzas">
          {filteredPizzas.map((pizza) => (
            <PizzaItem pizza={pizza} key={pizza._id} />
          ))}
        </div>
      ) : (
        <p>No pizzas available at the moment.</p>
      )}
    </section>
  );
}
