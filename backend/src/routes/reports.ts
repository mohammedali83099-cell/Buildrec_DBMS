import { Router, Request, Response } from 'express';
import { query, isDbConnected, memoryDb } from '../config/db.js';

const router = Router();

// ==========================================
// 1. MATERIAL BALANCE
// ==========================================
router.get('/reports/material-balance', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM vw_material_balance');
      return res.json(rows);
    }

    // Compute from memory
    const data = memoryDb.siteStock.map(st => {
      const s = memoryDb.sites.find(site => site.Site_ID === st.Site_ID);
      const m = memoryDb.materials.find(mat => mat.Material_ID === st.Material_ID);
      const issues = memoryDb.issues.filter(i => i.Stock_ID === st.Stock_ID);
      const totalIssued = issues.reduce((acc, i) => acc + i.Quantity_Issued, 0);
      return {
        Site_Name: s?.Site_Name || 'Unknown',
        Material_Name: m?.Material_Name || 'Unknown',
        Unit_Of_Measure: m?.Unit_Of_Measure || 'Units',
        Current_Available_Stock: st.Quantity_Available,
        Total_Quantity_Issued: totalIssued,
        Initial_Stock_Received: st.Quantity_Available + totalIssued
      };
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. WORK PROGRESS
// ==========================================
router.get('/reports/work-progress', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM vw_work_progress');
      return res.json(rows);
    }

    const data = memoryDb.workPackages.map(wp => {
      const s = memoryDb.sites.find(site => site.Site_ID === wp.Site_ID);
      const p = memoryDb.projects.find(proj => proj.Project_ID === s?.Project_ID);
      const c = memoryDb.contractors.find(ctr => ctr.Contractor_ID === wp.Contractor_ID);
      const entries = memoryDb.progressEntries.filter(pe => pe.Work_Package_ID === wp.Work_Package_ID);
      const maxProgress = entries.length ? Math.max(...entries.map(e => e.Percent_Complete)) : 0;
      let stage = 'Not Started';
      if (maxProgress >= 100) stage = 'Completed';
      else if (maxProgress >= 50) stage = 'Advanced Stage';
      else if (maxProgress > 0) stage = 'Early Stage';

      return {
        Project_Name: p?.Project_Name || 'Unknown',
        Site_Name: s?.Site_Name || 'Unknown',
        Work_Package_Name: wp.Work_Package_Name,
        Contractor_Name: c?.Contractor_Name || 'Unknown',
        Target_Quantity: wp.Verified_Quantity,
        Latest_Progress_Percent: maxProgress,
        Progress_Stage: stage
      };
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. SUPPLIER PERFORMANCE
// ==========================================
router.get('/reports/supplier-performance', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM vw_supplier_performance');
      return res.json(rows);
    }

    const data = memoryDb.suppliers.map(sup => {
      const pos = memoryDb.purchaseOrders.filter(po => po.Supplier_ID === sup.Supplier_ID);
      const poIds = pos.map(p => p.PO_ID);
      const delivs = memoryDb.deliveries.filter(d => poIds.includes(d.PO_ID));
      
      let onTime = 0;
      let delayed = 0;
      let totalDays = 0;

      delivs.forEach(d => {
        const po = pos.find(p => p.PO_ID === d.PO_ID);
        if (po) {
          const orderDate = new Date(po.Order_Date).getTime();
          const delivDate = new Date(d.Delivery_Date).getTime();
          const diffDays = Math.max(0, Math.round((delivDate - orderDate) / (1000 * 60 * 60 * 24)));
          totalDays += diffDays;

          const expDate = po.Expected_Delivery_Date ? new Date(po.Expected_Delivery_Date).getTime() : orderDate;
          if (delivDate <= expDate) onTime++;
          else delayed++;
        }
      });

      const avgLead = delivs.length ? (totalDays / delivs.length).toFixed(1) : '0';
      const onTimeRate = delivs.length ? ((onTime / delivs.length) * 100).toFixed(2) : '100.00';

      return {
        Supplier_ID: sup.Supplier_ID,
        Supplier_Name: sup.Supplier_Name,
        Total_Orders: pos.length,
        Total_Deliveries: delivs.length,
        Avg_Lead_Time_Days: Number(avgLead),
        On_Time_Deliveries: onTime,
        Delayed_Deliveries: delayed,
        On_Time_Delivery_Rate_Pct: Number(onTimeRate)
      };
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CONTRACTOR BILLS
// ==========================================
router.get('/reports/contractor-bills', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM vw_contractor_bills');
      return res.json(rows);
    }

    const data = memoryDb.bills.map(b => {
      const wp = memoryDb.workPackages.find(w => w.Work_Package_ID === b.Work_Package_ID);
      const c = memoryDb.contractors.find(ctr => ctr.Contractor_ID === wp?.Contractor_ID);
      const payments = memoryDb.payments.filter(p => p.Bill_ID === b.Bill_ID);
      const totalPaid = payments.reduce((acc, p) => acc + p.Amount_Paid, 0);

      return {
        Bill_ID: b.Bill_ID,
        Contractor_Name: c?.Contractor_Name || 'Unknown',
        Work_Package_Name: wp?.Work_Package_Name || 'Unknown',
        Billed_Quantity: b.Billed_Quantity,
        Verified_Quantity: wp?.Verified_Quantity || 0,
        Bill_Amount: b.Bill_Amount,
        Total_Amount_Paid: totalPaid,
        Balance_Due: b.Bill_Amount - totalPaid,
        Bill_Status: b.Status || (totalPaid >= b.Bill_Amount ? 'Paid' : 'Approved'),
        Bill_Date: b.Bill_Date || '2026-09-20'
      };
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. COST VARIANCE
// ==========================================
router.get('/reports/cost-variance', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM vw_cost_variance');
      return res.json(rows);
    }

    const data = memoryDb.projects.map(p => {
      const sites = memoryDb.sites.filter(s => s.Project_ID === p.Project_ID);
      const siteIds = sites.map(s => s.Site_ID);
      const wps = memoryDb.workPackages.filter(wp => siteIds.includes(wp.Site_ID));
      const wpIds = wps.map(w => w.Work_Package_ID);
      const bills = memoryDb.bills.filter(b => wpIds.includes(b.Work_Package_ID));
      
      const totalBilled = bills.reduce((acc, b) => acc + b.Bill_Amount, 0);
      const billIds = bills.map(b => b.Bill_ID);
      const payments = memoryDb.payments.filter(pay => billIds.includes(pay.Bill_ID));
      const totalPaid = payments.reduce((acc, pay) => acc + pay.Amount_Paid, 0);

      const budget = p.Budget || 40000000;
      const variance = budget - totalBilled;
      const utilization = ((totalBilled / budget) * 100).toFixed(2);

      return {
        Project_ID: p.Project_ID,
        Project_Name: p.Project_Name,
        Allocated_Budget: budget,
        Total_Billed_Expenses: totalBilled,
        Total_Disbursed: totalPaid,
        Cost_Variance: variance,
        Budget_Utilization_Pct: Number(utilization)
      };
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. PROJECT STATUS
// ==========================================
router.get('/reports/project-status', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM vw_project_status');
      return res.json(rows);
    }

    const data = memoryDb.projects.map(p => {
      const sites = memoryDb.sites.filter(s => s.Project_ID === p.Project_ID);
      const siteIds = sites.map(s => s.Site_ID);
      const wps = memoryDb.workPackages.filter(wp => siteIds.includes(wp.Site_ID));
      
      let sumProgress = 0;
      wps.forEach(wp => {
        const pe = memoryDb.progressEntries.filter(entry => entry.Work_Package_ID === wp.Work_Package_ID);
        const maxProg = pe.length ? Math.max(...pe.map(e => e.Percent_Complete)) : 0;
        sumProgress += maxProg;
      });
      const avgProgress = wps.length ? (sumProgress / wps.length).toFixed(2) : '0';

      return {
        Project_ID: p.Project_ID,
        Project_Name: p.Project_Name,
        Project_Status: p.Status || 'In Progress',
        Total_Sites: sites.length,
        Total_Work_Packages: wps.length,
        Overall_Average_Progress_Pct: Number(avgProgress),
        Total_Budget: p.Budget || 40000000
      };
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DASHBOARD EXECUTIVE SUMMARY
// ==========================================
router.get('/dashboard-summary', async (req: Request, res: Response) => {
  try {
    let projectCount = 0;
    let siteCount = 0;
    let contractorCount = 0;
    let workPackageCount = 0;
    let materialCount = 0;
    let totalStock = 0;
    let totalBilled = 0;
    let totalPaid = 0;
    let avgProgress = 0;

    if (isDbConnected()) {
      const [p] = await query('SELECT COUNT(*) as count FROM PROJECTS');
      const [s] = await query('SELECT COUNT(*) as count FROM SITES');
      const [c] = await query('SELECT COUNT(*) as count FROM CONTRACTORS');
      const [wp] = await query('SELECT COUNT(*) as count FROM WORK_PACKAGES');
      const [m] = await query('SELECT COUNT(*) as count FROM MATERIALS');
      const [st] = await query('SELECT COALESCE(SUM(Quantity_Available), 0) as total FROM SITE_STOCK');
      const [b] = await query('SELECT COALESCE(SUM(Bill_Amount), 0) as total FROM BILLS');
      const [pay] = await query('SELECT COALESCE(SUM(Amount_Paid), 0) as total FROM PAYMENTS');
      const [prog] = await query('SELECT COALESCE(AVG(Percent_Complete), 0) as avg FROM PROGRESS_ENTRIES');

      projectCount = p.count;
      siteCount = s.count;
      contractorCount = c.count;
      workPackageCount = wp.count;
      materialCount = m.count;
      totalStock = Number(st.total);
      totalBilled = Number(b.total);
      totalPaid = Number(pay.total);
      avgProgress = Number(Number(prog.avg).toFixed(1));
    } else {
      projectCount = memoryDb.projects.length;
      siteCount = memoryDb.sites.length;
      contractorCount = memoryDb.contractors.length;
      workPackageCount = memoryDb.workPackages.length;
      materialCount = memoryDb.materials.length;
      totalStock = memoryDb.siteStock.reduce((acc, st) => acc + st.Quantity_Available, 0);
      totalBilled = memoryDb.bills.reduce((acc, b) => acc + b.Bill_Amount, 0);
      totalPaid = memoryDb.payments.reduce((acc, p) => acc + p.Amount_Paid, 0);
      const totalProg = memoryDb.progressEntries.reduce((acc, pe) => acc + pe.Percent_Complete, 0);
      avgProgress = memoryDb.progressEntries.length ? Number((totalProg / memoryDb.progressEntries.length).toFixed(1)) : 0;
    }

    return res.json({
      projectCount,
      siteCount,
      contractorCount,
      workPackageCount,
      materialCount,
      totalStock,
      totalBilled,
      totalPaid,
      balanceDue: totalBilled - totalPaid,
      avgProgress,
      dbConnected: isDbConnected()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
