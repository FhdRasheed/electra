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
          <h1 className="vd-website-name"><span className="logo-pill">🔒</span> ELECTRA ADMIN</h1>
          <button className="btn-logout" onClick={() => navigate("/admin-dashboard")} title="Back to Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="vd-main">
        <div className="vd-hero" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="vd-section-title">Candidate Applications <span className="title-badge">{applications.length} Total</span></h2>
            <div className="vd-section-subtitle">Manage and review student candidacy for upcoming elections.</div>
          </div>
        </div>

        <section className="vd-notifications-list vd-card--spaced">
          <div className="filters-row">
            <div className="filter-field">
              <label className="filter-label">Status</label>
              <div className="select-pill">
                <svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M3 5h18v2H3V5zm3 6h12v2H6v-2zm3 6h6v2H9v-2z"/></svg>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="report-select">
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="filter-field wide">
              <label className="filter-label">Position</label>
              <div className="select-pill">
                <svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zM9.5 14C7 14 5 12 5 9.5S7 5 9.5 5 14 7 14 9.5 12 14 9.5 14z"/></svg>
                <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="report-select">
                  <option value="">All Positions</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filters-actions">
              <button className="icon-btn" onClick={fetchApplications} disabled={loading} title="Refresh">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15A9 9 0 1 1 15 3.5L23 11"/></svg>
              </button>
            </div>
          </div>

          {error ? <div className="form-error">{error}</div> : null}
        </section>

        <section className="vd-notifications-list">
          {loading ? (
            <div className="empty-state">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">No applications found.</div>
          ) : (
            <div className="table-wrapper">
              <div className="table-header-row">
                <h3 className="table-title">Applications</h3>
                <div className="table-meta">Total <span className="badge-pill">{applications.length}</span></div>
              </div>

              <table className="voters-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Voter / Ref</th>
                    <th>Position & Branch</th>
                    <th>Status</th>
                    <th>Documents</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => {
                    const docs = a?.documents || {};
                    return (
                      <tr key={a._id}>
                        <td>
                          <div className="applicant-cell">
                            <div className="applicant-avatar">{(a.full_name||"-").charAt(0)}</div>
                            <div className="applicant-meta">
                              <div className="applicant-name">{a.full_name || "-"}</div>
                              <div className="applicant-sub">Applied {a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '-'}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="ref-id">{a.voter_id || '-'}</div>
                          <div className="ref-sub">{a.reference_number || ''}</div>
                        </td>

                        <td>
                          <div className="pos-title">{a.position || '-'}</div>
                          <div className="pos-dept">{a.branch_name || ''}</div>
                        </td>

                        <td>
                          <span className={`status-badge status-${String((a.status||'').toLowerCase()||'unknown')}`}>
                            {a.status || '-'}
                          </span>
                        </td>

                        <td>
                          <div className="docs-chips">
                            {docs.identity_proof ? <a className="doc-chip" href={toAbsUrl(docs.identity_proof)} target="_blank" rel="noreferrer">Identity <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 21H3V3"/></svg></a> : null}
                            {docs.membership_proof ? <a className="doc-chip" href={toAbsUrl(docs.membership_proof)} target="_blank" rel="noreferrer">Membership <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 21H3V3"/></svg></a> : null}
                            {docs.supporting_document ? <a className="doc-chip" href={toAbsUrl(docs.supporting_document)} target="_blank" rel="noreferrer">Supporting <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 21H3V3"/></svg></a> : null}
                            {!docs.identity_proof && !docs.membership_proof && !docs.supporting_document ? <span className="muted">-</span> : null}
                          </div>
                        </td>

                        <td>
                          <div className="action-cell">
                            <button className="vd-tile-btn review-btn" onClick={() => startReview(a)}>
                              <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12 3.41 13.41 9 19l12-12L19.59 5 9 16.17z"/></svg>
                              <span>Review</span>
                            </button>
                          </div>
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
          <section className="vd-notifications-list vd-card--spaced">
            <h3 className="vd-section-title vd-section-title--compact">Review Application</h3>
            <div className="report-form">
              <div className="admin-edit-field">
                <label className="filter-label">Decision</label>
                <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="report-select">
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Reject</option>
                </select>
              </div>

              <div className="admin-edit-field grow">
                <label className="filter-label">Admin Remarks</label>
                <input
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Optional remarks (required if rejecting, recommended)"
                  className="report-input"
                />
              </div>
            </div>

            <div className="admin-edit-actions">
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
