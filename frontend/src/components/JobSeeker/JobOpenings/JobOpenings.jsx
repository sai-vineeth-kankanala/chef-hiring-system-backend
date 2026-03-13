import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./JobOpenings.css";
import Navbar from "../../Navbar/Navbar";
import { useNavigate } from "react-router-dom"; // ⬅️ Add this
import Loading from "../../Loading/Loading";
import LoginError from "../../Auth/LoginError/LoginError";
import { toast, ToastContainer } from "react-toastify";

const JobOpenings = () => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ⬅️ Initialize navigation

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobOpenings = async () => {
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
        const [response] = await Promise.all([
          axios.get("http://localhost:3000/jobseeker/job-openings", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          delay,
        ]);

        setJobOpenings(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch job openings:", error);
        setError("Failed to load job openings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobOpenings();
  }, [token, navigate]);

  const handleApply = async (postingId) => {
    if (!token) {
      alert("You must be logged in to apply.");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const jobSeekerId = decoded.id;

      await axios.post(
        "http://localhost:3000/jobseeker/apply",
        {
          JobSeekerID: jobSeekerId,
          PostingID: postingId,
          Status: "Pending",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("❌ Application error:", error);
      alert(
        "❌ Failed to apply. You might have already applied or there was an issue."
      );
    }
  };

  const filteredJobs = jobOpenings.filter((job) => {
    const search = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search) ||
      job.HotelName.toLowerCase().includes(search)
    );
  });

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) return <LoginError />;

  return (
    <>
      <Navbar />
      <div className="jobopenings-container">
        <div className="jobopenings-header">
          <div className="jobopenings-left" />

          <h1 className="jobopenings-title">‎𐂐◯𓇋 Job Openings</h1>

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

        <div className="jobopenings-grid">
          {filteredJobs.length === 0 ? (
            <p>No job openings match your search.</p>
          ) : (
            filteredJobs.map((job, index) => (
              <div key={job.PostingID || index} className="jobopenings-card">
                <h2 className="jobopenings-job-title">{job.title}</h2>
                <p className="jobopenings-job-location">
                  <strong>Hotel:</strong> {job.HotelName}
                </p>
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
                <button
                  className="jobopenings-apply-btn"
                  onClick={() => handleApply(job.id)}
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default JobOpenings;
