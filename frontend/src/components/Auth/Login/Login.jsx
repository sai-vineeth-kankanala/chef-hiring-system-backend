import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import banner1 from "../../../assets/image1.jpg";
import Navbar from "../../Navbar/Navbar";
import { toast } from "react-toastify";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "jobseeker",
  });

  useEffect(() => {
    // Clear any old token on login page load
    localStorage.removeItem("token");
  }, []);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "email" ? value.toLowerCase() : value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/login", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Login successful!");

      if (form.role === "jobseeker") {
        navigate("/home");
      } else if (form.role === "hotelmanager") {
        navigate("/hm/home");
      } else if (form.role === "admin") {
        navigate("/admin/jobseekers");
      }
    } catch (error) {
      if (error.response) {
        toast.error("Login failed: " + error.response.data.message);
      } else {
        toast.error("Something went wrong: " + error.message);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="Login-wrapper">
        <div className="Login-container">
          {/* Left Banner */}
          <div className="Login-banner">
            <img src={banner1} alt="Banner" className="Login-banner-img" />
          </div>

          {/* Right Form Section */}
          <form className="Login-form" onSubmit={handleLogin}>
            <h2 className="Login-heading">Login</h2>

            <select
              className="Login-role-select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="hotelmanager">Hotel Manager</option>
              <option value="jobseeker">Jobseeker</option>
            </select>

            <input
              className="Login-input"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              className="Login-input"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button className="Login-button" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
