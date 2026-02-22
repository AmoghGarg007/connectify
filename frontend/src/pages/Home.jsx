import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Connectify";
  }, []);
  
  return (
    <div className="home">

      {/* ================= HERO ================= */}

      <section className="section-sm hero-section">
        <h1>Find Your Tribe.</h1>

        <p>
          Connect with like-minded students based on your interests.
          Temporary group chats. Real connections.
        </p>

        <div className="home-buttons">
          <button onClick={() => navigate("/find-group")}>
            Find a Group
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/calendar")}
          >
            Events Calendar
          </button>
        </div>
      </section>


      {/* ================= FEATURES ================= */}

      <section className="section features-section">

        <h2 className="section-title">Key Features</h2>

        <div className="features-grid">

          <div className="feature-card glass">
            <div className="feature-header blue-gradient">
              <div className="feature-icon">📅</div>
              <h3>Events Calendar</h3>
            </div>

            <div className="feature-body">
              <p className="feature-description">
                A comprehensive calendar system showcasing events
                from all college clubs and organizations.
              </p>

              <ul className="feature-list">
                <li>View all club events in one place</li>
                <li>Filter by club, category, and date</li>
                <li>Get reminders for upcoming events</li>
                <li>RSVP and track participation</li>
              </ul>

              <button onClick={() => navigate("/calendar")}>
                Go to Calendar
              </button>
            </div>
          </div>

          <div className="feature-card glass">
            <div className="feature-header orange-gradient">
              <div className="feature-icon">🤝</div>
              <h3>Social Forum</h3>
            </div>

            <div className="feature-body">
              <p className="feature-description">
                Connect with like-minded individuals and build
                meaningful relationships within campus.
              </p>

              <ul className="feature-list">
                <li>Create interest-based groups</li>
                <li>Discover people with similar passions</li>
                <li>Engage in discussions</li>
                <li>Collaborate on ideas</li>
              </ul>

              <div className="placeholder-box">
                Forum Interface Placeholder
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ================= ABOUT / VISION ================= */}

      <section className="section about-section">

        <h2 className="section-title">Our Vision</h2>

        <div className="about-content glass">
          <p className="about-text">
            At PES Humanitarians, we believe in the power of community and connection.
            Our platform bridges gaps, fosters meaningful relationships,
            and helps students find their tribe.
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


      {/* ================= TEAM SECTION ================= */}

      <section className="section team-section">

        <h2 className="section-title">Meet the Team</h2>

        <div className="team-grid">

          <div className="team-card glass">
            <div className="team-avatar blue-gradient">👤</div>
            <h3>Amogh Garg and Rithvik Addanki</h3>
            <p className="team-role">Frontend Developer</p>
          </div>

          <div className="team-card glass">
            <div className="team-avatar orange-gradient">👤</div>
            <h3>Arrham Jain</h3>
            <p className="team-role">Backend Developer</p>
          </div>

          <div className="team-card glass">
            <div className="team-avatar blue-gradient">👤</div>
            <h3>Akshat Jayesh Bongale</h3>
            <p className="team-role">UI/UX Designer</p>
          </div>

          <div className="team-card glass">
            <div className="team-avatar orange-gradient">👤</div>
            <h3>Amogh Garg</h3>
            <p className="team-role">Project Lead</p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;