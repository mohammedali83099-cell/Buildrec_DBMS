import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
  dbConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  return (
    <header className="md:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl text-charcoal-700 hover:text-charcoal-900 hover:bg-slate-100/60 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <img 
              src="/buildrec_logo.png" 
              alt="BUILDREC Logo" 
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-sm"
            />
          </div>
        </div>

        {/* Right: Meta Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs text-charcoal-600 bg-slate-100/60 px-3.5 py-1.5 rounded-full border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Enterprise Site Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
};
