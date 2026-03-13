import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import { toast } from "react-toastify";

const AdminHotelManagerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    PhoneNumber: "",
    HotelName: "",
    HotelAddress: "",
    Position: "",
    YearsOfExperience: "",
    Gender: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotelManager = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/admin/hotelmanager/data/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        console.log(data);

        setFormData({
          Name: data.Name || "",
          Email: data.Email || "",
          PhoneNumber: data.PhoneNumber || "",
          HotelName: data.HotelName || "",
          HotelAddress: data.HotelAddress || "",
          Position: data.Position || "",
          YearsOfExperience: data.YearsOfExperience || "",
          Gender: data.Gender || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hotel manager:", err);
        setError("Failed to load hotel manager.");
        setLoading(false);
      }
    };

    fetchHotelManager();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
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
    } = formData;

    if (!Name.trim()) return "Name is required.";
    if (!/^[a-zA-Z\s]+$/.test(Name)) return "Name should contain only letters.";

    if (!Email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(Email)) return "Invalid email format.";

    if (!PhoneNumber.trim()) return "Phone number is required.";
    if (!/^\d{10}$/.test(PhoneNumber)) return "Phone number must be 10 digits.";

    if (!Gender) return "Please select a gender.";

    if (!YearsOfExperience || isNaN(YearsOfExperience) || YearsOfExperience < 0)
      return "Enter a valid number of years of experience.";

    if (!HotelName.trim()) return "Hotel Name is required.";
    if (!HotelAddress.trim()) return "Hotel Address is required.";
    if (!Position.trim()) return "Position is required.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/admin/hotelmanager/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hotel Manager updated successfully!");
      navigate("/admin/hotelmanagers");
    } catch (err) {
      toast.error("Failed to update Hotel Manager. Please try again.");
      console.error("Error updating hotel manager:", err);
      setError("Failed to update hotel manager.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="jobseekeredit-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form className="jobseekeredit-form" onSubmit={handleSubmit}>
            <h2 className="jobseekeredit-heading">Edit Hotel Manager</h2>

            {error && <p className="text-danger">{error}</p>}

            <input
              className="jobseekeredit-input"
              type="text"
              name="Name"
              placeholder="Full Name"
              value={formData.Name}
              onChange={handleChange}
              required
            />

            <input
              className="jobseekeredit-input"
              type="email"
              name="Email"
              placeholder="Email"
              value={formData.Email}
              onChange={handleChange}
              required
            />

            <input
              className="jobseekeredit-input"
              type="text"
              name="PhoneNumber"
              placeholder="Phone Number"
              value={formData.PhoneNumber}
              onChange={handleChange}
              required
            />

            <div className="jobseekeredit-inline-group">
              <select
                className="jobseekeredit-select-half"
                name="Gender"
                value={formData.Gender}
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
                value={formData.YearsOfExperience}
                onChange={handleChange}
                required
              />
            </div>

            <input
              className="jobseekeredit-input"
              type="text"
              name="HotelName"
              placeholder="Hotel Name"
              value={formData.HotelName}
              onChange={handleChange}
              required
            />

            <input
              className="jobseekeredit-input"
              type="text"
              name="HotelAddress"
              placeholder="Hotel Address"
              value={formData.HotelAddress}
              onChange={handleChange}
              required
            />

            <input
              className="jobseekeredit-input"
              type="text"
              name="Position"
              placeholder="Position"
              value={formData.Position}
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
        )}
      </div>
    </>
  );
};

export default AdminHotelManagerEdit;
