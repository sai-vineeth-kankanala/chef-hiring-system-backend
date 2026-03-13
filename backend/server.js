const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "hdvdfg123ff"; // Move to .env in production

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "912111",
  database: "cookhire",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL");
});

// ✅ AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //console.log("📦 Incoming Token:", token);

  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Invalid Token:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user; //console.log("✅ Token valid. User:", user);
    next();
  });
};

// ✅ ROLE-BASED AUTHORIZATION
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient privileges" });
    }
    next();
  };
};

// ⬇️ REGISTRATION
app.post("/register", async (req, res) => {
  const { role, ...data } = req.body;

  const validRoles = ["jobseeker", "hotelmanager"];
  if (!validRoles.includes(role)) {
    return res.status(400).send("Invalid role selected");
  }

  const table = role;
  const checkEmail = `SELECT * FROM ${table} WHERE Email = ?`;

  db.query(checkEmail, [data.Email], async (err, results) => {
    if (err) return res.status(500).send("DB error");
    if (results.length > 0)
      return res.status(400).send("Email already registered");

    const hashedPassword = await bcrypt.hash(data.Password, 10);
    data.Password = hashedPassword;

    const fields = Object.keys(data).join(", ");
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(", ");
    const values = Object.values(data);

    const insertQuery = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;

    db.query(insertQuery, values, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Insert failed");
      }
      res.status(201).send("User registered successfully");
    });
  });
});

//  LOGIN Route
app.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  const validRoles = ["admin", "hotelmanager", "jobseeker"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role selected" });
  }

  const table = role;
  const query = `SELECT * FROM ${table} WHERE Email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const userId =
      role === "admin"
        ? user.AdminID
        : role === "hotelmanager"
        ? user.ManagerID
        : user.JobSeekerID;

    const token = jwt.sign({ id: userId, role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  });
});

// ⬇️ JOBSEEKER PROFILE (PROTECTED)
app.get(
  "/jobseeker/profile/:id",
  authenticateToken,
  authorizeRoles("jobseeker"),
  (req, res) => {
    const jobSeekerId = req.params.id; // Optional: Only allow self-access

    if (parseInt(jobSeekerId) !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Access denied to another profile" });
    }

    const query = "SELECT * FROM jobseekerprofileview WHERE JobSeekerID = ?";

    db.query(query, [jobSeekerId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Failed to fetch profile");
      }

      if (results.length === 0) {
        return res.status(404).send("Jobseeker profile not found");
      }

      res.json(results[0]);
    });
  }
);

// UPDATE JOBSEEKER PROFILE (PROTECTED)
app.put(
  "/jobseeker/profile/:id",
  authenticateToken,
  authorizeRoles("jobseeker"),
  (req, res) => {
    const jobSeekerId = parseInt(req.params.id); // Ensure the user is only updating their own profile

    if (jobSeekerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Access denied to update another profile" });
    }

    const {
      Name,
      Email,
      PhoneNumber,
      Gender,
      DateOfBirth,
      Address,
      Experience,
    } = req.body;

    const updateQuery = `
UPDATE jobseeker
SET Name = ?, Email = ?, PhoneNumber = ?, Gender = ?, DateOfBirth = ?, Address = ?, Experience = ?
WHERE JobSeekerID = ?
`;

    db.query(
      updateQuery,
      [
        Name,
        Email,
        PhoneNumber,
        Gender,
        DateOfBirth,
        Address,
        Experience,
        jobSeekerId,
      ],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Failed to update profile" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ message: "Profile updated successfully" });
      }
    );
  }
);

// ✅ GET: Job Openings for Jobseekers
app.get(
  "/jobseeker/job-openings",
  authenticateToken,
  authorizeRoles("jobseeker"),
  (req, res) => {
    const query = `
SELECT 
PostingID AS id,
JobTitle AS title,
HotelName,
Location AS location,
Salary,
PostingDate AS posted,
EducationRequirements,
RequiredExperience,
'Full Time' AS type
FROM jobposting
ORDER BY PostingDate DESC
`;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch job openings:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching jobs" });
      }

      res.json(results);
    });
  }
);

app.post(
  "/jobseeker/apply",
  authenticateToken,
  authorizeRoles("jobseeker"),
  (req, res) => {
    const { JobSeekerID, PostingID, Status } = req.body;

    const DateApplied = new Date();

    const query = `
INSERT INTO jobapplication (JobSeekerID, PostingID, DateApplied, Status)
VALUES (?, ?, ?, ?)
`;

    db.query(
      query,
      [JobSeekerID, PostingID, DateApplied, Status],
      (err, result) => {
        if (err) {
          console.error("❌ Failed to submit application:", err);
          return res
            .status(500)
            .json({ message: "Server error while applying" });
        }

        res.status(201).json({ message: "Application submitted successfully" });
      }
    );
  }
);

// ⬇️ GET: Applied Jobs for a Jobseeker
app.get(
  "/jobseeker/applied-jobs",
  authenticateToken,
  authorizeRoles("jobseeker"),
  (req, res) => {
    const jobSeekerId = req.user.id; // From JWT

    const query = `
SELECT 
 ApplicationID,
 JobSeekerID,
 PostingID,
 JobTitle,
 HotelName,
 Location,
 Salary,
 RequiredExperience,
 EducationRequirements,
 PostingDate,
 DateApplied,
 Status
FROM appliedjobsview
WHERE JobSeekerID = ?
ORDER BY DateApplied DESC
  `;

    db.query(query, [jobSeekerId], (err, results) => {
      if (err) {
        console.error("❌ Error fetching applied jobs:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching applied jobs" });
      }

      res.json(results);
    });
  }
);

//hotel manager
// ✅ GET: Job Openings for Hotel Manager
app.get(
  "/hm/job-openings",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const query = `
SELECT 
 PostingID AS id,
 JobTitle AS title,
 HotelName,
 Location AS location,
 Salary,
 PostingDate AS posted,
 EducationRequirements,
 RequiredExperience,
 'Full Time' AS type
FROM jobposting
ORDER BY PostingDate DESC
  `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch job openings:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching jobs" });
      }

      res.json(results);
    });
  }
);

// ⬇️ GET: Applied Jobs for a Jobseeker
app.get(
  "/hm/applied-jobs",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const hmID = req.user.id; // From JWT

    const query = `
  SELECT 
 ja.ApplicationID,
 ja.JobSeekerID,
 ja.PostingID,
 jp.JobTitle,
 jp.HotelName,
 jp.Location,
 jp.Salary,
 jp.RequiredExperience,
 jp.EducationRequirements,
 jp.PostingDate,
 ja.DateApplied,
 ja.Status
FROM jobapplication ja
JOIN jobposting jp ON ja.PostingID = jp.PostingID
WHERE jp.ManagerID = ?
ORDER BY ja.DateApplied DESC;

  `;

    db.query(query, [hmID], (err, results) => {
      if (err) {
        console.error("❌ Error fetching applied jobs:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching applied jobs" });
      }

      res.json(results);
    });
  }
);

//self hm job openings
app.get(
  "/hm/self/job-openings/:id",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const managerID = req.params.id;

    const query = `CALL GetJobPostingsByManager(?)`;

    db.query(query, [managerID], (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch job postings for manager:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching job postings" });
      } // Stored procedure returns results inside an array

      const formatted = results[0].map((job) => ({
        id: job.PostingID,
        title: job.JobTitle,
        HotelName: job.HotelName,
        location: job.Location,
        Salary: job.Salary,
        posted: job.PostingDate,
        EducationRequirements: job.EducationRequirements,
        RequiredExperience: job.RequiredExperience,
        type: "Full Time",
      }));

      res.json(formatted);
    });
  }
);

//add job opening
app.post(
  "/hm/add/job-opening/:id",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const managerID = req.params.id; // Destructure request body to get job posting details

    const {
      JobTitle,
      HotelName,
      RequiredExperience,
      EducationRequirements,
      Salary,
      Location,
      PostingDate, // Optional, will be auto-filled by trigger if null
    } = req.body; // SQL query to insert the new job posting

    const query = `
INSERT INTO jobposting (
 JobTitle,
 HotelName,
 RequiredExperience,
 EducationRequirements,
 Salary,
 Location,
 PostingDate,
 ManagerID
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

    const params = [
      JobTitle,
      HotelName,
      RequiredExperience,
      EducationRequirements,
      Salary,
      Location,
      PostingDate || null, // Let the trigger handle it if null
      managerID,
    ]; // Execute the query

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("❌ Failed to add job posting:", err);
        return res
          .status(500)
          .json({ message: "Server error while adding job posting" });
      }

      res.status(201).json({ message: "✅ Job posting added successfully" });
    });
  }
);

//Update Job Opening
app.put(
  "/hm/edit/job-opening/:id",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const { id } = req.params;
    const {
      JobTitle,
      HotelName,
      RequiredExperience,
      EducationRequirements,
      Salary,
      Location,
      PostingDate,
    } = req.body;

    const query = `CALL UpdateJobPosting(?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [
        id,
        JobTitle,
        HotelName,
        RequiredExperience,
        EducationRequirements,
        Salary,
        Location,
        PostingDate,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Failed to update job posting:", err);
          return res
            .status(500)
            .json({ message: "Server error while updating job posting" });
        }

        res.json({ message: "✅ Job posting updated successfully" });
      }
    );
  }
);

//Get single job posting by PostingID
app.get(
  "/hm/job-opening/:id",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const postingID = req.params.id;

    const query = "SELECT * FROM jobposting WHERE PostingID = ?";

    db.query(query, [postingID], (err, results) => {
      if (err) {
        console.error("❌ Error fetching job posting:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Job posting not found" });
      }

      res.json(results[0]); // Send back single job object
    });
  }
);

// ⬇️ DELETE: Job Posting by Hotel Manager
app.delete(
  "/hm/delete/job-opening/:postingId",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const managerId = req.user.id; // From JWT
    const postingId = req.params.postingId; // First, confirm the job belongs to the authenticated manager

    const checkQuery = `
SELECT * FROM jobposting 
WHERE PostingID = ? AND ManagerID = ?
  `;

    db.query(checkQuery, [postingId, managerId], (err, results) => {
      if (err) {
        console.error("❌ Error checking job ownership:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res
          .status(403)
          .json({ message: "Unauthorized to delete this job posting" });
      } // Proceed to delete the job posting

      const deleteQuery = `

DELETE FROM jobposting
WHERE PostingID = ?;

`;

      db.query(deleteQuery, [postingId], (err, result) => {
        if (err) {
          console.error("❌ Error deleting job posting:", err);
          return res
            .status(500)
            .json({ message: "Failed to delete job posting" });
        }

        res.json({ message: "Job posting deleted successfully" });
      });
    });
  }
);

// ✅ GET: Candidates who applied to a hotel manager's jobs
app.get(
  "/hm/applied-candidates",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const managerID = req.user.id; // From JWT

    const query = `
SELECT *
FROM View_AppliedCandidatesByManager
WHERE ManagerID = ?
ORDER BY DateApplied DESC
  `;

    db.query(query, [managerID], (err, results) => {
      if (err) {
        console.error("❌ Error fetching applied candidates:", err);
        return res.status(500).json({
          message: "Server error while fetching applied candidates",
        });
      }

      res.json(results);
    });
  }
);

// ✅ UPDATE APPLICATION STATUS (Hotel Manager Only)
app.put(
  "/hm/update-status",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const { ApplicationID, Status } = req.body;
    console.log(ApplicationID);
    console.log(Status);

    if (!ApplicationID || !Status) {
      return res
        .status(400)
        .json({ message: "ApplicationID and Status are required" });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error("❌ Transaction start error:", err);
        return res
          .status(500)
          .json({ message: "Server error starting transaction" });
      }

      const updateQuery = `
 UPDATE jobapplication
 SET Status = ?
 WHERE ApplicationID = ?
`;

      db.query(updateQuery, [Status, ApplicationID], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Error during update:", err);
            res.status(500).json({ message: "Error updating status" });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ message: "Application not found" });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Commit failed:", err);
              res.status(500).json({ message: "Commit failed" });
            });
          }

          res.json({ message: "✅ Application status updated successfully" });
        });
      });
    });
  }
);

app.get(
  "/hotelmanager/profile/:id",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const managerId = req.params.id;

    db.query(
      "SELECT * FROM hotelmanager WHERE ManagerID = ?",
      [managerId],
      (err, results) => {
        if (err) {
          console.error("❌ Error fetching manager profile:", err);
          return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Manager not found" });
        }

        res.json(results[0]);
      }
    );
  }
);

app.put(
  "/hm/profile/update/:id",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const managerId = req.params.id;
    const {
      Name,
      Email,
      PhoneNumber,
      HotelName,
      HotelAddress,
      Position,
      YearsOfExperience,
      Gender,
    } = req.body;

    if (
      !Name ||
      !Email ||
      !PhoneNumber ||
      !HotelName ||
      !HotelAddress ||
      !Position ||
      !YearsOfExperience ||
      !Gender
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error("❌ Transaction error:", err);
        return res
          .status(500)
          .json({ message: "Server error starting transaction" });
      }

      const updateQuery = `
 UPDATE hotelmanager
 SET Name = ?, Email = ?, PhoneNumber = ?, HotelName = ?, HotelAddress = ?, Position = ?, YearsOfExperience = ?, Gender = ?
 WHERE ManagerID = ?
`;

      db.query(
        updateQuery,
        [
          Name,
          Email,
          PhoneNumber,
          HotelName,
          HotelAddress,
          Position,
          YearsOfExperience,
          Gender,
          managerId,
        ],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Error during update:", err);
              res.status(500).json({ message: "Error updating profile" });
            });
          }

          if (result.affectedRows === 0) {
            return db.rollback(() => {
              res.status(404).json({ message: "Hotel Manager not found" });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("❌ Commit failed:", err);
                res.status(500).json({ message: "Commit failed" });
              });
            }

            res.json({
              message: "✅ Hotel Manager profile updated successfully",
            });
          });
        }
      );
    });
  }
);

// ⬇️ GET: All Jobseekers (for Admin or Dev purposes)
app.get(
  "/admin/jobseekers",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = "SELECT * FROM jobseeker";

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch jobseekers:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching jobseekers" });
      }

      res.json(results);
    });
  }
);

// ⬇️ GET: Single Jobseeker by ID
app.get(
  "/admin/jobseeker/data/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const jobseekerId = req.params.id;

    const query = "SELECT * FROM jobseeker WHERE JobSeekerID = ?";
    db.query(query, [jobseekerId], (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch jobseeker by ID:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching jobseeker" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Jobseeker not found" });
      }

      res.json(results[0]);
    });
  }
);

// ⬆️ PUT: Update Jobseeker by ID
app.put(
  "/admin/jobseeker/update/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const jobseekerId = req.params.id;
    const {
      Name,
      Email,
      PhoneNumber,
      DateOfBirth,
      Gender,
      Experience,
      Address,
    } = req.body;

    const query = `
UPDATE jobseeker 
SET Name = ?, Email = ?, PhoneNumber = ?, DateOfBirth = ?, 
  Gender = ?, Experience = ?, Address = ?
WHERE JobSeekerID = ?
  `;

    db.query(
      query,
      [
        Name,
        Email,
        PhoneNumber,
        DateOfBirth,
        Gender,
        Experience,
        Address,
        jobseekerId,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Failed to update jobseeker:", err);
          return res
            .status(500)
            .json({ message: "Server error while updating jobseeker" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Jobseeker not found" });
        }

        res.json({ message: "Jobseeker updated successfully" });
      }
    );
  }
);

// ⬇️ DELETE: Jobseeker Account (Protected)
app.delete(
  "/jobseeker/delete/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const jobSeekerId = req.params.id;

    const deleteQuery = "DELETE FROM jobseeker WHERE JobSeekerID = ?";

    db.query(deleteQuery, [jobSeekerId], (err, result) => {
      if (err) {
        console.error("❌ Error deleting jobseeker:", err);
        return res.status(500).json({ message: "Failed to delete account" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Jobseeker not found" });
      }

      res.json({ message: "Jobseeker account deleted successfully" });
    });
  }
);

//hotelmanagers
app.get(
  "/admin/hotelmanagers",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = "SELECT * FROM hotelmanager";

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch hotel managers:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching hotel managers" });
      }

      res.json(results);
    });
  }
);

//hotel manager details using id
app.get(
  "/admin/hotelmanager/data/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const hotelManagerId = req.params.id;

    const query = "SELECT * FROM hotelmanager WHERE ManagerID = ?";
    db.query(query, [hotelManagerId], (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch hotel manager by ID:", err);
        return res
          .status(500)
          .json({ message: "Server error while fetching hotel manager" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Hotel Manager not found" });
      }

      res.json(results[0]);
    });
  }
);

//hotel manager update data
app.put(
  "/admin/hotelmanager/update/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const managerId = req.params.id;
    const {
      Name,
      Email,
      PhoneNumber,
      HotelName,
      HotelAddress,
      Position,
      YearsOfExperience,
      Gender,
    } = req.body;

    const query = `
   UPDATE hotelmanager 
SET Name = ?, Email = ?, PhoneNumber = ?, HotelName = ?, 
  HotelAddress = ?, Position = ?, YearsOfExperience = ?, Gender = ?
WHERE ManagerID = ?
  `;

    db.query(
      query,
      [
        Name,
        Email,
        PhoneNumber,
        HotelName,
        HotelAddress,
        Position,
        YearsOfExperience,
        Gender,
        managerId,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Failed to update hotel manager:", err);
          return res
            .status(500)
            .json({ message: "Server error while updating hotel manager" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Hotel manager not found" });
        }

        res.json({ message: "Hotel manager updated successfully" });
      }
    );
  }
);

//hotel manager delete
app.delete(
  "/admin/hotelmanager/delete/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const hotelManagerId = req.params.id;

    const deleteQuery = "DELETE FROM hotelmanager WHERE ManagerID = ?";

    db.query(deleteQuery, [hotelManagerId], (err, result) => {
      if (err) {
        console.error("❌ Error deleting hotel manager:", err);
        return res
          .status(500)
          .json({ message: "Failed to delete hotel manager" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Hotel Manager not found" });
      }

      res.json({ message: "Hotel Manager deleted successfully" });
    });
  }
);

// ⬇️ ADMIN PROFILE (PROTECTED)
app.get(
  "/admin/profile/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const adminId = req.params.id;

    const query =
      "SELECT AdminID, Name, Email, PhoneNumber FROM admin WHERE AdminID = ?";

    db.query(query, [adminId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Failed to fetch admin profile");
      }

      if (results.length === 0) {
        return res.status(404).send("Admin profile not found");
      }

      res.json(results[0]);
    });
  }
);

// ⬇️ UPDATE ADMIN PROFILE (PROTECTED)
app.put(
  "/admin/profile/update/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const adminId = parseInt(req.params.id);

    const { Name, Email, PhoneNumber } = req.body;

    const updateQuery = `
UPDATE admin
SET Name = ?, Email = ?, PhoneNumber = ?
WHERE AdminID = ?
  `;

    db.query(
      updateQuery,
      [Name, Email, PhoneNumber, adminId],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Failed to update admin profile" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Admin profile not found" });
        }

        res.json({ message: "Admin profile updated successfully" });
      }
    );
  }
);

//reset password admin
app.put(
  "/admin/reset/password/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const adminId = parseInt(req.params.id);
    const { Password } = req.body;

    bcrypt.hash(Password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }

      const updateQuery = `
 UPDATE admin
 SET Password = ?
 WHERE AdminID = ?
`;

      db.query(updateQuery, [hashedPassword, adminId], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Failed to update admin profile" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Admin password not found" });
        }

        res.json({ message: "Admin password updated successfully" });
      });
    });
  }
);

// reset password hotel manager
app.put(
  "/hotelmanager/reset/password/:id",
  authenticateToken,
  authorizeRoles("hotelmanager"),
  (req, res) => {
    const managerId = parseInt(req.params.id);
    const { Password } = req.body;

    bcrypt.hash(Password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }

      const updateQuery = `
 UPDATE hotelmanager
 SET Password = ?
 WHERE ManagerID = ?
`;

      db.query(updateQuery, [hashedPassword, managerId], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Failed to update hotel manager password" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Hotel manager not found" });
        }

        res.json({ message: "Hotel manager password updated successfully" });
      });
    });
  }
);

// reset password jobseeker
app.put(
  "/jobseeker/reset/password/:id",
  authenticateToken,
  authorizeRoles("jobseeker"),
  (req, res) => {
    const jobseekerId = parseInt(req.params.id);
    const { Password } = req.body;

    bcrypt.hash(Password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }

      const updateQuery = `
 UPDATE jobseeker
 SET Password = ?
 WHERE JobSeekerID = ?
`;

      db.query(updateQuery, [hashedPassword, jobseekerId], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Failed to update job seeker password" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Job seeker not found" });
        }

        res.json({ message: "Job seeker password updated successfully" });
      });
    });
  }
);

// ✅ START SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
