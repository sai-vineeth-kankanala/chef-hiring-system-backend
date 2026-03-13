import React, { useEffect, useState } from "react";
import "./AppliedJobs.css";
import Navbar from "../../Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ⬅️ Add this
import { jwtDecode } from "jwt-decode";
import Loading from "../../Loading/Loading";
import LoginError from "../../Auth/LoginError/LoginError";

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ⬅️ Initialize navigation

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login/error");
        return;
      }

      const decoded = jwtDecode(token);
      if (decoded.role !== "jobseeker") {
        navigate("/login/error");
        return;
      }

      const delay = new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const [res] = await Promise.all([
          axios.get("http://localhost:3000/jobseeker/applied-jobs", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          delay,
        ]);

        setAppliedJobs(res.data);
        setFilteredJobs(res.data);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
        setError("Failed to fetch applied jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [navigate]);

  useEffect(() => {
    const search = searchTerm.toLowerCase();
    const filtered = appliedJobs.filter((job) => {
      return (
        job.JobTitle.toLowerCase().includes(search) ||
        job.HotelName.toLowerCase().includes(search) ||
        job.Location.toLowerCase().includes(search)
      );
    });
    setFilteredJobs(filtered);
  }, [searchTerm, appliedJobs]);

  if (loading) return <Loading />;
  if (error) return <LoginError />;

  return (
    <>
      <Navbar />
      <div className="applied-jobs-container">
        <div className="jobopenings-header">
          <div className="jobopenings-left" />

          <h1 className="jobopenings-title">📝Applied Jobs</h1>
          <div className="jobopenings-search-right">
            <form class="search-form">
              <label for="search" class="search-label">
                Search
              </label>
              <input
                required
                pattern=".*\S.*"
                type="search"
                class="search-input"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span class="search-caret"></span>
            </form>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <p>No applied jobs match your search.</p>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.ApplicationID} className="applied-job-card">
              <div className="applied-job-header">
                <h2 className="applied-job-title">{job.JobTitle}</h2>
                <span
                  className={`applied-job-status status-${job.Status.replace(
                    /\s+/g,
                    "-"
                  ).toLowerCase()}`}
                >
                  {job.Status}
                </span>
              </div>

              <div className="applied-job-row">
                <p className="applied-job-info">
                  <strong>Hotel:</strong> {job.HotelName}
                </p>
                <p className="applied-job-info">
                  <strong>Location:</strong> {job.Location}
                </p>
              </div>

              <div className="applied-job-row">
                <p className="applied-job-info">
                  <strong>Education:</strong> {job.EducationRequirements}
                </p>
                <p className="applied-job-info">
                  <strong>Experience Required:</strong> {job.RequiredExperience}{" "}
                  yrs
                </p>
              </div>

              <div className="applied-job-row">
                <p className="applied-job-info">
                  <strong>Salary:</strong> ₹{job.Salary}
                </p>
              </div>

              <div className="applied-job-row">
                <p className="applied-job-date">
                  <strong>Posted on:</strong>{" "}
                  {new Date(job.PostingDate).toLocaleDateString()}
                </p>
                <p className="applied-job-date">
                  <strong>Applied on:</strong>{" "}
                  {new Date(job.DateApplied).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default AppliedJobs;
