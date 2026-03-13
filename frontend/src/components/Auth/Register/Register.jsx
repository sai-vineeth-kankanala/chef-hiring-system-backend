import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import banner1 from "../../../assets/image1.jpg";
import Navbar from "../../Navbar/Navbar";
import { toast } from "react-toastify";

function Register() {
  const [role, setRole] = useState("jobseeker");
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "Email" ? value.toLowerCase() : value,
    });
  };

  const validateForm = () => {
    const {
      Name,
      Email,
      Password,
      Gender,
      DateOfBirth,
      PhoneNumber,
      HotelAddress,
      Address,
      HotelName,
    } = form;

    // Common validations
    if (!Name || Name.trim().length < 3) {
      toast.error("Name must be at least 3 characters.");
      return false;
    }

    if (!Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      toast.error("Enter a valid email address.");
      return false;
    }

    if (!Password || Password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }

    if (!Gender) {
      toast.error("Please select a gender.");
      return false;
    }

    if (!PhoneNumber || !/^\d{10}$/.test(PhoneNumber)) {
      toast.error("Enter a valid 10-digit phone number.");
      return false;
    }

    if (role === "jobseeker") {
      if (!DateOfBirth) {
        toast.error("Please enter your date of birth.");
        return false;
      }

      if (!Address || Address.trim().length < 5) {
        toast.error("Address must be at least 5 characters.");
        return false;
      }
    }

    if (role === "hotelmanager") {
      if (!HotelAddress || HotelAddress.trim().length < 5) {
        toast.error("Hotel address must be at least 5 characters.");
        return false;
      }

      if (!HotelName || HotelName.trim().length < 3) {
        toast.error("Hotel name must be at least 3 characters.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, role };

    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:3000/register", payload);
      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      if (error.response) {
        toast.error("Error: " + error.response.data);
      } else {
        toast.error("Error: " + error.message);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="Register-wrapper">
        <div className="Register-container">
          {/* Banner Section */}
          <div className="Register-banner">
            <img src={banner1} alt="Banner" className="Register-banner-img" />
          </div>

          {/* Form Section */}
          <form className="Register-form" onSubmit={handleSubmit}>
            <h2 className="Register-heading">Register as</h2>

            {/* Role Selector */}
            <select
              className="Register-role-select"
              value={role}
              onChange={handleRoleChange}
            >
              <option value="jobseeker">Jobseeker</option>
              <option value="hotelmanager">Hotel Manager</option>
            </select>

            {/* Common Fields */}
            <input
              className="Register-input"
              type="text"
              name="Name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />
            <input
              className="Register-input"
              type="email"
              name="Email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              className="Register-input"
              type="password"
              name="Password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            {/* Gender + Date of Birth Side by Side */}
            <div className="Register-inline-group">
              <select
                className="Register-select-half"
                name="Gender"
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {role === "jobseeker" && (
                <input
                  className="Register-input-half"
                  type="date"
                  name="DateOfBirth"
                  placeholder="Date of Birth"
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            {/* Phone Number + Address Side by Side */}
            <div className="Register-inline-group">
              <input
                className="Register-input-half"
                type="text"
                name="PhoneNumber"
                placeholder="Phone Number"
                onChange={handleChange}
                required
              />

              {role === "hotelmanager" && (
                <input
                  className="Register-input-half"
                  type="text"
                  name="HotelAddress"
                  placeholder="HotelAddress"
                  onChange={handleChange}
                  required
                />
              )}

              {role === "jobseeker" && (
                <input
                  className="Register-input-half"
                  type="text"
                  name="Address"
                  placeholder="Address"
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            {/* Conditional Fields */}
            {role === "jobseeker" && (
              <input
                className="Register-input"
                type="text"
                name="Experience"
                placeholder="Experience"
                onChange={handleChange}
              />
            )}

            {role === "hotelmanager" && (
              <div className="Register-inline-group">
                <input
                  className="Register-input-half"
                  type="text"
                  name="HotelName"
                  placeholder="Hotel Name"
                  onChange={handleChange}
                  required
                />
                <input
                  className="Register-input-half"
                  type="text"
                  name="Position"
                  placeholder="Position"
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Submit Button */}
            <button className="Register-button" type="submit">
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
