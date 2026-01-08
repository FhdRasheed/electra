import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Voterdash.css";

function CandidateApplication() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(null);

  const [position, setPosition] = useState("");
  const [symbol, setSymbol] = useState("");
  const [statement, setStatement] = useState("");
  const [experience, setExperience] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [identityProof, setIdentityProof] = useState(null);
  const [membershipProof, setMembershipProof] = useState(null);
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [candidatePhoto, setCandidatePhoto] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const positions = useMemo(
    () => [
      { value: "President", label: "President" },
      { value: "Secretary", label: "Secretary" },
      { value: "Treasurer", label: "Treasurer" },
      { value: "Board Member", label: "Board Member" },
    ],
    []
  );

  const fetchStatus = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/candidate-applications/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfo(res.data);
    } catch (e) {
      setInfo(null);
      setError(e?.response?.data?.message || "Failed to load application status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canApply = Boolean(info?.success && info?.eligible && !info?.application);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!position || !statement) {
      setError("Position and candidate statement are required");
      return;
    }
    if (!identityProof || !membershipProof) {
      setError("Identity proof and membership proof are required");
      return;
    }
    if (!declaration) {
      setError("You must accept the declaration to continue");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("position", position);
      form.append("statement", statement);
      form.append("declaration", "true");
      if (experience) form.append("experience", experience);
      if (symbol) form.append("symbol", symbol);
      form.append("identity_proof", identityProof);
      form.append("membership_proof", membershipProof);
      if (supportingDocument) form.append("supporting_document", supportingDocument);
      if (candidatePhoto) form.append("candidate_photo", candidatePhoto);

      const res = await api.post("/candidate-applications", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMsg(res?.data?.message || "Application submitted");
      await fetchStatus();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const voter = info?.voter || {};
  const cfg = info?.config || {};
  const app = info?.application || null;

  return (
    <div className="vd-wrapper">
      <header className="vd-header">
        <div className="vd-header-inner">
          <h1 className="vd-website-name">ELECTRA</h1>
          <button className="btn-logout" onClick={() => navigate("/voter-dashboard")}>Back</button>
        </div>
      </header>

      <main className="vd-main">
        <h2 className="vd-section-title">Apply as Candidate</h2>

        <section className="vd-notifications-list" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 8 }}>Guidelines</div>
          <div style={{ color: "#0b2340", lineHeight: 1.6 }}>
            Submitting this form does not guarantee candidacy. All applications are subject to admin verification and approval.
          </div>
          <div style={{ color: "#0b2340", marginTop: 8, lineHeight: 1.6 }}>
            {cfg?.phase ? (
              <div><b>Current phase:</b> {cfg.phase}</div>
            ) : null}
            {cfg?.nomination_last_date ? (
              <div><b>Nomination last date:</b> {cfg.nomination_last_date}</div>
            ) : null}
            {cfg?.notes ? (
              <div><b>Notes:</b> {cfg.notes}</div>
            ) : null}
          </div>
        </section>

        <section className="vd-notifications-list" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 10 }}>Applicant Details (Read-only)</div>

          {loading ? (
            <div style={{ fontWeight: 700, color: "#0b2340" }}>Loading...</div>
          ) : error ? (
            <div style={{ fontWeight: 800, color: "#b42318" }}>{error}</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                color: "#0b2340",
              }}
            >
              <div><b>Full Name:</b> {voter.full_name || "-"}</div>
              <div><b>Voter ID:</b> {voter.voter_id || "-"}</div>
              <div><b>Date of Birth:</b> {voter.date_of_birth || "-"}</div>
              <div><b>Branch:</b> {voter.branch_name || "-"}</div>
              <div><b>Email:</b> {voter.email || "-"}</div>
              <div><b>Phone:</b> {voter.phone_no || "-"}</div>
            </div>
          )}
        </section>

        {successMsg ? (
          <section className="vd-notifications-list" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, color: "#027a48" }}>{successMsg}</div>
          </section>
        ) : null}

        {app ? (
          <section className="vd-notifications-list">
            <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 10 }}>Application Status</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                color: "#0b2340",
              }}
            >
              <div><b>Reference:</b> {app.reference_number || "-"}</div>
              <div><b>Status:</b> {app.status || "-"}</div>
              <div><b>Position:</b> {app.position || "-"}</div>
              <div><b>Submitted:</b> {app.applied_at ? new Date(app.applied_at).toLocaleString() : "-"}</div>
              {app.admin_remarks ? (
                <div style={{ gridColumn: "1 / -1" }}><b>Admin remarks:</b> {app.admin_remarks}</div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="vd-notifications-list">
            {!loading && !canApply ? (
              <div style={{ fontWeight: 800, color: "#b42318" }}>
                {info?.eligibility_reason || "You are not eligible to apply right now."}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} style={{ marginTop: 12, opacity: canApply ? 1 : 0.6, pointerEvents: canApply ? "auto" : "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Position / Post Applied For *</div>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} style={{ width: "100%" }}>
                    <option value="">Select</option>
                    {positions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Candidate Symbol (optional)</div>
                  <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Optional" style={{ width: "100%" }} />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Candidate Statement / Manifesto *</div>
                <textarea value={statement} onChange={(e) => setStatement(e.target.value)} rows={5} style={{ width: "100%" }} />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Prior Experience (optional)</div>
                <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={3} style={{ width: "100%" }} />
              </div>

              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Identity Proof (PDF/JPG/PNG) *</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setIdentityProof(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Membership Proof (PDF/JPG/PNG) *</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setMembershipProof(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Supporting Document (optional)</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setSupportingDocument(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#0b2340", marginBottom: 6 }}>Candidate Photo (optional)</div>
                  <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setCandidatePhoto(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#0b2340", fontWeight: 700 }}>
                  <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} />
                  I hereby declare that the information provided is true and correct. I accept that my application may be rejected if any information is found false.
                </label>
              </div>

              {error ? <div style={{ marginTop: 12, fontWeight: 800, color: "#b42318" }}>{error}</div> : null}

              <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="vd-tile-btn" type="submit" disabled={submitting || !canApply}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
                <button className="vd-tile-btn" type="button" onClick={() => navigate("/voter-dashboard")} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <footer className="vd-footer">
        <div className="vd-footer-inner">© 2025 St. Joseph's College of Engineering & Technology. All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default CandidateApplication;
