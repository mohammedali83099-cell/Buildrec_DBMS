import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  FileText, 
  Package, 
  Building, 
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
import { Supplier, PurchaseOrder, Delivery, DeliveryItem, Site, Material } from '../types';

export const ProcurementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'pos' | 'items' | 'suppliers'>('deliveries');
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Modals
  const [isAddPOOpen, setIsAddPOOpen] = useState(false);
  const [isAddDeliveryOpen, setIsAddDeliveryOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // Edit Modals
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [editPO, setEditPO] = useState<PurchaseOrder | null>(null);
  const [editDelivery, setEditDelivery] = useState<Delivery | null>(null);
  const [editItem, setEditItem] = useState<DeliveryItem | null>(null);

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null);

  // Forms
  const [poForm, setPOForm] = useState({ PO_ID: '', Supplier_ID: '', Order_Date: new Date().toISOString().split('T')[0] });
  const [deliveryForm, setDeliveryForm] = useState({ Delivery_ID: '', PO_ID: '', Site_ID: '', Delivery_Date: new Date().toISOString().split('T')[0] });
  const [itemForm, setItemForm] = useState({ Delivery_Item_ID: '', Delivery_ID: '', Material_ID: '', Quantity_Delivered: '', Unit_Price: '0' });
  const [supplierForm, setSupplierForm] = useState({ Supplier_ID: '', Supplier_Name: '', Contact_Info: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [sup, po, del, items, st, mat] = await Promise.all([
        api.getSuppliers(),
        api.getPurchaseOrders(),
        api.getDeliveries(),
        api.getDeliveryItems(),
        api.getSites(),
        api.getMaterials(),
      ]);
      setSuppliers(sup);
      setPurchaseOrders(po);
      setDeliveries(del);
      setDeliveryItems(items);
      setSites(st);
      setMaterials(mat);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPurchaseOrder({
        PO_ID: Number(poForm.PO_ID),
        Supplier_ID: Number(poForm.Supplier_ID),
        Order_Date: poForm.Order_Date
      });
      setFeedback({ type: 'success', message: `Purchase Order #${poForm.PO_ID} recorded!` });
      setIsAddPOOpen(false);
      setPOForm({ PO_ID: '', Supplier_ID: '', Order_Date: new Date().toISOString().split('T')[0] });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPO) return;
    try {
      await api.updatePurchaseOrder(editPO.PO_ID, {
        Supplier_ID: editPO.Supplier_ID,
        Order_Date: editPO.Order_Date
      });
      setFeedback({ type: 'success', message: `PO #${editPO.PO_ID} updated successfully!` });
      setEditPO(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDelivery({
        Delivery_ID: Number(deliveryForm.Delivery_ID),
        PO_ID: Number(deliveryForm.PO_ID),
        Site_ID: Number(deliveryForm.Site_ID),
        Delivery_Date: deliveryForm.Delivery_Date,
        Challan_No: `CHAL-${deliveryForm.Delivery_ID}`,
        Received_By: 'Site Supervisor'
      });
      setFeedback({ type: 'success', message: `Delivery #${deliveryForm.Delivery_ID} recorded!` });
      setIsAddDeliveryOpen(false);
      setDeliveryForm({ Delivery_ID: '', PO_ID: '', Site_ID: '', Delivery_Date: new Date().toISOString().split('T')[0] });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDelivery) return;
    try {
      await api.updateDelivery(editDelivery.Delivery_ID, {
        PO_ID: editDelivery.PO_ID,
        Site_ID: editDelivery.Site_ID,
        Delivery_Date: editDelivery.Delivery_Date,
        Challan_No: editDelivery.Challan_No || `CHAL-${editDelivery.Delivery_ID}`,
        Received_By: editDelivery.Received_By || 'Site Supervisor'
      });
      setFeedback({ type: 'success', message: `Delivery #${editDelivery.Delivery_ID} updated!` });
      setEditDelivery(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDeliveryItem({
        Delivery_Item_ID: Number(itemForm.Delivery_Item_ID),
        Delivery_ID: Number(itemForm.Delivery_ID),
        Material_ID: Number(itemForm.Material_ID),
        Quantity_Delivered: Number(itemForm.Quantity_Delivered),
        Delivered_Quantity: Number(itemForm.Quantity_Delivered),
        Unit_Price: Number(itemForm.Unit_Price) || 0
      });
      setFeedback({ type: 'success', message: `Delivery item #${itemForm.Delivery_Item_ID} registered!` });
      setIsAddItemOpen(false);
      setItemForm({ Delivery_Item_ID: '', Delivery_ID: '', Material_ID: '', Quantity_Delivered: '', Unit_Price: '0' });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await api.updateDeliveryItem(editItem.Delivery_Item_ID, {
        Delivered_Quantity: editItem.Quantity_Delivered,
        Quantity_Delivered: editItem.Quantity_Delivered,
        Material_ID: editItem.Material_ID,
        Unit_Price: editItem.Unit_Price
      });
      setFeedback({ type: 'success', message: `Delivery item updated!` });
      setEditItem(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupplier({
        Supplier_ID: Number(supplierForm.Supplier_ID),
        Supplier_Name: supplierForm.Supplier_Name,
        Contact_Info: supplierForm.Contact_Info
      });
      setFeedback({ type: 'success', message: `Supplier "${supplierForm.Supplier_Name}" added!` });
      setIsAddSupplierOpen(false);
      setSupplierForm({ Supplier_ID: '', Supplier_Name: '', Contact_Info: '' });
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSupplier) return;
    try {
      await api.updateSupplier(editSupplier.Supplier_ID, {
        Supplier_Name: editSupplier.Supplier_Name,
        Contact_Info: editSupplier.Contact_Info
      });
      setFeedback({ type: 'success', message: `Supplier updated!` });
      setEditSupplier(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'delivery') await api.deleteDelivery(deleteConfirm.id);
      else if (deleteConfirm.type === 'po') await api.deletePurchaseOrder(deleteConfirm.id);
      else if (deleteConfirm.type === 'item') await api.deleteDeliveryItem(deleteConfirm.id);
      else if (deleteConfirm.type === 'supplier') await api.deleteSupplier(deleteConfirm.id);
      
      setFeedback({ type: 'success', message: `Record and associated dependencies safely cascade-deleted.` });
      setDeleteConfirm(null);
      loadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setDeleteConfirm(null);
    }
  };

  const handleOpenAddDelivery = () => {
    const nextDelId = deliveries.length > 0 ? Math.max(...deliveries.map(d => d.Delivery_ID)) + 1 : 701;
    setDeliveryForm({
      Delivery_ID: nextDelId.toString(),
      PO_ID: purchaseOrders[0]?.PO_ID.toString() || '',
      Site_ID: sites[0]?.Site_ID.toString() || '',
      Delivery_Date: new Date().toISOString().split('T')[0]
    });
    setIsAddDeliveryOpen(true);
  };

  const handleOpenAddPO = () => {
    const nextPOId = purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map(p => p.PO_ID)) + 1 : 601;
    setPOForm({
      PO_ID: nextPOId.toString(),
      Supplier_ID: suppliers[0]?.Supplier_ID.toString() || '',
      Order_Date: new Date().toISOString().split('T')[0]
    });
    setIsAddPOOpen(true);
  };

  const handleOpenAddItem = (preselectedDeliveryId?: number) => {
    const nextItemId = deliveryItems.length > 0 ? Math.max(...deliveryItems.map(di => di.Delivery_Item_ID)) + 1 : 801;
    setItemForm({
      Delivery_Item_ID: nextItemId.toString(),
      Delivery_ID: (preselectedDeliveryId || deliveries[0]?.Delivery_ID || '').toString(),
      Material_ID: materials[0]?.Material_ID.toString() || '',
      Quantity_Delivered: '',
      Unit_Price: '500'
    });
    setIsAddItemOpen(true);
  };

  const handleOpenAddSupplier = () => {
    const nextSupId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.Supplier_ID)) + 1 : 501;
    setSupplierForm({
      Supplier_ID: nextSupId.toString(),
      Supplier_Name: '',
      Contact_Info: ''
    });
    setIsAddSupplierOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">Procurement &amp; Inbound Deliveries</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control vendor purchases, track dispatches, and log receipt consignments</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'deliveries' && (
            <button onClick={handleOpenAddDelivery} className="glass-button-primary text-xs">
              <Plus className="w-4 h-4" /> Log Delivery
            </button>
          )}
          {activeTab === 'pos' && (
            <button onClick={handleOpenAddPO} className="glass-button-primary text-xs">
              <Plus className="w-4 h-4" /> New PO
            </button>
          )}
          {activeTab === 'items' && (
            <button onClick={() => handleOpenAddItem()} className="glass-button-primary text-xs">
              <Plus className="w-4 h-4" /> Add Line Item
            </button>
          )}
          {activeTab === 'suppliers' && (
            <button onClick={handleOpenAddSupplier} className="glass-button-primary text-xs">
              <Plus className="w-4 h-4" /> Register Supplier
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

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'deliveries' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Deliveries ({deliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'pos' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> POs ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'items' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Items ({deliveryItems.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'suppliers' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Suppliers ({suppliers.length})
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
        {/* DELIVERIES TAB */}
        {activeTab === 'deliveries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Delivery ID</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Destination Site</th>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {deliveries
                  .filter(d => d.Delivery_ID.toString().includes(search) || (d.Site_Name && d.Site_Name.toLowerCase().includes(search.toLowerCase())))
                  .map((d) => (
                    <tr key={d.Delivery_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">#{d.Delivery_ID}</td>
                      <td className="py-3 px-4 font-medium">PO #{d.PO_ID}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{d.Site_Name || `Site #${d.Site_ID}`}</td>
                      <td className="py-3 px-4 text-slate-600">{d.Delivery_Date}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenAddItem(d.Delivery_ID)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sage-50 hover:bg-sage-100 text-sage-800 border border-sage-200/60 transition-colors"
                            title="Receive & record line items for this delivery"
                          >
                            <Plus className="w-3.5 h-3.5 text-sage-600" /> Receive Items
                          </button>
                          <button
                            onClick={() => setEditDelivery(d)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                            title="Edit Delivery"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'delivery', id: d.Delivery_ID, name: `Delivery #${d.Delivery_ID}` })}
                            className="glass-button-danger"
                            title="Delete Delivery & Line Items"
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

        {/* PURCHASE ORDERS TAB */}
        {activeTab === 'pos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">PO ID</th>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {purchaseOrders
                  .filter(po => po.PO_ID.toString().includes(search) || (po.Supplier_Name && po.Supplier_Name.toLowerCase().includes(search.toLowerCase())))
                  .map((po) => (
                    <tr key={po.PO_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">PO #{po.PO_ID}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{po.Supplier_Name || `Supplier #${po.Supplier_ID}`}</td>
                      <td className="py-3 px-4 text-slate-600">{po.Order_Date}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditPO(po)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                            title="Edit PO"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'po', id: po.PO_ID, name: `PO #${po.PO_ID}` })}
                            className="glass-button-danger"
                            title="Cascade Delete PO"
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

        {/* DELIVERY ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Delivery Ref</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Delivered Quantity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {deliveryItems
                  .filter(di => di.Delivery_Item_ID.toString().includes(search) || (di.Material_Name && di.Material_Name.toLowerCase().includes(search.toLowerCase())))
                  .map((di) => (
                    <tr key={di.Delivery_Item_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">#{di.Delivery_Item_ID}</td>
                      <td className="py-3 px-4 font-medium">Delivery #{di.Delivery_ID}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{di.Material_Name || `Material #${di.Material_ID}`}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{di.Quantity_Delivered} {di.Unit || 'units'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditItem(di)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                            title="Edit Line Item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'item', id: di.Delivery_Item_ID, name: `Line Item #${di.Delivery_Item_ID}` })}
                            className="glass-button-danger"
                            title="Delete Line Item"
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

        {/* SUPPLIERS TAB */}
        {activeTab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Supplier ID</th>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {suppliers
                  .filter(s => s.Supplier_Name.toLowerCase().includes(search.toLowerCase()) || s.Supplier_ID.toString().includes(search))
                  .map((s) => (
                    <tr key={s.Supplier_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">#{s.Supplier_ID}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{s.Supplier_Name}</td>
                      <td className="py-3 px-4 text-slate-500">{s.Contact_Info || 'No direct phone/email'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditSupplier(s)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                            title="Edit Supplier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'supplier', id: s.Supplier_ID, name: s.Supplier_Name })}
                            className="glass-button-danger"
                            title="Cascade Delete Supplier"
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

      {/* MODAL: CREATE PO */}
      <Modal isOpen={isAddPOOpen} onClose={() => setIsAddPOOpen(false)} title="Issue New Purchase Order" subtitle="Generates PO for vendor delivery">
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">PO ID *</label>
            <input type="number" required placeholder="e.g. 321" value={poForm.PO_ID} onChange={(e) => setPOForm({ ...poForm, PO_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Select Supplier *</label>
            <select required value={poForm.Supplier_ID} onChange={(e) => setPOForm({ ...poForm, Supplier_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Supplier --</option>
              {suppliers.map(s => <option key={s.Supplier_ID} value={s.Supplier_ID}>#{s.Supplier_ID} - {s.Supplier_Name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Order Date *</label>
            <input type="date" required value={poForm.Order_Date} onChange={(e) => setPOForm({ ...poForm, Order_Date: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddPOOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Generate PO</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PO */}
      <Modal isOpen={!!editPO} onClose={() => setEditPO(null)} title={`Edit PO #${editPO?.PO_ID}`} subtitle="Update Purchase Order details">
        {editPO && (
          <form onSubmit={handleUpdatePO} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Supplier</label>
              <select value={editPO.Supplier_ID} onChange={(e) => setEditPO({ ...editPO, Supplier_ID: Number(e.target.value) })} className="glass-dropdown w-full">
                {suppliers.map(s => <option key={s.Supplier_ID} value={s.Supplier_ID}>#{s.Supplier_ID} - {s.Supplier_Name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Order Date *</label>
              <input type="date" required value={editPO.Order_Date} onChange={(e) => setEditPO({ ...editPO, Order_Date: e.target.value })} className="glass-input w-full" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditPO(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: CREATE DELIVERY */}
      <Modal isOpen={isAddDeliveryOpen} onClose={() => setIsAddDeliveryOpen(false)} title="Record Incoming Delivery" subtitle="Logs site delivery from PO">
        <form onSubmit={handleCreateDelivery} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Delivery ID *</label>
            <input type="number" required placeholder="e.g. 731" value={deliveryForm.Delivery_ID} onChange={(e) => setDeliveryForm({ ...deliveryForm, Delivery_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Associated PO *</label>
            <select required value={deliveryForm.PO_ID} onChange={(e) => setDeliveryForm({ ...deliveryForm, PO_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose PO --</option>
              {purchaseOrders.map(p => <option key={p.PO_ID} value={p.PO_ID}>PO #{p.PO_ID} ({p.Supplier_Name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Destination Site *</label>
            <select required value={deliveryForm.Site_ID} onChange={(e) => setDeliveryForm({ ...deliveryForm, Site_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Site --</option>
              {sites.map(s => <option key={s.Site_ID} value={s.Site_ID}>#{s.Site_ID} - {s.Site_Name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Delivery Date *</label>
            <input type="date" required value={deliveryForm.Delivery_Date} onChange={(e) => setDeliveryForm({ ...deliveryForm, Delivery_Date: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddDeliveryOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Save Delivery</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT DELIVERY */}
      <Modal isOpen={!!editDelivery} onClose={() => setEditDelivery(null)} title={`Edit Delivery #${editDelivery?.Delivery_ID}`} subtitle="Update delivery information">
        {editDelivery && (
          <form onSubmit={handleUpdateDelivery} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Destination Site</label>
              <select value={editDelivery.Site_ID} onChange={(e) => setEditDelivery({ ...editDelivery, Site_ID: Number(e.target.value) })} className="glass-dropdown w-full">
                {sites.map(s => <option key={s.Site_ID} value={s.Site_ID}>#{s.Site_ID} - {s.Site_Name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Delivery Date *</label>
              <input type="date" required value={editDelivery.Delivery_Date} onChange={(e) => setEditDelivery({ ...editDelivery, Delivery_Date: e.target.value })} className="glass-input w-full" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditDelivery(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: CREATE ITEM */}
      <Modal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title="Add Delivery Line Item" subtitle="Itemized receipt of delivered material">
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Item ID *</label>
            <input type="number" required placeholder="e.g. 841" value={itemForm.Delivery_Item_ID} onChange={(e) => setItemForm({ ...itemForm, Delivery_Item_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Delivery Consignment *</label>
            <select required value={itemForm.Delivery_ID} onChange={(e) => setItemForm({ ...itemForm, Delivery_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Delivery --</option>
              {deliveries.map(d => <option key={d.Delivery_ID} value={d.Delivery_ID}>Delivery #{d.Delivery_ID} ({d.Site_Name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Material Item *</label>
            <select required value={itemForm.Material_ID} onChange={(e) => setItemForm({ ...itemForm, Material_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Material --</option>
              {materials.map(m => <option key={m.Material_ID} value={m.Material_ID}>#{m.Material_ID} - {m.Material_Name} ({m.Unit || 'units'})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Delivered Quantity *</label>
            <input type="number" required placeholder="e.g. 250" value={itemForm.Quantity_Delivered} onChange={(e) => setItemForm({ ...itemForm, Quantity_Delivered: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddItemOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Record Item</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT ITEM */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={`Edit Line Item #${editItem?.Delivery_Item_ID}`} subtitle="Update delivered line item quantity">
        {editItem && (
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Material</label>
              <select value={editItem.Material_ID} onChange={(e) => setEditItem({ ...editItem, Material_ID: Number(e.target.value) })} className="glass-dropdown w-full">
                {materials.map(m => <option key={m.Material_ID} value={m.Material_ID}>#{m.Material_ID} - {m.Material_Name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Quantity Delivered *</label>
              <input type="number" required value={editItem.Quantity_Delivered} onChange={(e) => setEditItem({ ...editItem, Quantity_Delivered: Number(e.target.value) })} className="glass-input w-full" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditItem(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: REGISTER SUPPLIER */}
      <Modal isOpen={isAddSupplierOpen} onClose={() => setIsAddSupplierOpen(false)} title="Register Supplier" subtitle="Vendor directory entry">
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Supplier ID *</label>
            <input type="number" required placeholder="e.g. 611" value={supplierForm.Supplier_ID} onChange={(e) => setSupplierForm({ ...supplierForm, Supplier_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Supplier Company Name *</label>
            <input type="text" required placeholder="e.g. Premier Aggregates Ltd" value={supplierForm.Supplier_Name} onChange={(e) => setSupplierForm({ ...supplierForm, Supplier_Name: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contact Details</label>
            <input type="text" placeholder="+91-9988776655, sales@premier.in" value={supplierForm.Contact_Info} onChange={(e) => setSupplierForm({ ...supplierForm, Contact_Info: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddSupplierOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Register Supplier</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT SUPPLIER */}
      <Modal isOpen={!!editSupplier} onClose={() => setEditSupplier(null)} title={`Edit Supplier #${editSupplier?.Supplier_ID}`} subtitle="Update vendor credentials">
        {editSupplier && (
          <form onSubmit={handleUpdateSupplier} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Company Name *</label>
              <input type="text" required value={editSupplier.Supplier_Name} onChange={(e) => setEditSupplier({ ...editSupplier, Supplier_Name: e.target.value })} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contact Details</label>
              <input type="text" value={editSupplier.Contact_Info || ''} onChange={(e) => setEditSupplier({ ...editSupplier, Contact_Info: e.target.value })} className="glass-input w-full" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditSupplier(null)} className="glass-button-secondary text-xs">Cancel</button>
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
