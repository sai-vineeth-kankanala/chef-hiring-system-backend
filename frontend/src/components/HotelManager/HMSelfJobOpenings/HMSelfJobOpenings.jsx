import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./HMSelfJobOpenings.css";
import Navbar from "../../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Loading from "../../Loading/Loading";
import LoginError from "../../Auth/LoginError/LoginError";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ConfirmModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this job posting?</p>
        <div className="modal-buttons">
          <button onClick={onCancel} className="modal-btn cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-btn delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const HMSelfJobOpenings = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSelfJobPostings = async () => {
      if (!token) {
        navigate("/login/error");
        return;
      }

      const decoded = jwtDecode(token);
      if (decoded.role !== "hotelmanager") {
        navigate("/login/error");
        return;
      }

      const managerId = decoded.id;

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const [response] = await Promise.all([
          axios.get(`http://localhost:3000/hm/self/job-openings/${managerId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          delay,
        ]);

        setJobPostings(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch your postings:", error);
        setError("Failed to load your job postings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSelfJobPostings();
  }, [token, navigate]);

  const filteredJobs = jobPostings.filter((job) => {
    const search = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search)
    );
  });

  const confirmDelete = (id) => {
    setJobToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/hm/delete/job-opening/${jobToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobPostings((prev) => prev.filter((job) => job.id !== jobToDelete));
      toast.success("Job posting deleted successfully.");
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Error deleting job. Please try again.");
    } finally {
      setShowConfirmModal(false);
      setJobToDelete(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <LoginError />;

  return (
    <>
      <Navbar />
      <div className="jobopenings-container">
        <div className="jobopenings-header">
          <div className="hm-jobopenings-left">
            <button className="home-icon-btn home-add-btn">
              <div className="home-add-icon"></div>
              <div
                className="home-btn-txt"
                onClick={() => navigate("/hm/add/job-posting")}
              >
                <b>Add</b>
              </div>
            </button>

            <button
              className="hm-mypostings-btn"
              onClick={() => navigate("/hm/job-postings")}
            >
              All Postings
            </button>
          </div>
          <h1 className="jobopenings-title">‎𐂐◯𓇋 My Postings</h1>
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
              <div key={job.id || index} className="jobopenings-card">
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

                <div className="jobopenings-edit-delete-actions">
                  <button
                    className="jobopenings-edit-btn"
                    onClick={() => navigate(`/hm/edit/job-posting/${job.id}`)}
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      style={{ marginRight: "5px" }}
                    />
                  </button>

                  <button
                    className="jobopenings-delete-btn"
                    onClick={() => confirmDelete(job.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ConfirmModal
        show={showConfirmModal}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default HMSelfJobOpenings;
