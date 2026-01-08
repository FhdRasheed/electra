import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Voterdash.css";

function AdminCandidateApplications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [reviewingId, setReviewingId] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const backendOrigin = String(api?.defaults?.baseURL || "").replace(/\/api\/?$/, "");
  const toAbsUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const normalized = url.startsWith("/") ? url.slice(1) : url;
    if (!backendOrigin) return `/${normalized}`;
    return `${backendOrigin}/${normalized}`;
  };

  const fetchApplications = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/candidate-applications", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter || undefined,
          position: positionFilter || undefined,
        },
      });
      setApplications(res.data.applications || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load applications");
      setApplications([]);
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
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, positionFilter]);

  const positions = useMemo(() => {
    const set = new Set();
    (applications || []).forEach((a) => {
      if (a?.position) set.add(a.position);
    });
    return Array.from(set).sort();
  }, [applications]);

  const startReview = (app) => {
    setReviewingId(app?._id || "");
    setReviewStatus("Approved");
    setAdminRemarks("");
  };

  const submitReview = async () => {
    if (!reviewingId) return;
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(
        `/candidate-applications/${reviewingId}/review`,
        { status: reviewStatus, admin_remarks: adminRemarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res?.data?.application;
      setApplications((prev) =>
        (prev || []).map((a) => (a?._id === reviewingId ? { ...a, ...updated } : a))
      );
      setReviewingId("");
      setAdminRemarks("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vd-wrapper">
      <header className="vd-header">
        <div className="vd-header-inner">
          <h1 className="vd-website-name">ELECTRA</h1>
          <button className="btn-logout" onClick={() => navigate("/admin-dashboard")}>Back</button>
        </div>
      </header>

      <main className="vd-main">
        <h2 className="vd-section-title">Candidate Applications</h2>

        <section className="vd-notifications-list" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ minWidth: 200 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "#0b2340" }}>Status</div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ minWidth: 260 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "#0b2340" }}>Position</div>
              <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">All</option>
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <button className="vd-tile-btn" onClick={fetchApplications} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <div style={{ marginTop: 12, color: "#b42318", fontWeight: 700 }}>{error}</div>
          ) : null}
        </section>

        <section className="vd-notifications-list">
          {loading ? (
            <div style={{ fontWeight: 700, color: "#0b2340" }}>Loading applications...</div>
          ) : applications.length === 0 ? (
            <div style={{ fontWeight: 700, color: "#0b2340" }}>No applications found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="vd-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Voter ID</th>
                    <th>Full Name</th>
                    <th>Branch</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Documents</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => {
                    const docs = a?.documents || {};
                    return (
                      <tr key={a._id}>
                        <td>{a.reference_number || "-"}</td>
                        <td>{a.voter_id || "-"}</td>
                        <td>{a.full_name || "-"}</td>
                        <td>{a.branch_name || "-"}</td>
                        <td>{a.position || "-"}</td>
                        <td style={{ fontWeight: 800 }}>{a.status || "-"}</td>
                        <td>{a.applied_at ? new Date(a.applied_at).toLocaleString() : "-"}</td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {docs.identity_proof ? (
                              <a href={toAbsUrl(docs.identity_proof)} target="_blank" rel="noreferrer">Identity</a>
                            ) : (
                              <span>-</span>
                            )}
                            {docs.membership_proof ? (
                              <a href={toAbsUrl(docs.membership_proof)} target="_blank" rel="noreferrer">Membership</a>
                            ) : (
                              <span>-</span>
                            )}
                            {docs.supporting_document ? (
                              <a href={toAbsUrl(docs.supporting_document)} target="_blank" rel="noreferrer">Supporting</a>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <button className="vd-tile-btn" onClick={() => startReview(a)}>
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {reviewingId ? (
          <section className="vd-notifications-list" style={{ marginTop: 16 }}>
            <h3 className="vd-section-title" style={{ marginBottom: 10 }}>Review Application</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: "#0b2340" }}>Decision</div>
                <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} style={{ width: "100%" }}>
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Reject</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: "#0b2340" }}>Admin Remarks</div>
                <input
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Optional remarks (required if rejecting, recommended)"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button className="vd-tile-btn" onClick={submitReview} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="vd-tile-btn" onClick={() => setReviewingId("")} disabled={saving}>
                Cancel
              </button>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="vd-footer">
        <div className="vd-footer-inner">© 2025 St. Joseph's College of Engineering & Technology. All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default AdminCandidateApplications;
