-- =============================================================================
-- QUICK ACCESS & INSPECTION SCRIPT: VIEW ALL TABLES AND REPORTS
-- =============================================================================
-- Database: Construction_Site_Management
-- Tip: Highlight any SELECT statement and press Ctrl + Enter to run it.
-- =============================================================================

USE Construction_Site_Management;

-- -----------------------------------------------------------------------------
-- 1. BASE ENTITIES
-- -----------------------------------------------------------------------------
-- Projects (Plural: 'PROJECTS')
SELECT * FROM PROJECTS;

-- Sites (Plural: 'SITES')
SELECT * FROM SITES;

-- Contractors (Plural: 'CONTRACTORS')
SELECT * FROM CONTRACTORS;

-- Labour Teams (Plural: 'LABOUR_TEAMS')
SELECT * FROM LABOUR_TEAMS;

-- Materials (Plural: 'MATERIALS')
SELECT * FROM MATERIALS;

-- Suppliers (Plural: 'SUPPLIERS')
SELECT * FROM SUPPLIERS;

-- -----------------------------------------------------------------------------
-- 2. OPERATIONAL & INVENTORY TABLES
-- -----------------------------------------------------------------------------
-- Work Packages
SELECT * FROM WORK_PACKAGES;

-- Purchase Orders
SELECT * FROM PURCHASE_ORDERS;

-- Deliveries
SELECT * FROM DELIVERIES;

-- Delivery Items (line items per delivery)
SELECT * FROM DELIVERY_ITEMS;

-- Current Site Stock / Warehouse levels
SELECT * FROM SITE_STOCK;

-- Material Issues (materials released to work packages)
SELECT * FROM ISSUES;

-- -----------------------------------------------------------------------------
-- 3. PROGRESS, BILLING & PAYMENTS
-- -----------------------------------------------------------------------------
-- Progress Entries (percent complete logs)
SELECT * FROM PROGRESS_ENTRIES;

-- Contractor Bills
SELECT * FROM BILLS;

-- Payment Transactions
SELECT * FROM PAYMENTS;

-- -----------------------------------------------------------------------------
-- 4. THE 6 REQUIRED ANALYTICAL REPORTS (VIEWS)
-- -----------------------------------------------------------------------------
-- Report 1: Material Balance (Available Stock vs Issued)
SELECT * FROM vw_material_balance;

-- Report 2: Work Progress by Package and Site
SELECT * FROM vw_work_progress;

-- Report 3: Supplier Reliability & Delivery Lead Times
SELECT * FROM vw_supplier_performance;

-- Report 4: Contractor Bills & Outstanding Balances Due
SELECT * FROM vw_contractor_bills;

-- Report 5: Cost Variance (Allocated Budget vs Billed Expenses)
SELECT * FROM vw_cost_variance;

-- Report 6: Executive Project Status Dashboard
SELECT * FROM vw_project_status;

-- -----------------------------------------------------------------------------
-- 5. TOTAL RECORD COUNT SUMMARY ACROSS ALL 15 TABLES
-- -----------------------------------------------------------------------------
SELECT 'PROJECTS' AS Table_Name, COUNT(*) AS Total_Rows FROM PROJECTS
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
