import { Router, Request, Response } from 'express';
import { 
  query, 
  isDbConnected, 
  memoryDb, 
  executeCascadeDelete, 
  cascadeDeleteBill 
} from '../config/db.js';

const router = Router();

// ==========================================
// BILLS
// ==========================================
router.get('/bills', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT b.*, wp.Work_Package_Name AS Package_Name, wp.Work_Package_ID AS Package_ID,
          COALESCE(SUM(p.Amount_Paid), 0) AS Paid_Amount,
          (b.Bill_Amount - COALESCE(SUM(p.Amount_Paid), 0)) AS Balance_Due
        FROM BILLS b 
        LEFT JOIN WORK_PACKAGES wp ON b.Work_Package_ID = wp.Work_Package_ID 
        LEFT JOIN PAYMENTS p ON b.Bill_ID = p.Bill_ID
        GROUP BY b.Bill_ID, wp.Work_Package_Name, wp.Work_Package_ID
        ORDER BY b.Bill_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.bills.map(b => {
      const wp = memoryDb.workPackages.find(p => p.Work_Package_ID === b.Work_Package_ID);
      const paid = memoryDb.payments
        .filter(p => p.Bill_ID === b.Bill_ID)
        .reduce((sum, p) => sum + (p.Amount_Paid || p.Payment_Amount || 0), 0);
      return {
        ...b,
        Package_ID: b.Work_Package_ID,
        Package_Name: wp?.Work_Package_Name || wp?.Package_Name || 'Unknown',
        Paid_Amount: paid,
        Balance_Due: b.Bill_Amount - paid
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/bills', async (req: Request, res: Response) => {
  const { Bill_ID, Package_ID, Work_Package_ID, Bill_Amount, Bill_Date, Billed_Quantity, Status } = req.body;
  const pkgId = Number(Package_ID || Work_Package_ID);
  if (!Bill_ID || !pkgId || !Bill_Amount || !Bill_Date) {
    return res.status(400).json({ error: 'Bill_ID, Package_ID, Bill_Amount, and Bill_Date are required.' });
  }

  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO BILLS (Bill_ID, Work_Package_ID, Billed_Quantity, Bill_Amount, Bill_Date, Status) VALUES (?, ?, ?, ?, ?, ?)',
        [Number(Bill_ID), pkgId, Number(Billed_Quantity || 100), Number(Bill_Amount), Bill_Date, Status || 'Pending']
      );
      return res.status(201).json({ message: 'Contractor bill recorded successfully' });
    }

    if (memoryDb.bills.some(b => b.Bill_ID === Number(Bill_ID))) {
      return res.status(400).json({ error: 'Bill_ID already exists.' });
    }
    const pkg = memoryDb.workPackages.find(wp => wp.Work_Package_ID === pkgId);
    if (!pkg) {
      return res.status(400).json({ error: 'Package_ID does not exist.' });
    }

    // Business check: work package must have recorded progress >= 10%
    const progressList = memoryDb.progressEntries.filter(pe => pe.Work_Package_ID === pkgId);
    const maxProgress = progressList.reduce((max, pe) => Math.max(max, pe.Percent_Complete || pe.Progress_Percentage || 0), 0);
    if (maxProgress < 10) {
      return res.status(400).json({ error: `Integrity Violation: Cannot bill unverified work package! Current progress is only ${maxProgress}% (must be at least 10%).` });
    }

    const newBill = {
      Bill_ID: Number(Bill_ID),
      Work_Package_ID: pkgId,
      Package_ID: pkgId,
      Billed_Quantity: Number(Billed_Quantity || 100),
      Bill_Amount: Number(Bill_Amount),
      Bill_Date,
      Status: Status || 'Pending'
    };
    memoryDb.bills.push(newBill);
    return res.status(201).json({ message: 'Contractor bill recorded successfully', data: newBill });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/bills/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Bill_Amount, Bill_Date, Status } = req.body;
  if (!Bill_Amount || !Bill_Date) {
    return res.status(400).json({ error: 'Bill_Amount and Bill_Date are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE BILLS SET Bill_Amount = ?, Bill_Date = ?, Status = COALESCE(?, Status) WHERE Bill_ID = ?',
        [Number(Bill_Amount), Bill_Date, Status || null, id]
      );
      return res.json({ message: 'Bill updated successfully' });
    }
    const bill = memoryDb.bills.find(b => b.Bill_ID === id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    bill.Bill_Amount = Number(Bill_Amount);
    bill.Bill_Date = Bill_Date;
    if (Status) bill.Status = Status;
    return res.json({ message: 'Bill updated successfully', data: bill });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/bills/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        { sql: 'DELETE FROM PAYMENTS WHERE Bill_ID = ?', params: [id] },
        { sql: 'DELETE FROM BILLS WHERE Bill_ID = ?', params: [id] }
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Bill and all linked payments deleted successfully.' });
    }

    const idx = memoryDb.bills.findIndex(b => b.Bill_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Bill not found' });
    cascadeDeleteBill(id);
    return res.json({ message: 'Bill and all linked payments deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// PAYMENTS
// ==========================================
router.get('/payments', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT p.*, p.Amount_Paid AS Payment_Amount, b.Bill_Amount, wp.Work_Package_Name AS Package_Name 
        FROM PAYMENTS p 
        LEFT JOIN BILLS b ON p.Bill_ID = b.Bill_ID 
        LEFT JOIN WORK_PACKAGES wp ON b.Work_Package_ID = wp.Work_Package_ID 
        ORDER BY p.Payment_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.payments.map(p => {
      const b = memoryDb.bills.find(bill => bill.Bill_ID === p.Bill_ID);
      const wp = b ? memoryDb.workPackages.find(pkg => pkg.Work_Package_ID === b.Work_Package_ID) : null;
      const amt = p.Amount_Paid || p.Payment_Amount || 0;
      return {
        ...p,
        Payment_Amount: amt,
        Amount_Paid: amt,
        Bill_Amount: b?.Bill_Amount || 0,
        Package_Name: wp?.Work_Package_Name || wp?.Package_Name || 'Unknown'
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/payments', async (req: Request, res: Response) => {
  const { Payment_ID, Bill_ID, Payment_Amount, Amount_Paid, Payment_Date, Payment_Mode } = req.body;
  const amt = Number(Payment_Amount || Amount_Paid);
  if (!Payment_ID || !Bill_ID || !amt || !Payment_Date) {
    return res.status(400).json({ error: 'Payment_ID, Bill_ID, Payment_Amount, and Payment_Date are required.' });
  }

  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO PAYMENTS (Payment_ID, Bill_ID, Amount_Paid, Payment_Date) VALUES (?, ?, ?, ?)',
        [Number(Payment_ID), Number(Bill_ID), amt, Payment_Date]
      );
      return res.status(201).json({ message: 'Payment recorded successfully' });
    }

    if (memoryDb.payments.some(p => p.Payment_ID === Number(Payment_ID))) {
      return res.status(400).json({ error: 'Payment_ID already exists.' });
    }
    const targetBill = memoryDb.bills.find(b => b.Bill_ID === Number(Bill_ID));
    if (!targetBill) {
      return res.status(400).json({ error: 'Bill_ID does not exist.' });
    }

    const currentPaid = memoryDb.payments
      .filter(p => p.Bill_ID === Number(Bill_ID))
      .reduce((sum, p) => sum + (p.Amount_Paid || p.Payment_Amount || 0), 0);

    if (currentPaid + amt > targetBill.Bill_Amount) {
      return res.status(400).json({
        error: `Integrity Violation: Total payments cannot exceed bill amount! Current total: ₹${currentPaid}, Attempted: ₹${amt}, Bill Max: ₹${targetBill.Bill_Amount}`
      });
    }

    const newPayment = {
      Payment_ID: Number(Payment_ID),
      Bill_ID: Number(Bill_ID),
      Amount_Paid: amt,
      Payment_Amount: amt,
      Payment_Date,
      Payment_Mode: Payment_Mode || 'NEFT'
    };
    memoryDb.payments.push(newPayment);

    // Replicate MySQL trg_after_payment_insert trigger in memory store
    if (currentPaid + amt >= targetBill.Bill_Amount) {
      targetBill.Status = 'PAID';
    }

    return res.status(201).json({ message: 'Payment recorded successfully', data: newPayment });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/payments/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Payment_Amount, Amount_Paid, Payment_Date, Payment_Mode } = req.body;
  const amt = Number(Payment_Amount || Amount_Paid);
  if (!amt || !Payment_Date) {
    return res.status(400).json({ error: 'Payment_Amount and Payment_Date are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE PAYMENTS SET Amount_Paid = ?, Payment_Date = ? WHERE Payment_ID = ?',
        [amt, Payment_Date, id]
      );
      return res.json({ message: 'Payment updated successfully' });
    }
    const pmt = memoryDb.payments.find(p => p.Payment_ID === id);
    if (!pmt) return res.status(404).json({ error: 'Payment not found' });
    pmt.Amount_Paid = amt;
    pmt.Payment_Amount = amt;
    pmt.Payment_Date = Payment_Date;
    if (Payment_Mode) pmt.Payment_Mode = Payment_Mode;
    return res.json({ message: 'Payment updated successfully', data: pmt });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/payments/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      await query('DELETE FROM PAYMENTS WHERE Payment_ID = ?', [id]);
      return res.json({ message: 'Payment deleted successfully' });
    }
    const idx = memoryDb.payments.findIndex(p => p.Payment_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Payment not found' });
    memoryDb.payments.splice(idx, 1);
    return res.json({ message: 'Payment deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
