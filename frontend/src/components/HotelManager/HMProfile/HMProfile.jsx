import React, { useEffect, useState } from "react";
import malechef from "../../../assets/malechef.png";
import femalechef from "../../../assets/femalechef.png";
import useDecodedToken from "../../../utils/useDecodedToken";
import axios from "axios";
import Navbar from "../../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Loading from "../../Loading/Loading";

// Avatar function based on gender
const getAvatar = (gender) => {
  return gender === "male" ? malechef : femalechef;
};

const HMProfile = () => {
  const decoded = useDecodedToken();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!decoded) {
      navigate("/login/error");
      return;
    }

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login/error");
        return;
      }

      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "hotelmanager") {
        navigate("/login/error");
        return;
      }

      const managerId = decodedToken.id;

      const delay = new Promise((resolve) => setTimeout(resolve, 1500)); // ⏳ 1.5s delay

      try {
        const [res] = await Promise.all([
          axios.get(`http://localhost:3000/hotelmanager/profile/${managerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          delay,
        ]);

        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch HM profile:", err);
      }
    };

    fetchProfile();
  }, [decoded, navigate]);

  const handleEdit = () => {
    navigate("/hotelmanager/edit-profile");
  };

  if (!profile) return <Loading />;

  const avatar = getAvatar(profile.Gender);

  return (
    <>
      <Navbar />
      <div className="jobseekerprofile-container">
        <div className="jobseekerprofile-card">
          <img src={avatar} alt="Avatar" className="jobseekerprofile-avatar" />
          <h2 className="jobseekerprofile-name">{profile.Name}</h2>
          <h4 className="jobseekerprofile-title">Hotel Manager</h4>
          <div className="jobseekerprofile-details">
            <p className="jobseekerprofile-p">
              <strong className="jobseekerprofile-label">Email:</strong>{" "}
              {profile.Email}
            </p>
            <p className="jobseekerprofile-p">
              <strong className="jobseekerprofile-label">Phone Number:</strong>{" "}
              {profile.PhoneNumber}
            </p>
            <p className="jobseekerprofile-p">
              <strong className="jobseekerprofile-label">Hotel Name:</strong>{" "}
              {profile.HotelName}
            </p>
            <p className="jobseekerprofile-p">
              <strong className="jobseekerprofile-label">Hotel Address:</strong>{" "}
              {profile.HotelAddress}
            </p>
            <p className="jobseekerprofile-p">
              <strong className="jobseekerprofile-label">Position:</strong>{" "}
              {profile.Position}
            </p>
            <p className="jobseekerprofile-p">
              <strong className="jobseekerprofile-label">Experience:</strong>{" "}
              {profile.YearsOfExperience} years
            </p>
            <p className="jobseekerprofile-p">
              <strong className="jobseekerprofile-label">Gender:</strong>{" "}
              {profile.Gender}
            </p>
          </div>
          <div className="jobseekerprofile-edit-block">
            <button
              className="jobseeker-profile-edit-button jobseekerprofile-edit-icon"
              onClick={handleEdit}
            >
              <svg
                className="jobseeker-profile-edit-svgIcon"
                viewBox="0 0 512 512"
              >
                <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
              </svg>
            </button>
          </div>
          <div className="jobseekerprofile-resetpwd-block">
            <button
              class="resetpwd-button"
              onClick={() => {
                navigate(`/reset/password/${profile.ManagerID}`);
              }}
            >
              <svg class="resetpwd-svgIcon" viewBox="-0.5 -0.5 16 16">
                <path
                  d="M7.5 8.235c-0.1949375 0 -0.38187499999999996 0.0775 -0.5196875 0.2153125s-0.2153125 0.32475 -0.2153125 0.5196875v2.205c0 0.1949375 0.0775 0.38187499999999996 0.2153125 0.51975s0.32475 0.21525 0.5196875 0.21525c0.1949375 0 0.3819375 -0.07743749999999999 0.51975 -0.21525s0.21525 -0.32481250000000006 0.21525 -0.51975v-2.205c0 -0.1949375 -0.07743749999999999 -0.38187499999999996 -0.21525 -0.5196875s-0.32481250000000006 -0.2153125 -0.51975 -0.2153125Zm3.675 -2.94V3.825c0 -0.9746875 -0.3871875 -1.9094375 -1.076375 -2.598625S8.4746875 0.15 7.5 0.15c-0.9746875 0 -1.9094375 0.3871875 -2.598625 1.076375S3.825 2.8503125000000002 3.825 3.825v1.47c-0.5848125 0 -1.145625 0.23231249999999998 -1.5591875 0.6458125000000001C1.8523124999999998 6.354375 1.62 6.9152499999999995 1.62 7.5v5.145c0 0.58475 0.23231249999999998 1.145625 0.6458125000000001 1.5591875 0.41356249999999994 0.4135 0.974375 0.6458125000000001 1.5591875 0.6458125000000001h7.35c0.58475 0 1.145625 -0.23231249999999998 1.5591875 -0.6458125000000001 0.4135 -0.41356249999999994 0.6458125000000001 -0.9744375 0.6458125000000001 -1.5591875V7.5c0 -0.58475 -0.23231249999999998 -1.145625 -0.6458125000000001 -1.5591875 -0.41356249999999994 -0.4135 -0.9744375 -0.6458125000000001 -1.5591875 -0.6458125000000001ZM5.295 3.825c0 -0.5848125 0.23231249999999998 -1.145625 0.6458125000000001 -1.5591875C6.354375 1.8523124999999998 6.9152499999999995 1.62 7.5 1.62s1.145625 0.23231249999999998 1.5591875 0.6458125000000001c0.4135 0.41356249999999994 0.6458125000000001 0.974375 0.6458125000000001 1.5591875v1.47H5.295V3.825Zm6.615 8.82c0 0.1949375 -0.07743749999999999 0.3819375 -0.21525 0.51975s-0.32481250000000006 0.21525 -0.51975 0.21525H3.825c-0.1949375 0 -0.38187499999999996 -0.07743749999999999 -0.51975 -0.21525 -0.1378125 -0.1378125 -0.21525 -0.32481250000000006 -0.21525 -0.51975V7.5c0 -0.1949375 0.07743749999999999 -0.38187499999999996 0.21525 -0.5196875 0.137875 -0.1378125 0.32481250000000006 -0.2153125 0.51975 -0.2153125h7.35c0.1949375 0 0.3819375 0.0775 0.51975 0.2153125s0.21525 0.32475 0.21525 0.5196875v5.145Z"
                  fill="#ffffff"
                  stroke-width="1"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HMProfile;
