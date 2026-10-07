import { Router, Request, Response } from 'express';
import { 
  query, 
  isDbConnected, 
  memoryDb, 
  executeCascadeDelete, 
  cascadeDeleteMaterial 
} from '../config/db.js';

const router = Router();

// ==========================================
// MATERIALS
// ==========================================
router.get('/materials', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT *, Unit_Of_Measure AS Unit FROM MATERIALS ORDER BY Material_ID ASC');
      return res.json(rows);
    }
    const joined = memoryDb.materials.map(m => ({
      ...m,
      Unit: m.Unit_Of_Measure || m.Unit || 'units'
    }));
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/materials', async (req: Request, res: Response) => {
  const { Material_ID, Material_Name, Unit, Unit_Of_Measure } = req.body;
  const unitVal = Unit_Of_Measure || Unit;
  if (!Material_ID || !Material_Name || !unitVal) {
    return res.status(400).json({ error: 'Material_ID, Material_Name, and Unit are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO MATERIALS (Material_ID, Material_Name, Unit_Of_Measure) VALUES (?, ?, ?)',
        [Number(Material_ID), Material_Name, unitVal]
      );
      return res.status(201).json({ message: 'Material added successfully' });
    }
    if (memoryDb.materials.some(m => m.Material_ID === Number(Material_ID))) {
      return res.status(400).json({ error: 'Material_ID already exists.' });
    }
    const newMat = { 
      Material_ID: Number(Material_ID), 
      Material_Name, 
      Unit_Of_Measure: unitVal,
      Unit: unitVal 
    };
    memoryDb.materials.push(newMat);
    return res.status(201).json({ message: 'Material added successfully', data: newMat });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/materials/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Material_Name, Unit, Unit_Of_Measure } = req.body;
  const unitVal = Unit_Of_Measure || Unit;
  if (!Material_Name || !unitVal) {
    return res.status(400).json({ error: 'Material_Name and Unit are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE MATERIALS SET Material_Name = ?, Unit_Of_Measure = ? WHERE Material_ID = ?',
        [Material_Name, unitVal, id]
      );
      return res.json({ message: 'Material updated successfully' });
    }
    const mat = memoryDb.materials.find(m => m.Material_ID === id);
    if (!mat) return res.status(404).json({ error: 'Material not found.' });
    mat.Material_Name = Material_Name;
    mat.Unit_Of_Measure = unitVal;
    mat.Unit = unitVal;
    return res.json({ message: 'Material updated successfully', data: mat });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/materials/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        { sql: 'DELETE FROM DELIVERY_ITEMS WHERE Material_ID = ?', params: [id] },
        { sql: 'DELETE FROM SITE_STOCK WHERE Material_ID = ?', params: [id] },
        { sql: 'DELETE FROM ISSUES WHERE Stock_ID IN (SELECT Stock_ID FROM SITE_STOCK WHERE Material_ID = ?)', params: [id] },
        { sql: 'DELETE FROM MATERIALS WHERE Material_ID = ?', params: [id] }
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Material and associated stock/records deleted successfully.' });
    }

    const idx = memoryDb.materials.findIndex(m => m.Material_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Material not found' });
    cascadeDeleteMaterial(id);
    return res.json({ message: 'Material and associated stock/records deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// SITE STOCK
// ==========================================
router.get('/site-stock', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT ss.*, ss.Quantity_Available AS Current_Stock, s.Site_Name, m.Material_Name, m.Unit_Of_Measure AS Unit 
        FROM SITE_STOCK ss 
        LEFT JOIN SITES s ON ss.Site_ID = s.Site_ID 
        LEFT JOIN MATERIALS m ON ss.Material_ID = m.Material_ID 
        ORDER BY ss.Stock_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.siteStock.map(ss => {
      const s = memoryDb.sites.find(site => site.Site_ID === ss.Site_ID);
      const m = memoryDb.materials.find(mat => mat.Material_ID === ss.Material_ID);
      const qty = ss.Quantity_Available ?? ss.Current_Stock ?? 0;
      return {
        ...ss,
        Current_Stock: qty,
        Quantity_Available: qty,
        Site_Name: s?.Site_Name || 'Unknown',
        Material_Name: m?.Material_Name || 'Unknown',
        Unit: m?.Unit_Of_Measure || m?.Unit || 'units'
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/site-stock', async (req: Request, res: Response) => {
  const { Stock_ID, Site_ID, Material_ID, Current_Stock, Quantity_Available } = req.body;
  const qty = Number(Current_Stock ?? Quantity_Available ?? 0);
  if (!Site_ID || !Material_ID || isNaN(qty)) {
    return res.status(400).json({ error: 'Site_ID, Material_ID, and Current_Stock are required.' });
  }
  const stockId = Stock_ID ? Number(Stock_ID) : (isDbConnected() ? Math.floor(1000 + Math.random() * 9000) : (Math.max(...memoryDb.siteStock.map(s => s.Stock_ID), 400) + 1));
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO SITE_STOCK (Stock_ID, Site_ID, Material_ID, Quantity_Available) VALUES (?, ?, ?, ?)',
        [stockId, Number(Site_ID), Number(Material_ID), qty]
      );
      return res.status(201).json({ message: 'Site stock registered successfully' });
    }
    if (!memoryDb.sites.some(s => s.Site_ID === Number(Site_ID))) {
      return res.status(400).json({ error: 'Site_ID does not exist.' });
    }
    if (!memoryDb.materials.some(m => m.Material_ID === Number(Material_ID))) {
      return res.status(400).json({ error: 'Material_ID does not exist.' });
    }
    const newStock = {
      Stock_ID: stockId,
      Site_ID: Number(Site_ID),
      Material_ID: Number(Material_ID),
      Quantity_Available: qty,
      Current_Stock: qty
    };
    memoryDb.siteStock.push(newStock);
    return res.status(201).json({ message: 'Site stock registered successfully', data: newStock });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/site-stock/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Current_Stock, Quantity_Available } = req.body;
  const qty = Number(Current_Stock ?? Quantity_Available);
  if (isNaN(qty) || qty < 0) {
    return res.status(400).json({ error: 'Valid Current_Stock (>= 0) is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE SITE_STOCK SET Quantity_Available = ? WHERE Stock_ID = ?',
        [qty, id]
      );
      return res.json({ message: 'Stock level updated successfully' });
    }
    const item = memoryDb.siteStock.find(ss => ss.Stock_ID === id);
    if (!item) return res.status(404).json({ error: 'Stock record not found' });
    item.Quantity_Available = qty;
    item.Current_Stock = qty;
    return res.json({ message: 'Stock level updated successfully', data: item });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/site-stock/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        { sql: 'DELETE FROM ISSUES WHERE Stock_ID = ?', params: [id] },
        { sql: 'DELETE FROM SITE_STOCK WHERE Stock_ID = ?', params: [id] }
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Stock record and linked issues deleted successfully' });
    }
    const idx = memoryDb.siteStock.findIndex(ss => ss.Stock_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Stock record not found' });
    memoryDb.issues = memoryDb.issues.filter(i => i.Stock_ID !== id);
    memoryDb.siteStock.splice(idx, 1);
    return res.json({ message: 'Stock record and linked issues deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// MATERIAL ISSUES
// ==========================================
router.get('/issues', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT i.*, i.Quantity_Issued AS Issued_Quantity, ss.Site_ID, ss.Material_ID, 
               s.Site_Name, m.Material_Name, m.Unit_Of_Measure AS Unit, 
               wp.Work_Package_Name AS Package_Name, wp.Work_Package_ID AS Package_ID 
        FROM ISSUES i 
        LEFT JOIN SITE_STOCK ss ON i.Stock_ID = ss.Stock_ID 
        LEFT JOIN SITES s ON ss.Site_ID = s.Site_ID 
        LEFT JOIN MATERIALS m ON ss.Material_ID = m.Material_ID 
        LEFT JOIN WORK_PACKAGES wp ON i.Work_Package_ID = wp.Work_Package_ID 
        ORDER BY i.Issue_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.issues.map(iss => {
      const stock = memoryDb.siteStock.find(ss => ss.Stock_ID === iss.Stock_ID);
      const s = stock ? memoryDb.sites.find(site => site.Site_ID === stock.Site_ID) : null;
      const m = stock ? memoryDb.materials.find(mat => mat.Material_ID === stock.Material_ID) : null;
      const wp = memoryDb.workPackages.find(p => p.Work_Package_ID === iss.Work_Package_ID);
      const qty = iss.Quantity_Issued ?? iss.Issued_Quantity ?? 0;
      return {
        ...iss,
        Issued_Quantity: qty,
        Quantity_Issued: qty,
        Site_ID: stock?.Site_ID,
        Material_ID: stock?.Material_ID,
        Package_ID: iss.Work_Package_ID,
        Site_Name: s?.Site_Name || 'Unknown',
        Material_Name: m?.Material_Name || 'Unknown',
        Unit: m?.Unit_Of_Measure || m?.Unit || 'units',
        Package_Name: wp?.Work_Package_Name || wp?.Package_Name || 'Unknown'
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/issues', async (req: Request, res: Response) => {
  const { Issue_ID, Stock_ID, Site_ID, Material_ID, Package_ID, Work_Package_ID, Issued_Quantity, Quantity_Issued, Issue_Date } = req.body;
  const pkgId = Number(Package_ID || Work_Package_ID);
  const qty = Number(Issued_Quantity || Quantity_Issued);
  
  if (!Issue_ID || !pkgId || !qty || !Issue_Date) {
    return res.status(400).json({ error: 'Issue_ID, Package_ID, Issued_Quantity, and Issue_Date are required.' });
  }

  try {
    let resolvedStockId = Stock_ID ? Number(Stock_ID) : null;

    if (isDbConnected()) {
      if (!resolvedStockId && Site_ID && Material_ID) {
        const stockRows: any[] = await query('SELECT Stock_ID FROM SITE_STOCK WHERE Site_ID = ? AND Material_ID = ? LIMIT 1', [Number(Site_ID), Number(Material_ID)]);
        if (stockRows.length > 0) resolvedStockId = stockRows[0].Stock_ID;
      }
      if (!resolvedStockId) {
        const defaultStock: any[] = await query('SELECT Stock_ID FROM SITE_STOCK LIMIT 1');
        resolvedStockId = defaultStock.length > 0 ? defaultStock[0].Stock_ID : 401;
      }

      await query(
        'INSERT INTO ISSUES (Issue_ID, Stock_ID, Work_Package_ID, Quantity_Issued, Issue_Date) VALUES (?, ?, ?, ?, ?)',
        [Number(Issue_ID), resolvedStockId, pkgId, qty, Issue_Date]
      );
      return res.status(201).json({ message: 'Material issue logged and stock deducted' });
    }

    if (memoryDb.issues.some(i => i.Issue_ID === Number(Issue_ID))) {
      return res.status(400).json({ error: 'Issue_ID already exists.' });
    }

    let stockRow = Site_ID && Material_ID 
      ? memoryDb.siteStock.find(s => s.Site_ID === Number(Site_ID) && s.Material_ID === Number(Material_ID))
      : memoryDb.siteStock.find(s => s.Stock_ID === resolvedStockId);

    if (!stockRow) {
      stockRow = memoryDb.siteStock[0];
    }

    const available = stockRow.Quantity_Available ?? stockRow.Current_Stock ?? 0;
    if (available < qty) {
      return res.status(400).json({ error: `Insufficient stock! Available: ${available}, Requested: ${qty}` });
    }

    stockRow.Quantity_Available = available - qty;
    stockRow.Current_Stock = stockRow.Quantity_Available;

    const newIssue = {
      Issue_ID: Number(Issue_ID),
      Stock_ID: stockRow.Stock_ID,
      Work_Package_ID: pkgId,
      Package_ID: pkgId,
      Quantity_Issued: qty,
      Issued_Quantity: qty,
      Issue_Date
    };
    memoryDb.issues.push(newIssue);
    return res.status(201).json({ message: 'Material issue logged and stock deducted', data: newIssue });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/issues/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Issued_Quantity, Quantity_Issued, Issue_Date } = req.body;
  const qty = Number(Issued_Quantity || Quantity_Issued);
  if (!qty || !Issue_Date) {
    return res.status(400).json({ error: 'Issued_Quantity and Issue_Date are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE ISSUES SET Quantity_Issued = ?, Issue_Date = ? WHERE Issue_ID = ?',
        [qty, Issue_Date, id]
      );
      return res.json({ message: 'Material issue updated successfully' });
    }
    const issue = memoryDb.issues.find(i => i.Issue_ID === id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    issue.Quantity_Issued = qty;
    issue.Issued_Quantity = qty;
    issue.Issue_Date = Issue_Date;
    return res.json({ message: 'Material issue updated successfully', data: issue });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/issues/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      await query('DELETE FROM ISSUES WHERE Issue_ID = ?', [id]);
      return res.json({ message: 'Issue record deleted successfully' });
    }
    const idx = memoryDb.issues.findIndex(i => i.Issue_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Issue record not found' });
    memoryDb.issues.splice(idx, 1);
    return res.json({ message: 'Issue record deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
