
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2025 at 07:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cookhire`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetJobPostingsByManager` (IN `managerId` INT)   BEGIN
  SELECT 
    PostingID,
    JobTitle,
    HotelName,
    RequiredExperience,
    EducationRequirements,
    Salary,
    Location,
    PostingDate
  FROM 
    jobposting
  WHERE 
    ManagerID = managerId;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateJobPosting` (IN `p_PostingID` INT, IN `p_JobTitle` VARCHAR(100), IN `p_HotelName` VARCHAR(100), IN `p_RequiredExperience` INT, IN `p_EducationRequirements` VARCHAR(100), IN `p_Salary` DECIMAL(10,2), IN `p_Location` VARCHAR(255), IN `p_PostingDate` DATE)   BEGIN
  UPDATE jobposting
  SET 
    JobTitle = p_JobTitle,
    HotelName = p_HotelName,
    RequiredExperience = p_RequiredExperience,
    EducationRequirements = p_EducationRequirements,
    Salary = p_Salary,
    Location = p_Location,
    PostingDate = p_PostingDate
  WHERE 
    PostingID = p_PostingID;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `AdminID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PhoneNumber` varchar(15) NOT NULL,
  `Password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`AdminID`, `Name`, `Email`, `PhoneNumber`, `Password`) VALUES
(1, 'Admin', 'sample@gmail.com', '1234567890', '$2b$10$o5c5dEyv7CtdR3T.9CEgxuf7Miu720WoKf/3AuJr2U/AR7zNVgKn2');

-- --------------------------------------------------------

--
-- Stand-in structure for view `appliedjobsview`
-- (See below for the actual view)
--
CREATE TABLE `appliedjobsview` (
`ApplicationID` int(11)
,`JobSeekerID` int(11)
,`PostingID` int(11)
,`JobTitle` varchar(100)
,`HotelName` varchar(100)
,`Location` varchar(255)
,`Salary` decimal(10,2)
,`RequiredExperience` int(11)
,`EducationRequirements` varchar(100)
,`PostingDate` date
,`DateApplied` date
,`Status` varchar(50)
);

-- --------------------------------------------------------

--
-- Table structure for table `hotelmanager`
--

CREATE TABLE `hotelmanager` (
  `ManagerID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PhoneNumber` varchar(15) NOT NULL,
  `HotelName` varchar(100) NOT NULL,
  `HotelAddress` varchar(255) NOT NULL,
  `Position` varchar(100) NOT NULL,
  `YearsOfExperience` int(11) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Gender` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hotelmanager`
--

INSERT INTO `hotelmanager` (`ManagerID`, `Name`, `Email`, `PhoneNumber`, `HotelName`, `HotelAddress`, `Position`, `YearsOfExperience`, `Password`, `Gender`) VALUES
(4, 'Goku', 'goku@gmail.com', '7671831838', 'Dragon Ball Z', 'Hyderabad', 'Assistant Manager', 2, '$2b$10$jpD5txDFV97L9DIr6tiAAe22Xs/9RNYvqkw4XsZe9MX4vcciEVxMe', 'male'),
(5, 'Sample', 'sample@gmail.com', '7671831838', 'Lemon Tree', 'House No.110, 1st Line Devi Nagar', 'Assistant Manager', 0, '$2b$10$hB5hlxx7OBL/MjZ6EQevCeFp1eCJnJ61.Cg8/BEKRmOSX5r5MQk2G', 'male');

-- --------------------------------------------------------

--
-- Table structure for table `jobapplication`
--

CREATE TABLE `jobapplication` (
  `ApplicationID` int(11) NOT NULL,
  `JobSeekerID` int(11) DEFAULT NULL,
  `PostingID` int(11) DEFAULT NULL,
  `DateApplied` date NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobapplication`
--

INSERT INTO `jobapplication` (`ApplicationID`, `JobSeekerID`, `PostingID`, `DateApplied`, `Status`) VALUES
(10, 9, 31, '2025-04-28', 'Pending'),
(11, 9, 32, '2025-04-28', 'Pending'),
(12, 9, 34, '2025-04-28', 'Pending'),
(13, 9, 31, '2025-04-28', 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `jobposting`
--

CREATE TABLE `jobposting` (
  `PostingID` int(11) NOT NULL,
  `JobTitle` varchar(100) NOT NULL,
  `HotelName` varchar(100) NOT NULL,
  `RequiredExperience` int(11) NOT NULL,
  `EducationRequirements` varchar(100) NOT NULL,
  `Salary` decimal(10,2) NOT NULL,
  `Location` varchar(255) NOT NULL,
  `PostingDate` date NOT NULL,
  `ManagerID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobposting`
--

INSERT INTO `jobposting` (`PostingID`, `JobTitle`, `HotelName`, `RequiredExperience`, `EducationRequirements`, `Salary`, `Location`, `PostingDate`, `ManagerID`) VALUES
(30, 'Head chef', 'Grand Spice Palace', 5, 'Diploma in Culinary Arts', 45000.00, 'Bengaluru, Karnataka', '2025-04-25', 4),
(31, 'Line cook', 'The Green Leaf Diner', 2, 'High School Diploma', 22000.00, 'Pune, Maharashtra', '2025-04-25', 4),
(32, 'Kitchen helper', 'Delight Biryani House', 0, 'Not Mandatory', 14000.00, 'Hyderabad, Telangana', '2025-04-25', 4),
(33, 'Sous chef', 'Ocean Breeze Resort', 4, 'Bachelor in Hotel Management', 38000.00, 'Goa', '2025-04-25', 4),
(34, 'Pastry chef', 'Sweet Treats Hotel', 3, 'Diploma in Baking & Pastry Arts', 30000.00, 'Chennai, Tamil Nadu', '2025-04-25', 4),
(35, 'Commis chef', 'Urban Bites Inn', 1, 'Culinary Certification', 18000.00, 'Delhi', '2025-04-25', 4),
(36, 'Grill cook', 'Flame & Grill Restaurant', 2, 'High School Diploma', 21000.00, 'Ahmedabad, Gujarat', '2025-04-25', 4),
(37, 'Breakfast cook', 'Sunrise Suites', 1, 'Certificate in Food Production', 19000.00, 'Mumbai, Maharashtra', '2025-04-25', 4),
(38, 'Tandoor specialist', 'Royal Tandoori Lounge', 4, 'Specialty Training', 35000.00, 'Lucknow, Uttar Pradesh', '2025-04-25', 4),
(39, 'Buffet supervisor', 'Mega Banquets', 3, 'Diploma in Catering Science', 32000.00, 'Jaipur, Rajasthan', '2025-04-25', 4);

--
-- Triggers `jobposting`
--
DELIMITER $$
CREATE TRIGGER `trg_before_insert_jobposting` BEFORE INSERT ON `jobposting` FOR EACH ROW BEGIN
    -- Auto-set PostingDate if NULL
    IF NEW.PostingDate IS NULL THEN
        SET NEW.PostingDate = CURDATE();
    END IF;

    -- Make JobTitle Title Case (capitalize first letter)
    SET NEW.JobTitle = CONCAT(UCASE(LEFT(NEW.JobTitle, 1)), LCASE(SUBSTRING(NEW.JobTitle, 2)));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `jobseeker`
--

CREATE TABLE `jobseeker` (
  `JobSeekerID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PhoneNumber` varchar(15) NOT NULL,
  `DateOfBirth` date NOT NULL,
  `Address` varchar(255) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Experience` varchar(255) NOT NULL,
  `Gender` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobseeker`
--

INSERT INTO `jobseeker` (`JobSeekerID`, `Name`, `Email`, `PhoneNumber`, `DateOfBirth`, `Address`, `Password`, `Experience`, `Gender`) VALUES
(9, 'Pavan Chintakayal', 'pa1chintakayala@gmail.com', '7671831838', '2002-06-18', 'Hyderabad', '$2b$10$rQlbk9FZa2X7gL2DUNYJouwUhxBYY7PV63K2x8LtPJKsbIaHZHxsa', '2', 'male');

-- --------------------------------------------------------

--
-- Stand-in structure for view `jobseekerprofileview`
-- (See below for the actual view)
--
CREATE TABLE `jobseekerprofileview` (
`JobSeekerID` int(11)
,`Name` varchar(100)
,`Email` varchar(100)
,`PhoneNumber` varchar(15)
,`DateOfBirth` date
,`Address` varchar(255)
,`Experience` varchar(255)
,`Gender` text
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_appliedcandidatesbymanager`
-- (See below for the actual view)
--
CREATE TABLE `view_appliedcandidatesbymanager` (
`JobSeekerID` int(11)
,`JobSeekerName` varchar(100)
,`Email` varchar(100)
,`PhoneNumber` varchar(15)
,`DateOfBirth` date
,`Address` varchar(255)
,`Experience` varchar(255)
,`Gender` text
,`JobTitle` varchar(100)
,`ManagerID` int(11)
,`Status` varchar(50)
,`ApplicationID` int(11)
,`DateApplied` date
);

-- --------------------------------------------------------

--
-- Structure for view `appliedjobsview`
--
DROP TABLE IF EXISTS `appliedjobsview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `appliedjobsview`  AS SELECT `ja`.`ApplicationID` AS `ApplicationID`, `ja`.`JobSeekerID` AS `JobSeekerID`, `ja`.`PostingID` AS `PostingID`, `jp`.`JobTitle` AS `JobTitle`, `jp`.`HotelName` AS `HotelName`, `jp`.`Location` AS `Location`, `jp`.`Salary` AS `Salary`, `jp`.`RequiredExperience` AS `RequiredExperience`, `jp`.`EducationRequirements` AS `EducationRequirements`, `jp`.`PostingDate` AS `PostingDate`, `ja`.`DateApplied` AS `DateApplied`, `ja`.`Status` AS `Status` FROM (`jobapplication` `ja` join `jobposting` `jp` on(`ja`.`PostingID` = `jp`.`PostingID`)) ;

-- --------------------------------------------------------

--
-- Structure for view `jobseekerprofileview`
--
DROP TABLE IF EXISTS `jobseekerprofileview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `jobseekerprofileview`  AS SELECT `jobseeker`.`JobSeekerID` AS `JobSeekerID`, `jobseeker`.`Name` AS `Name`, `jobseeker`.`Email` AS `Email`, `jobseeker`.`PhoneNumber` AS `PhoneNumber`, `jobseeker`.`DateOfBirth` AS `DateOfBirth`, `jobseeker`.`Address` AS `Address`, `jobseeker`.`Experience` AS `Experience`, `jobseeker`.`Gender` AS `Gender` FROM `jobseeker` ;

-- --------------------------------------------------------

--
-- Structure for view `view_appliedcandidatesbymanager`
--
DROP TABLE IF EXISTS `view_appliedcandidatesbymanager`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_appliedcandidatesbymanager`  AS SELECT `js`.`JobSeekerID` AS `JobSeekerID`, `js`.`Name` AS `JobSeekerName`, `js`.`Email` AS `Email`, `js`.`PhoneNumber` AS `PhoneNumber`, `js`.`DateOfBirth` AS `DateOfBirth`, `js`.`Address` AS `Address`, `js`.`Experience` AS `Experience`, `js`.`Gender` AS `Gender`, `jp`.`JobTitle` AS `JobTitle`, `jp`.`ManagerID` AS `ManagerID`, `ja`.`Status` AS `Status`, `ja`.`ApplicationID` AS `ApplicationID`, `ja`.`DateApplied` AS `DateApplied` FROM ((`jobapplication` `ja` join `jobseeker` `js` on(`ja`.`JobSeekerID` = `js`.`JobSeekerID`)) join `jobposting` `jp` on(`ja`.`PostingID` = `jp`.`PostingID`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`AdminID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `hotelmanager`
--
ALTER TABLE `hotelmanager`
  ADD PRIMARY KEY (`ManagerID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `jobapplication`
--
ALTER TABLE `jobapplication`
  ADD PRIMARY KEY (`ApplicationID`),
  ADD KEY `JobSeekerID` (`JobSeekerID`),
  ADD KEY `PostingID` (`PostingID`);

--
-- Indexes for table `jobposting`
--
ALTER TABLE `jobposting`
  ADD PRIMARY KEY (`PostingID`),
  ADD KEY `ManagerID` (`ManagerID`);

--
-- Indexes for table `jobseeker`
--
ALTER TABLE `jobseeker`
  ADD PRIMARY KEY (`JobSeekerID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `AdminID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hotelmanager`
--
ALTER TABLE `hotelmanager`
  MODIFY `ManagerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobapplication`
--
ALTER TABLE `jobapplication`
  MODIFY `ApplicationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `jobposting`
--
ALTER TABLE `jobposting`
  MODIFY `PostingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `jobseeker`
--
ALTER TABLE `jobseeker`
  MODIFY `JobSeekerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `jobapplication`
--
ALTER TABLE `jobapplication`
  ADD CONSTRAINT `jobapplication_ibfk_1` FOREIGN KEY (`JobSeekerID`) REFERENCES `jobseeker` (`JobSeekerID`) ON DELETE CASCADE,
  ADD CONSTRAINT `jobapplication_ibfk_2` FOREIGN KEY (`PostingID`) REFERENCES `jobposting` (`PostingID`) ON DELETE CASCADE;

--
-- Constraints for table `jobposting`
--
ALTER TABLE `jobposting`
  ADD CONSTRAINT `jobposting_ibfk_1` FOREIGN KEY (`ManagerID`) REFERENCES `hotelmanager` (`ManagerID`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


