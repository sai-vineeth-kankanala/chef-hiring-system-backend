import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDecodedToken from "../../../utils/useDecodedToken";
import Navbar from "../../Navbar/Navbar";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminProfileEdit = () => {
  const decoded = useDecodedToken();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Name: "",
    Email: "",
    PhoneNumber: "",
  });

  // Fetching profile on component load
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

        const decodedToken = jwtDecode(token);
        if (decodedToken.role !== "admin") {
          navigate("/login/error");
          return;
        }

        const res = await axios.get(
          `http://localhost:3000/admin/profile/${decoded.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const fetched = Array.isArray(res.data) ? res.data[0] : res.data;

        setForm({
          Name: fetched.Name || "",
          Email: fetched.Email || "",
          PhoneNumber: fetched.PhoneNumber || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [decoded?.id]);

  // Handling input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Validation function for form
  const validateForm = () => {
    const { Name, Email, PhoneNumber } = form;

    if (!Name.trim() || Name.length < 3) {
      toast.error("Name must be at least 3 characters long");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(Email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(PhoneNumber)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }

    return true;
  };

  // Handling form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/admin/profile/update/${decoded.id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate("/admin/myprofile"), 2000);
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update profile");
    }
  };

  return (
    <>
      <Navbar />
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
      <ToastContainer position="top-center" />
    </>
  );
};

export default AdminProfileEdit;
