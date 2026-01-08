import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Voterdash.css";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const dismissedIds = useMemo(() => {
    try {
      const raw = localStorage.getItem("dismissedNotificationIds");
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }, []);

  const [dismissed, setDismissed] = useState(dismissedIds);

  const saveDismissed = (next) => {
    setDismissed(next);
    localStorage.setItem("dismissedNotificationIds", JSON.stringify(Array.from(next)));
  };

  const dismiss = (id) => {
    const next = new Set(dismissed);
    next.add(String(id));
    saveDismissed(next);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      } else {
        setMessage(res.data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const visibleNotifications = useMemo(() => {
    return (notifications || []).filter((n) => !dismissed.has(String(n._id)));
  }, [notifications, dismissed]);

  return (
    <div className="vd-wrapper">
      <header className="vd-header">
        <div className="vd-header-inner">
          <h1 className="vd-website-name">ELECTRA</h1>
          <button className="btn-logout" onClick={() => navigate("/voter-dashboard")}>Back</button>
        </div>
      </header>

      <main className="vd-main">
        <section>
          <h2 className="vd-section-title">Notifications</h2>
          <div className="vd-section-subtitle">All announcements sent by the admin</div>

          {message && <div style={{ marginTop: 12 }} className="message error">{message}</div>}

          <div className="voters-table-container" style={{ marginTop: 16 }}>
            {loading ? (
              <div className="no-voters">Loading notifications...</div>
            ) : visibleNotifications.length > 0 ? (
              <div className="vd-notifications-list" style={{ boxShadow: "none", borderRadius: 0 }}>
                {visibleNotifications.map((n) => (
                  <div key={n._id} className="vd-notification-item" style={{ alignItems: "flex-start" }}>
                    <span className="notif-icon">📢</span>
                    <span className="notif-text">
                      <div style={{ fontWeight: 800, color: "#0b2340" }}>{n.title || "Notification"}</div>
                      <div style={{ marginTop: 4 }}>{n.message}</div>
                    </span>
                    <span className="notif-date" style={{ whiteSpace: "nowrap" }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</span>
                    <button className="notif-dismiss" type="button" onClick={() => dismiss(n._id)}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-voters">No notifications</div>
            )}
          </div>
        </section>
      </main>

      <footer className="vd-footer">
        <div className="vd-footer-inner">© 2025 St. Joseph's College of Engineering & Technology. All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default Notifications;
