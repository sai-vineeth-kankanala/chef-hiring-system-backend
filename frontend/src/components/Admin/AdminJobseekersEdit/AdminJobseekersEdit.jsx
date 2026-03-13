import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../../Navbar/Navbar";

const AdminJobseekersEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    PhoneNumber: "",
    DateOfBirth: "",
    Gender: "",
    Experience: "",
    Address: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobseeker = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/admin/jobseeker/data/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        setFormData({
          Name: data.Name || "",
          Email: data.Email || "",
          PhoneNumber: data.PhoneNumber || "",
          DateOfBirth: data.DateOfBirth
            ? new Date(
                new Date(data.DateOfBirth).setDate(
                  new Date(data.DateOfBirth).getDate() + 1
                )
              )
                .toISOString()
                .slice(0, 10)
            : "",
          Gender: data.Gender || "",
          Experience: data.Experience || "",
          Address: data.Address || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobseeker:", err);
        toast.error("Failed to load jobseeker data.");
        setLoading(false);
      }
    };

    fetchJobseeker();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.Name.trim()) {
      toast.error("Name is required.");
      return false;
    }
    if (!emailRegex.test(formData.Email)) {
      toast.error("Invalid email address.");
      return false;
    }
    if (!phoneRegex.test(formData.PhoneNumber)) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }
    if (!formData.Gender) {
      toast.error("Please select a gender.");
      return false;
    }
    if (!formData.DateOfBirth) {
      toast.error("Date of Birth is required.");
      return false;
    }
    if (
      !formData.Experience ||
      isNaN(formData.Experience) ||
      Number(formData.Experience) < 0
    ) {
      toast.error("Experience must be a valid number.");
      return false;
    }
    if (!formData.Address.trim()) {
      toast.error("Address is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/admin/jobseeker/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Jobseeker updated successfully!");
      setTimeout(() => navigate("/admin/jobseekers"), 2000);
    } catch (err) {
      console.error("Error updating jobseeker:", err);
      toast.error("Failed to update jobseeker.");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="jobseekeredit-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form className="jobseekeredit-form" onSubmit={handleSubmit}>
            <h2 className="jobseekeredit-heading">Edit Jobseeker</h2>

            <input
              className="jobseekeredit-input"
              type="text"
              name="Name"
              placeholder="Full Name"
              value={formData.Name}
              onChange={handleChange}
            />

            <input
              className="jobseekeredit-input"
              type="email"
              name="Email"
              placeholder="Email"
              value={formData.Email}
              onChange={handleChange}
            />

            <input
              className="jobseekeredit-input"
              type="text"
              name="PhoneNumber"
              placeholder="Phone Number"
              value={formData.PhoneNumber}
              onChange={handleChange}
            />

            <div className="jobseekeredit-inline-group">
              <select
                className="jobseekeredit-select-half"
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                className="jobseekeredit-input-half"
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleChange}
              />
            </div>

            <input
              className="jobseekeredit-input"
              type="text"
              name="Experience"
              placeholder="Experience"
              value={formData.Experience}
              onChange={handleChange}
            />

            <input
              className="jobseekeredit-input"
              type="text"
              name="Address"
              placeholder="Address"
              value={formData.Address}
              onChange={handleChange}
            />

            <div
              style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
            >
              <button className="jobseekeredit-button" type="submit">
                Save Changes
              </button>
              <button
                className="jobseekeredit-button-cancel-button"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default AdminJobseekersEdit;
