import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDecodedToken from "../../../utils/useDecodedToken";
import Navbar from "../../Navbar/Navbar";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HMProfileEdit = () => {
  const decoded = useDecodedToken();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Name: "",
    Email: "",
    PhoneNumber: "",
    HotelName: "",
    HotelAddress: "",
    Position: "",
    YearsOfExperience: "",
    Gender: "",
  });

  useEffect(() => {
    if (!decoded?.id) {
      navigate("/login/error");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login/error");

        const decoded = jwtDecode(token);
        if (decoded.role !== "hotelmanager") return navigate("/login/error");

        const res = await axios.get(
          `http://localhost:3000/hotelmanager/profile/${decoded.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const fetched = Array.isArray(res.data) ? res.data[0] : res.data;

        setForm({
          Name: fetched.Name || "",
          Email: fetched.Email || "",
          PhoneNumber: fetched.PhoneNumber || "",
          HotelName: fetched.HotelName || "",
          HotelAddress: fetched.HotelAddress || "",
          Position: fetched.Position || "",
          YearsOfExperience: fetched.YearsOfExperience || "",
          Gender: fetched.Gender || "",
        });
      } catch (err) {
        toast.error("Failed to fetch profile");
        console.log(err);
      }
    };

    fetchProfile();
  }, [decoded?.id, navigate]);

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
      HotelName,
      HotelAddress,
      Position,
      YearsOfExperience,
      Gender,
    } = form;

    if (Name.trim().length < 3)
      return toast.error("Name must be at least 3 characters long");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) return toast.error("Invalid email address");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(PhoneNumber))
      return toast.error("Invalid phone number");
    if (!Gender) return toast.error("Please select a gender");
    if (
      !YearsOfExperience ||
      isNaN(YearsOfExperience) ||
      Number(YearsOfExperience) < 0
    )
      return toast.error("Years of Experience must be a valid number");
    if (HotelName.trim().length < 3)
      return toast.error("Hotel Name is too short");
    if (HotelAddress.trim().length < 5)
      return toast.error("Hotel Address is too short");
    if (Position.trim().length < 2) return toast.error("Position is too short");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() !== true) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/hm/profile/update/${decoded.id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate("/hotelmanager/myprofile"), 2000);
    } catch (err) {
      toast.error("Failed to update profile");
      console.log(err);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
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
              type="text"
              name="YearsOfExperience"
              placeholder="Years of Experience"
              value={form.YearsOfExperience}
              onChange={handleChange}
              required
            />
          </div>

          <input
            className="jobseekeredit-input"
            type="text"
            name="HotelName"
            placeholder="Hotel Name"
            value={form.HotelName}
            onChange={handleChange}
            required
          />

          <input
            className="jobseekeredit-input"
            type="text"
            name="HotelAddress"
            placeholder="Hotel Address"
            value={form.HotelAddress}
            onChange={handleChange}
            required
          />

          <input
            className="jobseekeredit-input"
            type="text"
            name="Position"
            placeholder="Position"
            value={form.Position}
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

export default HMProfileEdit;
