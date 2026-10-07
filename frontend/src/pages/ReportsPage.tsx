import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Boxes, 
  TrendingUp, 
  Truck, 
  Receipt, 
  DollarSign, 
  FileCheck2,
  Search,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<
    'material' | 'progress' | 'supplier' | 'bills' | 'cost' | 'status'
  >('material');

  const [materialData, setMaterialData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [supplierData, setSupplierData] = useState<any[]>([]);
  const [billsData, setBillsData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [mat, prog, sup, b, cost, stat] = await Promise.all([
        api.getMaterialBalanceReport(),
        api.getWorkProgressReport(),
        api.getSupplierPerformanceReport(),
        api.getContractorBillsReport(),
        api.getCostVarianceReport(),
        api.getProjectStatusReport(),
      ]);
      setMaterialData(mat);
      setProgressData(prog);
      setSupplierData(sup);
      setBillsData(b);
      setCostData(cost);
      setStatusData(stat);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">Executive Reports & SQL Analytical Views</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time analytical dashboards derived directly from the 6 database views</p>
        </div>

        <button 
          onClick={loadReports}
          className="glass-button-secondary text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Views
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap p-1 bg-white border border-slate-200/90 rounded-xl shadow-xs gap-1">
        <button
          onClick={() => { setActiveReport('material'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeReport === 'material' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" /> 1. Material Balance
        </button>
        <button
          onClick={() => { setActiveReport('progress'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeReport === 'progress' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> 2. Work Progress
        </button>
        <button
          onClick={() => { setActiveReport('supplier'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeReport === 'supplier' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> 3. Supplier Performance
        </button>
        <button
          onClick={() => { setActiveReport('bills'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeReport === 'bills' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" /> 4. Contractor Bills
        </button>
        <button
          onClick={() => { setActiveReport('cost'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeReport === 'cost' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> 5. Cost Variance
        </button>
        <button
          onClick={() => { setActiveReport('status'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeReport === 'status' ? 'bg-charcoal-900 text-white shadow-xs' : 'text-slate-600 hover:text-charcoal-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" /> 6. Project Status
        </button>
      </div>

      {/* Search Filter for current report */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-9 w-full text-xs"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* REPORT 1: MATERIAL BALANCE */}
      {/* ========================================================= */}
      {activeReport === 'material' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4">
              <h3 className="font-bold text-base text-charcoal-900">SQL View: vw_material_balance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Compares available warehouse stock against total material issued across construction sites</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialData.slice(0, 8)} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <XAxis dataKey="Material_Name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Current_Available_Stock" name="Current Available Stock" fill="#7A9687" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total_Quantity_Issued" name="Total Issued to Sites" fill="#D4A373" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Site Name</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Unit of Measure</th>
                    <th className="py-3 px-4">Current Available Stock</th>
                    <th className="py-3 px-4">Total Issued</th>
                    <th className="py-3 px-4">Initial Stock Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                  {materialData
                    .filter(m => m.Site_Name.toLowerCase().includes(search.toLowerCase()) || m.Material_Name.toLowerCase().includes(search.toLowerCase()))
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-charcoal-900">{row.Site_Name}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{row.Material_Name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{row.Unit_Of_Measure || 'Units'}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-800">{Number(row.Current_Available_Stock).toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-medium text-amber-800">{Number(row.Total_Quantity_Issued).toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-bold text-charcoal-900">{Number(row.Initial_Stock_Received).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT 2: WORK PROGRESS */}
      {/* ========================================================= */}
      {activeReport === 'progress' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4">
              <h3 className="font-bold text-base text-charcoal-900">SQL View: vw_work_progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">Physical milestone percentage completion by project, site, and contracted agency</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData.slice(0, 10)} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <XAxis dataKey="Work_Package_Name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="Latest_Progress_Percent" name="Progress (%)" radius={[6, 6, 0, 0]}>
                    {progressData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Latest_Progress_Percent >= 70 ? '#7A9687' : '#D4A373'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Site</th>
                    <th className="py-3 px-4">Work Package</th>
                    <th className="py-3 px-4">Contractor</th>
                    <th className="py-3 px-4">Target Quantity</th>
                    <th className="py-3 px-4">Completion (%)</th>
                    <th className="py-3 px-4">Progress Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                  {progressData
                    .filter(p => p.Work_Package_Name.toLowerCase().includes(search.toLowerCase()) || p.Project_Name.toLowerCase().includes(search.toLowerCase()))
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-charcoal-900">{row.Project_Name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.Site_Name}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">{row.Work_Package_Name}</td>
                        <td className="py-3.5 px-4 text-slate-700">{row.Contractor_Name}</td>
                        <td className="py-3.5 px-4 font-mono">{Number(row.Target_Quantity).toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-sage-900 bg-sage-100/80 px-2 py-0.5 rounded-full text-[11px]">
                            {Number(row.Latest_Progress_Percent).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {row.Progress_Stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT 3: SUPPLIER PERFORMANCE */}
      {/* ========================================================= */}
      {activeReport === 'supplier' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4">
              <h3 className="font-bold text-base text-charcoal-900">SQL View: vw_supplier_performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Supplier fulfillment volume and average delivery lead time metrics</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <XAxis dataKey="Supplier_Name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis unit=" d" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="Avg_Lead_Time_Days" name="Average Lead Time (Days)" fill="#7A9687" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Total Deliveries</th>
                    <th className="py-3 px-4">Avg Lead Time</th>
                    <th className="py-3 px-4">On-Time Deliveries</th>
                    <th className="py-3 px-4">Delayed Count</th>
                    <th className="py-3 px-4">On-Time Reliability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                  {supplierData
                    .filter(s => s.Supplier_Name.toLowerCase().includes(search.toLowerCase()))
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-charcoal-900">{row.Supplier_Name}</td>
                        <td className="py-3.5 px-4 font-mono">{row.Total_Orders}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{row.Total_Deliveries}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{row.Avg_Lead_Time_Days} Days</td>
                        <td className="py-3.5 px-4 text-emerald-700 font-bold">{row.On_Time_Deliveries}</td>
                        <td className="py-3.5 px-4 text-amber-700 font-bold">{row.Delayed_Deliveries}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                            {row.On_Time_Delivery_Rate_Pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT 4: CONTRACTOR BILLS */}
      {/* ========================================================= */}
      {activeReport === 'bills' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4">
              <h3 className="font-bold text-base text-charcoal-900">SQL View: vw_contractor_bills</h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary of approved bills, disbursed amounts, and outstanding contractor balances</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billsData.slice(0, 10)} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                  <XAxis dataKey="Contractor_Name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(val: any) => [formatCurrency(val), 'Amount']} contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Bill_Amount" name="Bill Invoiced Amount" fill="#7A9687" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total_Amount_Paid" name="Amount Paid" fill="#2B353A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Bill ID</th>
                    <th className="py-3 px-4">Contractor</th>
                    <th className="py-3 px-4">Work Package</th>
                    <th className="py-3 px-4">Billed Amount</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                  {billsData
                    .filter(b => b.Contractor_Name.toLowerCase().includes(search.toLowerCase()) || b.Bill_ID.toString().includes(search))
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">#{row.Bill_ID}</td>
                        <td className="py-3.5 px-4 font-semibold text-charcoal-900">{row.Contractor_Name}</td>
                        <td className="py-3.5 px-4 text-slate-700">{row.Work_Package_Name}</td>
                        <td className="py-3.5 px-4 font-bold text-charcoal-900">{formatCurrency(row.Bill_Amount)}</td>
                        <td className="py-3.5 px-4 font-medium text-emerald-700">{formatCurrency(row.Total_Amount_Paid)}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-800">{formatCurrency(row.Balance_Due)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            row.Balance_Due <= 0 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {row.Balance_Due <= 0 ? 'Settled' : 'Balance Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT 5: COST VARIANCE */}
      {/* ========================================================= */}
      {activeReport === 'cost' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4">
              <h3 className="font-bold text-base text-charcoal-900">SQL View: vw_cost_variance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Budget utilization tracking and total incurred expenses across projects</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData.slice(0, 8)} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                  <XAxis dataKey="Project_Name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(val: any) => [formatCurrency(val), 'Amount']} contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Allocated_Budget" name="Allocated Budget" fill="#2B353A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total_Billed_Expenses" name="Total Billed Expenses" fill="#7A9687" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Project ID</th>
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-4">Allocated Budget</th>
                    <th className="py-3 px-4">Total Incurred Expenses</th>
                    <th className="py-3 px-4">Total Disbursed</th>
                    <th className="py-3 px-4">Cost Variance</th>
                    <th className="py-3 px-4">Utilization (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                  {costData
                    .filter(c => c.Project_Name.toLowerCase().includes(search.toLowerCase()))
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">#{row.Project_ID}</td>
                        <td className="py-3.5 px-4 font-semibold text-charcoal-900">{row.Project_Name}</td>
                        <td className="py-3.5 px-4 font-bold text-charcoal-950">{formatCurrency(row.Allocated_Budget)}</td>
                        <td className="py-3.5 px-4 font-medium text-amber-800">{formatCurrency(row.Total_Billed_Expenses)}</td>
                        <td className="py-3.5 px-4 font-medium text-emerald-800">{formatCurrency(row.Total_Disbursed)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{formatCurrency(row.Cost_Variance)}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[11px] border border-slate-200">
                            {row.Budget_Utilization_Pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT 6: PROJECT STATUS */}
      {/* ========================================================= */}
      {activeReport === 'status' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4">
              <h3 className="font-bold text-base text-charcoal-900">SQL View: vw_project_status</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-level executive status summary across all construction projects</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <XAxis dataKey="Project_Name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="Overall_Average_Progress_Pct" name="Overall Progress (%)" fill="#7A9687" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Project ID</th>
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-4">Project Status</th>
                    <th className="py-3 px-4">Active Sites</th>
                    <th className="py-3 px-4">Work Packages</th>
                    <th className="py-3 px-4">Overall Progress</th>
                    <th className="py-3 px-4">Total Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-charcoal-800">
                  {statusData
                    .filter(s => s.Project_Name.toLowerCase().includes(search.toLowerCase()))
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">#{row.Project_ID}</td>
                        <td className="py-3.5 px-4 font-semibold text-charcoal-900">{row.Project_Name}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {row.Project_Status || 'In Progress'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{row.Total_Sites}</td>
                        <td className="py-3.5 px-4 font-mono">{row.Total_Work_Packages}</td>
                        <td className="py-3.5 px-4 font-bold text-sage-900">{row.Overall_Average_Progress_Pct}%</td>
                        <td className="py-3.5 px-4 font-bold text-charcoal-900">{formatCurrency(row.Total_Budget)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
