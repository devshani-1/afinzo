import React from 'react';
import { Shield, Info, FileText, Lock, Trash2, HeartHandshake, Car, Home, DollarSign, PieChart, Sliders } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onResetData: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onResetData }) => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black text-sm">
                A.
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Affinzo</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Don't just calculate the number. Understand what the number means for your life. Affinzo is a U.S.-focused cash-flow intelligence platform analyzing real monthly costs, progressive taxes, and major purchase affordability.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Client-Side Private • Zero Bank Logins • Encrypted Local Storage</span>
            </div>
          </div>

          {/* Decision Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Real Cost Tools</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('car-cost')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  What Will This Car Cost?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rent-cost')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  What Will This Rent Cost?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('income-takehome')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  What Will I Actually Take Home?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('budget-flow')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Where Is My Money Going?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('affordability')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Can I Actually Afford This?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('life-cost')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  What Does Life Actually Cost?
                </button>
              </li>
            </ul>
          </div>

          {/* Product & Assessment */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Reality Assessment</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Decision Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('report')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Income Reality Report Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  How Tax & Cash Flow Math Works
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Legal & Privacy</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('disclaimer')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Financial Disclaimer
                </button>
              </li>
              <li className="pt-2">
                <button
                  id="footer-delete-stored-data-btn"
                  onClick={onResetData}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-950 hover:text-rose-200 transition-colors cursor-pointer"
                  title="Wipes local browser storage"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete My Stored Data</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="rounded-xl bg-slate-800/60 p-4 text-[11px] leading-relaxed text-slate-400 border border-slate-700/60">
            <span className="font-semibold text-slate-300">IMPORTANT EDUCATIONAL DISCLAIMER:</span> Affinzo is strictly an educational financial planning and cash-flow estimation platform, not a certified financial planner, CPA, tax advisor, or investment professional. Calculations and tax withholdings are estimates derived from standard formulas and IRS guidelines. Do not make irrevocable legal or financial commitments based exclusively on these estimates.
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Affinzo. Don't just calculate the number. Understand what the number means for your life.</p>
            <p className="text-slate-400">Built for U.S. households & personal financial clarity.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
