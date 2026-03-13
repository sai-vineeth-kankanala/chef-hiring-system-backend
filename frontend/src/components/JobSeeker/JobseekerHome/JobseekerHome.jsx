import React, { useRef, useState, useEffect } from "react";
import debounce from "lodash.debounce";
import "./JobseekerHome.css";
import Navbar from "../../Navbar/Navbar";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; // ⬅️ Add this
import Loading from "../../Loading/Loading";
import LoginError from "../../Auth/LoginError/LoginError";
import { toast, ToastContainer } from "react-toastify";

const JobseekerHome = () => {
  const navigate = useNavigate();
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  const [jobOpenings, setJobOpenings] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const [loading, setLoading] = useState(true); // ← loading state

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
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
        const jobOpeningsRequest = axios.get(
          "http://localhost:3000/jobseeker/job-openings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const appliedJobsRequest = axios.get(
          "http://localhost:3000/jobseeker/applied-jobs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Wait for both axios and the 3s delay
        const [jobOpeningsResponse, appliedJobsResponse] = await Promise.all([
          Promise.all([jobOpeningsRequest, appliedJobsRequest]),
          delay,
        ]).then(([responses]) => responses); // extract only responses

        setJobOpenings(jobOpeningsResponse.data);
        setAppliedJobs(appliedJobsResponse.data);
      } catch (error) {
        console.error("❌ Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Same scroll handlers, apply logic, etc. ↓↓↓

  const handleApply = async (postingId) => {
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

  const handleScroll1 = debounce(() => {
    const scrollLeft = scrollRef1.current.scrollLeft;
    const cardWidth = 280 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex1(index);
  }, 200);

  const handleScroll2 = debounce(() => {
    const scrollLeft = scrollRef2.current.scrollLeft;
    const cardWidth = 280 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex2(index);
  }, 200);

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />

      {/* Section 1 - Job Openings */}
      <div className="jobseeker-home-container">
        <header className="jobseeker-home-header jobseeker-home-three-column">
          <div className="header-left" />
          <h1 className="jobseeker-home-title">‎𐂐◯𓇋 Job Openings</h1>

          <button
            class="viewmore-button"
            onClick={() => navigate("/job-openings")}
          >
            View More
            <svg fill="currentColor" viewBox="0 0 24 24" class="viewmore-icon">
              <path
                clip-rule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                fill-rule="evenodd"
              ></path>
            </svg>
          </button>
        </header>

        <section
          className="jobseeker-home-job-listings"
          ref={scrollRef1}
          onScroll={handleScroll1}
        >
          {jobOpenings.map((job) => (
            <div key={job.id} className="jobseeker-home-job-card">
              <h2 className="jobseeker-home-job-title">{job.title}</h2>
              <p className="jobseeker-home-job-location">
                <strong>Location:</strong> {job.location}
              </p>
              <p className="jobseeker-home-job-salary">
                <strong>Salary:</strong> ₹{job.Salary}
              </p>
              <p className="jobseeker-home-posted-date">
                Posted: {new Date(job.posted).toLocaleDateString()}
              </p>
              <button
                className="jobseeker-home-apply-button"
                onClick={() => handleApply(job.id)}
              >
                Apply Now
              </button>
            </div>
          ))}
        </section>

        <div className="jobseeker-home-dot-indicators">
          {jobOpenings.map((_, index) => (
            <span
              key={index}
              className={`jobseeker-home-dot ${
                index === activeIndex1 ? "jobseeker-home-active" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Section 2 - Applied Jobs */}
      <div className="jobseeker-home-container">
        <header className="jobseeker-home-header jobseeker-home-three-column">
          <div className="header-left" /> {/* Empty for spacing */}
          <h1 className="jobseeker-home-title">📝 Applied Jobs</h1>
          <button
            class="viewmore-button"
            onClick={() => navigate("/applied-jobs")}
          >
            View More
            <svg fill="currentColor" viewBox="0 0 24 24" class="viewmore-icon">
              <path
                clip-rule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                fill-rule="evenodd"
              ></path>
            </svg>
          </button>
        </header>
        <section
          className="jobseeker-home-job-listings"
          ref={scrollRef2}
          onScroll={handleScroll2}
        >
          {appliedJobs.map((job) => (
            <div key={job.ApplicationID} className="jobseeker-home-job-card">
              <h2 className="jobseeker-home-job-title">{job.JobTitle}</h2>
              <p className="jobseeker-home-job-location">
                <strong>Location:</strong> {job.Location}
              </p>
              <p className="jobseeker-home-job-salary">
                <strong>Salary:</strong> ₹{job.Salary}
              </p>
              <p className="jobseeker-home-posted-date">
                Applied on: {new Date(job.DateApplied).toLocaleDateString()}
              </p>
              <span
                className={`applied-job-status status-${job.Status.replace(
                  /\s+/g,
                  "-"
                ).toLowerCase()}`}
              >
                {job.Status}
              </span>
            </div>
          ))}
        </section>

        <div className="jobseeker-home-dot-indicators">
          {appliedJobs.map((_, index) => (
            <span
              key={index}
              className={`jobseeker-home-dot ${
                index === activeIndex2 ? "jobseeker-home-active" : ""
              }`}
            />
          ))}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default JobseekerHome;
