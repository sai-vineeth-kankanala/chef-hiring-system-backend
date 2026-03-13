import React, { useRef, useState, useEffect } from "react";
import debounce from "lodash.debounce";
import "./HMHome.css";
import Navbar from "../../Navbar/Navbar";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Loading from "../../Loading/Loading";

const HMHome = () => {
  const navigate = useNavigate();
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  const [jobOpenings, setJobOpenings] = useState([]);
  const [appliedCandidates, setAppliedCandidates] = useState([]);
  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/login/error");
        return;
      }

      const decoded = jwtDecode(token);
      if (decoded.role !== "hotelmanager") {
        navigate("/login/error");
        return;
      }

      const delay = new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const jobOpeningsRequest = axios.get(
          "http://localhost:3000/hm/job-openings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const appliedCandidatesRequest = axios.get(
          "http://localhost:3000/hm/applied-candidates",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const [jobOpeningsResponse, appliedCandidatesResponse] =
          await Promise.all([
            Promise.all([jobOpeningsRequest, appliedCandidatesRequest]),
            delay,
          ]).then(([responses]) => responses);

        setJobOpenings(jobOpeningsResponse.data);
        setAppliedCandidates(appliedCandidatesResponse.data);
      } catch (error) {
        console.error("❌ Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleStatusChange = async (id, currentStatus) => {
    let newStatus;

    if (currentStatus === "pending") newStatus = "accepted";
    else if (currentStatus === "accepted") newStatus = "rejected";
    else newStatus = "pending";

    setAppliedCandidates((prev) =>
      prev.map((cand) =>
        cand.ApplicationID === id ? { ...cand, Status: newStatus } : cand
      )
    );

    try {
      await axios.put(
        "http://localhost:3000/hm/update-status",
        {
          ApplicationID: id,
          Status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("❌ Error updating status:", err);
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
          <div className="header-left">
            <button className="home-icon-btn home-add-btn">
              <div className="home-add-icon"></div>
              <div
                className="home-btn-txt"
                onClick={() => navigate("/hm/add/job-posting")}
              >
                <b>Add</b>
              </div>
            </button>
          </div>
          <h1 className="jobseeker-home-title">‎𐂐◯𓇋 Job Openings</h1>

          <button
            className="viewmore-button"
            onClick={() => navigate("/hm/job-postings")}
          >
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              className="viewmore-icon"
            >
              <path
                clipRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                fillRule="evenodd"
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

      {/* Section 2 - Applied Candidates */}
      <div className="jobseeker-home-container">
        <header className="jobseeker-home-header jobseeker-home-three-column">
          <div className="header-left" />
          <h1 className="jobseeker-home-title">📝Applied Candidates</h1>
          <button
            className="viewmore-button"
            onClick={() => navigate("/hm/applied-candidates")}
          >
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              className="viewmore-icon"
            >
              <path
                clipRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                fillRule="evenodd"
              ></path>
            </svg>
          </button>
        </header>

        <section
          className="jobseeker-home-job-listings"
          ref={scrollRef2}
          onScroll={handleScroll2}
        >
          {appliedCandidates.map((cand) => {
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
              <div key={cand.ApplicationID} className="jobseeker-home-job-card">
                <h2 className="jobseeker-home-job-title">
                  {cand.JobSeekerName}
                </h2>
                <p className="jobseeker-home-job-location">
                  <strong>Email:</strong> {cand.Email}
                </p>
                <p className="jobseeker-home-job-salary">
                  <strong>Phone:</strong> {cand.PhoneNumber}
                </p>
                <p className="jobseeker-home-job-salary">
                  <strong>Applied For:</strong> {cand.JobTitle}
                </p>
                <p className="jobseeker-home-posted-date">
                  Applied on: {new Date(cand.DateApplied).toLocaleDateString()}
                </p>

                <button
                  style={{
                    backgroundColor: buttonColor,
                    color: "#fff",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                  onClick={() =>
                    handleStatusChange(cand.ApplicationID, currentStatus)
                  }
                >
                  {buttonText}
                </button>
              </div>
            );
          })}
        </section>

        <div className="jobseeker-home-dot-indicators">
          {appliedCandidates.map((_, index) => (
            <span
              key={index}
              className={`jobseeker-home-dot ${
                index === activeIndex2 ? "jobseeker-home-active" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HMHome;
