import React, { useEffect, useState } from "react";
import axios from "axios";
import useDecodedToken from "../../../utils/useDecodedToken";
import { useNavigate } from "react-router-dom";
import "./AdminJobseekers.css";

import Navbar from "../../Navbar/Navbar";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

// Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const AdminJobseekers = () => {
  const [jobseekers, setJobseekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const decoded = useDecodedToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (!decoded) {
      navigate("/login/error");
      return;
    }
  }, [decoded, navigate]);

  const fetchJobseekers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/admin/jobseekers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setJobseekers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobseekers:", err);
      setError("Failed to load jobseekers.");
      setLoading(false);
    }
  };

  const handleEdit = (jobseekerId) => {
    navigate(`/admin/jobseekers/edit/${jobseekerId}`);
  };

  const handleDelete = async (jobseekerId) => {
    if (window.confirm("Are you sure you want to delete this jobseeker?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:3000/jobseeker/delete/${jobseekerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Refresh the jobseekers list after delete
        setJobseekers(
          jobseekers.filter((js) => js.JobSeekerID !== jobseekerId)
        );
      } catch (err) {
        console.error("Error deleting jobseeker:", err);
        setError("Failed to delete jobseeker.");
      }
    }
  };

  useEffect(() => {
    fetchJobseekers();
  }, []);

  return (
    <>
      <Navbar className="admin-navbar" />
      <div className="admin-container container mt-4">
        <h2 className="admin-heading">All Registered Jobseekers</h2>
        {loading ? (
          <p className="admin-loading">Loading jobseekers...</p>
        ) : error ? (
          <p className="admin-error text-danger">{error}</p>
        ) : (
          <Table className="admin-table table table-striped mt-4">
            <Thead className="admin-thead">
              <Tr className="admin-tr">
                <Th className="admin-th">Name</Th>
                <Th className="admin-th">Email</Th>
                <Th className="admin-th">Phone</Th>
                <Th className="admin-th">DOB</Th>
                <Th className="admin-th">Gender</Th>
                <Th className="admin-th">Experience</Th>
                <Th className="admin-th">Address</Th>
                <Th className="admin-th">Actions</Th>
              </Tr>
            </Thead>
            <Tbody className="admin-tbody">
              {jobseekers.map((js) => (
                <Tr key={js.JobSeekerID} className="admin-tr">
                  <Td className="admin-td">{js.Name}</Td>
                  <Td className="admin-td">{js.Email}</Td>
                  <Td className="admin-td">{js.PhoneNumber}</Td>
                  <Td className="admin-td">
                    {new Date(js.DateOfBirth).toLocaleDateString()}
                  </Td>
                  <Td className="admin-td">{js.Gender}</Td>
                  <Td className="admin-td">{js.Experience}</Td>
                  <Td className="admin-td">{js.Address}</Td>
                  <Td className="admin-td admin-actions">
                    <button
                      className="admin-edit-btn"
                      onClick={() => handleEdit(js.JobSeekerID)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(js.JobSeekerID)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default AdminJobseekers;
