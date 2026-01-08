import { useNavigate } from "react-router-dom";
import "../styles/Voterdash.css";

function AdminVoting() {
  const navigate = useNavigate();

  return (
    <div className="vd-wrapper">
      <header className="vd-header">
        <div className="vd-header-inner">
          <h1 className="vd-website-name">ELECTRA</h1>
          <button className="btn-logout" onClick={() => navigate("/admin-dashboard")}>Back</button>
        </div>
      </header>

      <main className="vd-main">
        <section>
          <h2 className="vd-section-title">Voting</h2>
          <div className="vd-section-subtitle">Manage voting operations</div>

          <div className="admin-edit-card" style={{ marginTop: 16 }}>
            <div style={{ color: "#0b2340", fontWeight: 600 }}>
              Voting management will be available here.
            </div>
          </div>
        </section>
      </main>

      <footer className="vd-footer">
        <div className="vd-footer-inner">© 2025 St. Joseph's College of Engineering & Technology. All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default AdminVoting;
