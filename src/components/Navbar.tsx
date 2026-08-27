import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  PieChart, 
  HelpCircle, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown,
  Car,
  Home,
  DollarSign,
  HeartHandshake,
  Sliders,
  Layers,
  Trash2
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  hasExistingReport: boolean;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasExistingReport,
  onResetData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [decisionsDropdownOpen, setDecisionsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDecisionsDropdownOpen(false);
      }
    };

    if (decisionsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [decisionsDropdownOpen]);

  const decisionTools = [
    { id: 'car-cost', label: 'What Will This Car Cost?', desc: 'True vehicle monthly ownership', icon: Car, color: 'text-emerald-600' },
    { id: 'rent-cost', label: 'How Much Will Rent Really Cost?', desc: 'True housing & utilities', icon: Home, color: 'text-sky-600' },
    { id: 'income-takehome', label: 'What Will I Actually Take Home?', desc: 'Gross to net pay & taxes', icon: DollarSign, color: 'text-purple-600' },
    { id: 'budget-flow', label: 'Where Is My Money Going?', desc: 'Monthly cash-flow breakdown', icon: PieChart, color: 'text-amber-600' },
    { id: 'affordability', label: 'Can I Actually Afford This?', desc: 'Decision scenario simulator', icon: Sliders, color: 'text-rose-600' },
    { id: 'life-cost', label: 'What Is My Life Costing Me?', desc: 'Holistic life cost analyzer', icon: HeartHandshake, color: 'text-teal-600' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <button
          id="nav-brand-logo-btn"
          onClick={() => {
            onNavigate('landing');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition-transform group-hover:scale-105">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
              A<span className="text-emerald-400 font-black">.</span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">Affinzo</span>
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                U.S.
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
              Know what things will actually cost you.
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => onNavigate('landing')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'landing'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Home
          </button>

          {/* Decision Tools Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              id="nav-real-cost-dropdown-btn"
              type="button"
              onClick={() => setDecisionsDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                ['car-cost', 'rent-cost', 'income-takehome', 'budget-flow', 'affordability', 'life-cost'].includes(currentView)
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>Real-Cost Tools</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${decisionsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {decisionsDropdownOpen && (
              <div 
                id="nav-real-cost-dropdown-menu"
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                  Real Decision Calculators
                </div>
                {decisionTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = currentView === tool.id;
                  return (
                    <button
                      key={tool.id}
                      id={`nav-tool-${tool.id}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onNavigate(tool.id);
                        setDecisionsDropdownOpen(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                        isActive ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tool.color}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{tool.label}</div>
                        <div className="text-[10px] text-slate-500">{tool.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('report')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'report'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Income Reality Report
          </button>

          {hasExistingReport && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => onNavigate('how-it-works')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'how-it-works'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            How It Works
          </button>

          <button
            onClick={() => onNavigate('privacy')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'privacy'
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Privacy
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          {hasExistingReport ? (
            <>
              <button
                id="nav-quick-dashboard-btn"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs cursor-pointer"
              >
                <PieChart className="h-3.5 w-3.5 text-slate-500" />
                <span>My Dashboard</span>
              </button>
              <button
                id="nav-quick-afford-btn"
                onClick={() => onNavigate('affordability')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Can I Afford This?</span>
              </button>
            </>
          ) : (
            <button
              id="nav-create-report-btn"
              onClick={() => onNavigate('report')}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all hover:shadow cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Create My Reality Report</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>Home</span>
            </button>

            <div className="pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Real Decision Calculators
            </div>
            {decisionTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onNavigate(tool.id);
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Icon className={`h-4 w-4 ${tool.color}`} />
                  <span>{tool.label}</span>
                </button>
              );
            })}

            <div className="border-t border-slate-100 pt-2 my-1"></div>

            <button
              onClick={() => {
                onNavigate('report');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>Income Reality Report</span>
            </button>

            {hasExistingReport && (
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>Dashboard</span>
              </button>
            )}

            <button
              onClick={() => {
                onNavigate('how-it-works');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>How It Works</span>
            </button>

            <button
              onClick={() => {
                onNavigate('privacy');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>Privacy</span>
            </button>

            <button
              id="mobile-nav-delete-data-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onResetData();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Stored Data</span>
            </button>

            <div className="mt-3 border-t border-slate-100 pt-3 flex flex-col gap-2">
              <button
                onClick={() => {
                  onNavigate('report');
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                <FileText className="h-4 w-4 text-emerald-400" />
                <span>Start Full Reality Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
