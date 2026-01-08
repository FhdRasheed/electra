import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Voterdash.css";

function AdminNominationPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [phase, setPhase] = useState("closed");
  const [nominationLastDate, setNominationLastDate] = useState("");
  const [notes, setNotes] = useState("");

  const fetchConfig = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/election-config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cfg = res?.data?.config || {};
      setPhase(cfg.phase || "closed");
      setNominationLastDate(cfg.nomination_last_date || "");
      setNotes(cfg.notes || "");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load election config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const userType = localStorage.getItem("userType");
    if (!storedEmail || userType !== "admin") {
      navigate("/login");
      return;
    }
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const saveConfig = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(
        "/election-config",
        {
          phase,
          nomination_last_date: nominationLastDate || null,
          notes: notes || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res?.data?.message || "Saved");
      await fetchConfig();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  const sendReminder = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/election-config/nomination-deadline-reminder",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res?.data?.message || "Reminder sent");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send reminder");
    } finally {
      setSaving(false);
    }
  };

  const isNominationOpen = String(phase || "").toLowerCase().includes("nomination");

  return (
    <div className="vd-wrapper">
      <header className="vd-header">
        <div className="vd-header-inner">
          <h1 className="vd-website-name">ELECTRA</h1>
          <button className="btn-logout" onClick={() => navigate("/admin-dashboard")}>Back</button>
        </div>
      </header>

      <main className="vd-main">
        <h2 className="vd-section-title">Nomination Portal</h2>

        <section className="vd-notifications-list" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 8 }}>What this controls</div>
          <div style={{ color: "#0b2340", lineHeight: 1.6 }}>
            When you set phase to <b>nomination</b>, voters can submit candidate applications. The system will automatically send a notification to all voters with the deadline.
          </div>
          <div style={{ color: "#0b2340", marginTop: 8, lineHeight: 1.6 }}>
            Use <b>Send Deadline Reminder</b> when the deadline is approaching.
          </div>
        </section>

        <section className="vd-notifications-list">
          {loading ? (
            <div style={{ fontWeight: 700, color: "#0b2340" }}>Loading...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Phase</div>
                <select value={phase} onChange={(e) => setPhase(e.target.value)} style={{ width: "100%" }}>
                  <option value="closed">Closed</option>
                  <option value="nomination">Nomination (Open)</option>
                  <option value="voting">Voting</option>
                  <option value="results">Results</option>
                </select>
              </div>

              <div>
                <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Nomination Deadline</div>
                <input type="date" value={nominationLastDate} onChange={(e) => setNominationLastDate(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Notes (optional)</div>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes shown to voters" style={{ width: "100%" }} />
              </div>

              {error ? (
                <div style={{ gridColumn: "1 / -1", fontWeight: 800, color: "#b42318" }}>{error}</div>
              ) : null}
              {success ? (
                <div style={{ gridColumn: "1 / -1", fontWeight: 800, color: "#027a48" }}>{success}</div>
              ) : null}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", gridColumn: "1 / -1" }}>
                <button className="vd-tile-btn" onClick={saveConfig} disabled={saving}>
                  {saving ? "Saving..." : isNominationOpen ? "Open Nomination Portal" : "Save"}
                </button>
                <button className="vd-tile-btn" onClick={fetchConfig} disabled={saving}>
                  Refresh
                </button>
                <button className="vd-tile-btn" onClick={sendReminder} disabled={saving || !isNominationOpen}>
                  Send Deadline Reminder
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="vd-footer">
        <div className="vd-footer-inner">© 2025 St. Joseph's College of Engineering & Technology. All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default AdminNominationPortal;
