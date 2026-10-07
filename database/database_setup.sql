-- =============================================================================
-- DBMS COURSE PROJECT: PROJECT 44
-- DESIGN AND IMPLEMENTATION OF A DATABASE MANAGEMENT SYSTEM FOR
-- CONSTRUCTION MATERIAL AND SITE PROGRESS MANAGEMENT SYSTEM
-- =============================================================================
-- Student: Mohammed Ali (Roll No: 25WU0102161) & Shubham (Roll No: 25WU0102275)
-- Target RDBMS: MySQL 8.0+
-- File: database_setup.sql
-- =============================================================================

DROP DATABASE IF EXISTS Construction_Site_Management;
CREATE DATABASE Construction_Site_Management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Construction_Site_Management;

-- =============================================================================
-- SECTION 1: DDL TABLE DEFINITIONS (Normalized up to 3NF)
-- =============================================================================

CREATE TABLE PROJECTS (
    Project_ID INT PRIMARY KEY,
    Project_Name VARCHAR(100) NOT NULL,
    Budget DECIMAL(15,2) NOT NULL CHECK (Budget > 0),
    Status VARCHAR(30) NOT NULL DEFAULT 'In Progress' 
        CHECK (Status IN ('Planned', 'In Progress', 'Completed', 'On Hold'))
) ENGINE=InnoDB;

CREATE TABLE SITES (
    Site_ID INT PRIMARY KEY,
    Project_ID INT NOT NULL,
    Site_Name VARCHAR(100) NOT NULL,
    Location VARCHAR(150) NOT NULL,
    FOREIGN KEY (Project_ID) REFERENCES PROJECTS(Project_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE CONTRACTORS (
    Contractor_ID INT PRIMARY KEY,
    Contractor_Name VARCHAR(100) NOT NULL,
    Contact_Info VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE WORK_PACKAGES (
    Work_Package_ID INT PRIMARY KEY,
    Site_ID INT NOT NULL,
    Contractor_ID INT NOT NULL,
    Work_Package_Name VARCHAR(100) NOT NULL,
    Verified_Quantity DECIMAL(12,2) NOT NULL CHECK (Verified_Quantity >= 0),
    FOREIGN KEY (Site_ID) REFERENCES SITES(Site_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (Contractor_ID) REFERENCES CONTRACTORS(Contractor_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE MATERIALS (
    Material_ID INT PRIMARY KEY,
    Material_Name VARCHAR(100) NOT NULL,
    Unit_Of_Measure VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE SUPPLIERS (
    Supplier_ID INT PRIMARY KEY,
    Supplier_Name VARCHAR(100) NOT NULL,
    Contact_Info VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE PURCHASE_ORDERS (
    PO_ID INT PRIMARY KEY,
    Supplier_ID INT NOT NULL,
    Order_Date DATE NOT NULL,
    Expected_Delivery_Date DATE NOT NULL,
    FOREIGN KEY (Supplier_ID) REFERENCES SUPPLIERS(Supplier_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (Expected_Delivery_Date >= Order_Date)
) ENGINE=InnoDB;

CREATE TABLE DELIVERIES (
    Delivery_ID INT PRIMARY KEY,
    PO_ID INT NOT NULL,
    Site_ID INT NOT NULL,
    Delivery_Date DATE NOT NULL,
    FOREIGN KEY (PO_ID) REFERENCES PURCHASE_ORDERS(PO_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (Site_ID) REFERENCES SITES(Site_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE DELIVERY_ITEMS (
    Delivery_Item_ID INT PRIMARY KEY,
    Delivery_ID INT NOT NULL,
    Material_ID INT NOT NULL,
    Quantity_Delivered DECIMAL(12,2) NOT NULL CHECK (Quantity_Delivered > 0),
    Unit_Price DECIMAL(12,2) NOT NULL CHECK (Unit_Price >= 0),
    FOREIGN KEY (Delivery_ID) REFERENCES DELIVERIES(Delivery_ID) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Material_ID) REFERENCES MATERIALS(Material_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE SITE_STOCK (
    Stock_ID INT PRIMARY KEY,
    Site_ID INT NOT NULL,
    Material_ID INT NOT NULL,
    Quantity_Available DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (Quantity_Available >= 0),
    FOREIGN KEY (Site_ID) REFERENCES SITES(Site_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (Material_ID) REFERENCES MATERIALS(Material_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE (Site_ID, Material_ID)
) ENGINE=InnoDB;

CREATE TABLE ISSUES (
    Issue_ID INT PRIMARY KEY,
    Stock_ID INT NOT NULL,
    Work_Package_ID INT NOT NULL,
    Quantity_Issued DECIMAL(12,2) NOT NULL CHECK (Quantity_Issued > 0),
    Issue_Date DATE NOT NULL,
    FOREIGN KEY (Stock_ID) REFERENCES SITE_STOCK(Stock_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (Work_Package_ID) REFERENCES WORK_PACKAGES(Work_Package_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE LABOUR_TEAMS (
    Labour_Team_ID INT PRIMARY KEY,
    Team_Name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE PROGRESS_ENTRIES (
    Progress_ID INT PRIMARY KEY,
    Work_Package_ID INT NOT NULL,
    Labour_Team_ID INT NOT NULL,
    Percent_Complete DECIMAL(5,2) NOT NULL 
        CHECK (Percent_Complete >= 0.00 AND Percent_Complete <= 100.00),
    Progress_Date DATE NOT NULL,
    FOREIGN KEY (Work_Package_ID) REFERENCES WORK_PACKAGES(Work_Package_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (Labour_Team_ID) REFERENCES LABOUR_TEAMS(Labour_Team_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE BILLS (
    Bill_ID INT PRIMARY KEY,
    Work_Package_ID INT NOT NULL,
    Billed_Quantity DECIMAL(12,2) NOT NULL CHECK (Billed_Quantity >= 0),
    Bill_Amount DECIMAL(14,2) NOT NULL CHECK (Bill_Amount >= 0),
    Bill_Date DATE NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'Pending' 
        CHECK (Status IN ('Pending', 'Approved', 'Rejected', 'Paid')),
    FOREIGN KEY (Work_Package_ID) REFERENCES WORK_PACKAGES(Work_Package_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE PAYMENTS (
    Payment_ID INT PRIMARY KEY,
    Bill_ID INT NOT NULL,
    Amount_Paid DECIMAL(14,2) NOT NULL CHECK (Amount_Paid > 0),
    Payment_Date DATE NOT NULL,
    FOREIGN KEY (Bill_ID) REFERENCES BILLS(Bill_ID) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =============================================================================
-- SECTION 2: DYNAMIC INTEGRITY CONSTRAINTS (Triggers)
-- =============================================================================

DELIMITER //

-- Rule 1: Delivery Date cannot be prior to Purchase Order Date
CREATE TRIGGER trg_validate_delivery_date
BEFORE INSERT ON DELIVERIES
FOR EACH ROW
BEGIN
    DECLARE po_date DATE;
    SELECT Order_Date INTO po_date FROM PURCHASE_ORDERS WHERE PO_ID = NEW.PO_ID;
    IF NEW.Delivery_Date < po_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Delivery Date cannot be earlier than Purchase Order Date.';
    END IF;
END //

-- Rule 2: Material Issue within Stock
CREATE TRIGGER trg_check_stock_before_issue
BEFORE INSERT ON ISSUES
FOR EACH ROW
BEGIN
    DECLARE current_stock DECIMAL(12,2);
    SELECT Quantity_Available INTO current_stock FROM SITE_STOCK WHERE Stock_ID = NEW.Stock_ID;
    IF NEW.Quantity_Issued > current_stock THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Issued quantity exceeds available site stock.';
    END IF;
END //

-- Automatic inventory reduction upon material issuance
CREATE TRIGGER trg_deduct_stock_on_issue
AFTER INSERT ON ISSUES
FOR EACH ROW
BEGIN
    UPDATE SITE_STOCK 
    SET Quantity_Available = Quantity_Available - NEW.Quantity_Issued
    WHERE Stock_ID = NEW.Stock_ID;
END //

-- Rule 3: Billed Quantity within Verified Work
CREATE TRIGGER trg_check_billed_quantity
BEFORE INSERT ON BILLS
FOR EACH ROW
BEGIN
    DECLARE max_verified DECIMAL(12,2);
    SELECT Verified_Quantity INTO max_verified FROM WORK_PACKAGES WHERE Work_Package_ID = NEW.Work_Package_ID;
    IF NEW.Billed_Quantity > max_verified THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Billed quantity cannot exceed verified work package quantity.';
    END IF;
END //

-- Rule 4: Payment within Approved Bill & not exceeding Bill Amount
CREATE TRIGGER trg_check_payment_against_bill
BEFORE INSERT ON PAYMENTS
FOR EACH ROW
BEGIN
    DECLARE b_status VARCHAR(30);
    DECLARE b_total DECIMAL(14,2);
    DECLARE b_paid DECIMAL(14,2);

    SELECT Status, Bill_Amount INTO b_status, b_total FROM BILLS WHERE Bill_ID = NEW.Bill_ID;

    IF b_status != 'Approved' AND b_status != 'Paid' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Payment cannot be made against an unapproved bill.';
    END IF;

    SELECT COALESCE(SUM(Amount_Paid), 0.00) INTO b_paid FROM PAYMENTS WHERE Bill_ID = NEW.Bill_ID;

    IF (b_paid + NEW.Amount_Paid) > b_total THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: Cumulative payments exceed the approved bill amount.';
    END IF;
END //

-- Update Bill status to 'Paid' if cumulative payments reach bill amount
CREATE TRIGGER trg_update_bill_status_after_payment
AFTER INSERT ON PAYMENTS
FOR EACH ROW
BEGIN
    DECLARE b_total DECIMAL(14,2);
    DECLARE b_paid DECIMAL(14,2);

    SELECT Bill_Amount INTO b_total FROM BILLS WHERE Bill_ID = NEW.Bill_ID;
    SELECT SUM(Amount_Paid) INTO b_paid FROM PAYMENTS WHERE Bill_ID = NEW.Bill_ID;

    IF b_paid >= b_total THEN
        UPDATE BILLS SET Status = 'Paid' WHERE Bill_ID = NEW.Bill_ID;
    END IF;
END //

DELIMITER ;

-- =============================================================================
-- SECTION 3: COMPREHENSIVE DML SEED DATA (Consolidated & Consistent)
-- =============================================================================

-- 1. PROJECTS (15 Projects with Budget & Status)
INSERT INTO PROJECTS (Project_ID, Project_Name, Budget, Status) VALUES
(101, 'Metro Rail Station', 45000000.00, 'In Progress'),
(102, 'Green Valley Apartments', 32000000.00, 'In Progress'),
(103, 'City Hospital Complex', 58000000.00, 'In Progress'),
(104, 'Tech Park Phase 2', 40000000.00, 'In Progress'),
(105, 'Riverfront Commercial Center', 65000000.00, 'In Progress'),
(106, 'Airport Terminal Expansion', 85000000.00, 'In Progress'),
(107, 'Smart City Housing', 38000000.00, 'In Progress'),
(108, 'Industrial Park Development', 50000000.00, 'In Progress'),
(109, 'University Campus Expansion', 42000000.00, 'In Progress'),
(110, 'Central Water Treatment Plant', 30000000.00, 'In Progress'),
(111, 'Sports Complex Development', 48000000.00, 'In Progress'),
(112, 'Highway Flyover Package', 55000000.00, 'In Progress'),
(113, 'Logistics Hub Project', 36000000.00, 'In Progress'),
(114, 'Solar Manufacturing Facility', 44000000.00, 'In Progress'),
(115, 'Urban Drainage Upgrade', 25000000.00, 'In Progress');

-- 2. SITES (25 Construction Sites with Locations)
INSERT INTO SITES (Site_ID, Project_ID, Site_Name, Location) VALUES
(201, 101, 'North Station Site', 'Sector 14, Ring Road'),
(202, 101, 'South Station Site', 'Central Plaza Terminal'),
(203, 102, 'Tower A Site', 'Lake View Enclave, Block A'),
(204, 102, 'Tower B Site', 'Lake View Enclave, Block B'),
(205, 103, 'Main Hospital Site', 'Healthcare Boulevard, Ward 9'),
(206, 104, 'Tech Park Main Site', 'IT Corridor, Plot 52'),
(207, 105, 'Commercial Block A', 'Riverfront Promenade North'),
(208, 105, 'Commercial Block B', 'Riverfront Promenade South'),
(209, 106, 'Terminal Expansion Zone', 'International Airport Wing C'),
(210, 107, 'Housing Sector A', 'Smart City Phase 1'),
(211, 107, 'Housing Sector B', 'Smart City Phase 2'),
(212, 108, 'Industrial Zone A', 'MIDC Heavy Industry Area'),
(213, 109, 'Academic Block Site', 'University Campus West'),
(214, 109, 'Residential Campus Site', 'University Campus East'),
(215, 110, 'Treatment Plant Site', 'Reservoir Road North'),
(216, 111, 'Stadium Site', 'Sports City Complex A'),
(217, 111, 'Indoor Arena Site', 'Sports City Complex B'),
(218, 112, 'Flyover East Site', 'Highway NH-44, Km 12'),
(219, 112, 'Flyover West Site', 'Highway NH-44, Km 16'),
(220, 113, 'Warehouse Zone', 'Logistics Park Gate 1'),
(221, 114, 'Manufacturing Plant Site', 'Green Energy SEZ'),
(222, 115, 'Drainage Zone A', 'Municipal Catchment Area A'),
(223, 115, 'Drainage Zone B', 'Municipal Catchment Area B'),
(224, 108, 'Industrial Zone B', 'MIDC Heavy Industry Area East'),
(225, 113, 'Logistics Office Site', 'Logistics Park Gate 3');

-- 3. CONTRACTORS (10 Contractors with Contact Info)
INSERT INTO CONTRACTORS (Contractor_ID, Contractor_Name, Contact_Info) VALUES
(301, 'BuildRight Constructions', '+91-9876543210, contact@buildright.in'),
(302, 'Apex Infrastructure', '+91-9811223344, info@apexbuilders.com'),
(303, 'UrbanWorks Ltd', '+91-9922334455, support@urbanworks.in'),
(304, 'PrimeBuild Contractors', '+91-9733445566, projects@primebuild.org'),
(305, 'Vertex Civil Works', '+91-9844556677, sales@vertexcivil.in'),
(306, 'Shakti Engineering', '+91-9855667788, projects@shaktiengg.com'),
(307, 'NexGen Structures', '+91-9866778899, info@nexgenstruct.com'),
(308, 'BlueLine Projects', '+91-9877889900, contact@blueline.in'),
(309, 'CivicCore Builders', '+91-9888990011, admin@civiccore.org'),
(310, 'MegaSpan Infrastructure', '+91-9899001122, projects@megaspan.in');

-- 4. WORK PACKAGES (30 Work Packages)
INSERT INTO WORK_PACKAGES (Work_Package_ID, Site_ID, Contractor_ID, Work_Package_Name, Verified_Quantity) VALUES
(401, 201, 301, 'Site Preparation', 800.00),
(402, 201, 301, 'Foundation Work', 1200.00),
(403, 201, 302, 'Structural Framework', 1500.00),
(404, 202, 302, 'Station Finishing', 900.00),
(405, 202, 303, 'Electrical Installation', 700.00),
(406, 203, 303, 'Excavation and Foundation', 1100.00),
(407, 203, 303, 'Concrete Work', 1300.00),
(408, 204, 304, 'Masonry Work', 1000.00),
(409, 204, 304, 'Plumbing Installation', 650.00),
(410, 205, 304, 'Civil and Foundation Work', 1600.00),
(411, 205, 305, 'MEP Installation', 1000.00),
(412, 206, 302, 'Structural Framework', 1400.00),
(413, 206, 306, 'Electrical and HVAC Work', 850.00),
(414, 207, 305, 'Commercial Foundation', 1250.00),
(415, 207, 305, 'Flooring and Finishing', 900.00),
(416, 208, 307, 'Facade Installation', 750.00),
(417, 208, 307, 'Interior Works', 800.00),
(418, 209, 308, 'Terminal Structure', 1800.00),
(419, 209, 308, 'Passenger Facility Works', 1200.00),
(420, 210, 309, 'Residential Foundations', 1400.00),
(421, 211, 309, 'Residential Finishing', 1000.00),
(422, 212, 310, 'Industrial Foundations', 1700.00),
(423, 224, 310, 'Utility Installation', 900.00),
(424, 213, 306, 'Academic Building Structure', 1500.00),
(425, 214, 306, 'Campus Infrastructure', 1000.00),
(426, 215, 305, 'Treatment Plant Civil Works', 1900.00),
(427, 216, 308, 'Stadium Structure', 2000.00),
(428, 217, 308, 'Arena Systems', 1200.00),
(429, 218, 309, 'Flyover Pier Construction', 1800.00),
(430, 219, 309, 'Flyover Deck Construction', 1600.00);

-- 5. MATERIALS (15 Construction Materials with Units of Measure)
INSERT INTO MATERIALS (Material_ID, Material_Name, Unit_Of_Measure) VALUES
(501, 'Cement', 'Bags (50kg)'),
(502, 'Steel', 'Metric Tons'),
(503, 'Sand', 'Cubic Meters'),
(504, 'Bricks', 'Pieces (x1000)'),
(505, 'Electrical Cable', 'Meters'),
(506, 'Concrete Blocks', 'Pieces'),
(507, 'Aggregates', 'Cubic Meters'),
(508, 'Ready Mix Concrete', 'Cubic Meters'),
(509, 'Rebar', 'Metric Tons'),
(510, 'PVC Pipes', 'Meters'),
(511, 'Tiles', 'Square Meters'),
(512, 'Glass Panels', 'Square Meters'),
(513, 'Paint', 'Liters'),
(514, 'Structural Bolts', 'Boxes (x100)'),
(515, 'Waterproofing Membrane', 'Rolls');

-- 6. SUPPLIERS (10 Suppliers with Contact Info)
INSERT INTO SUPPLIERS (Supplier_ID, Supplier_Name, Contact_Info) VALUES
(601, 'UltraBuild Materials', '+91-8800112233, sales@ultrabuild.com'),
(602, 'National Steel Suppliers', '+91-8811223344, supply@nationalsteel.in'),
(603, 'Reliable Construction Supply', '+91-8822334455, orders@reliablesupply.com'),
(604, 'PowerTech Supplies', '+91-8833445566, corporate@powertech.com'),
(605, 'Prime Cement Distributors', '+91-8844556677, sales@primecement.in'),
(606, 'Metro Aggregates', '+91-8855667788, dispatch@metroaggregates.com'),
(607, 'SteelCore India', '+91-8866778899, bulk@steelcore.in'),
(608, 'BuildTech Products', '+91-8877889900, support@buildtech.org'),
(609, 'SafeFlow Systems', '+91-8888990011, contact@safeflow.in'),
(610, 'Urban Materials Co', '+91-8899001122, info@urbanmaterials.com');

-- 7. PURCHASE ORDERS (20 POs with Expected Delivery Date)
INSERT INTO PURCHASE_ORDERS (PO_ID, Supplier_ID, Order_Date, Expected_Delivery_Date) VALUES
(701, 601, '2026-08-01', '2026-08-05'),
(702, 602, '2026-08-03', '2026-08-07'),
(703, 603, '2026-08-05', '2026-08-09'),
(704, 604, '2026-08-07', '2026-08-11'),
(705, 605, '2026-08-10', '2026-08-14'),
(706, 606, '2026-08-12', '2026-08-16'),
(707, 607, '2026-08-15', '2026-08-19'),
(708, 608, '2026-08-18', '2026-08-22'),
(709, 609, '2026-08-20', '2026-08-24'),
(710, 610, '2026-08-22', '2026-08-26'),
(711, 601, '2026-08-25', '2026-08-29'),
(712, 602, '2026-08-27', '2026-08-31'),
(713, 603, '2026-08-29', '2026-09-02'),
(714, 604, '2026-09-01', '2026-09-05'),
(715, 605, '2026-09-03', '2026-09-07'),
(716, 606, '2026-09-05', '2026-09-09'),
(717, 607, '2026-09-07', '2026-09-11'),
(718, 608, '2026-09-09', '2026-09-13'),
(719, 609, '2026-09-11', '2026-09-15'),
(720, 610, '2026-09-13', '2026-09-17');

-- 8. DELIVERIES (30 Deliveries with valid Delivery_Date >= Order_Date)
INSERT INTO DELIVERIES (Delivery_ID, PO_ID, Site_ID, Delivery_Date) VALUES
(801, 701, 201, '2026-08-04'),
(802, 702, 201, '2026-08-06'),
(803, 703, 203, '2026-08-08'),
(804, 704, 204, '2026-08-10'),
(805, 705, 205, '2026-08-12'),
(806, 706, 206, '2026-08-14'),
(807, 707, 207, '2026-08-17'),
(808, 708, 208, '2026-08-20'),
(809, 709, 209, '2026-08-22'),
(810, 710, 210, '2026-08-24'),
(811, 711, 211, '2026-08-27'),
(812, 712, 212, '2026-08-29'),
(813, 713, 213, '2026-08-31'),
(814, 714, 214, '2026-09-03'),
(815, 715, 215, '2026-09-05'),
(816, 716, 216, '2026-09-07'),
(817, 717, 217, '2026-09-09'),
(818, 718, 218, '2026-09-11'),
(819, 719, 219, '2026-09-13'),
(820, 720, 220, '2026-09-15'),
(821, 701, 221, '2026-09-17'),
(822, 702, 222, '2026-09-19'),
(823, 703, 223, '2026-09-21'),
(824, 704, 224, '2026-09-23'),
(825, 705, 225, '2026-09-25'),
(826, 706, 201, '2026-09-27'),
(827, 707, 203, '2026-09-29'),
(828, 708, 205, '2026-10-01'),
(829, 709, 207, '2026-10-03'),
(830, 710, 209, '2026-10-05');

-- 9. DELIVERY ITEMS (38 Delivered Material Batches with Unit Prices)
INSERT INTO DELIVERY_ITEMS (Delivery_Item_ID, Delivery_ID, Material_ID, Quantity_Delivered, Unit_Price) VALUES
(901, 801, 501, 500.00, 380.00),
(902, 801, 503, 900.00, 1800.00),
(903, 802, 502, 700.00, 58000.00),
(904, 803, 501, 800.00, 385.00),
(905, 804, 504, 600.00, 7500.00),
(906, 804, 506, 500.00, 45.00),
(907, 805, 507, 1000.00, 1200.00),
(908, 806, 508, 900.00, 4200.00),
(909, 806, 509, 450.00, 56000.00),
(910, 807, 510, 650.00, 220.00),
(911, 808, 511, 550.00, 650.00),
(912, 808, 512, 400.00, 1850.00),
(913, 809, 513, 700.00, 320.00),
(914, 810, 514, 300.00, 450.00),
(915, 810, 501, 750.00, 380.00),
(916, 811, 502, 800.00, 58500.00),
(917, 812, 503, 1000.00, 1750.00),
(918, 812, 504, 900.00, 7600.00),
(919, 813, 507, 1200.00, 1250.00),
(920, 814, 508, 1100.00, 4150.00),
(921, 814, 509, 600.00, 56500.00),
(922, 815, 510, 800.00, 210.00),
(923, 816, 511, 700.00, 640.00),
(924, 817, 512, 450.00, 1900.00),
(925, 817, 513, 500.00, 330.00),
(926, 818, 514, 350.00, 460.00),
(927, 819, 515, 600.00, 850.00),
(928, 820, 501, 900.00, 385.00),
(929, 821, 502, 750.00, 58000.00),
(930, 822, 503, 1000.00, 1800.00),
(931, 823, 507, 850.00, 1200.00),
(932, 824, 508, 950.00, 4200.00),
(933, 825, 509, 500.00, 57000.00),
(934, 826, 501, 650.00, 380.00),
(935, 827, 502, 700.00, 58200.00),
(936, 828, 503, 850.00, 1780.00),
(937, 829, 504, 600.00, 7500.00),
(938, 830, 507, 900.00, 1220.00);

-- 10. SITE STOCK (25 Stock Records with Quantity Available)
INSERT INTO SITE_STOCK (Stock_ID, Site_ID, Material_ID, Quantity_Available) VALUES
(1001, 201, 501, 1200.00),
(1002, 201, 503, 1800.00),
(1003, 201, 502, 1000.00),
(1004, 202, 505, 900.00),
(1005, 202, 501, 1100.00),
(1006, 203, 501, 1500.00),
(1007, 203, 504, 1000.00),
(1008, 204, 504, 1200.00),
(1009, 204, 506, 900.00),
(1010, 205, 507, 1600.00),
(1011, 205, 508, 1200.00),
(1012, 206, 508, 1400.00),
(1013, 206, 509, 900.00),
(1014, 207, 510, 1000.00),
(1015, 207, 511, 850.00),
(1016, 208, 512, 700.00),
(1017, 208, 513, 800.00),
(1018, 209, 514, 600.00),
(1019, 209, 515, 750.00),
(1020, 210, 501, 1300.00),
(1021, 211, 502, 1100.00),
(1022, 212, 507, 1500.00),
(1023, 213, 508, 1300.00),
(1024, 214, 509, 900.00),
(1025, 215, 510, 1000.00);

-- 11. ISSUES (40 Material Issue Slips within Stock limits with Issue Dates)
INSERT INTO ISSUES (Issue_ID, Stock_ID, Work_Package_ID, Quantity_Issued, Issue_Date) VALUES
(1101, 1001, 401, 250.00, '2026-08-10'),
(1102, 1001, 402, 300.00, '2026-08-15'),
(1103, 1002, 401, 400.00, '2026-08-12'),
(1104, 1002, 402, 500.00, '2026-08-18'),
(1105, 1003, 403, 350.00, '2026-08-14'),
(1106, 1003, 403, 250.00, '2026-08-20'),
(1107, 1004, 405, 300.00, '2026-08-16'),
(1108, 1004, 405, 250.00, '2026-08-22'),
(1109, 1005, 404, 350.00, '2026-08-18'),
(1110, 1005, 404, 300.00, '2026-08-24'),
(1111, 1006, 406, 450.00, '2026-08-20'),
(1112, 1006, 407, 400.00, '2026-08-26'),
(1113, 1007, 407, 350.00, '2026-08-22'),
(1114, 1008, 408, 450.00, '2026-08-24'),
(1115, 1008, 408, 300.00, '2026-08-28'),
(1116, 1009, 409, 300.00, '2026-08-26'),
(1117, 1009, 409, 250.00, '2026-08-30'),
(1118, 1010, 410, 500.00, '2026-08-28'),
(1119, 1010, 410, 450.00, '2026-09-02'),
(1120, 1011, 411, 400.00, '2026-08-30'),
(1121, 1011, 411, 300.00, '2026-09-04'),
(1122, 1012, 412, 500.00, '2026-09-02'),
(1123, 1012, 412, 400.00, '2026-09-06'),
(1124, 1013, 413, 300.00, '2026-09-04'),
(1125, 1013, 413, 250.00, '2026-09-08'),
(1126, 1014, 414, 400.00, '2026-09-06'),
(1127, 1014, 414, 300.00, '2026-09-10'),
(1128, 1015, 415, 350.00, '2026-09-08'),
(1129, 1015, 415, 250.00, '2026-09-12'),
(1130, 1016, 416, 300.00, '2026-09-10'),
(1131, 1016, 416, 200.00, '2026-09-14'),
(1132, 1017, 417, 350.00, '2026-09-12'),
(1133, 1017, 417, 200.00, '2026-09-16'),
(1134, 1018, 418, 250.00, '2026-09-14'),
(1135, 1018, 418, 200.00, '2026-09-18'),
(1136, 1019, 419, 300.00, '2026-09-16'),
(1137, 1019, 419, 200.00, '2026-09-20'),
(1138, 1020, 420, 450.00, '2026-09-18'),
(1139, 1020, 420, 350.00, '2026-09-22'),
(1140, 1021, 421, 400.00, '2026-09-20');

-- 12. LABOUR TEAMS (10 Teams)
INSERT INTO LABOUR_TEAMS (Labour_Team_ID, Team_Name) VALUES
(1201, 'Foundation Team'),
(1202, 'Structural Team'),
(1203, 'Electrical Team'),
(1204, 'Civil Works Team'),
(1205, 'Finishing Team'),
(1206, 'MEP Team'),
(1207, 'Plumbing Team'),
(1208, 'Road Works Team'),
(1209, 'Steel Works Team'),
(1210, 'General Construction Team');

-- 13. PROGRESS ENTRIES (45 Entries with valid 0-100% Progress)
INSERT INTO PROGRESS_ENTRIES (Progress_ID, Work_Package_ID, Labour_Team_ID, Percent_Complete, Progress_Date) VALUES
(1301, 401, 1201, 35.00, '2026-09-01'),
(1302, 401, 1201, 65.00, '2026-09-20'),
(1303, 402, 1201, 40.00, '2026-09-05'),
(1304, 402, 1201, 72.00, '2026-09-25'),
(1305, 403, 1202, 30.00, '2026-09-03'),
(1306, 403, 1202, 58.00, '2026-09-24'),
(1307, 404, 1205, 45.00, '2026-09-08'),
(1308, 404, 1205, 78.00, '2026-09-28'),
(1309, 405, 1203, 35.00, '2026-09-10'),
(1310, 405, 1203, 70.00, '2026-09-30'),
(1311, 406, 1201, 42.00, '2026-09-06'),
(1312, 406, 1201, 68.00, '2026-09-26'),
(1313, 407, 1204, 38.00, '2026-09-09'),
(1314, 407, 1204, 61.00, '2026-09-27'),
(1315, 408, 1204, 50.00, '2026-09-12'),
(1316, 408, 1204, 76.00, '2026-09-29'),
(1317, 409, 1207, 32.00, '2026-09-14'),
(1318, 409, 1207, 64.00, '2026-09-30'),
(1319, 410, 1201, 40.00, '2026-09-11'),
(1320, 410, 1201, 69.00, '2026-09-29'),
(1321, 411, 1206, 28.00, '2026-09-15'),
(1322, 411, 1206, 55.00, '2026-10-01'),
(1323, 412, 1202, 35.00, '2026-09-13'),
(1324, 412, 1202, 63.00, '2026-09-30'),
(1325, 413, 1203, 25.00, '2026-09-16'),
(1326, 413, 1203, 52.00, '2026-10-02'),
(1327, 414, 1201, 33.00, '2026-09-18'),
(1328, 414, 1201, 60.00, '2026-10-01'),
(1329, 415, 1205, 41.00, '2026-09-20'),
(1330, 415, 1205, 73.00, '2026-10-03'),
(1331, 416, 1209, 30.00, '2026-09-22'),
(1332, 416, 1209, 58.00, '2026-10-04'),
(1333, 417, 1205, 36.00, '2026-09-23'),
(1334, 417, 1205, 67.00, '2026-10-05'),
(1335, 418, 1202, 27.00, '2026-09-24'),
(1336, 418, 1202, 49.00, '2026-10-01'),
(1337, 419, 1206, 31.00, '2026-09-25'),
(1338, 419, 1206, 57.00, '2026-10-03'),
(1339, 420, 1201, 44.00, '2026-09-26'),
(1340, 420, 1201, 71.00, '2026-10-04'),
(1341, 421, 1205, 38.00, '2026-09-27'),
(1342, 421, 1205, 66.00, '2026-10-05'),
(1343, 422, 1209, 29.00, '2026-09-28'),
(1344, 422, 1209, 54.00, '2026-10-05'),
(1345, 423, 1208, 47.00, '2026-09-30');

-- 14. BILLS (30 Contractor Bills, Billed_Quantity <= Verified_Quantity, with Status & Bill_Date)
INSERT INTO BILLS (Bill_ID, Work_Package_ID, Billed_Quantity, Bill_Amount, Bill_Date, Status) VALUES
(1401, 401, 500.00, 750000.00, '2026-09-08', 'Approved'),
(1402, 402, 700.00, 1050000.00, '2026-09-12', 'Approved'),
(1403, 403, 850.00, 1275000.00, '2026-09-15', 'Approved'),
(1404, 404, 600.00, 900000.00, '2026-09-18', 'Approved'),
(1405, 405, 450.00, 630000.00, '2026-09-20', 'Approved'),
(1406, 406, 650.00, 975000.00, '2026-09-22', 'Approved'),
(1407, 407, 800.00, 1120000.00, '2026-09-23', 'Approved'),
(1408, 408, 550.00, 825000.00, '2026-09-25', 'Approved'),
(1409, 409, 350.00, 490000.00, '2026-09-26', 'Approved'),
(1410, 410, 900.00, 1350000.00, '2026-09-28', 'Approved'),
(1411, 411, 500.00, 750000.00, '2026-09-29', 'Approved'),
(1412, 412, 800.00, 1200000.00, '2026-09-30', 'Approved'),
(1413, 413, 400.00, 560000.00, '2026-10-01', 'Approved'),
(1414, 414, 700.00, 1050000.00, '2026-10-01', 'Approved'),
(1415, 415, 500.00, 700000.00, '2026-10-02', 'Approved'),
(1416, 416, 400.00, 600000.00, '2026-10-02', 'Approved'),
(1417, 417, 450.00, 675000.00, '2026-10-03', 'Approved'),
(1418, 418, 1000.00, 1500000.00, '2026-10-03', 'Approved'),
(1419, 419, 650.00, 975000.00, '2026-10-04', 'Approved'),
(1420, 420, 800.00, 1200000.00, '2026-10-04', 'Approved'),
(1421, 421, 600.00, 840000.00, '2026-10-04', 'Approved'),
(1422, 422, 1000.00, 1500000.00, '2026-10-05', 'Approved'),
(1423, 423, 500.00, 700000.00, '2026-10-05', 'Approved'),
(1424, 424, 900.00, 1350000.00, '2026-10-05', 'Approved'),
(1425, 425, 600.00, 900000.00, '2026-10-05', 'Approved'),
(1426, 426, 1100.00, 1650000.00, '2026-10-05', 'Approved'),
(1427, 427, 1200.00, 1800000.00, '2026-10-05', 'Approved'),
(1428, 428, 700.00, 1050000.00, '2026-10-05', 'Approved'),
(1429, 429, 1100.00, 1650000.00, '2026-10-05', 'Approved'),
(1430, 430, 1000.00, 1500000.00, '2026-10-05', 'Approved');

-- 15. PAYMENTS (37 Payments against Approved Bills, total <= Bill_Amount)
INSERT INTO PAYMENTS (Payment_ID, Bill_ID, Amount_Paid, Payment_Date) VALUES
(1501, 1401, 300000.00, '2026-09-10'),
(1502, 1401, 200000.00, '2026-09-25'),
(1503, 1402, 500000.00, '2026-09-15'),
(1504, 1402, 250000.00, '2026-09-30'),
(1505, 1403, 600000.00, '2026-09-18'),
(1506, 1404, 450000.00, '2026-09-20'),
(1507, 1404, 200000.00, '2026-10-01'),
(1508, 1405, 300000.00, '2026-09-22'),
(1509, 1406, 500000.00, '2026-09-24'),
(1510, 1406, 200000.00, '2026-10-02'),
(1511, 1407, 700000.00, '2026-09-25'),
(1512, 1408, 400000.00, '2026-09-27'),
(1513, 1409, 250000.00, '2026-09-29'),
(1514, 1410, 800000.00, '2026-09-30'),
(1515, 1410, 250000.00, '2026-10-05'),
(1516, 1411, 350000.00, '2026-10-01'),
(1517, 1412, 600000.00, '2026-10-02'),
(1518, 1413, 300000.00, '2026-10-03'),
(1519, 1414, 550000.00, '2026-10-03'),
(1520, 1415, 400000.00, '2026-10-04'),
(1521, 1416, 350000.00, '2026-10-04'),
(1522, 1417, 450000.00, '2026-10-05'),
(1523, 1418, 900000.00, '2026-10-05'),
(1524, 1418, 300000.00, '2026-10-06'),
(1525, 1419, 500000.00, '2026-10-06'),
(1526, 1420, 700000.00, '2026-10-06'),
(1527, 1421, 500000.00, '2026-10-06'),
(1528, 1422, 900000.00, '2026-10-06'),
(1529, 1423, 350000.00, '2026-10-06'),
(1530, 1424, 800000.00, '2026-10-06'),
(1531, 1424, 250000.00, '2026-10-06'),
(1532, 1425, 500000.00, '2026-10-06'),
(1533, 1426, 1000000.00, '2026-10-06'),
(1534, 1427, 1200000.00, '2026-10-06'),
(1535, 1428, 700000.00, '2026-10-06'),
(1536, 1429, 1000000.00, '2026-10-06'),
(1537, 1430, 900000.00, '2026-10-06');

-- =============================================================================
-- SECTION 4: THE 6 MANDATORY ANALYTICAL SQL VIEWS
-- =============================================================================

-- View 1: Material Balance (Available Stock vs Total Issued per Site & Material)
CREATE OR REPLACE VIEW vw_material_balance AS
SELECT 
    s.Site_Name,
    m.Material_Name,
    m.Unit_Of_Measure,
    st.Quantity_Available AS Current_Available_Stock,
    COALESCE(SUM(i.Quantity_Issued), 0.00) AS Total_Quantity_Issued,
    (st.Quantity_Available + COALESCE(SUM(i.Quantity_Issued), 0.00)) AS Initial_Stock_Received
FROM SITE_STOCK st
JOIN SITES s ON st.Site_ID = s.Site_ID
JOIN MATERIALS m ON st.Material_ID = m.Material_ID
LEFT JOIN ISSUES i ON st.Stock_ID = i.Stock_ID
GROUP BY s.Site_Name, m.Material_Name, m.Unit_Of_Measure, st.Quantity_Available;

-- View 2: Work Progress (Latest Progress % per Work Package)
CREATE OR REPLACE VIEW vw_work_progress AS
SELECT 
    p.Project_Name,
    s.Site_Name,
    wp.Work_Package_Name,
    c.Contractor_Name,
    wp.Verified_Quantity AS Target_Quantity,
    COALESCE(MAX(pe.Percent_Complete), 0.00) AS Latest_Progress_Percent,
    CASE 
        WHEN COALESCE(MAX(pe.Percent_Complete), 0.00) = 100 THEN 'Completed'
        WHEN COALESCE(MAX(pe.Percent_Complete), 0.00) >= 50 THEN 'Advanced Stage'
        WHEN COALESCE(MAX(pe.Percent_Complete), 0.00) > 0 THEN 'Early Stage'
        ELSE 'Not Started'
    END AS Progress_Stage
FROM WORK_PACKAGES wp
JOIN SITES s ON wp.Site_ID = s.Site_ID
JOIN PROJECTS p ON s.Project_ID = p.Project_ID
JOIN CONTRACTORS c ON wp.Contractor_ID = c.Contractor_ID
LEFT JOIN PROGRESS_ENTRIES pe ON wp.Work_Package_ID = pe.Work_Package_ID
GROUP BY p.Project_Name, s.Site_Name, wp.Work_Package_ID, wp.Work_Package_Name, c.Contractor_Name, wp.Verified_Quantity;

-- View 3: Supplier Performance (Delivery Fulfillment, Lead Time, Delay Analysis)
CREATE OR REPLACE VIEW vw_supplier_performance AS
SELECT 
    sup.Supplier_ID,
    sup.Supplier_Name,
    COUNT(po.PO_ID) AS Total_Orders,
    COUNT(d.Delivery_ID) AS Total_Deliveries,
    ROUND(AVG(DATEDIFF(d.Delivery_Date, po.Order_Date)), 1) AS Avg_Lead_Time_Days,
    SUM(CASE WHEN d.Delivery_Date <= po.Expected_Delivery_Date THEN 1 ELSE 0 END) AS On_Time_Deliveries,
    SUM(CASE WHEN d.Delivery_Date > po.Expected_Delivery_Date THEN 1 ELSE 0 END) AS Delayed_Deliveries,
    ROUND((SUM(CASE WHEN d.Delivery_Date <= po.Expected_Delivery_Date THEN 1 ELSE 0 END) / COUNT(d.Delivery_ID)) * 100, 2) AS On_Time_Delivery_Rate_Pct
FROM SUPPLIERS sup
JOIN PURCHASE_ORDERS po ON sup.Supplier_ID = po.Supplier_ID
LEFT JOIN DELIVERIES d ON po.PO_ID = d.PO_ID
GROUP BY sup.Supplier_ID, sup.Supplier_Name;

-- View 4: Contractor Bills & Outstanding Payments
CREATE OR REPLACE VIEW vw_contractor_bills AS
SELECT 
    b.Bill_ID,
    c.Contractor_Name,
    wp.Work_Package_Name,
    b.Billed_Quantity,
    wp.Verified_Quantity,
    b.Bill_Amount,
    COALESCE(SUM(p.Amount_Paid), 0.00) AS Total_Amount_Paid,
    (b.Bill_Amount - COALESCE(SUM(p.Amount_Paid), 0.00)) AS Balance_Due,
    b.Status AS Bill_Status,
    b.Bill_Date
FROM BILLS b
JOIN WORK_PACKAGES wp ON b.Work_Package_ID = wp.Work_Package_ID
JOIN CONTRACTORS c ON wp.Contractor_ID = c.Contractor_ID
LEFT JOIN PAYMENTS p ON b.Bill_ID = p.Bill_ID
GROUP BY b.Bill_ID, c.Contractor_Name, wp.Work_Package_Name, b.Billed_Quantity, wp.Verified_Quantity, b.Bill_Amount, b.Status, b.Bill_Date;

-- View 5: Cost Variance Analysis (Allocated Budget vs Total Expenses)
CREATE OR REPLACE VIEW vw_cost_variance AS
SELECT 
    pr.Project_ID,
    pr.Project_Name,
    pr.Budget AS Allocated_Budget,
    COALESCE(SUM(b.Bill_Amount), 0.00) AS Total_Billed_Expenses,
    COALESCE(SUM(pay.Total_Paid), 0.00) AS Total_Disbursed,
    (pr.Budget - COALESCE(SUM(b.Bill_Amount), 0.00)) AS Cost_Variance,
    ROUND(((COALESCE(SUM(b.Bill_Amount), 0.00) / pr.Budget) * 100), 2) AS Budget_Utilization_Pct
FROM PROJECTS pr
LEFT JOIN SITES s ON pr.Project_ID = s.Project_ID
LEFT JOIN WORK_PACKAGES wp ON s.Site_ID = wp.Site_ID
LEFT JOIN BILLS b ON wp.Work_Package_ID = b.Work_Package_ID
LEFT JOIN (
    SELECT Bill_ID, SUM(Amount_Paid) AS Total_Paid 
    FROM PAYMENTS 
    GROUP BY Bill_ID
) pay ON b.Bill_ID = pay.Bill_ID
GROUP BY pr.Project_ID, pr.Project_Name, pr.Budget;

-- View 6: Project Status Summary (Executive Dashboard View)
CREATE OR REPLACE VIEW vw_project_status AS
SELECT 
    pr.Project_ID,
    pr.Project_Name,
    pr.Status AS Project_Status,
    COUNT(DISTINCT s.Site_ID) AS Total_Sites,
    COUNT(DISTINCT wp.Work_Package_ID) AS Total_Work_Packages,
    ROUND(AVG(COALESCE(pe_summary.Max_Progress, 0.00)), 2) AS Overall_Average_Progress_Pct,
    pr.Budget AS Total_Budget
FROM PROJECTS pr
LEFT JOIN SITES s ON pr.Project_ID = s.Project_ID
LEFT JOIN WORK_PACKAGES wp ON s.Site_ID = wp.Site_ID
LEFT JOIN (
    SELECT Work_Package_ID, MAX(Percent_Complete) AS Max_Progress 
    FROM PROGRESS_ENTRIES 
    GROUP BY Work_Package_ID
) pe_summary ON wp.Work_Package_ID = pe_summary.Work_Package_ID
GROUP BY pr.Project_ID, pr.Project_Name, pr.Status, pr.Budget;

-- =============================================================================
-- SECTION 5: RECORD VERIFICATION SUMMARY
-- =============================================================================
SELECT 'Database Setup Complete with Rich Dataset!' AS Message;
SELECT 'PROJECTS' AS Table_Name, COUNT(*) AS Records FROM PROJECTS
UNION ALL SELECT 'SITES', COUNT(*) FROM SITES
UNION ALL SELECT 'CONTRACTORS', COUNT(*) FROM CONTRACTORS
UNION ALL SELECT 'WORK_PACKAGES', COUNT(*) FROM WORK_PACKAGES
UNION ALL SELECT 'MATERIALS', COUNT(*) FROM MATERIALS
UNION ALL SELECT 'SUPPLIERS', COUNT(*) FROM SUPPLIERS
UNION ALL SELECT 'PURCHASE_ORDERS', COUNT(*) FROM PURCHASE_ORDERS
UNION ALL SELECT 'DELIVERIES', COUNT(*) FROM DELIVERIES
UNION ALL SELECT 'DELIVERY_ITEMS', COUNT(*) FROM DELIVERY_ITEMS
UNION ALL SELECT 'SITE_STOCK', COUNT(*) FROM SITE_STOCK
UNION ALL SELECT 'ISSUES', COUNT(*) FROM ISSUES
UNION ALL SELECT 'LABOUR_TEAMS', COUNT(*) FROM LABOUR_TEAMS
UNION ALL SELECT 'PROGRESS_ENTRIES', COUNT(*) FROM PROGRESS_ENTRIES
UNION ALL SELECT 'BILLS', COUNT(*) FROM BILLS
UNION ALL SELECT 'PAYMENTS', COUNT(*) FROM PAYMENTS;
