# BUILDREC Database Layer

This directory contains the complete MySQL database setup, schema definitions, triggers, views, and analytical query scripts for the **BUILDREC Construction Site Management System**.

## Contents

- **`database_setup.sql`**: Full DDL and DML script including:
  - `CREATE DATABASE IF NOT EXISTS Construction_Site_Management;`
  - 15 Normalized relational tables (3NF):
    1. `PROJECT`
    2. `SITE`
    3. `MATERIAL`
    4. `SUPPLIER`
    5. `PURCHASE_ORDER`
    6. `DELIVERY`
    7. `DELIVERY_ITEM`
    8. `SITE_STOCK`
    9. `CONTRACTOR`
    10. `LABOUR_TEAM`
    11. `WORK_PACKAGE`
    12. `MATERIAL_ISSUE`
    13. `PROGRESS_ENTRY`
    14. `CONTRACTOR_BILL`
    15. `PAYMENT`
  - Automated triggers:
    - `trg_after_delivery_item_insert`: Automatically increments `SITE_STOCK` when items are received at a site.
    - `trg_after_material_issue_insert`: Automatically decrements `SITE_STOCK` and validates sufficient inventory.
    - `trg_after_payment_insert`: Automatically marks contractor bills as `'PAID'` once fully disbursed.
    - Validation triggers for milestone progress and billing amount limits.
  - Analytical views:
    - `vw_project_financial_summary`: High-level project-wise billed vs paid amounts.
    - `vw_site_material_inventory`: Live material stock levels per site.
    - `vw_contractor_work_summary`: Work package assignments and progress per contractor.
    - `vw_supplier_delivery_performance`: Deliveries and material quantities supplied.

- **`review2_queries.sql`**: Set of analytical, aggregation, nested join, and reporting queries designed for administrative reviews and analytics dashboards.

- **`view_all_tables.sql`**: Diagnostic script that queries `SELECT *` from all 15 tables for quick verification of data state.

## Setup Instructions

```bash
# Log in to MySQL and execute the setup script:
mysql -u root -p < database/database_setup.sql
```
