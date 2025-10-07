import { useState, useEffect } from "react";
import { pizzaAPI } from "../../services/api";

export default function Products() {
  const [pizzas, setPizzas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPizza, setCurrentPizza] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    ingredients: "",
    image: null,
    popular: false,
  });

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      const response = await pizzaAPI.getAll();
      setPizzas(response.data);
    } catch (error) {
      console.error("Error fetching pizzas:", error);
      alert("Failed to load pizzas");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || formData.quantity === "") {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("quantity", formData.quantity);
      data.append("ingredients", formData.ingredients);
      data.append("popular", formData.popular);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (currentPizza) {
        await pizzaAPI.update(currentPizza._id, data);
      } else {
        await pizzaAPI.create(data);
      }

      fetchPizzas();
      setIsEditing(false);
      setImagePreview(null);
      setFormData({
        name: "",
        price: "",
        quantity: "",
        ingredients: "",
        image: null,
        popular: false,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save pizza");
      console.error("Error saving pizza:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pizza) => {
    setIsEditing(true);
    setCurrentPizza(pizza);
    setFormData({
      name: pizza.name,
      price: pizza.price,
      quantity: pizza.quantity,
      ingredients: pizza.ingredients,
      image: null,
      popular: pizza.popular,
    });
    setImagePreview(pizza.photoName);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pizza?")) {
      try {
        await pizzaAPI.delete(id);
        fetchPizzas();
      } catch (error) {
        alert("Failed to delete pizza");
        console.error("Error deleting pizza:", error);
      }
    }
  };

  return (
    <section className="page-section admin-products">
      <div className="page-header">
        <h2>Manage Pizzas</h2>
        <div className="header-underline"></div>
      </div>

      <div className="admin-actions">
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentPizza(null);
            setFormData({
              name: "",
              price: "",
              quantity: "",
              ingredients: "",
              image: null,
              popular: false,
            });
            setImagePreview(null);
          }}
          className="btn add-pizza-btn"
        >
          🍕 Add New Pizza
        </button>
      </div>

      {isEditing && (
        <div className="admin-form-card">
          <h3>{currentPizza ? "Edit Pizza" : "Add New Pizza"}</h3>

          <div className="form-grid-admin">
            <div className="form-group">
              <label>Pizza Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Margherita"
              />
            </div>

            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="12.99"
              />
            </div>

            <div className="form-group">
              <label>Available Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="50"
              />
            </div>

            <div className="form-group">
              <label>Pizza Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "200px",
                      marginTop: "10px",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group form-group-full">
              <label>Ingredients</label>
              <textarea
                value={formData.ingredients}
                onChange={(e) =>
                  setFormData({ ...formData, ingredients: e.target.value })
                }
                rows="3"
                placeholder="Tomato, mozzarella, basil..."
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) =>
                    setFormData({ ...formData, popular: e.target.checked })
                  }
                />
                <span>Mark as Popular</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Pizza"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setImagePreview(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Popular</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pizzas.map((pizza) => (
              <tr key={pizza._id}>
                <td>
                  <img
                    src={pizza.photoName}
                    alt={pizza.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </td>
                <td className="table-name">{pizza.name}</td>
                <td>${pizza.price.toFixed(2)}</td>
                <td>{pizza.quantity}</td>
                <td>
                  <span
                    className={`status-badge ${
                      pizza.soldOut ? "status-soldout" : "status-available"
                    }`}
                  >
                    {pizza.soldOut ? "Sold Out" : "Available"}
                  </span>
                </td>
                <td>{pizza.popular ? "⭐ Yes" : "No"}</td>
                <td className="table-actions">
                  <button
                    onClick={() => handleEdit(pizza)}
                    className="btn-icon btn-edit"
                  >
                    <span className="edit-icon"></span>
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(pizza._id)}
                    className="btn-delete"
                  >
                    <span className="delete-fill"></span>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
