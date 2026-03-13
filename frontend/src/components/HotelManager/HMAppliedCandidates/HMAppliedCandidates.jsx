import React, { useEffect, useState } from "react";
import Navbar from "../../Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Loading from "../../Loading/Loading";
import LoginError from "../../Auth/LoginError/LoginError";

const HMAppliedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login/error");
        return;
      }

      const decoded = jwtDecode(token);
      if (decoded.role !== "hotelmanager") {
        navigate("/login/error");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:3000/hm/applied-candidates",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCandidates(res.data);
        setFilteredCandidates(res.data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Failed to fetch applied candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [navigate]);

  useEffect(() => {
    const search = searchTerm.toLowerCase();
    const filtered = candidates.filter(
      (cand) =>
        cand.JobSeekerName.toLowerCase().includes(search) ||
        cand.JobTitle.toLowerCase().includes(search) ||
        cand.Email.toLowerCase().includes(search)
    );
    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  const handleStatusChange = async (id, currentStatus) => {
    let newStatus;

    // Toggle logic for status
    if (currentStatus === "pending") {
      newStatus = "accepted";
    } else if (currentStatus === "accepted") {
      newStatus = "rejected";
    } else {
      newStatus = "pending";
    }

    // Update state for the specific candidate (local state)
    setCandidates((prevCandidates) =>
      prevCandidates.map(
        (candidate) =>
          candidate.ApplicationID === id
            ? { ...candidate, Status: newStatus } // Only update the clicked candidate's status
            : candidate // Keep other candidates the same
      )
    );

    try {
      const token = localStorage.getItem("token");

      // Send the status change to the backend for that candidate
      await axios.put(
        "http://localhost:3000/hm/update-status",
        {
          ApplicationID: id, // use the correct name as per the backend
          Status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <Loading />;
  if (error) return <LoginError />;

  return (
    <>
      <Navbar />
      <div className="applied-jobs-container">
        <div className="jobopenings-header">
          <div className="jobopenings-left" />
          <h1 className="jobopenings-title">📝Candidates</h1>
          <div className="jobopenings-search-right">
            <form className="search-form">
              <label htmlFor="search" className="search-label">
                Search
              </label>
              <input
                required
                pattern=".*\S.*"
                type="search"
                className="search-input"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-caret"></span>
            </form>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <p>No candidates match your search.</p>
        ) : (
          filteredCandidates.map((cand) => {
            const currentStatus = cand.Status.toLowerCase();
            let buttonText = "Pending";
            let buttonColor = "gray";

            if (currentStatus === "accepted") {
              buttonText = "Accepted";
              buttonColor = "#39C64D";
            } else if (currentStatus === "rejected") {
              buttonText = "Rejected";
              buttonColor = "red";
            }

            return (
              <div key={cand.ApplicationID} className="applied-job-card">
                <div className="applied-job-header">
                  <h2 className="applied-job-title">{cand.JobSeekerName}</h2>
                  <button
                    style={{
                      backgroundColor: buttonColor,
                      color: "#fff",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleStatusChange(cand.ApplicationID, currentStatus)
                    }
                  >
                    {buttonText}
                  </button>
                </div>

                <div className="applied-job-row">
                  <p className="applied-job-info">
                    <strong>Email:</strong> {cand.Email}
                  </p>
                  <p className="applied-job-info">
                    <strong>Phone:</strong> {cand.PhoneNumber}
                  </p>
                </div>

                <div className="applied-job-row">
                  <p className="applied-job-info">
                    <strong>Gender:</strong> {cand.Gender}
                  </p>
                  <p className="applied-job-info">
                    <strong>Experience:</strong> {cand.Experience} yrs
                  </p>
                </div>

                <div className="applied-job-row">
                  <p className="applied-job-info">
                    <strong>Applied for:</strong> {cand.JobTitle}
                  </p>
                </div>

                <div className="applied-job-row">
                  <p className="applied-job-date">
                    <strong>Applied on:</strong>{" "}
                    {new Date(cand.DateApplied).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default HMAppliedCandidates;
