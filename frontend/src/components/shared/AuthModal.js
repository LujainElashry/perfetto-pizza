import { useState } from "react";
import { userAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    if (isLogin) {
      const response = await userAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        onLogin(response.data.user);

        // Redirect admin to admin panel
        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        }

        onClose();
      } else {
        // Backend explicitly said login failed (e.g. account deleted)
        setError(response.message || "Login failed");
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const response = await userAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        onLogin(response.data.user);
        onClose();
      } else {
        setError(response.message || "Registration failed");
      }
    }
  } catch (err) {
    // ✅ Handle 403 (deactivated) or other backend messages
    const message =
      err.response?.data?.message ||
      (err.response?.status === 403
        ? "Your account has been deactivated."
        : "An error occurred. Please try again.");
    setError(message);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p className="modal-subtitle">
          {isLogin ? "Login to place your order" : "Sign up to start ordering delicious pizza"}
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="auth-form">
          <div className="form-grid">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleSubmit} 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </div>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({ name: "", email: "", password: "", confirmPassword: "" });
            }}
            className="link-button"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
