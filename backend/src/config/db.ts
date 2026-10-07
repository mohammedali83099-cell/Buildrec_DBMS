import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import * as initial from './initialData.js';

dotenv.config();

let pool: mysql.Pool | null = null;
let isConnected = false;

// Fallback in-memory state
export const memoryDb = {
  projects: [...initial.initialProjects],
  sites: [...initial.initialSites],
  contractors: [...initial.initialContractors],
  workPackages: [...initial.initialWorkPackages],
  materials: [...initial.initialMaterials],
  suppliers: [...initial.initialSuppliers],
  purchaseOrders: [...initial.initialPurchaseOrders],
  deliveries: [...initial.initialDeliveries],
  deliveryItems: [...initial.initialDeliveryItems],
  siteStock: [...initial.initialSiteStock],
  issues: [...initial.initialIssues],
  labourTeams: [...initial.initialLabourTeams],
  progressEntries: [...initial.initialProgressEntries],
  bills: [...initial.initialBills],
  payments: [...initial.initialPayments],
};

export async function initDb(): Promise<boolean> {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Construction_Site_Management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    await pool.query('SELECT 1');
    isConnected = true;
    console.log('✅ Connected to MySQL database: Construction_Site_Management');
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn('⚠️ Could not connect to MySQL directly (' + err.message + ').');
    console.warn('ℹ️ Serving verified in-memory store until DB password is set in server/.env');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  if (isConnected && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results as T;
    } catch (err: any) {
      const errorMsg = err.sqlMessage || err.message;
      throw new Error(errorMsg);
    }
  }
  throw new Error('Database is not connected');
}

/**
 * Execute transactional cascading deletes with foreign key checks safely managed.
 */
export async function executeCascadeDelete(steps: { sql: string; params?: any[] }[]): Promise<boolean> {
  if (isConnected && pool) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const step of steps) {
        await conn.query(step.sql, step.params || []);
      }
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      await conn.commit();
      return true;
    } catch (err: any) {
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      await conn.rollback();
      throw new Error(err.sqlMessage || err.message);
    } finally {
      conn.release();
    }
  }
  return false;
}

// =========================================================================
// Memory DB Cascade Deletion Helpers
// =========================================================================

export function cascadeDeleteBill(billId: number) {
  memoryDb.payments = memoryDb.payments.filter(p => p.Bill_ID !== billId);
  memoryDb.bills = memoryDb.bills.filter(b => b.Bill_ID !== billId);
}

export function cascadeDeleteWorkPackage(packageId: number) {
  const billsToDelete = memoryDb.bills.filter(b => b.Work_Package_ID === packageId);
  billsToDelete.forEach(b => cascadeDeleteBill(b.Bill_ID));

  memoryDb.progressEntries = memoryDb.progressEntries.filter(pe => pe.Work_Package_ID !== packageId);
  memoryDb.issues = memoryDb.issues.filter(i => i.Work_Package_ID !== packageId);
  memoryDb.workPackages = memoryDb.workPackages.filter(wp => wp.Work_Package_ID !== packageId);
}

export function cascadeDeleteDelivery(deliveryId: number) {
  memoryDb.deliveryItems = memoryDb.deliveryItems.filter(di => di.Delivery_ID !== deliveryId);
  memoryDb.deliveries = memoryDb.deliveries.filter(d => d.Delivery_ID !== deliveryId);
}

export function cascadeDeletePO(poId: number) {
  const deliveriesToDelete = memoryDb.deliveries.filter(d => d.PO_ID === poId);
  deliveriesToDelete.forEach(d => cascadeDeleteDelivery(d.Delivery_ID));
  memoryDb.purchaseOrders = memoryDb.purchaseOrders.filter(po => po.PO_ID !== poId);
}

export function cascadeDeleteSupplier(supplierId: number) {
  const posToDelete = memoryDb.purchaseOrders.filter(po => po.Supplier_ID === supplierId);
  posToDelete.forEach(po => cascadeDeletePO(po.PO_ID));
  memoryDb.suppliers = memoryDb.suppliers.filter(s => s.Supplier_ID !== supplierId);
}

export function cascadeDeleteSite(siteId: number) {
  // 1. Remove all deliveries to this site
  const deliveries = memoryDb.deliveries.filter(d => d.Site_ID === siteId);
  deliveries.forEach(d => cascadeDeleteDelivery(d.Delivery_ID));

  // 2. Remove all work packages for this site
  const packages = memoryDb.workPackages.filter(wp => wp.Site_ID === siteId);
  packages.forEach(wp => cascadeDeleteWorkPackage(wp.Work_Package_ID));

  // 3. Remove site stock
  memoryDb.siteStock = memoryDb.siteStock.filter(ss => ss.Site_ID !== siteId);

  // 4. Remove labour teams
  memoryDb.labourTeams = memoryDb.labourTeams.filter(lt => (lt as any).Site_ID !== siteId);

  // 5. Remove site
  memoryDb.sites = memoryDb.sites.filter(s => s.Site_ID !== siteId);
}

export function cascadeDeleteProject(projectId: number) {
  const sites = memoryDb.sites.filter(s => s.Project_ID === projectId);
  sites.forEach(s => cascadeDeleteSite(s.Site_ID));
  memoryDb.projects = memoryDb.projects.filter(p => p.Project_ID !== projectId);
}

export function cascadeDeleteContractor(contractorId: number) {
  const packages = memoryDb.workPackages.filter(wp => wp.Contractor_ID === contractorId);
  packages.forEach(wp => cascadeDeleteWorkPackage(wp.Work_Package_ID));
  memoryDb.contractors = memoryDb.contractors.filter(c => c.Contractor_ID !== contractorId);
}

export function cascadeDeleteMaterial(materialId: number) {
  memoryDb.deliveryItems = memoryDb.deliveryItems.filter(di => di.Material_ID !== materialId);
  memoryDb.siteStock = memoryDb.siteStock.filter(ss => ss.Material_ID !== materialId);
  memoryDb.issues = memoryDb.issues.filter(i => (i as any).Material_ID !== materialId);
  memoryDb.materials = memoryDb.materials.filter(m => m.Material_ID !== materialId);
}
