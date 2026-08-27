import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';

interface DisclaimerPageProps {
  onNavigateHome: () => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 mb-3">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Official Legal & Financial Disclaimer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Financial Disclaimer</h1>
          <p className="mt-2 text-sm text-slate-600">
            Educational Purpose & Calculation Notice
          </p>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-6 text-sm text-amber-950 font-medium leading-relaxed">
          Affinzo is an educational financial planning and estimation tool, <strong>NOT a certified financial planner, certified public accountant (CPA), licensed investment advisor, or tax authority</strong>.
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Nature of Calculations & Estimates</h2>
            <p>
              All computations provided within Affinzo—including estimated federal income taxes, state taxes, FICA withholdings, take-home earnings, monthly cash flows, expense percentages, and affordability scenarios—are estimates generated from standard mathematical formulas and simplified tax schedules.
            </p>
            <p>
              Your actual net take-home pay and tax liability may differ based on pre-tax deductions (such as traditional 401(k), 403(b), HSA, FSA, and health insurance premiums), local municipal or county taxes, itemized deductions, tax credits (such as Child Tax Credit or EITC), and changing tax regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. No Fiduciary or Advisory Relationship</h2>
            <p>
              Use of the Affinzo website, reports, or simulators does not establish a fiduciary, advisory, legal, or accounting relationship between you and Affinzo. The information presented is intended strictly for general personal financial literacy and budget exploration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Independent Verification Recommended</h2>
            <p>
              Before making significant financial commitments, entering mortgage or vehicle contracts, liquidating assets, or altering retirement contributions, you should consult with a qualified financial advisor, CPA, or licensed tax professional.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
