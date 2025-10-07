export default function About() {
  return (
    <section className="page-section about-page">
      <div className="page-header">
        <h2>About Us</h2>
        <div className="header-underline"></div>
        <p className="page-subtitle">
          Our passion for authentic Italian pizza crafted with love and
          tradition
        </p>
      </div>

      <div className="page-content-grid">
        <div className="content-card">
          <div className="card-icon">🍕</div>
          <h3>Our Story</h3>
          <p>
            PERFETTO was born from a dream to bring authentic Italian pizza to
            your neighborhood. Passed down through generations, our recipes
            blend tradition with the finest organic ingredients — each pizza
            handcrafted with care and passion for perfection in every bite.
          </p>
        </div>

        <div className="content-card">
          <div className="card-icon">🔥</div>
          <h3>Stone Oven Tradition</h3>
          <p>
            Every pizza is baked in our traditional stone oven at the perfect
            temperature, ensuring that golden, crispy crust and perfectly melted
            cheese that makes Italian pizza unforgettable.
          </p>
        </div>

        <div className="content-card">
          <div className="card-icon">🌿</div>
          <h3>Organic Ingredients</h3>
          <p>
            We source only the finest organic ingredients, from San Marzano
            tomatoes to fresh mozzarella. Quality is never compromised, because
            your health and satisfaction matter to us.
          </p>
        </div>
      </div>

      <div className="mission-statement">
        <h3>Our Mission</h3>
        <p>
          To serve the most authentic, delicious Italian pizza while creating
          memorable experiences for our community. We believe great food brings
          people together.
        </p>
      </div>
    </section>
  );
}
