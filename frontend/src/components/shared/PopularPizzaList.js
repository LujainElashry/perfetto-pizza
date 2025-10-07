import { useState, useEffect } from "react";
import { pizzaAPI } from "../../services/api";
import PizzaItem from "./PizzaItem";

export default function PopularPizzaList() {
  const [pizzas, setPizzas] = useState([]);

  useEffect(() => {
    fetchPopularPizzas();
  }, []);

  const fetchPopularPizzas = async () => {
    try {
      const response = await pizzaAPI.getPopular();
      setPizzas(response.data);
    } catch (error) {
      console.error("Error fetching popular pizzas:", error);
    }
  };

  if (pizzas.length === 0) return null;

  return (
    <section className="popular">
      <h2>Most Frequently Ordered</h2>
      <div className="pizza-list">
        {pizzas.map((pizza) => (
          <PizzaItem pizza={pizza} key={pizza._id} />
        ))}
      </div>
    </section>
  );
}
