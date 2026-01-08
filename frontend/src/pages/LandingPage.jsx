import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🏛️</div>
            <div className="logo-text">
              <h1>Electra</h1>
              <p>Smart Election Assistant</p>
            </div>
          </div>
          <div className="header-buttons">
            <button className="btn btn-header" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="btn btn-header secondary" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <section className="purpose-section">
          <div className="purpose-content">
            <h2>Secure & Transparent Election System</h2>
            <p className="purpose-desc">
              Login to access your dashboard, view updates, and participate in the election process.
            </p>

            <div className="cta-buttons" style={{ marginTop: 18 }}>
              <button className="btn btn-primary-large" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="btn btn-secondary-large" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 St. Joseph's College of Engineering & Technology. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
