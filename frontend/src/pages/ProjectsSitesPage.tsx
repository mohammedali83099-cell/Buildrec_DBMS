import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Pencil,
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { api } from '../api';
import { Project, Site } from '../types';

interface ProjectsSitesPageProps {
  initialAction?: 'add-project' | 'add-site' | null;
  onActionHandled?: () => void;
}

export const ProjectsSitesPage: React.FC<ProjectsSitesPageProps> = ({ initialAction, onActionHandled }) => {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'sites'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  
  // Edit State
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editSite, setEditSite] = useState<Site | null>(null);

  // Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'project' | 'site'; id: number; name: string } | null>(null);

  const [projectForm, setProjectForm] = useState({ Project_ID: '', Project_Name: '', Budget: '45000000', Status: 'In Progress' });
  const [siteForm, setSiteForm] = useState({ Site_ID: '', Project_ID: '', Site_Name: '', Location: '' });

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && initialAction) {
      if (initialAction === 'add-project') {
        setActiveSubTab('projects');
        handleOpenAddProject();
      } else if (initialAction === 'add-site') {
        setActiveSubTab('sites');
        handleOpenAddSite();
      }
      onActionHandled?.();
    }
  }, [loading, initialAction]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projList, siteList] = await Promise.all([
        api.getProjects(),
        api.getSites(),
      ]);
      setProjects(projList);
      setSites(siteList);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProject({
        Project_ID: Number(projectForm.Project_ID),
        Project_Name: projectForm.Project_Name,
        Budget: Number(projectForm.Budget),
        Status: projectForm.Status
      });
      setFeedback({ type: 'success', message: `Project "${projectForm.Project_Name}" created successfully!` });
      setIsAddProjectOpen(false);
      setProjectForm({ Project_ID: '', Project_Name: '', Budget: '45000000', Status: 'In Progress' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    try {
      await api.updateProject(editProject.Project_ID, {
        Project_Name: editProject.Project_Name,
        Budget: editProject.Budget,
        Status: editProject.Status
      });
      setFeedback({ type: 'success', message: `Project "${editProject.Project_Name}" updated successfully!` });
      setEditProject(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSite({
        Site_ID: Number(siteForm.Site_ID),
        Project_ID: Number(siteForm.Project_ID),
        Site_Name: siteForm.Site_Name,
        Location: siteForm.Location
      });
      setFeedback({ type: 'success', message: `Site "${siteForm.Site_Name}" added successfully!` });
      setIsAddSiteOpen(false);
      setSiteForm({ Site_ID: '', Project_ID: '', Site_Name: '', Location: '' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSite) return;
    try {
      await api.updateSite(editSite.Site_ID, {
        Site_Name: editSite.Site_Name,
        Project_ID: editSite.Project_ID,
        Location: editSite.Location
      });
      setFeedback({ type: 'success', message: `Site "${editSite.Site_Name}" updated successfully!` });
      setEditSite(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'project') {
        await api.deleteProject(deleteConfirm.id);
        setFeedback({ type: 'success', message: `Project #${deleteConfirm.id} and all associated child sites/records removed cleanly.` });
      } else {
        await api.deleteSite(deleteConfirm.id);
        setFeedback({ type: 'success', message: `Site #${deleteConfirm.id} and associated records removed cleanly.` });
      }
      setDeleteConfirm(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setDeleteConfirm(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.Project_Name.toLowerCase().includes(search.toLowerCase()) || 
    p.Project_ID.toString().includes(search)
  );

  const filteredSites = sites.filter(s => 
    s.Site_Name.toLowerCase().includes(search.toLowerCase()) || 
    (s.Location && s.Location.toLowerCase().includes(search.toLowerCase())) ||
    s.Site_ID.toString().includes(search)
  );

  const handleOpenAddProject = () => {
    const nextProjId = projects.length > 0 ? Math.max(...projects.map(p => p.Project_ID)) + 1 : 101;
    setProjectForm({ Project_ID: nextProjId.toString(), Project_Name: '', Budget: '45000000', Status: 'In Progress' });
    setIsAddProjectOpen(true);
  };

  const handleOpenAddSite = (preselectedProjectId?: number) => {
    const nextSiteId = sites.length > 0 ? Math.max(...sites.map(s => s.Site_ID)) + 1 : 201;
    setSiteForm({ 
      Site_ID: nextSiteId.toString(), 
      Project_ID: (preselectedProjectId || projects[0]?.Project_ID || '').toString(), 
      Site_Name: '', 
      Location: '' 
    });
    setIsAddSiteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">Projects &amp; Construction Sites</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage master infrastructure undertakings and physical site installations</p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'projects' ? (
            <button 
              onClick={handleOpenAddProject}
              className="glass-button-primary text-xs"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          ) : (
            <button 
              onClick={() => handleOpenAddSite()}
              className="glass-button-primary text-xs"
            >
              <Plus className="w-4 h-4" /> Add Site
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border backdrop-blur-sm transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200' 
            : 'bg-red-50/90 text-red-900 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline hover:opacity-75">Dismiss</button>
        </div>
      )}

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Toggle Pills */}
        <div className="flex p-1 bg-white border border-slate-200/90 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'projects'
                ? 'bg-charcoal-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sites')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'sites'
                ? 'bg-charcoal-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Sites ({sites.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeSubTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-9 w-full text-xs"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="glass-panel overflow-hidden">
        {activeSubTab === 'projects' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Associated Sites</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {filteredProjects.map((p) => {
                  const siteCount = sites.filter(s => s.Project_ID === p.Project_ID).length;
                  return (
                    <tr key={p.Project_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">#{p.Project_ID}</td>
                      <td className="py-3.5 px-4 font-semibold text-charcoal-900">{p.Project_Name}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            setActiveSubTab('sites');
                            setSearch(p.Project_Name);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-charcoal-800 border border-slate-200/80 transition-colors"
                          title="Click to view sites for this project"
                        >
                          <MapPin className="w-3 h-3 text-sage-600" />
                          {siteCount} {siteCount === 1 ? 'Site' : 'Sites'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenAddSite(p.Project_ID)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200/60 transition-colors"
                            title="Add a Site to this Project"
                          >
                            <Plus className="w-3.5 h-3.5 text-sage-600" /> Site
                          </button>
                          <button
                            onClick={() => setEditProject(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                            title="Edit Project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'project', id: p.Project_ID, name: p.Project_Name })}
                            className="glass-button-danger"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No projects found matching "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Site ID</th>
                  <th className="py-3 px-4">Site Name</th>
                  <th className="py-3 px-4">Parent Project</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {filteredSites.map((s) => (
                  <tr key={s.Site_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">#{s.Site_ID}</td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal-900">{s.Site_Name}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {s.Project_Name || `Project #${s.Project_ID}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{s.Location || 'Not specified'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setEditSite(s)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                          title="Edit Site"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'site', id: s.Site_ID, name: s.Site_Name })}
                          className="glass-button-danger"
                          title="Cascade Delete Site"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSites.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No construction sites found matching "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Insert Project */}
      <Modal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        title="Create New Project"
        subtitle="Registers a new master development or construction venture"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Project ID *</label>
            <input
              type="number"
              required
              placeholder="e.g. 116"
              value={projectForm.Project_ID}
              onChange={(e) => setProjectForm({ ...projectForm, Project_ID: e.target.value })}
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Waterfront Marina Tower"
              value={projectForm.Project_Name}
              onChange={(e) => setProjectForm({ ...projectForm, Project_Name: e.target.value })}
              className="glass-input w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setIsAddProjectOpen(false)}
              className="glass-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button-primary text-xs"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Project */}
      <Modal
        isOpen={!!editProject}
        onClose={() => setEditProject(null)}
        title={`Edit Project #${editProject?.Project_ID}`}
        subtitle="Update project specifications and active details"
      >
        {editProject && (
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={editProject.Project_Name}
                onChange={(e) => setEditProject({ ...editProject, Project_Name: e.target.value })}
                className="glass-input w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setEditProject(null)}
                className="glass-button-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glass-button-primary text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Insert Site */}
      <Modal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        title="Add New Construction Site"
        subtitle="Registers a physical site under an existing project (FK: Project_ID)"
      >
        <form onSubmit={handleCreateSite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Site ID *</label>
            <input
              type="number"
              required
              placeholder="e.g. 226"
              value={siteForm.Site_ID}
              onChange={(e) => setSiteForm({ ...siteForm, Site_ID: e.target.value })}
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Parent Project (FK) *</label>
            <select
              required
              value={siteForm.Project_ID}
              onChange={(e) => setSiteForm({ ...siteForm, Project_ID: e.target.value })}
              className="glass-dropdown w-full"
            >
              <option value="">-- Select Parent Project --</option>
              {projects.map((p) => (
                <option key={p.Project_ID} value={p.Project_ID}>
                  #{p.Project_ID} — {p.Project_Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Site Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Coastal Pier Zone B"
              value={siteForm.Site_Name}
              onChange={(e) => setSiteForm({ ...siteForm, Site_Name: e.target.value })}
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Location Details</label>
            <input
              type="text"
              placeholder="e.g. Expressway Sector 9, Km 34"
              value={siteForm.Location}
              onChange={(e) => setSiteForm({ ...siteForm, Location: e.target.value })}
              className="glass-input w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setIsAddSiteOpen(false)}
              className="glass-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button-primary text-xs"
            >
              Insert Site Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Site */}
      <Modal
        isOpen={!!editSite}
        onClose={() => setEditSite(null)}
        title={`Edit Site #${editSite?.Site_ID}`}
        subtitle="Update site attributes and parent project association"
      >
        {editSite && (
          <form onSubmit={handleUpdateSite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Parent Project (FK) *</label>
              <select
                required
                value={editSite.Project_ID}
                onChange={(e) => setEditSite({ ...editSite, Project_ID: Number(e.target.value) })}
                className="glass-dropdown w-full"
              >
                {projects.map((p) => (
                  <option key={p.Project_ID} value={p.Project_ID}>
                    #{p.Project_ID} — {p.Project_Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Site Name *</label>
              <input
                type="text"
                required
                value={editSite.Site_Name}
                onChange={(e) => setEditSite({ ...editSite, Site_Name: e.target.value })}
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Location</label>
              <input
                type="text"
                value={editSite.Location || ''}
                onChange={(e) => setEditSite({ ...editSite, Location: e.target.value })}
                className="glass-input w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setEditSite(null)}
                className="glass-button-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glass-button-primary text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Simple Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={`Delete ${deleteConfirm?.type === 'project' ? 'Project' : 'Site'}?`}
      >
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-charcoal-900 font-bold">"{deleteConfirm.name}"</strong>? All associated records will also be removed.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="glass-button-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
