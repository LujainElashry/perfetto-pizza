export default function Footer() {
  const hour = new Date().getHours();
  const openHour = 12;
  const closeHour = 22;
  const isOpen = hour >= openHour && hour <= closeHour;

  return (
    <footer className="footer">
      {isOpen ? (
        <div className="footer-message">
          <p>We're opening now. Come visit us or order online.</p>
        </div>
      ) : (
        <div className="footer-message">
          <p>
            We're happy to welcome you between {openHour}:00 and {closeHour}:00.
          </p>
        </div>
      )}

      <div className="footer-content">
        <div className="footer-section">
          <h4>About Us</h4>
          <p>
            Authentic Italian pizza made with love and the finest organic
            ingredients.
          </p>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>123 Pizza Street</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@perfetto.com</p>
        </div>

        <div className="footer-section">
          <h4>Opening Hours</h4>
          <p>
            From: {openHour}:00 - To : {closeHour}:00
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 PERFETTO Pizza. All rights reserved.</p>
      </div>
    </footer>
  );
}
