import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../Navbar/Navbar";
import useDecodedToken from "../../../utils/useDecodedToken";

const ResetPassword = () => {
  const decoded = useDecodedToken();

  const { id } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return toast.error("Both fields are required.");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      const token = localStorage.getItem("token");
      const role = decoded?.role;

      let endpoint = "";

      if (role === "admin") {
        endpoint = `http://localhost:3000/admin/reset/password/${id}`;
      } else if (role === "hotelmanager") {
        endpoint = `http://localhost:3000/hotelmanager/reset/password/${id}`;
      } else if (role === "jobseeker") {
        endpoint = `http://localhost:3000/jobseeker/reset/password/${id}`;
      } else {
        return toast.error("Invalid user role.");
      }

      await axios.put(
        endpoint,
        { Password: password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password updated successfully!");

      navigate(`/${role}/myprofile`);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <>
      <Navbar />
      <div className="jobseekeredit-wrapper">
        <form className="jobseekeredit-form" onSubmit={handleReset}>
          <h2 className="jobseekeredit-heading">Reset Admin Password</h2>

          <input
            className="jobseekeredit-input"
            type="password"
            name="Password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="jobseekeredit-input"
            type="password"
            name="ConfirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div
            style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
          >
            <button className="jobseekeredit-button" type="submit">
              Reset Password
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

export default ResetPassword;
