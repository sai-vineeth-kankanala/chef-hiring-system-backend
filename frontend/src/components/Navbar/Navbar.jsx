import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Read role from localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (error) {
        console.error("Invalid token:", error);
        setRole(null);
      }
    }
  }, []);

  // Prevent scroll on mobile menu
  // useEffect(() => {
  //   document.body.style.overflow = isOpen ? "hidden" : "auto";
  // }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    setIsOpen(false);
    setTimeout(() => {
      localStorage.removeItem("token");
      setRole(null);
      navigate("/login");
    }, 300); // Wait for menu to close
  };

  // Define home route based on the role
  const getHomeRoute = () => {
    switch (role) {
      case "jobseeker":
        return "/home";
      case "hotelmanager":
        return "/hm/home";
      case "admin":
        return "/admin/home";
      default:
        return "/"; // Default home route when no role is defined
    }
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to={getHomeRoute()} className="navbar-link">
            Chef Hire 
          </Link>
        </div>

        {/* Nav Links */}
        <div className={`navbar-links ${isOpen ? "navbar-links-active" : ""}`}>
          {role === "jobseeker" && (
            <>
              <Link to="/home" className="navbar-link" onClick={toggleMenu}>
                Home
              </Link>
              <Link
                to="/job-openings"
                className="navbar-link"
                onClick={toggleMenu}
              >
                Job Openings
              </Link>
              <Link
                to="/applied-jobs"
                className="navbar-link"
                onClick={toggleMenu}
              >
                Applied Jobs
              </Link>
              <Link
                to="/jobseeker/myprofile"
                className="navbar-link"
                onClick={toggleMenu}
              >
                My Profile
              </Link>
            </>
          )}

          {role === "hotelmanager" && (
            <>
              <Link to="/hm/home" className="navbar-link" onClick={toggleMenu}>
                Home
              </Link>
              <Link
                to="/hm/job-postings"
                className="navbar-link"
                onClick={toggleMenu}
              >
                Job Postings
              </Link>
              <Link
                to="/hm/applied-candidates"
                className="navbar-link"
                onClick={toggleMenu}
              >
                Applied Candidates
              </Link>
              <Link
                to="/hotelmanager/myprofile"
                className="navbar-link"
                onClick={toggleMenu}
              >
                My Profile
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                to="/admin/jobseekers"
                className="navbar-link"
                onClick={toggleMenu}
              >
                Job Seekers
              </Link>
              <Link
                to="/admin/hotelmanagers"
                className="navbar-link"
                onClick={toggleMenu}
              >
                Hotel Managers
              </Link>
              <Link
                to="/admin/myprofile"
                className="navbar-link"
                onClick={toggleMenu}
              >
                My Profile
              </Link>
            </>
          )}

          {!role && (
            <>
              <Link to="/login" className="navbar-link" onClick={toggleMenu}>
                Login
              </Link>
              <Link to="/register" className="navbar-link" onClick={toggleMenu}>
                Register
              </Link>
            </>
          )}

          {role && (
            <Link className="navbar-link" onClick={handleLogout}>
              Logout
            </Link>
          )}
        </div>

        {/* Hamburger Icon */}
        <div
          className="navbar-menu-icon"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          role="button"
          aria-expanded={isOpen}
        >
          <span
            className={isOpen ? "navbar-close-icon" : "navbar-hamburger-icon"}
          ></span>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`navbar-backdrop ${isOpen ? "show" : ""}`}
        onClick={toggleMenu}
      />
    </nav>
  );
};

export default Navbar;
