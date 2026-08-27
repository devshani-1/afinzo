import React from 'react';
import { 
  Calculator, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Scale, 
  Percent, 
  CheckCircle2,
  Building2,
  DollarSign
} from 'lucide-react';

interface HowItWorksPageProps {
  onStartReport: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onStartReport }) => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 mb-4">
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span>Deterministic Math & Methodology</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How Affinzo Calculates Your Numbers
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Affinzo is built on the core principle that <strong>accuracy is more important than AI</strong>. Every figure on your dashboard is calculated using explicit mathematical models before AI provides educational synthesis.
          </p>
        </div>

        {/* Section 1: Tax Engine */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-600" />
            <span>1. U.S. Federal, State & FICA Tax Estimation</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To determine your realistic monthly take-home pay, Affinzo models standard withholding taxes based on official IRS guidelines:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Federal Income Tax</h3>
              <p className="mt-1 text-xs text-slate-600">
                Applies standard deductions ($14,600 Single, $29,200 Married Joint, $21,900 Head of Household) and progressive 2024/2025 brackets from 10% to 37%.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">FICA (Social Security & Medicare)</h3>
              <p className="mt-1 text-xs text-slate-600">
                Calculates standard 6.2% Social Security (capped up to wage base $168,600) + 1.45% Medicare on all gross wages (plus self-employment adjustments if applicable).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">State Income Tax (50 States)</h3>
              <p className="mt-1 text-xs text-slate-600">
                Accounts for states with no income tax (TX, FL, WA, NV, TN, WY, AK, SD), flat rate states (NC, CO, IL, PA), and progressive state brackets (CA, NY, NJ, HI).
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Cash Flow Architecture */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span>2. The Cash Flow Formula</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your monthly budget is evaluated through a strict water-fall subtraction:
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white font-mono text-xs sm:text-sm space-y-2">
            <p className="text-emerald-400 font-bold">Estimated Monthly Take-Home Pay</p>
            <p className="text-slate-300"> - Monthly Housing (Rent/Mortgage, Utilities, Insurance, Property Taxes)</p>
            <p className="text-slate-300"> - Monthly Transportation (Car loan, Insurance, Fuel, Transit, Maintenance)</p>
            <p className="text-slate-300"> - Monthly Living Expenses (Food, Healthcare, Phone, Subscriptions, Personal)</p>
            <p className="text-slate-300"> - Monthly Debt Payments (Credit card minimums, Student loans, Personal loans)</p>
            <p className="text-slate-300"> - Monthly Active Savings (Retirement contributions, Emergency fund, General savings)</p>
            <div className="border-t border-slate-700 pt-2 text-emerald-400 font-bold">
              = Estimated Monthly Remaining Cash-Flow Buffer
            </div>
          </div>
        </section>

        {/* Section 3: Financial Indicators & Neutral Benchmarks */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Percent className="h-5 w-5 text-purple-600" />
            <span>3. Financial Health Ratios & Benchmarks</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold text-slate-900">Housing Burden Share:</h4>
              <p className="mt-1 text-slate-600">
                Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Monthly Housing ÷ Estimated Take-Home Pay</code>.
                Standard economic guidelines suggest keeping housing under 30% of take-home pay to prevent shelter cost overburden.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold text-slate-900">Debt Payment Share:</h4>
              <p className="mt-1 text-slate-600">
                Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Monthly Non-Mortgage Debt ÷ Estimated Take-Home Pay</code>.
                Measures the percentage of income committed to contractual debt service. Under 15% is generally considered moderate.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold text-slate-900">Emergency Reserve Runway:</h4>
              <p className="mt-1 text-slate-600">
                Formula: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Current Liquid Savings ÷ Total Monthly Expenses</code>.
                Calculates how many months of necessary living expenses your current liquid reserves could support in an interruption.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Educational Nature */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-xs text-amber-900 space-y-2">
          <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            <span>Important Tool Notice: Educational Utility Only</span>
          </h3>
          <p className="leading-relaxed">
            Affordly provides mathematical estimations to assist users in visualizing cash flow and personal budgeting. It does not provide certified financial, legal, investment, or tax advice. Actual tax liability and credit eligibility depend on exact employer withholdings, pre-tax benefits (401k/HSA/FSA), local ordinances, and IRS filings.
          </p>
        </section>

        {/* Call to Action */}
        <div className="pt-4 text-center">
          <button
            onClick={onStartReport}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>Build Your Income Reality Report</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
