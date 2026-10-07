import { Router, Request, Response } from 'express';
import { 
  query, 
  isDbConnected, 
  memoryDb, 
  executeCascadeDelete, 
  cascadeDeleteContractor, 
  cascadeDeleteWorkPackage 
} from '../config/db.js';

const router = Router();

// ==========================================
// CONTRACTORS
// ==========================================
router.get('/contractors', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM CONTRACTORS ORDER BY Contractor_ID ASC');
      return res.json(rows);
    }
    return res.json(memoryDb.contractors);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/contractors', async (req: Request, res: Response) => {
  const { Contractor_ID, Contractor_Name, Contact_Info } = req.body;
  if (!Contractor_ID || !Contractor_Name) {
    return res.status(400).json({ error: 'Contractor_ID and Contractor_Name are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO CONTRACTORS (Contractor_ID, Contractor_Name, Contact_Info) VALUES (?, ?, ?)',
        [Number(Contractor_ID), Contractor_Name, Contact_Info || 'General Contractor']
      );
      return res.status(201).json({ message: 'Contractor registered successfully' });
    }
    if (memoryDb.contractors.some(c => c.Contractor_ID === Number(Contractor_ID))) {
      return res.status(400).json({ error: 'Contractor_ID already exists.' });
    }
    const newCon = { Contractor_ID: Number(Contractor_ID), Contractor_Name, Contact_Info: Contact_Info || 'General Contractor' };
    memoryDb.contractors.push(newCon);
    return res.status(201).json({ message: 'Contractor registered successfully', data: newCon });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/contractors/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Contractor_Name, Contact_Info } = req.body;
  if (!Contractor_Name) {
    return res.status(400).json({ error: 'Contractor_Name is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE CONTRACTORS SET Contractor_Name = ?, Contact_Info = COALESCE(?, Contact_Info) WHERE Contractor_ID = ?',
        [Contractor_Name, Contact_Info || null, id]
      );
      return res.json({ message: 'Contractor updated successfully' });
    }
    const con = memoryDb.contractors.find(c => c.Contractor_ID === id);
    if (!con) return res.status(404).json({ error: 'Contractor not found' });
    con.Contractor_Name = Contractor_Name;
    if (Contact_Info) con.Contact_Info = Contact_Info;
    return res.json({ message: 'Contractor updated successfully', data: con });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/contractors/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const packages: any[] = await query('SELECT Work_Package_ID FROM WORK_PACKAGES WHERE Contractor_ID = ?', [id]);
      const pkgIds = packages.map(p => p.Work_Package_ID);

      const steps: { sql: string; params?: any[] }[] = [];
      if (pkgIds.length > 0) {
        steps.push({
          sql: `DELETE p FROM PAYMENTS p 
                INNER JOIN BILLS b ON p.Bill_ID = b.Bill_ID 
                WHERE b.Work_Package_ID IN (?)`,
          params: [pkgIds]
        });
        steps.push({ sql: 'DELETE FROM BILLS WHERE Work_Package_ID IN (?)', params: [pkgIds] });
        steps.push({ sql: 'DELETE FROM PROGRESS_ENTRIES WHERE Work_Package_ID IN (?)', params: [pkgIds] });
        steps.push({ sql: 'DELETE FROM ISSUES WHERE Work_Package_ID IN (?)', params: [pkgIds] });
        steps.push({ sql: 'DELETE FROM WORK_PACKAGES WHERE Contractor_ID = ?', params: [id] });
      }
      steps.push({ sql: 'DELETE FROM CONTRACTORS WHERE Contractor_ID = ?', params: [id] });

      await executeCascadeDelete(steps);
      return res.json({ message: 'Contractor and assigned work packages deleted successfully.' });
    }

    const idx = memoryDb.contractors.findIndex(c => c.Contractor_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Contractor not found' });
    cascadeDeleteContractor(id);
    return res.json({ message: 'Contractor and assigned work packages deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// WORK PACKAGES
// ==========================================
router.get('/work-packages', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT wp.*, wp.Work_Package_ID AS Package_ID, wp.Work_Package_Name AS Package_Name,
               s.Site_Name, c.Contractor_Name 
        FROM WORK_PACKAGES wp 
        LEFT JOIN SITES s ON wp.Site_ID = s.Site_ID 
        LEFT JOIN CONTRACTORS c ON wp.Contractor_ID = c.Contractor_ID 
        ORDER BY wp.Work_Package_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.workPackages.map(wp => {
      const s = memoryDb.sites.find(site => site.Site_ID === wp.Site_ID);
      const c = memoryDb.contractors.find(con => con.Contractor_ID === wp.Contractor_ID);
      return {
        ...wp,
        Package_ID: wp.Work_Package_ID,
        Package_Name: wp.Work_Package_Name,
        Site_Name: s?.Site_Name || 'Unknown',
        Contractor_Name: c?.Contractor_Name || 'Unknown'
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/work-packages', async (req: Request, res: Response) => {
  const { Package_ID, Work_Package_ID, Site_ID, Contractor_ID, Package_Name, Work_Package_Name, Verified_Quantity } = req.body;
  const pkgId = Number(Package_ID || Work_Package_ID);
  const name = Package_Name || Work_Package_Name;
  if (!pkgId || !Site_ID || !Contractor_ID || !name) {
    return res.status(400).json({ error: 'Package_ID, Site_ID, Contractor_ID, and Package_Name are required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO WORK_PACKAGES (Work_Package_ID, Site_ID, Contractor_ID, Work_Package_Name, Verified_Quantity) VALUES (?, ?, ?, ?, ?)',
        [pkgId, Number(Site_ID), Number(Contractor_ID), name, Number(Verified_Quantity || 500)]
      );
      return res.status(201).json({ message: 'Work package created successfully' });
    }

    if (memoryDb.workPackages.some(wp => wp.Work_Package_ID === pkgId)) {
      return res.status(400).json({ error: 'Package_ID already exists.' });
    }
    if (!memoryDb.sites.some(s => s.Site_ID === Number(Site_ID))) {
      return res.status(400).json({ error: 'Site_ID does not exist.' });
    }
    if (!memoryDb.contractors.some(c => c.Contractor_ID === Number(Contractor_ID))) {
      return res.status(400).json({ error: 'Contractor_ID does not exist.' });
    }

    const newPkg = {
      Work_Package_ID: pkgId,
      Package_ID: pkgId,
      Site_ID: Number(Site_ID),
      Contractor_ID: Number(Contractor_ID),
      Work_Package_Name: name,
      Package_Name: name,
      Verified_Quantity: Number(Verified_Quantity || 500)
    };
    memoryDb.workPackages.push(newPkg);
    return res.status(201).json({ message: 'Work package created successfully', data: newPkg });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/work-packages/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Package_Name, Work_Package_Name, Site_ID, Contractor_ID, Verified_Quantity } = req.body;
  const name = Package_Name || Work_Package_Name;
  if (!name) {
    return res.status(400).json({ error: 'Package_Name is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE WORK_PACKAGES SET Work_Package_Name = ?, Site_ID = COALESCE(?, Site_ID), Contractor_ID = COALESCE(?, Contractor_ID), Verified_Quantity = COALESCE(?, Verified_Quantity) WHERE Work_Package_ID = ?',
        [name, Site_ID ? Number(Site_ID) : null, Contractor_ID ? Number(Contractor_ID) : null, Verified_Quantity !== undefined ? Number(Verified_Quantity) : null, id]
      );
      return res.json({ message: 'Work package updated successfully' });
    }
    const wp = memoryDb.workPackages.find(p => p.Work_Package_ID === id);
    if (!wp) return res.status(404).json({ error: 'Work package not found' });
    wp.Work_Package_Name = name;
    wp.Package_Name = name;
    if (Site_ID) wp.Site_ID = Number(Site_ID);
    if (Contractor_ID) wp.Contractor_ID = Number(Contractor_ID);
    if (Verified_Quantity !== undefined) wp.Verified_Quantity = Number(Verified_Quantity);
    return res.json({ message: 'Work package updated successfully', data: wp });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/work-packages/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        {
          sql: `DELETE p FROM PAYMENTS p 
                INNER JOIN BILLS b ON p.Bill_ID = b.Bill_ID 
                WHERE b.Work_Package_ID = ?`,
          params: [id]
        },
        { sql: 'DELETE FROM BILLS WHERE Work_Package_ID = ?', params: [id] },
        { sql: 'DELETE FROM PROGRESS_ENTRIES WHERE Work_Package_ID = ?', params: [id] },
        { sql: 'DELETE FROM ISSUES WHERE Work_Package_ID = ?', params: [id] },
        { sql: 'DELETE FROM WORK_PACKAGES WHERE Work_Package_ID = ?', params: [id] }
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Work package and dependent logs deleted successfully.' });
    }

    const idx = memoryDb.workPackages.findIndex(wp => wp.Work_Package_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Work package not found' });
    cascadeDeleteWorkPackage(id);
    return res.json({ message: 'Work package and dependent logs deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// LABOUR TEAMS
// ==========================================
router.get('/labour-teams', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT lt.*, lt.Labour_Team_ID AS Team_ID, lt.Team_Name AS Team_Leader 
        FROM LABOUR_TEAMS lt 
        ORDER BY lt.Labour_Team_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.labourTeams.map(lt => {
      const tid = lt.Labour_Team_ID || lt.Team_ID || 0;
      return { 
        ...lt, 
        Team_ID: tid,
        Labour_Team_ID: tid,
        Team_Leader: lt.Team_Leader || lt.Team_Name,
        Number_Of_Workers: lt.Number_Of_Workers || 15
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/labour-teams', async (req: Request, res: Response) => {
  const { Team_ID, Labour_Team_ID, Team_Leader, Team_Name } = req.body;
  const name = Team_Leader || Team_Name;
  if (!name) {
    return res.status(400).json({ error: 'Team_Name / Team_Leader is required.' });
  }
  const tid = Team_ID ? Number(Team_ID) : (Labour_Team_ID ? Number(Labour_Team_ID) : (isDbConnected() ? Math.floor(500 + Math.random() * 400) : (Math.max(...memoryDb.labourTeams.map(t => t.Labour_Team_ID || t.Team_ID || 0), 500) + 1)));
  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO LABOUR_TEAMS (Labour_Team_ID, Team_Name) VALUES (?, ?)',
        [tid, name]
      );
      return res.status(201).json({ message: 'Labour team assigned successfully' });
    }
    const newTeam = {
      Labour_Team_ID: tid,
      Team_ID: tid,
      Team_Name: name,
      Team_Leader: name,
      Number_Of_Workers: 15
    };
    memoryDb.labourTeams.push(newTeam);
    return res.status(201).json({ message: 'Labour team assigned successfully', data: newTeam });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/labour-teams/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Team_Leader, Team_Name } = req.body;
  const name = Team_Leader || Team_Name;
  if (!name) {
    return res.status(400).json({ error: 'Team_Name is required.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE LABOUR_TEAMS SET Team_Name = ? WHERE Labour_Team_ID = ?',
        [name, id]
      );
      return res.json({ message: 'Labour team updated successfully' });
    }
    const team = memoryDb.labourTeams.find(t => (t.Labour_Team_ID || t.Team_ID) === id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.Team_Name = name;
    team.Team_Leader = name;
    return res.json({ message: 'Labour team updated successfully', data: team });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/labour-teams/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        { sql: 'DELETE FROM PROGRESS_ENTRIES WHERE Labour_Team_ID = ?', params: [id] },
        { sql: 'DELETE FROM LABOUR_TEAMS WHERE Labour_Team_ID = ?', params: [id] }
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Labour team removed successfully' });
    }
    const idx = memoryDb.labourTeams.findIndex(t => (t.Labour_Team_ID || t.Team_ID) === id);
    if (idx === -1) return res.status(404).json({ error: 'Team not found' });
    memoryDb.progressEntries = memoryDb.progressEntries.filter(pe => pe.Labour_Team_ID !== id);
    memoryDb.labourTeams.splice(idx, 1);
    return res.json({ message: 'Labour team removed successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// PROGRESS ENTRIES
// ==========================================
router.get('/progress-entries', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT pe.*, pe.Work_Package_ID AS Package_ID, pe.Percent_Complete AS Progress_Percentage, 
               pe.Progress_Date AS Recorded_Date, wp.Work_Package_Name AS Package_Name 
        FROM PROGRESS_ENTRIES pe 
        LEFT JOIN WORK_PACKAGES wp ON pe.Work_Package_ID = wp.Work_Package_ID 
        ORDER BY pe.Progress_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.progressEntries.map(pe => {
      const wp = memoryDb.workPackages.find(p => p.Work_Package_ID === pe.Work_Package_ID);
      const pct = pe.Percent_Complete ?? pe.Progress_Percentage ?? 0;
      const dt = pe.Progress_Date || pe.Recorded_Date || '2026-03-01';
      return { 
        ...pe, 
        Package_ID: pe.Work_Package_ID,
        Percent_Complete: pct,
        Progress_Percentage: pct,
        Progress_Date: dt,
        Recorded_Date: dt,
        Package_Name: wp?.Work_Package_Name || wp?.Package_Name || 'Unknown' 
      };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/progress-entries', async (req: Request, res: Response) => {
  const { Progress_ID, Package_ID, Work_Package_ID, Progress_Percentage, Percent_Complete, Recorded_Date, Progress_Date, Labour_Team_ID } = req.body;
  const pkgId = Number(Package_ID || Work_Package_ID);
  const pct = Number(Progress_Percentage !== undefined ? Progress_Percentage : Percent_Complete);
  const dt = Recorded_Date || Progress_Date;
  const teamId = Number(Labour_Team_ID || 501);

  if (!Progress_ID || !pkgId || isNaN(pct) || !dt) {
    return res.status(400).json({ error: 'All progress entry fields are required.' });
  }

  if (pct < 0 || pct > 100) {
    return res.status(400).json({ error: 'Integrity Violation: Progress_Percentage must be between 0 and 100.' });
  }

  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO PROGRESS_ENTRIES (Progress_ID, Work_Package_ID, Labour_Team_ID, Percent_Complete, Progress_Date) VALUES (?, ?, ?, ?, ?)',
        [Number(Progress_ID), pkgId, teamId, pct, dt]
      );
      return res.status(201).json({ message: 'Progress recorded successfully' });
    }

    if (memoryDb.progressEntries.some(pe => pe.Progress_ID === Number(Progress_ID))) {
      return res.status(400).json({ error: 'Progress_ID already exists.' });
    }
    if (!memoryDb.workPackages.some(wp => wp.Work_Package_ID === pkgId)) {
      return res.status(400).json({ error: 'Package_ID does not exist.' });
    }

    const newPE = {
      Progress_ID: Number(Progress_ID),
      Work_Package_ID: pkgId,
      Package_ID: pkgId,
      Labour_Team_ID: teamId,
      Percent_Complete: pct,
      Progress_Percentage: pct,
      Progress_Date: dt,
      Recorded_Date: dt
    };
    memoryDb.progressEntries.push(newPE);
    return res.status(201).json({ message: 'Progress recorded successfully', data: newPE });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/progress-entries/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Progress_Percentage, Percent_Complete, Recorded_Date, Progress_Date } = req.body;
  const pct = Number(Progress_Percentage !== undefined ? Progress_Percentage : Percent_Complete);
  const dt = Recorded_Date || Progress_Date;
  if (isNaN(pct) || !dt) {
    return res.status(400).json({ error: 'Progress_Percentage and Recorded_Date are required.' });
  }
  if (pct < 0 || pct > 100) {
    return res.status(400).json({ error: 'Integrity Violation: Progress_Percentage must be between 0 and 100.' });
  }
  try {
    if (isDbConnected()) {
      await query(
        'UPDATE PROGRESS_ENTRIES SET Percent_Complete = ?, Progress_Date = ? WHERE Progress_ID = ?',
        [pct, dt, id]
      );
      return res.json({ message: 'Progress entry updated successfully' });
    }
    const pe = memoryDb.progressEntries.find(p => p.Progress_ID === id);
    if (!pe) return res.status(404).json({ error: 'Progress entry not found' });
    pe.Percent_Complete = pct;
    pe.Progress_Percentage = pct;
    pe.Progress_Date = dt;
    pe.Recorded_Date = dt;
    return res.json({ message: 'Progress entry updated successfully', data: pe });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/progress-entries/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      await query('DELETE FROM PROGRESS_ENTRIES WHERE Progress_ID = ?', [id]);
      return res.json({ message: 'Progress entry deleted successfully' });
    }
    const idx = memoryDb.progressEntries.findIndex(pe => pe.Progress_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Progress entry not found' });
    memoryDb.progressEntries.splice(idx, 1);
    return res.json({ message: 'Progress entry deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
