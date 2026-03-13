// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./components/Auth/Login/Login";
import Register from "./components/Auth/Register/Register";
import JobseekerHome from "./components/JobSeeker/JobseekerHome/JobseekerHome";
import JobOpenings from "./components/JobSeeker/JobOpenings/JobOpenings";
import AppliedJobs from "./components/JobSeeker/AppliedJobs/AppliedJobs";
import JobseekerProfile from "./components/JobSeeker/JobseekerProfile/JobseekerProfile";
import JobseekerProfileEdit from "./components/JobSeeker/JobseekerProfileEdit/JobseekerProfileEdit";
import LoginError from "./components/Auth/LoginError/LoginError";
import HMHome from "./components/HotelManager/HMHome/HMHome";
import HMJobOpenings from "./components/HotelManager/HMJobOpenings/HMJobOpenings";
import HMSelfJobOpenings from "./components/HotelManager/HMSelfJobOpenings/HMSelfJobOpenings";
import HMAddJobOpening from "./components/HotelManager/HMAddJobOpening/HMAddJobOpening";
import HMEditJobOpening from "./components/HotelManager/HMEditJobOpening/HMEditJobOpening";
import HMAppliedCandidates from "./components/HotelManager/HMAppliedCandidates/HMAppliedCandidates";
import HMProfile from "./components/HotelManager/HMProfile/HMProfile";
import HMProfileEdit from "./components/HotelManager/HMProfileEdit/HMProfileEdit";
import AdminJobseekers from "./components/Admin/AdminJobseekers/AdminJobseekers";
import AdminJobseekersEdit from "./components/Admin/AdminJobseekersEdit/AdminJobseekersEdit";
import AdminHotelManagers from "./components/Admin/AdminHotelManagers/AdminHotelManagers";
import AdminHotelManagerEdit from "./components/Admin/AdminHotelManagersEdit/AdminHotelManagersEdit";
import AdminProfile from "./components/Admin/AdminProfile/AdminProfile";
import AdminProfileEdit from "./components/Admin/AdminProfileEdit/AdminProfileEdit";
import ResetPassword from "./components/Auth/ResetPassword/ResetPassword";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login/error" element={<LoginError />} />

        {/* JobSeeker */}
        <Route path="/home" element={<JobseekerHome />} />
        <Route path="/job-openings" element={<JobOpenings />} />
        <Route path="/applied-jobs" element={<AppliedJobs />} />
        <Route path="/jobseeker/myprofile" element={<JobseekerProfile />} />
        <Route
          path="/jobseeker/edit-profile"
          element={<JobseekerProfileEdit />}
        />

        {/* Hotel Manager */}
        <Route path="/hm/home" element={<HMHome />} />
        <Route path="/hm/job-postings" element={<HMJobOpenings />} />
        <Route path="/hm/my/job-postings" element={<HMSelfJobOpenings />} />
        <Route path="/hm/add/job-posting" element={<HMAddJobOpening />} />
        <Route path="/hm/edit/job-posting/:id" element={<HMEditJobOpening />} />
        <Route
          path="/hm/applied-candidates"
          element={<HMAppliedCandidates />}
        />
        <Route path="/hotelmanager/myprofile" element={<HMProfile />} />
        <Route path="/hotelmanager/edit-profile" element={<HMProfileEdit />} />

        {/*admin*/}
        <Route path="/admin/jobseekers" element={<AdminJobseekers />} />
        <Route
          path="/admin/jobseekers/edit/:id"
          element={<AdminJobseekersEdit />}
        />
        <Route path="/admin/hotelmanagers" element={<AdminHotelManagers />} />
        <Route
          path="/admin/hotelmanagers/edit/:id"
          element={<AdminHotelManagerEdit />}
        />
        <Route path="/admin/myprofile" element={<AdminProfile />} />
        <Route path="/admin/edit-profile" element={<AdminProfileEdit />} />
        <Route path="/reset/password/:id" element={<ResetPassword />} />

        {/*  */}
        <Route path="*" element={<LoginError />} />
      </Routes>
    </Router>
  );
}

export default App;
