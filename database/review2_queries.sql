-- =============================================================================
-- DBMS COURSE PROJECT: REVIEW 2 QUERIES & DEMONSTRATION SCRIPT
-- =============================================================================
-- Project 44: Construction Material and Site Progress Management System
-- Demonstrates: Joins, Nested Subqueries, Aggregation, Views, and Constraint Violations
-- =============================================================================

USE Construction_Site_Management;

-- -----------------------------------------------------------------------------
-- 1. MATERIAL BALANCE REPORT (Joins + Aggregation)
-- -----------------------------------------------------------------------------
-- Calculates current stock, total material issued, and stock consumption rate.
SELECT 
    s.Site_Name,
    m.Material_Name,
    m.Unit_Of_Measure,
    st.Quantity_Available AS Current_Stock,
    COALESCE(SUM(i.Quantity_Issued), 0.00) AS Total_Issued,
    ROUND((COALESCE(SUM(i.Quantity_Issued), 0.00) / 
          (st.Quantity_Available + COALESCE(SUM(i.Quantity_Issued), 0.00))) * 100, 2) AS Consumption_Rate_Pct
FROM SITE_STOCK st
JOIN SITES s ON st.Site_ID = s.Site_ID
JOIN MATERIALS m ON st.Material_ID = m.Material_ID
LEFT JOIN ISSUES i ON st.Stock_ID = i.Stock_ID
GROUP BY s.Site_Name, m.Material_Name, m.Unit_Of_Measure, st.Quantity_Available
ORDER BY Consumption_Rate_Pct DESC;

-- -----------------------------------------------------------------------------
-- 2. WORK PROGRESS REPORT (Multi-Table Join + Window / Subquery)
-- -----------------------------------------------------------------------------
-- Retrieves work packages lagging behind 50% completion across all sites.
SELECT 
    p.Project_Name,
    s.Site_Name,
    wp.Work_Package_Name,
    c.Contractor_Name,
    COALESCE(pe.Latest_Progress, 0.00) AS Current_Progress_Pct
FROM WORK_PACKAGES wp
JOIN SITES s ON wp.Site_ID = s.Site_ID
JOIN PROJECTS p ON s.Project_ID = p.Project_ID
JOIN CONTRACTORS c ON wp.Contractor_ID = c.Contractor_ID
LEFT JOIN (
    SELECT Work_Package_ID, MAX(Percent_Complete) AS Latest_Progress
    FROM PROGRESS_ENTRIES
    GROUP BY Work_Package_ID
) pe ON wp.Work_Package_ID = pe.Work_Package_ID
WHERE COALESCE(pe.Latest_Progress, 0.00) < 50.00;

-- -----------------------------------------------------------------------------
-- 3. SUPPLIER PERFORMANCE REPORT (Aggregation + Conditional Expression)
-- -----------------------------------------------------------------------------
-- Analyzes on-time delivery rate, delayed orders, and average lead time.
SELECT 
    sup.Supplier_Name,
    COUNT(d.Delivery_ID) AS Total_Deliveries,
    ROUND(AVG(DATEDIFF(d.Delivery_Date, po.Order_Date)), 1) AS Avg_Lead_Days,
    SUM(CASE WHEN d.Delivery_Date <= po.Expected_Delivery_Date THEN 1 ELSE 0 END) AS On_Time_Count,
    SUM(CASE WHEN d.Delivery_Date > po.Expected_Delivery_Date THEN 1 ELSE 0 END) AS Delayed_Count,
    CONCAT(ROUND((SUM(CASE WHEN d.Delivery_Date <= po.Expected_Delivery_Date THEN 1 ELSE 0 END) / COUNT(d.Delivery_ID)) * 100, 1), '%') AS Reliability_Rate
FROM SUPPLIERS sup
JOIN PURCHASE_ORDERS po ON sup.Supplier_ID = po.Supplier_ID
JOIN DELIVERIES d ON po.PO_ID = d.PO_ID
GROUP BY sup.Supplier_ID, sup.Supplier_Name;

-- -----------------------------------------------------------------------------
-- 4. CONTRACTOR BILLS AND OUTSTANDING DUES (Joins + Nested Aggregation)
-- -----------------------------------------------------------------------------
-- Identifies contractors with approved bills that still have pending balances.
SELECT 
    c.Contractor_Name,
    b.Bill_ID,
    wp.Work_Package_Name,
    b.Bill_Amount,
    COALESCE(SUM(p.Amount_Paid), 0.00) AS Total_Paid,
    (b.Bill_Amount - COALESCE(SUM(p.Amount_Paid), 0.00)) AS Pending_Due
FROM BILLS b
JOIN WORK_PACKAGES wp ON b.Work_Package_ID = wp.Work_Package_ID
JOIN CONTRACTORS c ON wp.Contractor_ID = c.Contractor_ID
LEFT JOIN PAYMENTS p ON b.Bill_ID = p.Bill_ID
WHERE b.Status = 'Approved'
GROUP BY c.Contractor_Name, b.Bill_ID, wp.Work_Package_Name, b.Bill_Amount
HAVING Pending_Due > 0;

-- -----------------------------------------------------------------------------
-- 5. COST VARIANCE AND BUDGET UTILIZATION (Nested Subqueries + Aggregation)
-- -----------------------------------------------------------------------------
-- Calculates budget variance and percentage utilized per project.
SELECT 
    p.Project_ID,
    p.Project_Name,
    p.Budget AS Allocated_Budget,
    COALESCE(billed.Total_Billed, 0.00) AS Total_Incurred_Cost,
    (p.Budget - COALESCE(billed.Total_Billed, 0.00)) AS Cost_Variance,
    CONCAT(ROUND((COALESCE(billed.Total_Billed, 0.00) / p.Budget) * 100, 2), '%') AS Budget_Spent_Pct
FROM PROJECTS p
LEFT JOIN (
    SELECT s.Project_ID, SUM(b.Bill_Amount) AS Total_Billed
    FROM SITES s
    JOIN WORK_PACKAGES wp ON s.Site_ID = wp.Site_ID
    JOIN BILLS b ON wp.Work_Package_ID = b.Work_Package_ID
    GROUP BY s.Project_ID
) billed ON p.Project_ID = billed.Project_ID;

-- -----------------------------------------------------------------------------
-- 6. PROJECT STATUS SUMMARY (Views Usage)
-- -----------------------------------------------------------------------------
SELECT * FROM vw_project_status;

-- -----------------------------------------------------------------------------
-- 7. INTEGRITY CONSTRAINT DEMONSTRATION TESTS (Will Trigger Errors)
-- -----------------------------------------------------------------------------
-- Test A: Attempt to issue more stock than available (Should fail with Trigger error)
-- INSERT INTO ISSUES (Issue_ID, Stock_ID, Work_Package_ID, Quantity_Issued, Issue_Date)
-- VALUES (9999, 1001, 401, 999999.00, CURDATE());

-- Test B: Attempt to bill more than verified physical work (Should fail with Trigger error)
-- INSERT INTO BILLS (Bill_ID, Work_Package_ID, Billed_Quantity, Bill_Amount, Bill_Date, Status)
-- VALUES (9999, 401, 99999.00, 5000000.00, CURDATE(), 'Pending');

-- Test C: Attempt payment against an unapproved bill (Should fail with Trigger error)
-- INSERT INTO PAYMENTS (Payment_ID, Bill_ID, Amount_Paid, Payment_Date)
-- VALUES (9999, 1404, 10000.00, CURDATE());
