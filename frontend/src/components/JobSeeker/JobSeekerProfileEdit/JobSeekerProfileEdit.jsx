import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDecodedToken from "../../../utils/useDecodedToken";
import "./JobseekerProfileEdit.css";
import Navbar from "../../Navbar/Navbar";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const JobseekerProfileEdit = () => {
  const decoded = useDecodedToken();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Name: "",
    Email: "",
    PhoneNumber: "",
    Gender: "",
    DateOfBirth: "",
    Address: "",
    Experience: "",
  });

  useEffect(() => {
    if (!decoded?.id) {
      navigate("/login/error");
      return;
    }

    const fetchProfile = async () => {
      try {
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

        const res = await axios.get(
          `http://localhost:3000/jobseeker/profile/${decoded.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const fetched = Array.isArray(res.data) ? res.data[0] : res.data;

        setForm({
          Name: fetched.Name || "",
          Email: fetched.Email || "",
          PhoneNumber: fetched.PhoneNumber || "",
          Gender: fetched.Gender || "",
          DateOfBirth: fetched.DateOfBirth
            ? new Date(
                new Date(fetched.DateOfBirth).setDate(
                  new Date(fetched.DateOfBirth).getDate() + 1
                )
              )
                .toISOString()
                .slice(0, 10)
            : "",
          Address: fetched.Address || "",
          Experience: fetched.Experience || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [decoded?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const {
      Name,
      Email,
      PhoneNumber,
      Gender,
      DateOfBirth,
      Address,
      Experience,
    } = form;

    if (!Name.trim() || Name.length < 3) {
      toast.error("Name must be at least 3 characters long.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      toast.error("Invalid email address.");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(PhoneNumber)) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }

    if (!Gender) {
      toast.error("Please select a gender.");
      return false;
    }

    if (!DateOfBirth) {
      toast.error("Please select a valid date of birth.");
      return false;
    }

    if (!Address.trim()) {
      toast.error("Address cannot be empty.");
      return false;
    }

    if (!Experience.trim()) {
      toast.error("Experience cannot be empty.");
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
        `http://localhost:3000/jobseeker/profile/${decoded.id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/jobseeker/myprofile");
      }, 2000);
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update profile");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="jobseekeredit-wrapper">
        <form className="jobseekeredit-form" onSubmit={handleSubmit}>
          <h2 className="jobseekeredit-heading">Edit Profile</h2>

          <input
            className="jobseekeredit-input"
            type="text"
            name="Name"
            placeholder="Full Name"
            value={form.Name}
            onChange={handleChange}
            required
          />

          <input
            className="jobseekeredit-input"
            type="email"
            name="Email"
            placeholder="Email"
            value={form.Email}
            onChange={handleChange}
            required
          />

          <input
            className="jobseekeredit-input"
            type="text"
            name="PhoneNumber"
            placeholder="Phone Number"
            value={form.PhoneNumber}
            onChange={handleChange}
            required
          />

          <div className="jobseekeredit-inline-group">
            <select
              className="jobseekeredit-select-half"
              name="Gender"
              value={form.Gender}
              onChange={handleChange}
              required
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
              value={form.DateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <input
            className="jobseekeredit-input"
            type="text"
            name="Address"
            placeholder="Address"
            value={form.Address}
            onChange={handleChange}
            required
          />

          <input
            className="jobseekeredit-input"
            type="text"
            name="Experience"
            placeholder="Experience"
            value={form.Experience}
            onChange={handleChange}
            required
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
      </div>
    </>
  );
};

export default JobseekerProfileEdit;
