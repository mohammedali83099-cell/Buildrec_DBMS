import React, { useEffect, useState } from 'react';
import { 
  Receipt, 
  CreditCard, 
  Plus, 
  Trash2, 
  Pencil,
  Search, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { api } from '../api';
import { Bill, Payment, WorkPackage } from '../types';

interface BillingPaymentsPageProps {
  initialAction?: 'add-bill' | 'record-payment' | null;
  onActionHandled?: () => void;
}

export const BillingPaymentsPage: React.FC<BillingPaymentsPageProps> = ({ initialAction, onActionHandled }) => {
  const [activeTab, setActiveTab] = useState<'bills' | 'payments'>('bills');

  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);

  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Modals
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // Edit Modals
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null);

  // Forms
  const [billForm, setBillForm] = useState({
    Bill_ID: '',
    Work_Package_ID: '',
    Billed_Quantity: '',
    Bill_Amount: '',
    Bill_Date: new Date().toISOString().split('T')[0],
    Status: 'Approved'
  });

  const [paymentForm, setPaymentForm] = useState({
    Payment_ID: '',
    Bill_ID: '',
    Amount_Paid: '',
    Payment_Date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialAction) {
      if (initialAction === 'add-bill') {
        setActiveTab('bills');
        handleOpenAddBill();
      } else if (initialAction === 'record-payment') {
        setActiveTab('payments');
        handleOpenAddPayment();
      }
      onActionHandled?.();
    }
  }, [initialAction, bills, payments]);

  const loadData = async () => {
    try {
      const [bList, pList, wpList] = await Promise.all([
        api.getBills(),
        api.getPayments(),
        api.getWorkPackages(),
      ]);
      setBills(bList);
      setPayments(pList);
      setWorkPackages(wpList);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBill({
        Bill_ID: Number(billForm.Bill_ID),
        Work_Package_ID: Number(billForm.Work_Package_ID),
        Package_ID: Number(billForm.Work_Package_ID),
        Billed_Quantity: Number(billForm.Billed_Quantity),
        Bill_Amount: Number(billForm.Bill_Amount),
        Bill_Date: billForm.Bill_Date,
        Status: billForm.Status
      });
      setFeedback({ type: 'success', message: `Contractor bill #${billForm.Bill_ID} logged!` });
      setIsAddBillOpen(false);
      setBillForm({
        Bill_ID: '',
        Work_Package_ID: '',
        Billed_Quantity: '',
        Bill_Amount: '',
        Bill_Date: new Date().toISOString().split('T')[0],
        Status: 'Approved'
      });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBill) return;
    try {
      await api.updateBill(editBill.Bill_ID, {
        Bill_Amount: Number(editBill.Bill_Amount),
        Bill_Date: editBill.Bill_Date,
        Status: editBill.Status
      });
      setFeedback({ type: 'success', message: `Bill #${editBill.Bill_ID} updated!` });
      setEditBill(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPayment({
        Payment_ID: Number(paymentForm.Payment_ID),
        Bill_ID: Number(paymentForm.Bill_ID),
        Amount_Paid: Number(paymentForm.Amount_Paid),
        Payment_Amount: Number(paymentForm.Amount_Paid),
        Payment_Date: paymentForm.Payment_Date,
        Payment_Mode: 'NEFT'
      });
      setFeedback({ type: 'success', message: `Payment installment #${paymentForm.Payment_ID} recorded!` });
      setIsAddPaymentOpen(false);
      setPaymentForm({
        Payment_ID: '',
        Bill_ID: '',
        Amount_Paid: '',
        Payment_Date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPayment) return;
    try {
      const amt = Number(editPayment.Amount_Paid || editPayment.Payment_Amount);
      await api.updatePayment(editPayment.Payment_ID, {
        Amount_Paid: amt,
        Payment_Amount: amt,
        Payment_Date: editPayment.Payment_Date
      });
      setFeedback({ type: 'success', message: `Payment #${editPayment.Payment_ID} updated!` });
      setEditPayment(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'bill') await api.deleteBill(deleteConfirm.id);
      else if (deleteConfirm.type === 'payment') await api.deletePayment(deleteConfirm.id);

      setFeedback({ type: 'success', message: `Record deleted successfully.` });
      setDeleteConfirm(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setDeleteConfirm(null);
    }
  };

  const selectedBillForPayment = bills.find(b => b.Bill_ID === Number(paymentForm.Bill_ID));

  const handleOpenAddBill = () => {
    const nextBillId = bills.length > 0 ? Math.max(...bills.map(b => b.Bill_ID)) + 1 : 801;
    setBillForm({
      Bill_ID: nextBillId.toString(),
      Work_Package_ID: (workPackages[0]?.Work_Package_ID || workPackages[0]?.Package_ID || '').toString(),
      Billed_Quantity: '50',
      Bill_Amount: '250000',
      Bill_Date: new Date().toISOString().split('T')[0],
      Status: 'Approved'
    });
    setIsAddBillOpen(true);
  };

  const handleOpenAddPayment = (preselectedBillId?: number, exactBalance?: number) => {
    const nextPayId = payments.length > 0 ? Math.max(...payments.map(p => p.Payment_ID)) + 1 : 901;
    const targetBillId = preselectedBillId || (bills[0]?.Bill_ID || 0);
    const targetBill = bills.find(b => b.Bill_ID === targetBillId);
    const paid = targetBill?.Paid_Amount || 0;
    const balance = exactBalance !== undefined ? exactBalance : (targetBill ? targetBill.Bill_Amount - paid : 100000);

    setPaymentForm({
      Payment_ID: nextPayId.toString(),
      Bill_ID: targetBillId.toString(),
      Amount_Paid: balance > 0 ? balance.toString() : '50000',
      Payment_Date: new Date().toISOString().split('T')[0]
    });
    setIsAddPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">Billing &amp; Contractor Payments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Enforces trigger rules: Verified work package progress &ge; 10%, payments &le; total billed amount</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'bills' && (
            <button onClick={handleOpenAddBill} className="glass-button-primary text-xs">
              <Plus className="w-4 h-4" /> Create Bill
            </button>
          )}
          {activeTab === 'payments' && (
            <button onClick={() => handleOpenAddPayment()} className="glass-button-sage text-xs">
              <CreditCard className="w-4 h-4" /> Record Payment
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
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'bills' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Contractor Bills ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'payments' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Payment Payouts ({payments.length})
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

      {/* Table Content */}
      <div className="glass-panel overflow-hidden">
        {/* BILLS TAB */}
        {activeTab === 'bills' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Bill ID</th>
                  <th className="py-3 px-4">Work Package</th>
                  <th className="py-3 px-4">Bill Amount</th>
                  <th className="py-3 px-4">Paid Total</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Bill Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {bills
                  .filter(b => (b.Package_Name && b.Package_Name.toLowerCase().includes(search.toLowerCase())) || b.Bill_ID.toString().includes(search))
                  .map((b) => {
                    const paid = b.Paid_Amount || 0;
                    const balance = (b.Balance_Due !== undefined) ? b.Balance_Due : (b.Bill_Amount - paid);
                    return (
                      <tr key={b.Bill_ID} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">#{b.Bill_ID}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{b.Package_Name || `Package #${b.Work_Package_ID}`}</td>
                        <td className="py-3 px-4 font-bold text-charcoal-900">₹{b.Bill_Amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">₹{paid.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            balance <= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}>
                            {balance <= 0 ? 'Fully Paid' : `₹${balance.toLocaleString()}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{b.Bill_Date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {balance > 0 && (
                              <button
                                onClick={() => handleOpenAddPayment(b.Bill_ID, balance)}
                                className="glass-button-sage text-[11px] py-1 px-2.5 font-semibold"
                                title="Pay this bill immediately"
                              >
                                <CreditCard className="w-3.5 h-3.5" /> Pay Now
                              </button>
                            )}
                            <button
                              onClick={() => setEditBill(b)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                              title="Edit Bill"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'bill', id: b.Bill_ID, name: `Bill #${b.Bill_ID}` })}
                              className="glass-button-danger"
                              title="Delete Bill"
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

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Bill Ref</th>
                  <th className="py-3 px-4">Work Package</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                {payments
                  .filter(p => p.Payment_ID.toString().includes(search) || (p.Package_Name && p.Package_Name.toLowerCase().includes(search.toLowerCase())))
                  .map((p) => {
                    const amt = p.Amount_Paid || p.Payment_Amount || 0;
                    return (
                      <tr key={p.Payment_ID} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">#{p.Payment_ID}</td>
                        <td className="py-3 px-4 font-medium">Bill #{p.Bill_ID}</td>
                        <td className="py-3 px-4 font-semibold text-charcoal-900">{p.Package_Name || 'Work Package'}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">₹{amt.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-600">{p.Payment_Date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setEditPayment(p)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-charcoal-900 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
                              title="Edit Payment"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'payment', id: p.Payment_ID, name: `Payment #${p.Payment_ID}` })}
                              className="glass-button-danger"
                              title="Delete Payment"
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

      {/* MODAL: CREATE BILL */}
      <Modal isOpen={isAddBillOpen} onClose={() => setIsAddBillOpen(false)} title="Issue Contractor Bill" subtitle="Requires verified work package progress >= 10%">
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Bill ID *</label>
            <input type="number" required placeholder="e.g. 931" value={billForm.Bill_ID} onChange={(e) => setBillForm({ ...billForm, Bill_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Work Package *</label>
            <select required value={billForm.Work_Package_ID} onChange={(e) => setBillForm({ ...billForm, Work_Package_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Package --</option>
              {workPackages.map(wp => {
                const pkgId = wp.Work_Package_ID || wp.Package_ID;
                const name = wp.Work_Package_Name || wp.Package_Name;
                return <option key={pkgId} value={pkgId}>#{pkgId} - {name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Billed Quantity *</label>
            <input type="number" required placeholder="e.g. 100" value={billForm.Billed_Quantity} onChange={(e) => setBillForm({ ...billForm, Billed_Quantity: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Total Bill Amount (INR) *</label>
            <input type="number" required placeholder="e.g. 350000" value={billForm.Bill_Amount} onChange={(e) => setBillForm({ ...billForm, Bill_Amount: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Invoice Date *</label>
            <input type="date" required value={billForm.Bill_Date} onChange={(e) => setBillForm({ ...billForm, Bill_Date: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddBillOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-primary text-xs">Register Bill</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT BILL */}
      <Modal isOpen={!!editBill} onClose={() => setEditBill(null)} title={`Edit Bill #${editBill?.Bill_ID}`} subtitle="Update invoice specifications">
        {editBill && (
          <form onSubmit={handleUpdateBill} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Bill Amount (INR) *</label>
              <input
                type="number"
                required
                value={editBill.Bill_Amount}
                onChange={(e) => setEditBill({ ...editBill, Bill_Amount: Number(e.target.value) })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Bill Date *</label>
              <input
                type="date"
                required
                value={editBill.Bill_Date || ''}
                onChange={(e) => setEditBill({ ...editBill, Bill_Date: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditBill(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: RECORD PAYMENT */}
      <Modal isOpen={isAddPaymentOpen} onClose={() => setIsAddPaymentOpen(false)} title="Record Payment Payout" subtitle="Enforces validation: payment total <= bill total">
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Payment ID *</label>
            <input type="number" required placeholder="e.g. 738" value={paymentForm.Payment_ID} onChange={(e) => setPaymentForm({ ...paymentForm, Payment_ID: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Target Contractor Bill *</label>
            <select required value={paymentForm.Bill_ID} onChange={(e) => setPaymentForm({ ...paymentForm, Bill_ID: e.target.value })} className="glass-dropdown w-full">
              <option value="">-- Choose Bill --</option>
              {bills.map(b => (
                <option key={b.Bill_ID} value={b.Bill_ID}>
                  Bill #{b.Bill_ID} (Total: ₹{b.Bill_Amount.toLocaleString()}, Balance: ₹{(b.Balance_Due ?? (b.Bill_Amount - (b.Paid_Amount || 0))).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedBillForPayment && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              Outstanding Balance: <strong className="text-amber-800 font-bold">₹{(selectedBillForPayment.Balance_Due ?? (selectedBillForPayment.Bill_Amount - (selectedBillForPayment.Paid_Amount || 0))).toLocaleString()}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Payment Amount (INR) *</label>
            <input type="number" required placeholder="e.g. 150000" value={paymentForm.Amount_Paid} onChange={(e) => setPaymentForm({ ...paymentForm, Amount_Paid: e.target.value })} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Payment Date *</label>
            <input type="date" required value={paymentForm.Payment_Date} onChange={(e) => setPaymentForm({ ...paymentForm, Payment_Date: e.target.value })} className="glass-input w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
            <button type="button" onClick={() => setIsAddPaymentOpen(false)} className="glass-button-secondary text-xs">Cancel</button>
            <button type="submit" className="glass-button-sage text-xs">Authorize Payment</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PAYMENT */}
      <Modal isOpen={!!editPayment} onClose={() => setEditPayment(null)} title={`Edit Payment #${editPayment?.Payment_ID}`} subtitle="Update payment amount or transaction date">
        {editPayment && (
          <form onSubmit={handleUpdatePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Payment Amount (INR) *</label>
              <input
                type="number"
                required
                value={editPayment.Amount_Paid || editPayment.Payment_Amount || 0}
                onChange={(e) => setEditPayment({ ...editPayment, Amount_Paid: Number(e.target.value), Payment_Amount: Number(e.target.value) })}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={editPayment.Payment_Date || ''}
                onChange={(e) => setEditPayment({ ...editPayment, Payment_Date: e.target.value })}
                className="glass-input w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
              <button type="button" onClick={() => setEditPayment(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button type="submit" className="glass-button-primary text-xs">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Simple Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Deletion" subtitle="This action cannot be undone">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-xs text-charcoal-800">
              Are you sure you want to delete <strong className="text-charcoal-950 font-bold">{deleteConfirm.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="glass-button-secondary text-xs">Cancel</button>
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
