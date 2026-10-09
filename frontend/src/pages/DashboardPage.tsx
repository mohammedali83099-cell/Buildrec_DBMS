import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  HardHat, 
  Boxes, 
  Receipt, 
  TrendingUp, 
  Truck,
  AlertCircle,
  Clock,
  ArrowRight,
  FolderPlus,
  PackageCheck,
  PackageMinus,
  FileText
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../api';
import { DashboardSummary } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  CartesianGrid
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: any, action?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [workProgressData, setWorkProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [sum, prog] = await Promise.all([
        api.getSummary(),
        api.getWorkProgressReport(),
      ]);
      setSummary(sum);
      setWorkProgressData(prog.slice(0, 8)); // Top 8 work packages for chart
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-sage-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  const financialData = [
    { name: 'Disbursed Paid', value: summary?.totalPaid || 0, color: '#7A9687' },
    { name: 'Balance Due', value: summary?.balanceDue || 0, color: '#D9822B' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner - Sleek Executive Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-1.5 sm:mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
            <span>Enterprise Operations Platform</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Construction Material &amp; Site Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 max-w-2xl leading-relaxed">
            Real-time multi-site operational tracking, materials inventory control, contractor verified progress, and automated billing integrity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex sm:block items-center justify-between text-left md:text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Portfolio</div>
            <div className="text-xs sm:text-sm font-extrabold text-charcoal-900 sm:mt-0.5">
              {summary?.projectCount || 0} Projects • {summary?.siteCount || 0} Sites
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Operations Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-charcoal-900 tracking-tight">Quick Operations</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Launch direct creation &amp; logging actions across modules</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Direct 1-Click Launch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {/* 1. New Project */}
          <button
            onClick={() => onNavigate('projects', 'add-project')}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-left transition-all group"
            title="Create a new construction undertaking"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-charcoal-700 group-hover:bg-charcoal-900 group-hover:text-white group-hover:border-charcoal-900 flex items-center justify-center mb-2 transition-all border border-slate-200/90 shadow-2xs">
              <FolderPlus className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">New Project</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Projects Module</span>
          </button>

          {/* 2. Add Site */}
          <button
            onClick={() => onNavigate('projects', 'add-site')}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-left transition-all group"
            title="Register a physical job site under a project"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-charcoal-700 group-hover:bg-charcoal-900 group-hover:text-white group-hover:border-charcoal-900 flex items-center justify-center mb-2 transition-all border border-slate-200/90 shadow-2xs">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">Add Site</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Link to Project</span>
          </button>

          {/* 3. Receive Delivery */}
          <button
            onClick={() => onNavigate('procurement', 'add-delivery')}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-left transition-all group"
            title="Record site shipment arrival & received items"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-charcoal-700 group-hover:bg-charcoal-900 group-hover:text-white group-hover:border-charcoal-900 flex items-center justify-center mb-2 transition-all border border-slate-200/90 shadow-2xs">
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">Receive Items</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Procurement</span>
          </button>

          {/* 4. Issue Material */}
          <button
            onClick={() => onNavigate('materials', 'issue-material')}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-left transition-all group"
            title="Dispatch materials from inventory to package"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-charcoal-700 group-hover:bg-charcoal-900 group-hover:text-white group-hover:border-charcoal-900 flex items-center justify-center mb-2 transition-all border border-slate-200/90 shadow-2xs">
              <PackageMinus className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">Issue Stock</span>
            <span className="text-[10px] text-slate-500 mt-0.5">To Work Package</span>
          </button>

          {/* 5. Log Progress */}
          <button
            onClick={() => onNavigate('progress', 'log-progress')}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-left transition-all group"
            title="Record physical completion milestone"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-charcoal-700 group-hover:bg-charcoal-900 group-hover:text-white group-hover:border-charcoal-900 flex items-center justify-center mb-2 transition-all border border-slate-200/90 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">Log Progress</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Field Milestones</span>
          </button>

          {/* 6. Create Bill */}
          <button
            onClick={() => onNavigate('billing', 'add-bill')}
            className="flex flex-col items-start p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-left transition-all group"
            title="Generate contractor milestone bill"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-charcoal-700 group-hover:bg-charcoal-900 group-hover:text-white group-hover:border-charcoal-900 flex items-center justify-center mb-2 transition-all border border-slate-200/90 shadow-2xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">Create Bill</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Billing &amp; Payouts</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - 2 columns on mobile, 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard
          label="Total Projects"
          value={summary?.projectCount || 0}
          sublabel={`${summary?.siteCount || 0} Active Sites`}
          icon={Building2}
          accentColor="charcoal"
        />
        <StatCard
          label="Work Packages"
          value={summary?.workPackageCount || 0}
          sublabel={`${summary?.contractorCount || 0} Agencies`}
          icon={HardHat}
          accentColor="sage"
        />
        <StatCard
          label="Overall Progress"
          value={`${summary?.avgProgress || 0}%`}
          sublabel="Weighted Avg"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <StatCard
          label="Contractor Dues"
          value={formatCurrency(summary?.balanceDue || 0)}
          sublabel={`Invoiced: ${formatCurrency(summary?.totalBilled || 0)}`}
          icon={Receipt}
          accentColor="amber"
        />
      </div>

      {/* Analytics Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Work Progress Velocity Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-charcoal-900">Work Package Progress (%)</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Physical verified completion rate</p>
            </div>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-semibold text-slate-600 hover:text-charcoal-900 flex items-center gap-1 group py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={workProgressData} 
                layout="vertical" 
                margin={{ left: isMobile ? -12 : 10, right: isMobile ? 12 : 30, top: 10, bottom: 10 }}
                barCategoryGap="16%"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  unit="%" 
                  tick={{ fontSize: isMobile ? 10 : 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  dataKey="Work_Package_Name" 
                  type="category" 
                  width={isMobile ? 85 : 150} 
                  tick={{ fontSize: isMobile ? 10 : 11, fill: '#334155' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(val: string) => (val && val.length > (isMobile ? 11 : 20)) ? `${val.substring(0, isMobile ? 9 : 18)}…` : val}
                />
                <Tooltip 
                  formatter={(val: any) => [`${val}% Complete`, 'Progress']}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '10px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                />
                <Bar dataKey="Latest_Progress_Percent" radius={[0, 5, 5, 0]} barSize={isMobile ? 12 : 15}>
                  {workProgressData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.Latest_Progress_Percent >= 70 ? '#7A9687' : entry.Latest_Progress_Percent >= 40 ? '#9FB3A8' : '#D4A373'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Billing & Payout Ratio */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3 pb-2 sm:pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-charcoal-900">Billing Settlement</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Disbursed vs Outstanding dues</p>
              </div>
            </div>

            <div className="h-36 sm:h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 42 : 52}
                    outerRadius={isMobile ? 60 : 74}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {financialData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(val), 'Amount']}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '10px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      fontSize: '12px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clean Financial Breakdown - 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-sage-500 shrink-0" />
                  <span className="truncate">Amount Paid</span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-charcoal-900 mt-1 block truncate">
                  {formatCurrency(summary?.totalPaid || 0)}
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-amber-900">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Pending Due</span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-950 mt-1 block truncate">
                  {formatCurrency(summary?.balanceDue || 0)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('billing')}
            className="w-full mt-3 sm:mt-4 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold bg-charcoal-900 hover:bg-charcoal-950 text-white transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Review Invoices &amp; Payouts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards - Compact on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
        <div 
          onClick={() => onNavigate('materials')}
          className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-charcoal-900 group-hover:text-white transition-colors shrink-0">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">Site Stock &amp; Issues</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Issue materials with live stock check</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('procurement')}
          className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-charcoal-900 group-hover:text-white transition-colors shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">Procurement &amp; POs</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Track vendors, POs &amp; site deliveries</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 cursor-pointer hover:border-slate-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-charcoal-900 group-hover:text-white transition-colors shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">Mandated SQL Views</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">View the 6 analytical project reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
