import { Router, Request, Response } from 'express';
import { 
  query, 
  isDbConnected, 
  memoryDb, 
  executeCascadeDelete, 
  cascadeDeleteSupplier, 
  cascadeDeletePO, 
  cascadeDeleteDelivery 
} from '../config/db.js';

const router = Router();

// ==========================================
// SUPPLIERS
// ==========================================
router.get('/suppliers', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM SUPPLIERS ORDER BY Supplier_ID ASC');
      return res.json(rows);
    }
    return res.json(memoryDb.suppliers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/suppliers', async (req: Request, res: Response) => {
  const { Supplier_ID, Supplier_Name, Contact_Info } = req.body;
  if (!Supplier_ID || !Supplier_Name) {
    return res.status(400).json({ error: 'Supplier_ID and Supplier_Name are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO SUPPLIERS (Supplier_ID, Supplier_Name, Contact_Info) VALUES (?, ?, ?)',
        [Number(Supplier_ID), Supplier_Name, Contact_Info || 'General Contact']
      );
      return res.status(201).json({ message: 'Supplier added successfully' });
    }
    if (memoryDb.suppliers.some(s => s.Supplier_ID === Number(Supplier_ID))) {
      return res.status(400).json({ error: 'Supplier_ID already exists.' });
    }
    const newSup = { Supplier_ID: Number(Supplier_ID), Supplier_Name, Contact_Info: Contact_Info || 'General Contact' };
    memoryDb.suppliers.push(newSup);
    return res.status(201).json({ message: 'Supplier added successfully', data: newSup });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/suppliers/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Supplier_Name, Contact_Info } = req.body;
  if (!Supplier_Name) {
    return res.status(400).json({ error: 'Supplier_Name is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE SUPPLIERS SET Supplier_Name = ?, Contact_Info = COALESCE(?, Contact_Info) WHERE Supplier_ID = ?',
        [Supplier_Name, Contact_Info || null, id]
      );
      return res.json({ message: 'Supplier updated successfully' });
    }
    const sup = memoryDb.suppliers.find(s => s.Supplier_ID === id);
    if (!sup) return res.status(404).json({ error: 'Supplier not found.' });
    sup.Supplier_Name = Supplier_Name;
    if (Contact_Info) sup.Contact_Info = Contact_Info;
    return res.json({ message: 'Supplier updated successfully', data: sup });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/suppliers/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const pos: any[] = await query('SELECT PO_ID FROM PURCHASE_ORDERS WHERE Supplier_ID = ?', [id]);
      const poIds = pos.map(p => p.PO_ID);

      const steps: { sql: string; params?: any[] }[] = [];
      if (poIds.length > 0) {
        steps.push({
          sql: `DELETE di FROM DELIVERY_ITEMS di 
                INNER JOIN DELIVERIES d ON di.Delivery_ID = d.Delivery_ID 
                WHERE d.PO_ID IN (?)`,
          params: [poIds]
        });
        steps.push({ sql: 'DELETE FROM DELIVERIES WHERE PO_ID IN (?)', params: [poIds] });
        steps.push({ sql: 'DELETE FROM PURCHASE_ORDERS WHERE Supplier_ID = ?', params: [id] });
      }
      steps.push({ sql: 'DELETE FROM SUPPLIERS WHERE Supplier_ID = ?', params: [id] });

      await executeCascadeDelete(steps);
      return res.json({ message: 'Supplier and linked purchase orders deleted successfully.' });
    }

    const idx = memoryDb.suppliers.findIndex(s => s.Supplier_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Supplier not found' });
    cascadeDeleteSupplier(id);
    return res.json({ message: 'Supplier and linked purchase orders deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// PURCHASE ORDERS
// ==========================================
router.get('/purchase-orders', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT po.*, s.Supplier_Name 
        FROM PURCHASE_ORDERS po 
        LEFT JOIN SUPPLIERS s ON po.Supplier_ID = s.Supplier_ID 
        ORDER BY po.PO_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.purchaseOrders.map(po => {
      const s = memoryDb.suppliers.find(sup => sup.Supplier_ID === po.Supplier_ID);
      return { ...po, Supplier_Name: s?.Supplier_Name || 'Unknown' };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/purchase-orders', async (req: Request, res: Response) => {
  const { PO_ID, Supplier_ID, Order_Date, Expected_Delivery_Date } = req.body;
  const expDate = Expected_Delivery_Date || Order_Date;
  if (!PO_ID || !Supplier_ID || !Order_Date) {
    return res.status(400).json({ error: 'PO_ID, Supplier_ID, and Order_Date are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO PURCHASE_ORDERS (PO_ID, Supplier_ID, Order_Date, Expected_Delivery_Date) VALUES (?, ?, ?, ?)',
        [Number(PO_ID), Number(Supplier_ID), Order_Date, expDate]
      );
      return res.status(201).json({ message: 'PO created successfully' });
    }
    if (memoryDb.purchaseOrders.some(p => p.PO_ID === Number(PO_ID))) {
      return res.status(400).json({ error: 'PO_ID already exists.' });
    }
    if (!memoryDb.suppliers.some(s => s.Supplier_ID === Number(Supplier_ID))) {
      return res.status(400).json({ error: 'Supplier_ID does not exist.' });
    }
    const newPO = { 
      PO_ID: Number(PO_ID), 
      Supplier_ID: Number(Supplier_ID), 
      Order_Date,
      Expected_Delivery_Date: expDate
    };
    memoryDb.purchaseOrders.push(newPO);
    return res.status(201).json({ message: 'PO created successfully', data: newPO });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/purchase-orders/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Supplier_ID, Order_Date, Expected_Delivery_Date } = req.body;
  if (!Order_Date) {
    return res.status(400).json({ error: 'Order_Date is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE PURCHASE_ORDERS SET Order_Date = ?, Supplier_ID = COALESCE(?, Supplier_ID), Expected_Delivery_Date = COALESCE(?, Expected_Delivery_Date) WHERE PO_ID = ?',
        [Order_Date, Supplier_ID ? Number(Supplier_ID) : null, Expected_Delivery_Date || null, id]
      );
      return res.json({ message: 'Purchase Order updated successfully' });
    }
    const po = memoryDb.purchaseOrders.find(p => p.PO_ID === id);
    if (!po) return res.status(404).json({ error: 'Purchase Order not found.' });
    if (Supplier_ID && !memoryDb.suppliers.some(s => s.Supplier_ID === Number(Supplier_ID))) {
      return res.status(400).json({ error: 'Supplier_ID does not exist.' });
    }
    po.Order_Date = Order_Date;
    if (Supplier_ID) po.Supplier_ID = Number(Supplier_ID);
    if (Expected_Delivery_Date) po.Expected_Delivery_Date = Expected_Delivery_Date;
    return res.json({ message: 'Purchase Order updated successfully', data: po });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/purchase-orders/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        {
          sql: `DELETE di FROM DELIVERY_ITEMS di 
                INNER JOIN DELIVERIES d ON di.Delivery_ID = d.Delivery_ID 
                WHERE d.PO_ID = ?`,
          params: [id]
        },
        { sql: 'DELETE FROM DELIVERIES WHERE PO_ID = ?', params: [id] },
        { sql: 'DELETE FROM PURCHASE_ORDERS WHERE PO_ID = ?', params: [id] }
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Purchase order and linked deliveries deleted successfully.' });
    }

    const idx = memoryDb.purchaseOrders.findIndex(p => p.PO_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'PO not found' });
    cascadeDeletePO(id);
    return res.json({ message: 'Purchase order and linked deliveries deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// DELIVERIES
// ==========================================
router.get('/deliveries', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT d.*, s.Site_Name 
        FROM DELIVERIES d 
        LEFT JOIN SITES s ON d.Site_ID = s.Site_ID 
        ORDER BY d.Delivery_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.deliveries.map(d => {
      const s = memoryDb.sites.find(site => site.Site_ID === d.Site_ID);
      return { 
        ...d, 
        Site_Name: s?.Site_Name || 'Unknown',
        Challan_No: d.Challan_No || `CHAL-${d.Delivery_ID}`,
        Received_By: d.Received_By || 'Site Supervisor'
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deliveries', async (req: Request, res: Response) => {
  const { Delivery_ID, PO_ID, Site_ID, Delivery_Date, Challan_No, Received_By } = req.body;
  if (!Delivery_ID || !PO_ID || !Site_ID || !Delivery_Date) {
    return res.status(400).json({ error: 'Delivery_ID, PO_ID, Site_ID, and Delivery_Date are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO DELIVERIES (Delivery_ID, PO_ID, Site_ID, Delivery_Date) VALUES (?, ?, ?, ?)',
        [Number(Delivery_ID), Number(PO_ID), Number(Site_ID), Delivery_Date]
      );
      return res.status(201).json({ message: 'Delivery record created successfully' });
    }

    if (memoryDb.deliveries.some(d => d.Delivery_ID === Number(Delivery_ID))) {
      return res.status(400).json({ error: 'Delivery_ID already exists.' });
    }
    if (!memoryDb.purchaseOrders.some(p => p.PO_ID === Number(PO_ID))) {
      return res.status(400).json({ error: 'PO_ID does not exist.' });
    }
    if (!memoryDb.sites.some(s => s.Site_ID === Number(Site_ID))) {
      return res.status(400).json({ error: 'Site_ID does not exist.' });
    }

    const newDel = {
      Delivery_ID: Number(Delivery_ID),
      PO_ID: Number(PO_ID),
      Site_ID: Number(Site_ID),
      Delivery_Date,
      Challan_No: Challan_No || `CHAL-${Delivery_ID}`,
      Received_By: Received_By || 'Site Supervisor'
    };
    memoryDb.deliveries.push(newDel);
    return res.status(201).json({ message: 'Delivery record created successfully', data: newDel });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/deliveries/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { PO_ID, Site_ID, Delivery_Date, Challan_No, Received_By } = req.body;
  if (!Delivery_Date) {
    return res.status(400).json({ error: 'Delivery_Date is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE DELIVERIES SET Delivery_Date = ?, PO_ID = COALESCE(?, PO_ID), Site_ID = COALESCE(?, Site_ID) WHERE Delivery_ID = ?',
        [Delivery_Date, PO_ID ? Number(PO_ID) : null, Site_ID ? Number(Site_ID) : null, id]
      );
      return res.json({ message: 'Delivery updated successfully' });
    }
    const del = memoryDb.deliveries.find(d => d.Delivery_ID === id);
    if (!del) return res.status(404).json({ error: 'Delivery not found.' });
    del.Delivery_Date = Delivery_Date;
    if (Challan_No) del.Challan_No = Challan_No;
    if (Received_By) del.Received_By = Received_By;
    if (PO_ID) del.PO_ID = Number(PO_ID);
    if (Site_ID) del.Site_ID = Number(Site_ID);
    return res.json({ message: 'Delivery updated successfully', data: del });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/deliveries/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        { sql: 'DELETE FROM DELIVERY_ITEMS WHERE Delivery_ID = ?', params: [id] },
        { sql: 'DELETE FROM DELIVERIES WHERE Delivery_ID = ?', params: [id] }
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Delivery and items deleted successfully' });
    }

    const idx = memoryDb.deliveries.findIndex(d => d.Delivery_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Delivery not found' });
    cascadeDeleteDelivery(id);
    return res.json({ message: 'Delivery and items deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// DELIVERY ITEMS
// ==========================================
router.get('/delivery-items', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT di.*, di.Quantity_Delivered AS Delivered_Quantity, m.Material_Name, m.Unit_Of_Measure AS Unit 
        FROM DELIVERY_ITEMS di 
        LEFT JOIN MATERIALS m ON di.Material_ID = m.Material_ID 
        ORDER BY di.Delivery_Item_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.deliveryItems.map(di => {
      const m = memoryDb.materials.find(mat => mat.Material_ID === di.Material_ID);
      const qty = di.Quantity_Delivered ?? di.Delivered_Quantity ?? 0;
      return { 
        ...di, 
        Quantity_Delivered: qty,
        Delivered_Quantity: qty,
        Material_Name: m?.Material_Name || 'Unknown', 
        Unit: m?.Unit_Of_Measure || m?.Unit || 'units' 
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/delivery-items', async (req: Request, res: Response) => {
  const { Delivery_Item_ID, Delivery_ID, Material_ID, Delivered_Quantity, Quantity_Delivered, Unit_Price, Inspected_Status } = req.body;
  const qty = Number(Delivered_Quantity ?? Quantity_Delivered);
  if (!Delivery_Item_ID || !Delivery_ID || !Material_ID || isNaN(qty)) {
    return res.status(400).json({ error: 'Delivery_Item_ID, Delivery_ID, Material_ID, and Delivered_Quantity are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO DELIVERY_ITEMS (Delivery_Item_ID, Delivery_ID, Material_ID, Quantity_Delivered, Unit_Price) VALUES (?, ?, ?, ?, ?)',
        [Number(Delivery_Item_ID), Number(Delivery_ID), Number(Material_ID), qty, Number(Unit_Price || 500)]
      );
      return res.status(201).json({ message: 'Delivery item recorded successfully' });
    }

    if (memoryDb.deliveryItems.some(di => di.Delivery_Item_ID === Number(Delivery_Item_ID))) {
      return res.status(400).json({ error: 'Delivery_Item_ID already exists.' });
    }
    if (!memoryDb.deliveries.some(d => d.Delivery_ID === Number(Delivery_ID))) {
      return res.status(400).json({ error: 'Delivery_ID does not exist.' });
    }
    if (!memoryDb.materials.some(m => m.Material_ID === Number(Material_ID))) {
      return res.status(400).json({ error: 'Material_ID does not exist.' });
    }

    const newItem = {
      Delivery_Item_ID: Number(Delivery_Item_ID),
      Delivery_ID: Number(Delivery_ID),
      Material_ID: Number(Material_ID),
      Quantity_Delivered: qty,
      Delivered_Quantity: qty,
      Unit_Price: Number(Unit_Price || 500),
      Inspected_Status: Inspected_Status || 'Accepted'
    };
    memoryDb.deliveryItems.push(newItem);

    // Replicate MySQL trg_after_delivery_item_insert trigger in memory store
    const delivery = memoryDb.deliveries.find(d => d.Delivery_ID === Number(Delivery_ID));
    if (delivery) {
      const existingStock = memoryDb.siteStock.find(s => s.Site_ID === delivery.Site_ID && s.Material_ID === Number(Material_ID));
      if (existingStock) {
        existingStock.Quantity_Available = (existingStock.Quantity_Available ?? existingStock.Current_Stock ?? 0) + qty;
        existingStock.Current_Stock = existingStock.Quantity_Available;
      } else {
        const nextStockId = memoryDb.siteStock.length > 0 ? Math.max(...memoryDb.siteStock.map(s => s.Stock_ID)) + 1 : 401;
        memoryDb.siteStock.push({
          Stock_ID: nextStockId,
          Site_ID: delivery.Site_ID,
          Material_ID: Number(Material_ID),
          Quantity_Available: qty,
          Current_Stock: qty
        });
      }
    }

    return res.status(201).json({ message: 'Delivery item recorded successfully', data: newItem });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/delivery-items/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Delivered_Quantity, Quantity_Delivered, Inspected_Status, Material_ID, Unit_Price } = req.body;
  const qty = Number(Delivered_Quantity ?? Quantity_Delivered);
  if (isNaN(qty)) {
    return res.status(400).json({ error: 'Delivered_Quantity is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE DELIVERY_ITEMS SET Quantity_Delivered = ?, Material_ID = COALESCE(?, Material_ID), Unit_Price = COALESCE(?, Unit_Price) WHERE Delivery_Item_ID = ?',
        [qty, Material_ID ? Number(Material_ID) : null, Unit_Price ? Number(Unit_Price) : null, id]
      );
      return res.json({ message: 'Delivery item updated successfully' });
    }
    const item = memoryDb.deliveryItems.find(di => di.Delivery_Item_ID === id);
    if (!item) return res.status(404).json({ error: 'Delivery item not found.' });
    item.Quantity_Delivered = qty;
    item.Delivered_Quantity = qty;
    if (Inspected_Status) item.Inspected_Status = Inspected_Status;
    if (Material_ID) item.Material_ID = Number(Material_ID);
    if (Unit_Price) item.Unit_Price = Number(Unit_Price);
    return res.json({ message: 'Delivery item updated successfully', data: item });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/delivery-items/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      await query('DELETE FROM DELIVERY_ITEMS WHERE Delivery_Item_ID = ?', [id]);
      return res.json({ message: 'Delivery item deleted successfully' });
    }
    const idx = memoryDb.deliveryItems.findIndex(di => di.Delivery_Item_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Delivery item not found' });
    memoryDb.deliveryItems.splice(idx, 1);
    return res.json({ message: 'Delivery item deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
