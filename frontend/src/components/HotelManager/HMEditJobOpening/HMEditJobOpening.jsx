import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import useDecodedToken from "../../../utils/useDecodedToken";
import Navbar from "../../Navbar/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./HMEditJobOpening.css";

const HMEditJobOpening = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/hm/job-opening/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const fetched = response.data;

        const formattedDate = fetched.PostingDate
          ? new Date(
              new Date(fetched.PostingDate).setDate(
                new Date(fetched.PostingDate).getDate() + 1
              )
            )
              .toISOString()
              .slice(0, 10)
          : "";

        setForm({
          JobTitle: fetched.JobTitle || "",
          HotelName: fetched.HotelName || "",
          RequiredExperience: fetched.RequiredExperience || "",
          EducationRequirements: fetched.EducationRequirements || "",
          Salary: fetched.Salary || "",
          Location: fetched.Location || "",
          PostingDate: formattedDate,
        });
      } catch (err) {
        console.error("Failed to fetch job posting", err);
        toast.error("Error loading job data");
      }
    };

    fetchJobData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!form.JobTitle.trim()) errors.push("Job Title is required.");
    if (!form.HotelName.trim()) errors.push("Hotel Name is required.");
    if (!form.RequiredExperience || form.RequiredExperience <= 0)
      errors.push("Required Experience must be a positive number.");
    if (!form.EducationRequirements.trim())
      errors.push("Education Requirements are required.");
    if (!form.Salary || form.Salary <= 0)
      errors.push("Salary must be a positive number.");
    if (!form.Location.trim()) errors.push("Location is required.");

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/hm/edit/job-opening/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Job posting updated!");
      navigate("/hm/job-postings");
    } catch (err) {
      console.error("Failed to update job posting", err);
      toast.error("Failed to update job posting");
    }
  };

  if (!decoded || decoded.role !== "hotelmanager") {
    return <div>Unauthorized access</div>;
  }

  return (
    <>
      <Navbar />
      <div className="jobposting-wrapper">
        <form className="jobposting-form" onSubmit={handleSubmit}>
          <h2 className="jobposting-heading">Edit Job Posting</h2>

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
            placeholder="Required Experience (years)"
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
            required
          />

          <div className="jobposting-button-group">
            <button className="jobposting-button" type="submit">
              Update Job Posting
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

export default HMEditJobOpening;
