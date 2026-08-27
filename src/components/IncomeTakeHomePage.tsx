import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  Sliders, 
  PieChart, 
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  Download
} from 'lucide-react';
import { US_STATES } from '../utils/taxData';
import { calculateTaxes } from '../utils/calculations';
import { FinancialFormData } from '../types/financial';
import { generateTakeHomePDF } from '../utils/pdfGenerator';

interface IncomeTakeHomePageProps {
  formData: FinancialFormData;
  onNavigate: (view: string) => void;
  onStartReport: () => void;
}

export const IncomeTakeHomePage: React.FC<IncomeTakeHomePageProps> = ({
  formData,
  onNavigate,
  onStartReport,
}) => {
  // Inputs
  const [grossAnnual, setGrossAnnual] = useState<number>(85000);
  const [stateCode, setStateCode] = useState<string>('TX');
  const [filingStatus, setFilingStatus] = useState<'single' | 'married_joint' | 'head_of_household'>('single');
  const [payFrequency, setPayFrequency] = useState<'biweekly' | 'semimonthly' | 'monthly' | 'weekly'>('biweekly');
  const [retirementPercent, setRetirementPercent] = useState<number>(6);
  const [monthlyHealthDental, setMonthlyHealthDental] = useState<number>(180);
  const [monthlyHsaFsa, setMonthlyHsaFsa] = useState<number>(50);

  // Paychecks per year
  const paychecksPerYear = useMemo(() => {
    switch (payFrequency) {
      case 'weekly': return 52;
      case 'biweekly': return 26;
      case 'semimonthly': return 24;
      case 'monthly': return 12;
      default: return 26;
    }
  }, [payFrequency]);

  // Pre-tax retirement and benefits
  const annualRetirementPreTax = (grossAnnual * retirementPercent) / 100;
  const annualHealthDental = monthlyHealthDental * 12;
  const annualHsaFsa = monthlyHsaFsa * 12;
  const totalPreTaxDeductions = annualRetirementPreTax + annualHealthDental + annualHsaFsa;

  // Taxable wage base after pre-tax benefits
  const taxableFederalIncome = Math.max(0, grossAnnual - totalPreTaxDeductions);

  // Tax computations using deterministic engine
  const taxResults = useMemo(() => {
    return calculateTaxes(taxableFederalIncome, stateCode, filingStatus);
  }, [taxableFederalIncome, stateCode, filingStatus]);

  const totalTaxes = taxResults.totalTax;
  const annualTakeHome = Math.max(0, grossAnnual - totalTaxes - totalPreTaxDeductions);
  const monthlyTakeHome = annualTakeHome / 12;
  const paycheckTakeHome = annualTakeHome / paychecksPerYear;
  const effectiveTaxRate = (totalTaxes / (grossAnnual || 1)) * 100;

  // Budget rules derived from Net Take-Home
  const recommendedMaxHousing = monthlyTakeHome * 0.30;
  const recommendedMaxAuto = monthlyTakeHome * 0.15;
  const recommendedMonthlySavings = monthlyTakeHome * 0.20;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = generateTakeHomePDF({
        grossAnnual,
        stateCode,
        filingStatus,
        payFrequency,
        paychecksPerYear,
        retirementPercent,
        monthlyHealthDental,
        monthlyHsaFsa,
        totalPreTaxDeductions,
        taxableFederalIncome,
        taxResults,
        annualTakeHome,
        monthlyTakeHome,
        paycheckTakeHome,
        effectiveTaxRate,
        recommendedMaxHousing,
        recommendedMaxAuto,
        recommendedMonthlySavings,
      });
      const filename = `take-home-pay-report-$${grossAnnual.toLocaleString()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating Take-Home PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Top Question Header */}
      <section className="bg-slate-900 text-white py-14 sm:py-18 border-b border-slate-800 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Decision Center</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-4">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Search Intent & Real-Cost Decision</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            What Will I Actually Take Home <span className="text-emerald-400">From My Salary?</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Your salary isn't necessarily the amount that reaches your bank account. See what federal withholdings, state income taxes, FICA, healthcare benefits, and 401(k) deductions mean for your actual monthly paycheck.
          </p>

          {/* Quick Salary Pills */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Test standard salaries:</span>
            {[55000, 75000, 95000, 125000, 160000].map((sal) => (
              <button
                key={sal}
                onClick={() => setGrossAnnual(sal)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  grossAnnual === sal
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                ${(sal / 1000).toFixed(0)}k / year
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Salary & Location Input */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">1. Gross Salary & Location</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your official compensation before any withholdings</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Gross Base Salary ($)
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">$</span>
                    <input
                      type="number"
                      min={10000}
                      step={1000}
                      value={grossAnnual || ''}
                      onChange={(e) => setGrossAnnual(Number(e.target.value))}
                      className="block w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State of Residence
                  </label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none bg-white"
                  >
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code}) {s.type === 'none' ? '- 0% State Tax' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax Filing Status
                  </label>
                  <select
                    value={filingStatus}
                    onChange={(e) => setFilingStatus(e.target.value as any)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none bg-white"
                  >
                    <option value="single">Single</option>
                    <option value="married_joint">Married Filing Jointly</option>
                    <option value="head_of_household">Head of Household</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paycheck Frequency
                  </label>
                  <select
                    value={payFrequency}
                    onChange={(e) => setPayFrequency(e.target.value as any)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none bg-white"
                  >
                    <option value="biweekly">Every 2 Weeks (26 paychecks)</option>
                    <option value="semimonthly">Twice a Month (24 paychecks)</option>
                    <option value="monthly">Monthly (12 paychecks)</option>
                    <option value="weekly">Weekly (52 paychecks)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Benefits & Deductions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">2. Pre-Tax Deductions & Benefits</h2>
                <p className="text-xs text-slate-500 mt-0.5">Deductions that reduce your taxable income</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">401(k) / 403(b) Retirement Contribution</span>
                    <span className="text-[10px] text-slate-500">${Math.round(annualRetirementPreTax / 12).toLocaleString()}/mo pre-tax savings</span>
                  </div>
                  <div className="w-28 relative">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={1}
                      value={retirementPercent || ''}
                      onChange={(e) => setRetirementPercent(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pr-6 pl-3 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                    <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Health, Dental & Vision Insurance</span>
                    <span className="text-[10px] text-slate-500">Employer payroll health premium share</span>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={monthlyHealthDental || ''}
                      onChange={(e) => setMonthlyHealthDental(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">HSA / FSA Pre-Tax Contribution</span>
                    <span className="text-[10px] text-slate-500">Pre-tax medical/dependent care account</span>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={monthlyHsaFsa || ''}
                      onChange={(e) => setMonthlyHsaFsa(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* What That Means For Your Life Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">What Does This Take-Home Mean For Your Budget?</h3>
              <p className="text-xs text-slate-500 mb-4">Healthy affordability thresholds calibrated directly to your net pay</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Safe Rent Limit (30%)</span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">${Math.round(recommendedMaxHousing).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">Total all-in housing/mo</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Safe Car Limit (15%)</span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">${Math.round(recommendedMaxAuto).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">Loan + ins + gas/mo</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Target Savings (20%)</span>
                  <div className="text-base font-extrabold text-emerald-700 mt-1">${Math.round(recommendedMonthlySavings).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">Monthly buffer / growth</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Take-Home Breakdown & Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Paycheck & Monthly Take-Home Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900 text-white p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Estimated Net Take-Home</span>
                <span className="text-[10px] rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                  {effectiveTaxRate.toFixed(1)}% total taxes
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-white">
                    ${Math.round(monthlyTakeHome).toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-slate-400">/ month</span>
                </div>
                <div className="mt-1 text-xs text-emerald-400 font-semibold">
                  ≈ ${Math.round(paycheckTakeHome).toLocaleString()} per paycheck ({payFrequency})
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Out of your ${grossAnnual.toLocaleString()} gross salary, <strong className="text-emerald-400">${Math.round(annualTakeHome).toLocaleString()}</strong> is your real spendable net income per year.
              </p>

              {/* Breakdown items */}
              <div className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Paycheck:</span>
                  <span className="font-semibold text-white">${Math.round(grossAnnual / 12).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>Federal Income Tax:</span>
                  <span className="font-semibold">-${Math.round(taxResults.federalTax / 12).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>State Income Tax ({stateCode}):</span>
                  <span className="font-semibold">-${Math.round(taxResults.stateTax / 12).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>FICA (Social Security & Medicare):</span>
                  <span className="font-semibold">-${Math.round(taxResults.ficaTax / 12).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-sky-300">
                  <span>401(k) & Pre-tax Benefits:</span>
                  <span className="font-semibold">-${Math.round(totalPreTaxDeductions / 12).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-400 text-[11px]">
                  <span>Annual Take-Home Total:</span>
                  <span className="font-bold text-slate-200">${Math.round(annualTakeHome).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Want to Map Your Real Expenses?</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Take your ${Math.round(monthlyTakeHome).toLocaleString()}/mo take-home pay and see exactly how much is consumed by rent, car payments, debt, food, and subscriptions.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-100" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Paycheck & Tax PDF'}</span>
                </button>
                <button
                  onClick={onStartReport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Build 5-Step Income Reality Report</span>
                </button>
                <button
                  onClick={() => onNavigate('car-cost')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>See "What Will This Car Actually Cost Me?"</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigate('rent-cost')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>See "How Much Will This Rent Really Cost Me?"</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
