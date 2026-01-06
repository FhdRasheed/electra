import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Voterdash.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const userType = localStorage.getItem("userType");
    
    if (!storedEmail || userType !== "admin") {
      navigate("/login");
      return;
    }
    
    setEmail(storedEmail);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("email");
    window.location.href = "/";
  };

  return (
    <div className="vd-wrapper">
      {/* Header */}
      <header className="vd-header">
        <div className="vd-header-inner">
          <h1 className="vd-website-name">ELECTRON</h1>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="vd-main">
        <h2 className="vd-section-title">Admin Dashboard</h2>

        {/* Cards Grid as action tiles */}
        <section className="vd-action-tiles">
          <div className="vd-tile">
            <div className="vd-tile-icon">👤</div>
            <h3 className="vd-tile-title">Add New Voter</h3>
            <p className="vd-tile-desc">Register new voters to the election system. Add their details and verify their eligibility.</p>
            <button className="vd-tile-btn" onClick={() => navigate("/add-voter")}>Add New Voter</button>
          </div>

          <div className="vd-tile">
            <div className="vd-tile-icon">✓</div>
            <h3 className="vd-tile-title">Approve Candidates</h3>
            <p className="vd-tile-desc">Review and approve candidate applications. Verify their eligibility and approve or reject applications.</p>
            <button className="vd-tile-btn" onClick={() => navigate('/candidate-application')}>Review Applications</button>
          </div>

          <div className="vd-tile">
            <div className="vd-tile-icon">📋</div>
            <h3 className="vd-tile-title">Voter Reports</h3>
            <p className="vd-tile-desc">Review reports submitted by voters about mistakes, discrepancies, or issues in their voter information.</p>
            <button className="vd-tile-btn" onClick={() => navigate("/admin-reports")}>View All Reports</button>
          </div>

          <div className="vd-tile">
            <div className="vd-tile-icon">👥</div>
            <h3 className="vd-tile-title">View Voters</h3>
            <p className="vd-tile-desc">See the complete list of voters and edit their details when required.</p>
            <button className="vd-tile-btn" onClick={() => navigate("/voters-list")}>View Voters List</button>
          </div>

          <div className="vd-tile">
            <div className="vd-tile-icon">📣</div>
            <h3 className="vd-tile-title">Send Notification</h3>
            <p className="vd-tile-desc">Send announcements or alerts to voters. Notifications will appear on voter dashboards.</p>
            <button className="vd-tile-btn" onClick={() => navigate('/send-notification')}>Send Notification</button>
          </div>
        </section>
      </main>

      <footer className="vd-footer">
        <div className="vd-footer-inner">© 2025 St. Joseph's College of Engineering & Technology. All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default AdminDashboard;
