import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Truck, 
  Boxes, 
  HardHat, 
  Receipt, 
  BarChart3,
  ShieldCheck,
  X
} from 'lucide-react';

export type TabId = 
  | 'dashboard' 
  | 'projects' 
  | 'procurement' 
  | 'materials' 
  | 'progress' 
  | 'billing' 
  | 'reports';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Key Metrics' },
  { id: 'projects', label: 'Projects & Sites', icon: Building2, description: 'Manage Projects & Locations' },
  { id: 'procurement', label: 'Procurement', icon: Truck, description: 'Vendors, POs & Deliveries' },
  { id: 'materials', label: 'Materials & Stock', icon: Boxes, description: 'Inventory & Material Issues' },
  { id: 'progress', label: 'Work & Progress', icon: HardHat, description: 'Contractors, Packages & Logs' },
  { id: 'billing', label: 'Billing & Payments', icon: Receipt, description: 'Invoices & Payouts' },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, description: 'System Views & Analytics' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col h-full py-4 px-3">
      {/* Brand Header */}
      <div className="px-3 pt-1 pb-4 mb-3 border-b border-slate-200/60 flex items-center justify-between">
        <button
          onClick={() => {
            onTabChange('dashboard');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 focus:outline-none hover:opacity-90 transition-opacity text-left"
          aria-label="BUILDREC Home"
        >
          <img 
            src="/buildrec_logo.png" 
            alt="BUILDREC Logo" 
            className="h-8 w-auto object-contain"
          />
        </button>

        <button 
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        System Modules
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150 group relative ${
                isActive
                  ? 'bg-slate-100/90 text-charcoal-950 border border-slate-200/90 shadow-2xs'
                  : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                isActive ? 'text-sage-700' : 'text-slate-400 group-hover:text-charcoal-700'
              }`} />
              
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate leading-tight ${
                  isActive ? 'font-bold text-charcoal-950' : 'font-semibold text-charcoal-800'
                }`}>
                  {item.label}
                </div>
                <div className={`text-[11px] truncate leading-tight mt-0.5 ${
                  isActive ? 'text-slate-500 font-medium' : 'text-slate-400'
                }`}>
                  {item.description}
                </div>
              </div>

              {isActive && (
                <span className="w-1.5 h-5 rounded-full bg-sage-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding snippet */}
      <div className="mt-auto pt-4 px-3 border-t border-slate-200/60">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-charcoal-800">BUILDREC ERP</span>
            <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 font-medium">v2.4</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Site Operations &amp; Inventory System</div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
            <ShieldCheck className="w-3 h-3 text-sage-600" />
            <span>Enterprise Site Operations</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-[calc(100vh-3rem)] sticky top-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-charcoal-950/30 transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-200 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {content}
      </div>
    </>
  );
};
