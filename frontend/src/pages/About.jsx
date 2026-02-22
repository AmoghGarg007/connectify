function About() {
  return (
    <div className="about-page">

      {/* ===== OUR VISION ===== */}
      <section className="about-section">
        <h2 className="section-title">Our Vision</h2>

        <div className="about-content glass">
          <p className="about-text">
            At PES Humanitarians, we believe in the power of community and connection.
            Our platform is designed to bridge gaps, foster meaningful relationships,
            and create a vibrant ecosystem where students can discover opportunities
            and find their tribe.
          </p>
        </div>

        <div className="stats-grid">

          <div className="stat-card glass">
            <div className="stat-number blue">01</div>
            <h3>Unified Platform</h3>
            <p>All events and communities in one place</p>
          </div>

          <div className="stat-card glass">
            <div className="stat-number orange">02</div>
            <h3>Smart Connections</h3>
            <p>Find people who share your interests</p>
          </div>

          <div className="stat-card glass">
            <div className="stat-number blue">03</div>
            <h3>Campus Integration</h3>
            <p>Seamlessly connected with college life</p>
          </div>

        </div>
      </section>

      {/* ===== TEAM SECTION ===== */}
      <section className="team-section">
        <h2 className="section-title">Meet the Team</h2>

        <div className="team-grid">

          <div className="team-card glass">
            <div className="team-avatar blue-gradient">👤</div>
            <h3>Team Member 1</h3>
            <p className="team-role">Frontend Developer</p>
          </div>

          <div className="team-card glass">
            <div className="team-avatar orange-gradient">👤</div>
            <h3>Team Member 2</h3>
            <p className="team-role">Backend Developer</p>
          </div>

          <div className="team-card glass">
            <div className="team-avatar blue-gradient">👤</div>
            <h3>Team Member 3</h3>
            <p className="team-role">UI/UX Designer</p>
          </div>

          <div className="team-card glass">
            <div className="team-avatar orange-gradient">👤</div>
            <h3>Team Member 4</h3>
            <p className="team-role">Project Lead</p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default About;