import React, { useEffect, useState } from "react";
import axios from "axios";
import useDecodedToken from "../../../utils/useDecodedToken";
import { useNavigate } from "react-router-dom";
import "./AdminHotelManagers.css"; // You can reuse the same CSS class

import Navbar from "../../Navbar/Navbar";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

// Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const AdminHotelManagers = () => {
  const [hotelManagers, setHotelManagers] = useState([]);
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

  const fetchHotelManagers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/admin/hotelmanagers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHotelManagers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching hotel managers:", err);
      setError("Failed to load hotel managers.");
      setLoading(false);
    }
  };

  const handleEdit = (hotelManagerId) => {
    navigate(`/admin/hotelmanagers/edit/${hotelManagerId}`);
  };

  const handleDelete = async (hotelManagerId) => {
    if (window.confirm("Are you sure you want to delete this hotel manager?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:3000/admin/hotelmanager/delete/${hotelManagerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Refresh the hotel managers list after delete
        setHotelManagers(
          hotelManagers.filter((hm) => hm.HotelManagerID !== hotelManagerId)
        );
      } catch (err) {
        console.error("Error deleting hotel manager:", err);
        setError("Failed to delete hotel manager.");
      }
    }
  };

  useEffect(() => {
    fetchHotelManagers();
  }, []);

  return (
    <>
      <Navbar className="admin-navbar" />
      <div className="admin-container container mt-4">
        <h2 className="admin-heading">All Registered Hotel Managers</h2>
        {loading ? (
          <p className="admin-loading">Loading hotel managers...</p>
        ) : error ? (
          <p className="admin-error text-danger">{error}</p>
        ) : (
          <Table className="admin-table table table-striped mt-4">
            <Thead className="admin-thead">
              <Tr className="admin-tr">
                <Th className="admin-th">Name</Th>
                <Th className="admin-th">Email</Th>
                <Th className="admin-th">Phone</Th>
                <Th className="admin-th">Gender</Th>
                <Th className="admin-th">Experience</Th>
                <Th className="admin-th">Hotel Name</Th>
                <Th className="admin-th">Position</Th>

                <Th className="admin-th">Actions</Th>
              </Tr>
            </Thead>
            <Tbody className="admin-tbody">
              {hotelManagers.map((hm) => (
                <Tr key={hm.HotelManagerID} className="admin-tr">
                  <Td className="admin-td">{hm.Name}</Td>
                  <Td className="admin-td">{hm.Email}</Td>
                  <Td className="admin-td">{hm.PhoneNumber}</Td>
                  <Td className="admin-td">{hm.Gender}</Td>
                  <Td className="admin-td">{hm.YearsOfExperience}</Td>
                  <Td className="admin-td">{hm.HotelName}</Td>
                  <Td className="admin-td">{hm.Position}</Td>

                  <Td className="admin-td admin-actions">
                    <button
                      className="admin-edit-btn"
                      onClick={() => handleEdit(hm.ManagerID)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(hm.ManagerID)}
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

export default AdminHotelManagers;
