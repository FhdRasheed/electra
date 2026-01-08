import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Voterdash.css";

function ViewVotersList() {
  const navigate = useNavigate();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchVoterId, setSearchVoterId] = useState("");

  const formatAddress = (address) => {
    if (!address) return "—";
    if (typeof address === "string") return address || "—";
    if (typeof address === "object") {
      const houseName = address.house_name;
      const houseNumber = address.house_number;
      const streetName = address.street_name;
      const place = address.place;
      const combined = [houseName, houseNumber, streetName, place].filter(Boolean).join(", ");
      return combined || "—";
    }
    return String(address);
  };

  const calculateAge = (dob) => {
    if (!dob) return "—";
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return "—";
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age -= 1;
    }
    return age >= 0 ? age : "—";
  };

  const fetchVoters = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/voters", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setVoters(res.data.voters || []);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch voters list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  const filteredVoters = useMemo(() => {
    const q = (searchVoterId || "").trim();
    if (!q) return voters;
    return voters.filter((v) => String(v.voter_id || "").includes(q));
  }, [voters, searchVoterId]);

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
          <h2 className="vd-section-title">Voters List</h2>
          <div className="vd-section-subtitle">Search voters by Voter ID</div>

          <div className="admin-edit-card" style={{ marginTop: 0 }}>
            <div className="report-form">
              <div className="report-field report-field--grow">
                <label htmlFor="searchVoterId">Voter ID</label>
                <input
                  id="searchVoterId"
                  className="report-input"
                  type="text"
                  placeholder="Enter Voter ID"
                  value={searchVoterId}
                  onChange={(e) => setSearchVoterId(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
              <div className="report-actions">
                <button className="btn-cancel" type="button" onClick={() => setSearchVoterId("")}>Clear</button>
              </div>
            </div>
          </div>

          {message && <div style={{ marginTop: 12 }} className="message error">{message}</div>}

          <div className="voters-table-container">
            {loading ? (
              <div className="no-voters">Loading voters list...</div>
            ) : (
              <table className="voters-table">
                <thead>
                  <tr>
                    <th>SI No</th>
                    <th>Voter ID</th>
                    <th>Voter Name</th>
                    <th>Age</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.length > 0 ? (
                    filteredVoters.map((voter, idx) => (
                      <tr key={voter._id || voter.voter_id}>
                        <td>{idx + 1}</td>
                        <td>{voter.voter_id}</td>
                        <td>{voter.full_name || voter.name || "—"}</td>
                        <td>{calculateAge(voter.date_of_birth)}</td>
                        <td>{formatAddress(voter.address)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-voters">No voters found</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export default ViewVotersList;
