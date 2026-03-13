import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./HMJobOpenings.css"; // You can rename this CSS if desired
import Navbar from "../../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Loading from "../../Loading/Loading";
import LoginError from "../../Auth/LoginError/LoginError";

const HMJobOpenings = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobPostings = async () => {
      if (!token) {
        navigate("/login/error");
        return;
      }

      const decoded = jwtDecode(token);
      if (decoded.role !== "hotelmanager") {
        navigate("/login/error");
        return;
      }

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const [response] = await Promise.all([
          axios.get("http://localhost:3000/hm/job-openings", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          delay,
        ]);
        setJobPostings(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch postings:", error);
        setError("Failed to load job postings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, [token, navigate]);

  const filteredJobs = jobPostings.filter((job) => {
    const search = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search)
    );
  });

  if (loading) return <Loading />;
  if (error) return <LoginError />;

  return (
    <>
      <Navbar />
      <div className="jobopenings-container">
        <div className="jobopenings-header">
          <div className="hm-jobopenings-left">
            <button class="home-icon-btn home-add-btn">
              <div class="home-add-icon"></div>
              <div
                class="home-btn-txt"
                onClick={() => navigate("/hm/add/job-posting")}
              >
                <b>Add</b>
              </div>
            </button>

            {/* My Postings Button */}

            <button
              className="hm-mypostings-btn"
              onClick={() => navigate("/hm/my/job-postings")}
            >
              My Postings
            </button>
          </div>
          <h1 className="jobopenings-title">‎𐂐◯𓇋 Job Openings</h1>
          <div className="jobopenings-search-right">
            <form className="search-form">
              <label htmlFor="search" className="search-label">
                Search
              </label>
              <input
                type="search"
                required
                pattern=".*\S.*"
                className="search-input"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-caret"></span>
            </form>
          </div>
        </div>

        <div className="jobopenings-grid">
          {filteredJobs.length === 0 ? (
            <p>No job postings match your search.</p>
          ) : (
            filteredJobs.map((job, index) => (
              <div key={job.PostingID || index} className="jobopenings-card">
                <h2 className="jobopenings-job-title">{job.title}</h2>
                <p className="jobopenings-job-location">
                  <strong>Location:</strong> {job.location}
                </p>
                <p className="jobopenings-job-salary">
                  <strong>Salary:</strong> ₹{job.Salary}
                </p>
                <p className="jobopenings-job-type">
                  <strong>Experience:</strong> {job.RequiredExperience} years
                </p>
                <p className="jobopenings-job-type">
                  <strong>Requirements:</strong> {job.EducationRequirements}
                </p>
                <p className="jobopenings-posted">
                  Posted on: {new Date(job.posted).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HMJobOpenings;
