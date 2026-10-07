import { Router, Request, Response } from 'express';
import { 
  query, 
  isDbConnected, 
  memoryDb, 
  executeCascadeDelete, 
  cascadeDeleteProject, 
  cascadeDeleteSite 
} from '../config/db.js';

const router = Router();

// GET all projects
router.get('/projects', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM PROJECTS ORDER BY Project_ID ASC');
      return res.json(rows);
    }
    return res.json(memoryDb.projects);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST new project
router.post('/projects', async (req: Request, res: Response) => {
  const { Project_ID, Project_Name, Budget, Status } = req.body;
  if (!Project_ID || !Project_Name) {
    return res.status(400).json({ error: 'Project_ID and Project_Name are required.' });
  }

  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO PROJECTS (Project_ID, Project_Name, Budget, Status) VALUES (?, ?, ?, ?)',
        [Number(Project_ID), Project_Name, Number(Budget) || 10000000, Status || 'In Progress']
      );
      return res.status(201).json({ message: 'Project created successfully' });
    }

    if (memoryDb.projects.some(p => p.Project_ID === Number(Project_ID))) {
      return res.status(400).json({ error: 'Project with this ID already exists.' });
    }
    const newProj = {
      Project_ID: Number(Project_ID),
      Project_Name,
      Budget: Number(Budget) || 10000000,
      Status: Status || 'In Progress'
    };
    memoryDb.projects.push(newProj);
    return res.status(201).json({ message: 'Project created successfully', data: newProj });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT update project
router.put('/projects/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Project_Name, Budget, Status } = req.body;
  if (!Project_Name) {
    return res.status(400).json({ error: 'Project_Name is required.' });
  }

  try {
    if (isDbConnected()) {
      await query(
        'UPDATE PROJECTS SET Project_Name = ?, Budget = COALESCE(?, Budget), Status = COALESCE(?, Status) WHERE Project_ID = ?',
        [Project_Name, Budget !== undefined ? Number(Budget) : null, Status || null, id]
      );
      return res.json({ message: 'Project updated successfully' });
    }

    const proj = memoryDb.projects.find(p => p.Project_ID === id);
    if (!proj) return res.status(404).json({ error: 'Project not found.' });
    proj.Project_Name = Project_Name;
    if (Budget !== undefined) proj.Budget = Number(Budget);
    if (Status !== undefined) proj.Status = Status;
    return res.json({ message: 'Project updated successfully', data: proj });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE project (smart cascade delete)
router.delete('/projects/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      // Find all sites for this project
      const sites: any[] = await query('SELECT Site_ID FROM SITES WHERE Project_ID = ?', [id]);
      const siteIds = sites.map(s => s.Site_ID);

      const steps: { sql: string; params?: any[] }[] = [];
      if (siteIds.length > 0) {
        // Cascade child dependencies of these sites
        steps.push({
          sql: `DELETE p FROM PAYMENTS p 
                INNER JOIN BILLS b ON p.Bill_ID = b.Bill_ID 
                INNER JOIN WORK_PACKAGES wp ON b.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID IN (?)`,
          params: [siteIds]
        });
        steps.push({
          sql: `DELETE b FROM BILLS b 
                INNER JOIN WORK_PACKAGES wp ON b.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID IN (?)`,
          params: [siteIds]
        });
        steps.push({
          sql: `DELETE pe FROM PROGRESS_ENTRIES pe 
                INNER JOIN WORK_PACKAGES wp ON pe.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID IN (?)`,
          params: [siteIds]
        });
        steps.push({
          sql: `DELETE i FROM ISSUES i 
                INNER JOIN WORK_PACKAGES wp ON i.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID IN (?)`,
          params: [siteIds]
        });
        steps.push({
          sql: `DELETE di FROM DELIVERY_ITEMS di 
                INNER JOIN DELIVERIES d ON di.Delivery_ID = d.Delivery_ID 
                WHERE d.Site_ID IN (?)`,
          params: [siteIds]
        });
        steps.push({ sql: 'DELETE FROM DELIVERIES WHERE Site_ID IN (?)', params: [siteIds] });
        steps.push({ sql: 'DELETE FROM SITE_STOCK WHERE Site_ID IN (?)', params: [siteIds] });
        steps.push({ sql: 'DELETE FROM LABOUR_TEAMS WHERE Site_ID IN (?)', params: [siteIds] });
        steps.push({ sql: 'DELETE FROM WORK_PACKAGES WHERE Site_ID IN (?)', params: [siteIds] });
        steps.push({ sql: 'DELETE FROM SITES WHERE Project_ID = ?', params: [id] });
      }
      steps.push({ sql: 'DELETE FROM PROJECTS WHERE Project_ID = ?', params: [id] });

      await executeCascadeDelete(steps);
      return res.json({ message: 'Project and all associated sites/records deleted successfully.' });
    }

    const idx = memoryDb.projects.findIndex(p => p.Project_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });
    cascadeDeleteProject(id);
    return res.json({ message: 'Project and all associated sites/records deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET all sites
router.get('/sites', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT s.*, p.Project_Name 
        FROM SITES s 
        LEFT JOIN PROJECTS p ON s.Project_ID = p.Project_ID 
        ORDER BY s.Site_ID ASC
      `);
      return res.json(rows);
    }
    const joined = memoryDb.sites.map(s => {
      const p = memoryDb.projects.find(pr => pr.Project_ID === s.Project_ID);
      return { ...s, Project_Name: p?.Project_Name || 'Unknown' };
    });
    return res.json(joined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST new site
router.post('/sites', async (req: Request, res: Response) => {
  const { Site_ID, Project_ID, Site_Name, Location } = req.body;
  if (!Site_ID || !Project_ID || !Site_Name) {
    return res.status(400).json({ error: 'Site_ID, Project_ID, and Site_Name are required.' });
  }

  try {
    if (isDbConnected()) {
      await query(
        'INSERT INTO SITES (Site_ID, Project_ID, Site_Name, Location) VALUES (?, ?, ?, ?)',
        [Number(Site_ID), Number(Project_ID), Site_Name, Location || 'Site Location']
      );
      return res.status(201).json({ message: 'Site created successfully' });
    }

    if (memoryDb.sites.some(s => s.Site_ID === Number(Site_ID))) {
      return res.status(400).json({ error: 'Site with this ID already exists.' });
    }
    if (!memoryDb.projects.some(p => p.Project_ID === Number(Project_ID))) {
      return res.status(400).json({ error: 'Foreign Key Violation: Project_ID does not exist.' });
    }
    const newSite = {
      Site_ID: Number(Site_ID),
      Project_ID: Number(Project_ID),
      Site_Name,
      Location: Location || 'Site Location'
    };
    memoryDb.sites.push(newSite);
    return res.status(201).json({ message: 'Site created successfully', data: newSite });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT update site
router.put('/sites/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { Site_Name, Project_ID, Location } = req.body;
  if (!Site_Name) {
    return res.status(400).json({ error: 'Site_Name is required.' });
  }

  try {
    if (isDbConnected()) {
      await query(
        'UPDATE SITES SET Site_Name = ?, Project_ID = COALESCE(?, Project_ID), Location = COALESCE(?, Location) WHERE Site_ID = ?',
        [Site_Name, Project_ID ? Number(Project_ID) : null, Location || null, id]
      );
      return res.json({ message: 'Site updated successfully' });
    }

    const site = memoryDb.sites.find(s => s.Site_ID === id);
    if (!site) return res.status(404).json({ error: 'Site not found.' });
    if (Project_ID && !memoryDb.projects.some(p => p.Project_ID === Number(Project_ID))) {
      return res.status(400).json({ error: 'Foreign Key Violation: Project_ID does not exist.' });
    }
    site.Site_Name = Site_Name;
    if (Project_ID) site.Project_ID = Number(Project_ID);
    if (Location) site.Location = Location;
    return res.json({ message: 'Site updated successfully', data: site });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE site (smart cascade delete)
router.delete('/sites/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    if (isDbConnected()) {
      const steps = [
        {
          sql: `DELETE p FROM PAYMENTS p 
                INNER JOIN BILLS b ON p.Bill_ID = b.Bill_ID 
                INNER JOIN WORK_PACKAGES wp ON b.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID = ?`,
          params: [id]
        },
        {
          sql: `DELETE b FROM BILLS b 
                INNER JOIN WORK_PACKAGES wp ON b.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID = ?`,
          params: [id]
        },
        {
          sql: `DELETE pe FROM PROGRESS_ENTRIES pe 
                INNER JOIN WORK_PACKAGES wp ON pe.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID = ?`,
          params: [id]
        },
        {
          sql: `DELETE i FROM ISSUES i 
                INNER JOIN WORK_PACKAGES wp ON i.Package_ID = wp.Package_ID 
                WHERE wp.Site_ID = ?`,
          params: [id]
        },
        {
          sql: `DELETE di FROM DELIVERY_ITEMS di 
                INNER JOIN DELIVERIES d ON di.Delivery_ID = d.Delivery_ID 
                WHERE d.Site_ID = ?`,
          params: [id]
        },
        { sql: 'DELETE FROM DELIVERIES WHERE Site_ID = ?', params: [id] },
        { sql: 'DELETE FROM SITE_STOCK WHERE Site_ID = ?', params: [id] },
        { sql: 'DELETE FROM LABOUR_TEAMS WHERE Site_ID = ?', params: [id] },
        { sql: 'DELETE FROM WORK_PACKAGES WHERE Site_ID = ?', params: [id] },
        { sql: 'DELETE FROM SITES WHERE Site_ID = ?', params: [id] },
      ];
      await executeCascadeDelete(steps);
      return res.json({ message: 'Site and all associated records deleted successfully.' });
    }

    const idx = memoryDb.sites.findIndex(s => s.Site_ID === id);
    if (idx === -1) return res.status(404).json({ error: 'Site not found' });
    cascadeDeleteSite(id);
    return res.json({ message: 'Site and all associated records deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
