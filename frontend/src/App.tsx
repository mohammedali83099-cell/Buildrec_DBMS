import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsSitesPage } from './pages/ProjectsSitesPage';
import { ProcurementPage } from './pages/ProcurementPage';
import { MaterialsStockPage } from './pages/MaterialsStockPage';
import { ProgressPage } from './pages/ProgressPage';
import { BillingPaymentsPage } from './pages/BillingPaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { api } from './api';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    checkHealth();
    // Periodically verify connection
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      setDbConnected(!!res.dbConnected);
    } catch {
      setDbConnected(false);
    }
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-charcoal-900 flex flex-col font-sans selection:bg-slate-200 selection:text-charcoal-900">
      {/* Subtle neutral background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-slate-200/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-slate-100/30 blur-3xl" />
      </div>

      {/* Top Navbar */}
      <Navbar 
        onMenuToggle={() => setIsMobileOpen((prev) => !prev)} 
        dbConnected={dbConnected} 
      />

      {/* Main Body */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-6">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          isOpenMobile={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Content Workspace */}
        <main className="flex-1 min-w-0 transition-all duration-200">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={handleTabChange} />}
          {activeTab === 'projects' && <ProjectsSitesPage />}
          {activeTab === 'procurement' && <ProcurementPage />}
          {activeTab === 'materials' && <MaterialsStockPage />}
          {activeTab === 'progress' && <ProgressPage />}
          {activeTab === 'billing' && <BillingPaymentsPage />}
          {activeTab === 'reports' && <ReportsPage />}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-4 mt-auto text-xs text-charcoal-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="BUILDREC" className="w-4 h-4 object-contain" />
            <span className="font-semibold text-charcoal-800">BUILDREC</span>
            <span>— Construction Material & Site Progress Management System</span>
          </div>
          <div>
            <span>© 2026 BUILDREC Systems • All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
