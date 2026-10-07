import React, { useEffect, useState } from 'react';
import { 
  HardHat, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Pencil,
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Layers
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { api } from '../api';
import { WorkPackage, ProgressEntry, Contractor, LabourTeam, Site } from '../types';

export const ProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'packages' | 'entries' | 'contractors' | 'teams'>('packages');

  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [labourTeams, setLabourTeams] = useState<LabourTeam[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Modals
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);

  // Edit Modals
  const [editPackage, setEditPackage] = useState<WorkPackage | null>(null);
  const [editProgress, setEditProgress] = useState<ProgressEntry | null>(null);
  const [editContractor, setEditContractor] = useState<Contractor | null>(null);
  const [editTeam, setEditTeam] = useState<LabourTeam | null>(null);

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null);

  // Forms
  const [progressForm, setProgressForm] = useState({
    Progress_ID: '',
    Work_Package_ID: '',
    Labour_Team_ID: '',
    Percent_Complete: '',
    Progress_Date: new Date().toISOString().split('T')[0]
  });

  const [packageForm, setPackageForm] = useState({
    Work_Package_ID: '',
    Site_ID: '',
    Contractor_ID: '',
    Work_Package_Name: '',
    Verified_Quantity: ''
  });

  const [contractorForm, setContractorForm] = useState({
    Contractor_ID: '',
    Contractor_Name: '',
    Contact_Info: ''
  });

  const [teamForm, setTeamForm] = useState({
    Labour_Team_ID: '',
    Team_Name: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [wp, pe, con, lt, st] = await Promise.all([
        api.getWorkPackages(),
        api.getProgressEntries(),
        api.getContractors(),
        api.getLabourTeams(),
        api.getSites(),
      ]);
      setWorkPackages(wp);
      setProgressEntries(pe);
      setContractors(con);
      setLabourTeams(lt);
      setSites(st);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProgressEntry({
        Progress_ID: Number(progressForm.Progress_ID),
        Work_Package_ID: Number(progressForm.Work_Package_ID),
        Package_ID: Number(progressForm.Work_Package_ID),
        Labour_Team_ID: Number(progressForm.Labour_Team_ID),
        Percent_Complete: Number(progressForm.Percent_Complete),
        Progress_Percentage: Number(progressForm.Percent_Complete),
        Progress_Date: progressForm.Progress_Date,
        Recorded_Date: progressForm.Progress_Date
      });
      setFeedback({ type: 'success', message: 'Progress update recorded!' });
      setIsAddProgressOpen(false);
      setProgressForm({
        Progress_ID: '',
        Work_Package_ID: '',
        Labour_Team_ID: '',
        Percent_Complete: '',
        Progress_Date: new Date().toISOString().split('T')[0]
      });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProgress) return;
    try {
      const pct = Number(editProgress.Percent_Complete ?? editProgress.Progress_Percentage);
      await api.updateProgressEntry(editProgress.Progress_ID, {
        Percent_Complete: pct,
        Progress_Percentage: pct,
        Progress_Date: editProgress.Progress_Date || editProgress.Recorded_Date,
        Recorded_Date: editProgress.Progress_Date || editProgress.Recorded_Date
      });
      setFeedback({ type: 'success', message: `Progress record #${editProgress.Progress_ID} updated!` });
      setEditProgress(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWorkPackage({
        Work_Package_ID: Number(packageForm.Work_Package_ID),
        Package_ID: Number(packageForm.Work_Package_ID),
        Site_ID: Number(packageForm.Site_ID),
        Contractor_ID: Number(packageForm.Contractor_ID),
        Work_Package_Name: packageForm.Work_Package_Name,
        Package_Name: packageForm.Work_Package_Name,
        Verified_Quantity: Number(packageForm.Verified_Quantity)
      });
      setFeedback({ type: 'success', message: `Work Package "${packageForm.Work_Package_Name}" created!` });
      setIsAddPackageOpen(false);
      setPackageForm({ Work_Package_ID: '', Site_ID: '', Contractor_ID: '', Work_Package_Name: '', Verified_Quantity: '' });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPackage) return;
    try {
      const pkgId = editPackage.Work_Package_ID || editPackage.Package_ID || 0;
      const name = editPackage.Work_Package_Name || editPackage.Package_Name || '';
      await api.updateWorkPackage(pkgId, {
        Work_Package_Name: name,
        Package_Name: name,
        Site_ID: editPackage.Site_ID,
        Contractor_ID: editPackage.Contractor_ID,
        Verified_Quantity: editPackage.Verified_Quantity
      });
      setFeedback({ type: 'success', message: `Work package #${pkgId} updated!` });
      setEditPackage(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createContractor({
        Contractor_ID: Number(contractorForm.Contractor_ID),
        Contractor_Name: contractorForm.Contractor_Name,
        Contact_Info: contractorForm.Contact_Info
      });
      setFeedback({ type: 'success', message: `Contractor "${contractorForm.Contractor_Name}" registered!` });
      setIsAddContractorOpen(false);
      setContractorForm({ Contractor_ID: '', Contractor_Name: '', Contact_Info: '' });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContractor) return;
    try {
      await api.updateContractor(editContractor.Contractor_ID, {
        Contractor_Name: editContractor.Contractor_Name,
        Contact_Info: editContractor.Contact_Info
      });
      setFeedback({ type: 'success', message: `Contractor #${editContractor.Contractor_ID} updated!` });
      setEditContractor(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLabourTeam({
        Labour_Team_ID: Number(teamForm.Labour_Team_ID),
        Team_ID: Number(teamForm.Labour_Team_ID),
        Team_Name: teamForm.Team_Name,
        Team_Leader: teamForm.Team_Name
      });
      setFeedback({ type: 'success', message: `Labour Team "${teamForm.Team_Name}" registered!` });
      setIsAddTeamOpen(false);
      setTeamForm({ Labour_Team_ID: '', Team_Name: '' });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeam) return;
    try {
      const tid = editTeam.Labour_Team_ID || editTeam.Team_ID || 0;
      const name = editTeam.Team_Name || editTeam.Team_Leader || '';
      await api.updateLabourTeam(tid, {
        Team_Name: name,
        Team_Leader: name
      });
      setFeedback({ type: 'success', message: `Labour team #${tid} updated!` });
      setEditTeam(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'package') await api.deleteWorkPackage(deleteConfirm.id);
      else if (deleteConfirm.type === 'entry') await api.deleteProgressEntry(deleteConfirm.id);
      else if (deleteConfirm.type === 'contractor') await api.deleteContractor(deleteConfirm.id);
      else if (deleteConfirm.type === 'team') await api.deleteLabourTeam(deleteConfirm.id);

      setFeedback({ type: 'success', message: `Record and dependent entries safely cascade-deleted.` });
      setDeleteConfirm(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setDeleteConfirm(null);
    }
  };

  const handleOpenAddPackage = () => {
    const nextPkgId = workPackages.length > 0 ? Math.max(...workPackages.map(wp => Number(wp.Work_Package_ID || wp.Package_ID || 0))) + 1 : 201;
    setPackageForm({
      Work_Package_ID: nextPkgId.toString(),
      Site_ID: sites[0]?.Site_ID.toString() || '',
      Contractor_ID: contractors[0]?.Contractor_ID.toString() || '',
      Work_Package_Name: '',
      Verified_Quantity: '100'
    });
    setIsAddPackageOpen(true);
  };

  const handleOpenLogProgress = (preselectedPkgId?: number | string) => {
    const nextProgId = progressEntries.length > 0 ? Math.max(...progressEntries.map(pe => pe.Progress_ID)) + 1 : 901;
    const pkgId = preselectedPkgId ? Number(preselectedPkgId) : (workPackages[0]?.Work_Package_ID || workPackages[0]?.Package_ID || 0);

    setProgressForm({
      Progress_ID: nextProgId.toString(),
      Work_Package_ID: pkgId.toString(),
      Labour_Team_ID: (labourTeams[0]?.Labour_Team_ID || labourTeams[0]?.Team_ID || '').toString(),
      Percent_Complete: '',
      Progress_Date: new Date().toISOString().split('T')[0]
    });
    setIsAddProgressOpen(true);
  };

  const handleOpenAddContractor = () => {
    const nextCId = contractors.length > 0 ? Math.max(...contractors.map(c => c.Contractor_ID)) + 1 : 101;
    setContractorForm({
      Contractor_ID: nextCId.toString(),
      Contractor_Name: '',
      Contact_Info: ''
    });
    setIsAddContractorOpen(true);
  };

  const handleOpenAddTeam = () => {
    const nextTeamId = labourTeams.length > 0 ? Math.max(...labourTeams.map(t => Number(t.Labour_Team_ID || t.Team_ID || 0))) + 1 : 101;
    setTeamForm({
      Labour_Team_ID: nextTeamId.toString(),
      Team_Name: ''
    });
    setIsAddTeamOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">Work Packages &amp; Progress</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track field progress milestones (0–100%), labour force assignments, and contractor performance</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'packages' && (
            <button onClick={handleOpenAddPackage} className="glass-button-primary text-xs">
              <Plus className="w-4 h-4" /> Add Package
            </button>
          )}
          {activeTab === 'entries' && (
            <button onClick={() => handleOpenLogProgress()} className="glass-button-sage text-xs">
              <TrendingUp className="w-4 h-4" /> Log Progress
            </button>
          )}
          {activeTab === 'contractors' && (
            <button onClick={handleOpenAddContractor} className="glass-button-secondary text-xs">
              <Plus className="w-4 h-4" /> Register Contractor
            </button>
          )}
          {activeTab === 'teams' && (
            <button onClick={handleOpenAddTeam} className="glass-button-secondary text-xs">
              <Plus className="w-4 h-4" /> Assign Labour Team
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border backdrop-blur-sm transition-all ${
          feedback.type === 'success' ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200' : 'bg-red-50/90 text-red-900 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline hover:opacity-75">Dismiss</button>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'packages' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" /> Work Packages ({workPackages.length})
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'entries' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Progress Logs ({progressEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('contractors')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'contractors' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Contractors ({contractors.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'teams' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Labour Teams ({labourTeams.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search current section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-9 w-full text-xs"
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="glass-panel overflow-hidden">
        {/* WORK PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Package ID</th>
                  <th className="py-3 px-4">Package Name</th>
                  <th className="py-3 px-4">Site Location</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4">Verified Quantity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {workPackages
                  .filter(wp => {
                    const name = wp.Work_Package_Name || wp.Package_Name || '';
                    const pkgId = (wp.Work_Package_ID || wp.Package_ID || '').toString();
                    return name.toLowerCase().includes(search.toLowerCase()) || pkgId.includes(search);
                  })
                  .map((wp) => {
                    const pkgId = wp.Work_Package_ID || wp.Package_ID;
                    const name = wp.Work_Package_Name || wp.Package_Name;
                    return (
                      <tr key={pkgId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">#{pkgId}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{name}</td>
                        <td className="py-3 px-4 text-slate-700">{wp.Site_Name || `Site #${wp.Site_ID}`}</td>
                        <td className="py-3 px-4 text-slate-700">{wp.Contractor_Name || `Contractor #${wp.Contractor_ID}`}</td>
                        <td className="py-3 px-4 font-medium">{wp.Verified_Quantity} units</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenLogProgress(pkgId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200/60 transition-colors"
                              title="Log physical progress entry for this package"
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-sage-600" /> Log Progress
                            </button>
                            <button
                              onClick={() => setEditPackage(wp)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                              title="Edit Work Package"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'package', id: Number(pkgId), name: `${name} (#${pkgId})` })}
                              className="glass-button-danger"
                              title="Delete Work Package"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* PROGRESS ENTRIES TAB */}
        {activeTab === 'entries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Work Package</th>
                  <th className="py-3 px-4">Completion %</th>
                  <th className="py-3 px-4">Recorded Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {progressEntries
                  .filter(pe => {
                    const name = pe.Package_Name || '';
                    return name.toLowerCase().includes(search.toLowerCase()) || pe.Progress_ID.toString().includes(search);
                  })
                  .map((pe) => {
                    const pct = pe.Percent_Complete ?? pe.Progress_Percentage ?? 0;
                    return (
                      <tr key={pe.Progress_ID} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">#{pe.Progress_ID}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{pe.Package_Name || `Package #${pe.Work_Package_ID || pe.Package_ID}`}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200/80 rounded-full h-2 overflow-hidden">
                              <div className="bg-sage-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-bold text-xs text-charcoal-900">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{pe.Progress_Date || pe.Recorded_Date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setEditProgress(pe)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                              title="Edit Progress Entry"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'entry', id: pe.Progress_ID, name: `Progress Log #${pe.Progress_ID}` })}
                              className="glass-button-danger"
                              title="Delete Progress Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTRACTORS TAB */}
        {activeTab === 'contractors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Contractor ID</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {contractors
                  .filter(c => c.Contractor_Name.toLowerCase().includes(search.toLowerCase()) || c.Contractor_ID.toString().includes(search))
                  .map((c) => (
                    <tr key={c.Contractor_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">#{c.Contractor_ID}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{c.Contractor_Name}</td>
                      <td className="py-3 px-4 text-slate-500">{c.Contact_Info || 'General Contractor'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditContractor(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                            title="Edit Contractor"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'contractor', id: c.Contractor_ID, name: c.Contractor_Name })}
                            className="glass-button-danger"
                            title="Cascade Delete Contractor"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LABOUR TEAMS TAB */}
        {activeTab === 'teams' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Team ID</th>
                  <th className="py-3 px-4">Team Leader / Name</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {labourTeams
                  .filter(lt => {
                    const name = lt.Team_Name || lt.Team_Leader || '';
                    const tid = (lt.Labour_Team_ID || lt.Team_ID || '').toString();
                    return name.toLowerCase().includes(search.toLowerCase()) || tid.includes(search);
                  })
                  .map((lt) => {
                    const tid = lt.Labour_Team_ID || lt.Team_ID || 0;
                    const name = lt.Team_Name || lt.Team_Leader;
                    return (
                      <tr key={tid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">#{tid}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{name}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setEditTeam(lt)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                              title="Edit Labour Team"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'team', id: tid, name: `${name} (#${tid})` })}
                              className="glass-button-danger"
                              title="Delete Labour Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREATE WORK PACKAGE */}
      <Modal isOpen={isAddPackageOpen} onClose={() => setIsAddPackageOpen(false)} title="Create Work Package" subtitle="Assign task breakdown to contractor on site">
        <form onSubmit={handleCreatePackage} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Package ID *</label>
            <input type="number" required placeholder="e.g. 531" value={packageForm.Work_Package_ID} onChange={(e) => setPackageForm({ ...packageForm, Work_Package_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Work Package Name *</label>
            <input type="text" required placeholder="e.g. Foundation Pouring Phase 1" value={packageForm.Work_Package_Name} onChange={(e) => setPackageForm({ ...packageForm, Work_Package_Name: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Site Location *</label>
            <select required value={packageForm.Site_ID} onChange={(e) => setPackageForm({ ...packageForm, Site_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Site --</option>
              {sites.map(s => <option key={s.Site_ID} value={s.Site_ID}>#{s.Site_ID} - {s.Site_Name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Assigned Contractor *</label>
            <select required value={packageForm.Contractor_ID} onChange={(e) => setPackageForm({ ...packageForm, Contractor_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Contractor --</option>
              {contractors.map(c => <option key={c.Contractor_ID} value={c.Contractor_ID}>#{c.Contractor_ID} - {c.Contractor_Name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Verified Target Quantity *</label>
            <input type="number" required placeholder="e.g. 500" value={packageForm.Verified_Quantity} onChange={(e) => setPackageForm({ ...packageForm, Verified_Quantity: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddPackageOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Create Package</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT WORK PACKAGE */}
      <Modal isOpen={!!editPackage} onClose={() => setEditPackage(null)} title={`Edit Work Package #${editPackage?.Work_Package_ID || editPackage?.Package_ID}`} subtitle="Update work package parameters">
        {editPackage && (
          <form onSubmit={handleUpdatePackage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Package Name *</label>
              <input
                type="text"
                required
                value={editPackage.Work_Package_Name || editPackage.Package_Name || ''}
                onChange={(e) => setEditPackage({ ...editPackage, Work_Package_Name: e.target.value, Package_Name: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Site Location</label>
              <select value={editPackage.Site_ID} onChange={(e) => setEditPackage({ ...editPackage, Site_ID: Number(e.target.value) })} className="glass-dropdown w-full">
                {sites.map(s => <option key={s.Site_ID} value={s.Site_ID}>#{s.Site_ID} - {s.Site_Name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contractor</label>
              <select value={editPackage.Contractor_ID} onChange={(e) => setEditPackage({ ...editPackage, Contractor_ID: Number(e.target.value) })} className="glass-dropdown w-full">
                {contractors.map(c => <option key={c.Contractor_ID} value={c.Contractor_ID}>#{c.Contractor_ID} - {c.Contractor_Name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Verified Quantity</label>
              <input
                type="number"
                value={editPackage.Verified_Quantity}
                onChange={(e) => setEditPackage({ ...editPackage, Verified_Quantity: Number(e.target.value) })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditPackage(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: LOG PROGRESS */}
      <Modal isOpen={isAddProgressOpen} onClose={() => setIsAddProgressOpen(false)} title="Record Milestone Progress" subtitle="Enforces validation constraint (0 <= % <= 100)">
        <form onSubmit={handleCreateProgress} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Log ID *</label>
            <input type="number" required placeholder="e.g. 946" value={progressForm.Progress_ID} onChange={(e) => setProgressForm({ ...progressForm, Progress_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Work Package *</label>
            <select required value={progressForm.Work_Package_ID} onChange={(e) => setProgressForm({ ...progressForm, Work_Package_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Package --</option>
              {workPackages.map(wp => {
                const pkgId = wp.Work_Package_ID || wp.Package_ID;
                const name = wp.Work_Package_Name || wp.Package_Name;
                return <option key={pkgId} value={pkgId}>#{pkgId} - {name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Labour Team *</label>
            <select required value={progressForm.Labour_Team_ID} onChange={(e) => setProgressForm({ ...progressForm, Labour_Team_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Team --</option>
              {labourTeams.map(lt => {
                const tid = lt.Labour_Team_ID || lt.Team_ID;
                const name = lt.Team_Name || lt.Team_Leader;
                return <option key={tid} value={tid}>#{tid} - {name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Completion Percentage (0-100) *</label>
            <input type="number" min="0" max="100" step="0.1" required placeholder="e.g. 75.5" value={progressForm.Percent_Complete} onChange={(e) => setProgressForm({ ...progressForm, Percent_Complete: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Date Recorded *</label>
            <input type="date" required value={progressForm.Progress_Date} onChange={(e) => setProgressForm({ ...progressForm, Progress_Date: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddProgressOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-sage text-xs">Record Progress</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PROGRESS */}
      <Modal isOpen={!!editProgress} onClose={() => setEditProgress(null)} title={`Edit Progress Log #${editProgress?.Progress_ID}`} subtitle="Adjust completion percentage or date">
        {editProgress && (
          <form onSubmit={handleUpdateProgress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Completion Percentage (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={editProgress.Percent_Complete ?? editProgress.Progress_Percentage ?? 0}
                onChange={(e) => setEditProgress({ ...editProgress, Percent_Complete: Number(e.target.value), Progress_Percentage: Number(e.target.value) })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Date Recorded *</label>
              <input
                type="date"
                required
                value={editProgress.Progress_Date || editProgress.Recorded_Date || ''}
                onChange={(e) => setEditProgress({ ...editProgress, Progress_Date: e.target.value, Recorded_Date: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditProgress(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: REGISTER CONTRACTOR */}
      <Modal isOpen={isAddContractorOpen} onClose={() => setIsAddContractorOpen(false)} title="Register Contractor" subtitle="Onboard specialized building contractor">
        <form onSubmit={handleCreateContractor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contractor ID *</label>
            <input type="number" required placeholder="e.g. 511" value={contractorForm.Contractor_ID} onChange={(e) => setContractorForm({ ...contractorForm, Contractor_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contractor Name *</label>
            <input type="text" required placeholder="e.g. Vertex Infra Solutions" value={contractorForm.Contractor_Name} onChange={(e) => setContractorForm({ ...contractorForm, Contractor_Name: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contact Information</label>
            <input type="text" placeholder="+91-9876543210, contact@vertexinfra.in" value={contractorForm.Contact_Info} onChange={(e) => setContractorForm({ ...contractorForm, Contact_Info: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddContractorOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Register Contractor</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT CONTRACTOR */}
      <Modal isOpen={!!editContractor} onClose={() => setEditContractor(null)} title={`Edit Contractor #${editContractor?.Contractor_ID}`} subtitle="Update contractor credentials">
        {editContractor && (
          <form onSubmit={handleUpdateContractor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contractor Name *</label>
              <input type="text" required value={editContractor.Contractor_Name} onChange={(e) => setEditContractor({ ...editContractor, Contractor_Name: e.target.value })} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contact Information</label>
              <input type="text" value={editContractor.Contact_Info || ''} onChange={(e) => setEditContractor({ ...editContractor, Contact_Info: e.target.value })} className="glass-input w-full" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditContractor(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: ADD LABOUR TEAM */}
      <Modal isOpen={isAddTeamOpen} onClose={() => setIsAddTeamOpen(false)} title="Assign Labour Team" subtitle="Register work squad">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Team ID *</label>
            <input type="number" required placeholder="e.g. 511" value={teamForm.Labour_Team_ID} onChange={(e) => setTeamForm({ ...teamForm, Labour_Team_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Team Name / Lead *</label>
            <input type="text" required placeholder="e.g. Alpha Squad - Masonry" value={teamForm.Team_Name} onChange={(e) => setTeamForm({ ...teamForm, Team_Name: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddTeamOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Register Team</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT LABOUR TEAM */}
      <Modal isOpen={!!editTeam} onClose={() => setEditTeam(null)} title={`Edit Labour Team #${editTeam?.Labour_Team_ID || editTeam?.Team_ID}`} subtitle="Update team name or leader">
        {editTeam && (
          <form onSubmit={handleUpdateTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Team Name / Lead *</label>
              <input
                type="text"
                required
                value={editTeam.Team_Name || editTeam.Team_Leader || ''}
                onChange={(e) => setEditTeam({ ...editTeam, Team_Name: e.target.value, Team_Leader: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditTeam(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Simple Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={`Delete ${deleteConfirm?.name}?`}>
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-charcoal-900 font-bold">{deleteConfirm.name}</strong>? All associated records will also be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95">
                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
