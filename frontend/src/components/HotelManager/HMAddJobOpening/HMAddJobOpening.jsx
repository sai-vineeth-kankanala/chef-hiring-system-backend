import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDecodedToken from "../../../utils/useDecodedToken";
import "./HMAddJobOpening.css";
import Navbar from "../../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HMAddJobOpening = () => {
  const decoded = useDecodedToken();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    JobTitle: "",
    HotelName: "",
    RequiredExperience: "",
    EducationRequirements: "",
    Salary: "",
    Location: "",
    PostingDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.JobTitle.trim()) return "Job Title is required";
    if (!form.HotelName.trim()) return "Hotel Name is required";
    if (
      !form.RequiredExperience ||
      isNaN(form.RequiredExperience) ||
      form.RequiredExperience < 0
    )
      return "Enter valid experience in years";
    if (!form.EducationRequirements.trim())
      return "Education Requirements are required";
    if (!form.Salary || isNaN(form.Salary) || form.Salary < 0)
      return "Enter valid salary";
    if (!form.Location.trim()) return "Location is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const managerID = decoded?.id;

      await axios.post(
        `http://localhost:3000/hm/add/job-opening/${managerID}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Job posting added!");
      setTimeout(() => navigate("/hm/job-postings"), 1500);
    } catch (err) {
      console.error("Failed to add job posting", err);
      toast.error("Failed to add job posting");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="jobposting-wrapper">
        <form className="jobposting-form" onSubmit={handleSubmit}>
          <h2 className="jobposting-heading">Add Job Posting</h2>

          <input
            className="jobposting-input"
            type="text"
            name="JobTitle"
            placeholder="Job Title"
            value={form.JobTitle}
            onChange={handleChange}
            required
          />

          <input
            className="jobposting-input"
            type="text"
            name="HotelName"
            placeholder="Hotel Name"
            value={form.HotelName}
            onChange={handleChange}
            required
          />

          <input
            className="jobposting-input"
            type="number"
            name="RequiredExperience"
            placeholder="Required Experience (in years)"
            value={form.RequiredExperience}
            onChange={handleChange}
            required
          />

          <input
            className="jobposting-input"
            type="text"
            name="EducationRequirements"
            placeholder="Education Requirements"
            value={form.EducationRequirements}
            onChange={handleChange}
            required
          />

          <input
            className="jobposting-input"
            type="number"
            name="Salary"
            placeholder="Salary"
            value={form.Salary}
            onChange={handleChange}
            required
          />

          <input
            className="jobposting-input"
            type="text"
            name="Location"
            placeholder="Location"
            value={form.Location}
            onChange={handleChange}
            required
          />

          <input
            className="jobposting-input"
            type="date"
            name="PostingDate"
            value={form.PostingDate}
            onChange={handleChange}
            placeholder="Posting Date (Optional)"
          />

          <div className="jobposting-button-group">
            <button className="jobposting-button" type="submit">
              Add Job Posting
            </button>
            <button
              className="jobposting-cancel-button"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default HMAddJobOpening;
