import React from 'react';
import { Shield, Lock, Trash2, CheckCircle2, FileText, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onResetData: () => void;
  onNavigateHome: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onResetData, onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 mb-3">
            <Lock className="h-3.5 w-3.5" />
            <span>Zero-Knowledge Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-600">
            Last updated: February 2025 • Affinzo Data Handling Standards
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Our Core Privacy Commitment
            </h2>
            <p>
              Your financial information is sensitive. Affinzo minimizes data collection and clearly explains how your information is handled. We do not require accounts, logins, bank credentials, Social Security Numbers, or credit card details.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">1. Data Storage & Local Persistence</h3>
            <p>
              All income amounts, expense categories, debt balances, and affordability simulator scenarios you enter are stored strictly within your web browser's private local storage (<code>localStorage</code>). This ensures your financial information remains on your personal device and persists across browser refreshes for your convenience without being transmitted to an external user account database.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">2. What Information We Never Collect</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>No Social Security Numbers (SSN) or Tax IDs</li>
              <li>No Bank Account Numbers or Routing Numbers</li>
              <li>No Credit Card Numbers or Account Logins</li>
              <li>No Plaid, Yodlee, or MX credential connections</li>
              <li>No full names, physical home addresses, or phone numbers</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">3. AI Analysis & Processing</h3>
            <p>
              When you generate an Income Reality Report, our server-side API formats your high-level numbers (e.g. gross income, tax estimates, expense category totals) into an anonymized mathematical prompt to generate plain-English explanations. No personally identifiable tracking data is attached.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">4. One-Click Data Deletion</h3>
            <p>
              You have complete ownership of your data. You can erase all stored inputs, reports, and simulator scenarios at any moment by clicking the button below.
            </p>

            <div className="pt-2">
              <button
                id="privacy-wipe-stored-data-btn"
                onClick={onResetData}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Wipe All Stored Data Now</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
