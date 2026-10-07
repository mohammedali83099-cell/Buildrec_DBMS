import React, { useEffect, useState } from 'react';
import { 
  Boxes, 
  Layers, 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  Pencil,
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { api } from '../api';
import { Material, SiteStock, Issue, WorkPackage, Site } from '../types';

export const MaterialsStockPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'issues' | 'catalog'>('stock');

  const [siteStock, setSiteStock] = useState<SiteStock[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  // Edit Modals
  const [editStock, setEditStock] = useState<SiteStock | null>(null);
  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null);

  // Forms
  const [issueForm, setIssueForm] = useState({
    Issue_ID: '',
    Stock_ID: '',
    Work_Package_ID: '',
    Quantity_Issued: '',
    Issue_Date: new Date().toISOString().split('T')[0]
  });

  const [materialForm, setMaterialForm] = useState({
    Material_ID: '',
    Material_Name: '',
    Unit_Of_Measure: 'Bags'
  });

  const [stockForm, setStockForm] = useState({
    Site_ID: '',
    Material_ID: '',
    Current_Stock: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stk, iss, mat, wp, siteList] = await Promise.all([
        api.getSiteStock(),
        api.getIssues(),
        api.getMaterials(),
        api.getWorkPackages(),
        api.getSites(),
      ]);
      setSiteStock(stk);
      setIssues(iss);
      setMaterials(mat);
      setWorkPackages(wp);
      setSites(siteList);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleIssueMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedStock = siteStock.find(s => s.Stock_ID === Number(issueForm.Stock_ID));
      if (!selectedStock) throw new Error('Selected stock record not found.');

      await api.createIssue({
        Issue_ID: Number(issueForm.Issue_ID),
        Stock_ID: Number(issueForm.Stock_ID),
        Site_ID: selectedStock.Site_ID,
        Material_ID: selectedStock.Material_ID,
        Package_ID: Number(issueForm.Work_Package_ID),
        Work_Package_ID: Number(issueForm.Work_Package_ID),
        Issued_Quantity: Number(issueForm.Quantity_Issued),
        Quantity_Issued: Number(issueForm.Quantity_Issued),
        Issue_Date: issueForm.Issue_Date
      });

      setFeedback({ type: 'success', message: `Material issue #${issueForm.Issue_ID} recorded! Site stock deducted automatically.` });
      setIsIssueModalOpen(false);
      setIssueForm({
        Issue_ID: '',
        Stock_ID: '',
        Work_Package_ID: '',
        Quantity_Issued: '',
        Issue_Date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editIssue) return;
    try {
      await api.updateIssue(editIssue.Issue_ID, {
        Issued_Quantity: Number(editIssue.Quantity_Issued || editIssue.Issued_Quantity),
        Quantity_Issued: Number(editIssue.Quantity_Issued || editIssue.Issued_Quantity),
        Issue_Date: editIssue.Issue_Date
      });
      setFeedback({ type: 'success', message: `Material issue #${editIssue.Issue_ID} updated!` });
      setEditIssue(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaterial({
        Material_ID: Number(materialForm.Material_ID),
        Material_Name: materialForm.Material_Name,
        Unit_Of_Measure: materialForm.Unit_Of_Measure,
        Unit: materialForm.Unit_Of_Measure
      });
      setFeedback({ type: 'success', message: `Material "${materialForm.Material_Name}" created in catalog!` });
      setIsAddMaterialOpen(false);
      setMaterialForm({ Material_ID: '', Material_Name: '', Unit_Of_Measure: 'Bags' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMaterial) return;
    try {
      const u = editMaterial.Unit_Of_Measure || editMaterial.Unit || 'units';
      await api.updateMaterial(editMaterial.Material_ID, {
        Material_Name: editMaterial.Material_Name,
        Unit_Of_Measure: u,
        Unit: u
      });
      setFeedback({ type: 'success', message: `Material #${editMaterial.Material_ID} updated!` });
      setEditMaterial(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSiteStock({
        Site_ID: Number(stockForm.Site_ID),
        Material_ID: Number(stockForm.Material_ID),
        Current_Stock: Number(stockForm.Current_Stock),
        Quantity_Available: Number(stockForm.Current_Stock)
      });
      setFeedback({ type: 'success', message: 'New site stock record registered!' });
      setIsAddStockOpen(false);
      setStockForm({ Site_ID: '', Material_ID: '', Current_Stock: '' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStock) return;
    try {
      const qty = Number(editStock.Quantity_Available ?? editStock.Current_Stock);
      await api.updateSiteStock(editStock.Stock_ID, {
        Current_Stock: qty,
        Quantity_Available: qty
      });
      setFeedback({ type: 'success', message: `Stock level for Stock #${editStock.Stock_ID} updated to ${qty}!` });
      setEditStock(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'stock') await api.deleteSiteStock(deleteConfirm.id);
      else if (deleteConfirm.type === 'issue') await api.deleteIssue(deleteConfirm.id);
      else if (deleteConfirm.type === 'material') await api.deleteMaterial(deleteConfirm.id);

      setFeedback({ type: 'success', message: `Item and related dependencies safely cascade-deleted.` });
      setDeleteConfirm(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setDeleteConfirm(null);
    }
  };

  const selectedStockDetails = siteStock.find(s => s.Stock_ID === Number(issueForm.Stock_ID));

  const handleOpenAddStock = () => {
    setStockForm({
      Site_ID: sites[0]?.Site_ID.toString() || '',
      Material_ID: materials[0]?.Material_ID.toString() || '',
      Current_Stock: '100'
    });
    setIsAddStockOpen(true);
  };

  const handleOpenAddMaterial = () => {
    const nextMatId = materials.length > 0 ? Math.max(...materials.map(m => m.Material_ID)) + 1 : 301;
    setMaterialForm({
      Material_ID: nextMatId.toString(),
      Material_Name: '',
      Unit_Of_Measure: 'Bags'
    });
    setIsAddMaterialOpen(true);
  };

  const handleOpenIssueModal = (preselectedStockId?: number) => {
    const nextIssId = issues.length > 0 ? Math.max(...issues.map(i => i.Issue_ID)) + 1 : 501;
    const stockId = preselectedStockId || (siteStock[0]?.Stock_ID || 0);
    const stockItem = siteStock.find(s => s.Stock_ID === stockId);
    
    // Filter packages matching the site of the stock item
    const matchingPackages = stockItem 
      ? workPackages.filter(wp => wp.Site_ID === stockItem.Site_ID)
      : workPackages;
    
    const targetWp = matchingPackages[0] || workPackages[0];
    const targetWpId = targetWp ? (targetWp.Work_Package_ID || targetWp.Package_ID || '') : '';

    setIssueForm({
      Issue_ID: nextIssId.toString(),
      Stock_ID: stockId.toString(),
      Work_Package_ID: targetWpId.toString(),
      Quantity_Issued: '',
      Issue_Date: new Date().toISOString().split('T')[0]
    });
    setIsIssueModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">Materials &amp; Site Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control live site stockpiles, dispatch issues to work packages, and manage item master catalog</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'stock' && (
            <button onClick={handleOpenAddStock} className="glass-button-secondary text-xs">
              <Plus className="w-4 h-4" /> Add Stock
            </button>
          )}
          {activeTab === 'issues' && (
            <button onClick={() => handleOpenIssueModal()} className="glass-button-sage text-xs">
              <Zap className="w-4 h-4" /> Log Material Issue
            </button>
          )}
          {activeTab === 'catalog' && (
            <button onClick={handleOpenAddMaterial} className="glass-button-primary text-xs">
              <Plus className="w-4 h-4" /> Add Material
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

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'stock' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" /> Site Stock Levels ({siteStock.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'issues' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Issues to Packages ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'catalog' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Material Catalog ({materials.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search current list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-9 w-full text-xs"
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="glass-panel overflow-hidden">
        {/* SITE STOCK TAB */}
        {activeTab === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Stock ID</th>
                  <th className="py-3 px-4">Site Location</th>
                  <th className="py-3 px-4">Material Name</th>
                  <th className="py-3 px-4">Available Quantity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {siteStock
                  .filter(s => 
                    (s.Material_Name && s.Material_Name.toLowerCase().includes(search.toLowerCase())) ||
                    (s.Site_Name && s.Site_Name.toLowerCase().includes(search.toLowerCase())) ||
                    s.Stock_ID.toString().includes(search)
                  )
                  .map((s) => {
                    const qty = s.Quantity_Available ?? s.Current_Stock ?? 0;
                    return (
                      <tr key={s.Stock_ID} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">#{s.Stock_ID}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{s.Site_Name || `Site #${s.Site_ID}`}</td>
                        <td className="py-3 px-4 font-medium">{s.Material_Name || `Material #${s.Material_ID}`}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            qty < 100 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {qty} {s.Unit || 'units'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenIssueModal(s.Stock_ID)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200/60 transition-colors"
                              title="Issue this stock to an on-site work package"
                            >
                              <Zap className="w-3.5 h-3.5 text-sage-600" /> Issue
                            </button>
                            <button
                              onClick={() => setEditStock(s)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                              title="Update Stock Level"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'stock', id: s.Stock_ID, name: `Stock Record #${s.Stock_ID}` })}
                              className="glass-button-danger"
                              title="Delete Stock Record"
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

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Issue ID</th>
                  <th className="py-3 px-4">Target Work Package</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Quantity Issued</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {issues
                  .filter(i => 
                    (i.Package_Name && i.Package_Name.toLowerCase().includes(search.toLowerCase())) ||
                    (i.Material_Name && i.Material_Name.toLowerCase().includes(search.toLowerCase())) ||
                    i.Issue_ID.toString().includes(search)
                  )
                  .map((i) => {
                    const qty = i.Quantity_Issued ?? i.Issued_Quantity ?? 0;
                    return (
                      <tr key={i.Issue_ID} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">#{i.Issue_ID}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{i.Package_Name || `Package #${i.Work_Package_ID || i.Package_ID}`}</td>
                        <td className="py-3 px-4 font-medium">{i.Material_Name || 'Material'}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{qty} {i.Unit || 'units'}</td>
                        <td className="py-3 px-4 text-slate-600">{i.Issue_Date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setEditIssue(i)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                              title="Edit Issue Entry"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'issue', id: i.Issue_ID, name: `Issue #${i.Issue_ID}` })}
                              className="glass-button-danger"
                              title="Delete Issue"
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

        {/* MATERIAL CATALOG TAB */}
        {activeTab === 'catalog' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Material ID</th>
                  <th className="py-3 px-4">Material Name</th>
                  <th className="py-3 px-4">Unit of Measurement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {materials
                  .filter(m => m.Material_Name.toLowerCase().includes(search.toLowerCase()) || m.Material_ID.toString().includes(search))
                  .map((m) => (
                    <tr key={m.Material_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">#{m.Material_ID}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{m.Material_Name}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{m.Unit_Of_Measure || m.Unit || 'units'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditMaterial(m)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                            title="Edit Material"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'material', id: m.Material_ID, name: m.Material_Name })}
                            className="glass-button-danger"
                            title="Cascade Delete Material"
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
      </div>

      {/* MODAL: ADD STOCK */}
      <Modal isOpen={isAddStockOpen} onClose={() => setIsAddStockOpen(false)} title="Register Site Stock" subtitle="Create stock entry for site & material">
        <form onSubmit={handleCreateStock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Site Location *</label>
            <select required value={stockForm.Site_ID} onChange={(e) => setStockForm({ ...stockForm, Site_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Site --</option>
              {sites.map(s => <option key={s.Site_ID} value={s.Site_ID}>#{s.Site_ID} - {s.Site_Name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Material *</label>
            <select required value={stockForm.Material_ID} onChange={(e) => setStockForm({ ...stockForm, Material_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Material --</option>
              {materials.map(m => <option key={m.Material_ID} value={m.Material_ID}>#{m.Material_ID} - {m.Material_Name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Initial Stock Level *</label>
            <input type="number" required placeholder="e.g. 500" value={stockForm.Current_Stock} onChange={(e) => setStockForm({ ...stockForm, Current_Stock: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddStockOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Register Stock</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT STOCK */}
      <Modal isOpen={!!editStock} onClose={() => setEditStock(null)} title={`Update Stock Level (Stock #${editStock?.Stock_ID})`} subtitle="Adjust live inventory quantity">
        {editStock && (
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div>
              <p className="text-xs text-charcoal-600 mb-2">
                Site: <strong>{editStock.Site_Name}</strong> | Material: <strong>{editStock.Material_Name}</strong>
              </p>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Available Quantity *</label>
              <input
                type="number"
                required
                value={editStock.Quantity_Available ?? editStock.Current_Stock ?? 0}
                onChange={(e) => setEditStock({ ...editStock, Quantity_Available: Number(e.target.value), Current_Stock: Number(e.target.value) })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditStock(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Update Quantity</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: ISSUE MATERIAL */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue Material to Work Package" subtitle="Deducts stock via business rule trigger">
        <form onSubmit={handleIssueMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Issue Transaction ID *</label>
            <input type="number" required placeholder="e.g. 541" value={issueForm.Issue_ID} onChange={(e) => setIssueForm({ ...issueForm, Issue_ID: e.target.value })} className="glass-input w-full" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Select Source Stock *</label>
            <select required value={issueForm.Stock_ID} onChange={(e) => setIssueForm({ ...issueForm, Stock_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Available Stock --</option>
              {siteStock.map(s => {
                const qty = s.Quantity_Available ?? s.Current_Stock ?? 0;
                return (
                  <option key={s.Stock_ID} value={s.Stock_ID}>
                    #{s.Stock_ID} - {s.Material_Name} at {s.Site_Name} ({qty} {s.Unit || 'units'} available)
                  </option>
                );
              })}
            </select>
          </div>

          {selectedStockDetails && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              Available Balance: <strong className="text-emerald-700 font-bold">{selectedStockDetails.Quantity_Available ?? selectedStockDetails.Current_Stock ?? 0} {selectedStockDetails.Unit || 'units'}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Target Work Package *</label>
            <select required value={issueForm.Work_Package_ID} onChange={(e) => setIssueForm({ ...issueForm, Work_Package_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Work Package --</option>
              {workPackages.map(wp => (
                <option key={wp.Work_Package_ID || wp.Package_ID} value={wp.Work_Package_ID || wp.Package_ID}>
                  #{wp.Work_Package_ID || wp.Package_ID} - {wp.Work_Package_Name || wp.Package_Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Quantity to Issue *</label>
            <input type="number" required placeholder="e.g. 40" value={issueForm.Quantity_Issued} onChange={(e) => setIssueForm({ ...issueForm, Quantity_Issued: e.target.value })} className="glass-input w-full" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Issue Date *</label>
            <input type="date" required value={issueForm.Issue_Date} onChange={(e) => setIssueForm({ ...issueForm, Issue_Date: e.target.value })} className="glass-input w-full" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsIssueModalOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-sage text-xs">Execute Issue</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT ISSUE */}
      <Modal isOpen={!!editIssue} onClose={() => setEditIssue(null)} title={`Edit Issue Record #${editIssue?.Issue_ID}`} subtitle="Update issue parameters">
        {editIssue && (
          <form onSubmit={handleUpdateIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Quantity Issued *</label>
              <input
                type="number"
                required
                value={editIssue.Quantity_Issued ?? editIssue.Issued_Quantity ?? 0}
                onChange={(e) => setEditIssue({ ...editIssue, Quantity_Issued: Number(e.target.value), Issued_Quantity: Number(e.target.value) })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={editIssue.Issue_Date}
                onChange={(e) => setEditIssue({ ...editIssue, Issue_Date: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditIssue(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: ADD MATERIAL */}
      <Modal isOpen={isAddMaterialOpen} onClose={() => setIsAddMaterialOpen(false)} title="Register Material in Catalog" subtitle="Add new standardized construction material">
        <form onSubmit={handleCreateMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Material ID *</label>
            <input type="number" required placeholder="e.g. 516" value={materialForm.Material_ID} onChange={(e) => setMaterialForm({ ...materialForm, Material_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Material Name *</label>
            <input type="text" required placeholder="e.g. Ready-Mix Concrete M25" value={materialForm.Material_Name} onChange={(e) => setMaterialForm({ ...materialForm, Material_Name: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Unit of Measurement *</label>
            <input type="text" required placeholder="e.g. cu.m, Tonnes, Bags, Bundles" value={materialForm.Unit_Of_Measure} onChange={(e) => setMaterialForm({ ...materialForm, Unit_Of_Measure: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddMaterialOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Add Material</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT MATERIAL */}
      <Modal isOpen={!!editMaterial} onClose={() => setEditMaterial(null)} title={`Edit Material #${editMaterial?.Material_ID}`} subtitle="Update catalog specifications">
        {editMaterial && (
          <form onSubmit={handleUpdateMaterial} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Material Name *</label>
              <input
                type="text"
                required
                value={editMaterial.Material_Name}
                onChange={(e) => setEditMaterial({ ...editMaterial, Material_Name: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Unit of Measurement *</label>
              <input
                type="text"
                required
                value={editMaterial.Unit_Of_Measure || editMaterial.Unit || ''}
                onChange={(e) => setEditMaterial({ ...editMaterial, Unit_Of_Measure: e.target.value, Unit: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditMaterial(null)} className="glass-button-secondary text-xs">Cancel</button>
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
