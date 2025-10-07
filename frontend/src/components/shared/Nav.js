import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import AuthModal from "./AuthModal";
import { userAPI, messageAPI } from "../../services/api";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, setCurrentUser, getCartCount } = useCart();

  useEffect(() => {
    const user = userAPI.getCurrentUser();
    setCurrentUser(user);
  }, [setCurrentUser]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUnreadCount = async () => {
      try {
        const response =
          currentUser.role === "admin"
            ? await messageAPI.getAdminUnreadCount()
            : await messageAPI.getUnreadCount();
        setUnreadCount(response.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      userAPI.logout();
      setCurrentUser(null);
      navigate("/");
      window.location.reload();
      setTimeout(() => alert("You have been logged out successfully"), 100);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="nav">
        <Logo />

        {/* Hamburger icon */}
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Nav menu + mobile actions */}
        <div className={`nav-menu-wrapper ${menuOpen ? "open" : ""}`}>
          {currentUser?.role === "admin" ? (
            <AdminNavMenu unreadCount={unreadCount} closeMenu={closeMenu} />
          ) : (
            <NavMenu
              currentUser={currentUser}
              unreadCount={unreadCount}
              closeMenu={closeMenu}
            />
          )}

          {/* Mobile actions inside menu */}
          <div className="nav-actions-mobile">
            {currentUser ? (
              <>
                <div className="user-menu">
                  <span className="user-name">
                    👋 Hi, {currentUser.name.split(" ")[0]}!
                  </span>
                  {currentUser.role !== "admin" && (
                    <Link to="/cart" className="cart-link" onClick={closeMenu}>
                      <span className="mdi--cart"></span>
                      <span>My Cart</span>
                      {getCartCount() > 0 && (
                        <span className="cart-badge">{getCartCount()}</span>
                      )}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsAuthOpen(true);
                  closeMenu();
                }}
                className="btn btn-primary btn-full"
              >
                Order Now
              </button>
            )}
          </div>
        </div>

        {/* Desktop nav-actions */}
        <div className="nav-actions-desktop">
          {currentUser ? (
            <>
              {currentUser.role !== "admin" && (
                <Link to="/cart" className="cart-link">
                  <span className="mdi--cart"></span>
                  {getCartCount() > 0 && (
                    <span className="cart-badge">{getCartCount()}</span>
                  )}
                </Link>
              )}
              <div className="user-menu">
                <span className="user-name">
                  Hi, {currentUser.name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn btn-primary"
            >
              Order Now
            </button>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
}

// Logo component
function Logo() {
  return (
    <a href="/" className="logo">
      <img
        src="/images/Perfetto-Logo.png"
        alt="PERFETTO Pizza"
        className="logo-image"
      />
    </a>
  );
}

// Normal user nav
function NavMenu({ currentUser, unreadCount, closeMenu }) {
  return (
    <ul className="nav-menu">
      <NavItem to="/" text="Home" closeMenu={closeMenu} />
      <NavItem to="/menu" text="Menu" closeMenu={closeMenu} />
      {currentUser && (
        <NavItem to="/orders" text="Orders" closeMenu={closeMenu} />
      )}
      {currentUser && (
        <NavItem
          to="/messages"
          text="My Messages"
          badge={unreadCount > 0 ? unreadCount : null}
          closeMenu={closeMenu}
        />
      )}
      <NavItem to="/about" text="About" closeMenu={closeMenu} />
      <NavItem to="/contact" text="Contact" closeMenu={closeMenu} />
    </ul>
  );
}

// Admin nav
function AdminNavMenu({ unreadCount, closeMenu }) {
  return (
    <ul className="nav-menu">
      <NavItem to="/admin/dashboard" text="Dashboard" closeMenu={closeMenu} />
      <NavItem
        to="/admin/messages"
        text="Messages"
        badge={unreadCount > 0 ? unreadCount : null}
        closeMenu={closeMenu}
      />
      <NavItem to="/admin/orders" text="Manage Orders" closeMenu={closeMenu} />
      <NavItem
        to="/admin/products"
        text="Manage Products"
        closeMenu={closeMenu}
      />
      <NavItem to="/admin/users" text="Manage Users" closeMenu={closeMenu} />
    </ul>
  );
}

function NavItem({ to, text, badge, closeMenu }) {
  return (
    <li className="nav-item-with-badge">
      <Link to={to} className="nav-link" onClick={closeMenu}>
        {text}
        {badge && <span className="nav-notification-badge">{badge}</span>}
      </Link>
    </li>
  );
}
