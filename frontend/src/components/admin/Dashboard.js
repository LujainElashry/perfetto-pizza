import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPizzas: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await adminAPI.getStats();

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics");
    } finally {
    }
  };

  if (error) {
    return (
      <section className="page-section admin-dashboard">
        <div className="container text-center">
          <div className="error-message">{error}</div>
          <button onClick={fetchStats} className="btn btn-primary">
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section admin-dashboard">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <div className="header-underline"></div>
        <p className="page-subtitle">Welcome to your control center</p>
      </div>

      <div className="dashboard-refresh">
        <button onClick={fetchStats} className="btn-refresh">
          <span className="ic--outline-refresh"></span>
          Refresh Statistics
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card stat-card-pizzas">
          <div className="stat-icon pizza-icon">🍕</div>
          <div className="stat-content">
            <h3>Total Pizzas</h3>
            <p className="stat-number">{stats.totalPizzas}</p>
            <span className="stat-label">in menu</span>
          </div>
        </div>

        <div className="stat-card stat-card-orders">
          <div className="stat-icon orders-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders}</p>
            <span className="stat-label">all time</span>
          </div>
        </div>

        <div className="stat-card stat-card-pending">
          <div className="stat-icon pending-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
            <span className="stat-label">need attention</span>
          </div>
        </div>

        <div className="stat-card stat-card-users">
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <span className="stat-label">registered</span>
          </div>
        </div>

        <div className="stat-card stat-card-revenue">
          <div className="stat-icon revenue-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
            <span className="stat-label">gross sales</span>
          </div>
        </div>
      </div>
    </section>
  );
}
