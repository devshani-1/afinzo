import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  ArrowLeft, 
  DollarSign, 
  HelpCircle, 
  FileText, 
  Sliders, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  CreditCard,
  Tv,
  Download
} from 'lucide-react';
import { FinancialFormData, FinancialCalculations } from '../types/financial';
import { generateBudgetFlowPDF } from '../utils/pdfGenerator';

interface BudgetWhereGoingPageProps {
  formData: FinancialFormData;
  calculations: FinancialCalculations;
  onNavigate: (view: string) => void;
  onStartReport: () => void;
}

export const BudgetWhereGoingPage: React.FC<BudgetWhereGoingPageProps> = ({
  formData,
  calculations,
  onNavigate,
  onStartReport,
}) => {
  // Local quick adjustment states
  const [takeHomePay, setTakeHomePay] = useState<number>(
    calculations.estimatedMonthlyTakeHome > 0 ? Math.round(calculations.estimatedMonthlyTakeHome) : 5800
  );
  const [housingCost, setHousingCost] = useState<number>(
    calculations.monthlyHousingTotal > 0 ? Math.round(calculations.monthlyHousingTotal) : 1950
  );
  const [transportCost, setTransportCost] = useState<number>(
    calculations.monthlyTransportTotal > 0 ? Math.round(calculations.monthlyTransportTotal) : 650
  );
  const [groceriesFood, setGroceriesFood] = useState<number>(
    formData.livingExpenses.foodGroceries > 0 ? formData.livingExpenses.foodGroceries : 600
  );
  const [diningOut, setDiningOut] = useState<number>(
    formData.livingExpenses.restaurants > 0 ? formData.livingExpenses.restaurants : 350
  );
  const [debtPayments, setDebtPayments] = useState<number>(
    calculations.monthlyDebtTotal > 0 ? Math.round(calculations.monthlyDebtTotal) : 400
  );
  const [subscriptionsDigital, setSubscriptionsDigital] = useState<number>(
    formData.livingExpenses.subscriptions > 0 ? formData.livingExpenses.subscriptions : 120
  );
  const [utilitiesPhone, setUtilitiesPhone] = useState<number>(
    (formData.housingTransport.utilities + formData.livingExpenses.internet + formData.livingExpenses.phone) || 280
  );
  const [lifestyleShopping, setLifestyleShopping] = useState<number>(
    formData.livingExpenses.shopping > 0 ? formData.livingExpenses.shopping : 250
  );
  const [savingsMonthly, setSavingsMonthly] = useState<number>(
    formData.debtSavings.monthlySavings > 0 ? formData.debtSavings.monthlySavings : 500
  );

  // Computations
  const totalOutflows =
    housingCost +
    transportCost +
    groceriesFood +
    diningOut +
    debtPayments +
    subscriptionsDigital +
    utilitiesPhone +
    lifestyleShopping +
    savingsMonthly;

  const remainingCashFlow = takeHomePay - totalOutflows;
  const remainingRate = (remainingCashFlow / (takeHomePay || 1)) * 100;

  // Categories ranked
  const categories = [
    { name: 'Housing (Rent / Mortgage)', amount: housingCost, icon: Home, color: 'bg-indigo-500' },
    { name: 'Transportation & Vehicle', amount: transportCost, icon: Car, color: 'bg-sky-500' },
    { name: 'Groceries & Household Food', amount: groceriesFood, icon: Utensils, color: 'bg-emerald-500' },
    { name: 'Dining Out & Delivery', amount: diningOut, icon: Utensils, color: 'bg-amber-500' },
    { name: 'Debt & Loans Minimums', amount: debtPayments, icon: CreditCard, color: 'bg-rose-500' },
    { name: 'Utilities, Phone & Internet', amount: utilitiesPhone, icon: Layers, color: 'bg-teal-500' },
    { name: 'Shopping & Discretionary', amount: lifestyleShopping, icon: ShoppingBag, color: 'bg-purple-500' },
    { name: 'Subscriptions & Streaming', amount: subscriptionsDigital, icon: Tv, color: 'bg-pink-500' },
    { name: 'Active Savings & Growth', amount: savingsMonthly, icon: Sparkles, color: 'bg-emerald-600' },
  ].sort((a, b) => b.amount - a.amount);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const totalNeeds = housingCost + transportCost + groceriesFood + utilitiesPhone + debtPayments;
      const totalWants = diningOut + subscriptionsDigital + lifestyleShopping;
      const totalSavings = savingsMonthly;
      const needsPct = (totalNeeds / (takeHomePay || 1)) * 100;
      const wantsPct = (totalWants / (takeHomePay || 1)) * 100;
      const savingsPct = (totalSavings / (takeHomePay || 1)) * 100;

      const doc = generateBudgetFlowPDF({
        takeHomePay,
        housingCost,
        transportCost,
        groceriesFood,
        diningOut,
        debtPayments,
        subscriptionsDigital,
        utilitiesPhone,
        lifestyleShopping,
        savingsMonthly,
        totalOutflows,
        remainingCashFlow,
        savingsRate: (savingsMonthly / (takeHomePay || 1)) * 100,
        needsPct,
        wantsPct,
        savingsPct,
      });
      const filename = `budget-cashflow-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating Budget Flow PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
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
              className="inline-flex items-center gap-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/60 px-3.5 py-1 text-xs font-semibold text-purple-400 mb-4">
            <PieChart className="h-3.5 w-3.5" />
            <span>Search Intent & Real-Cost Decision</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Where Is My Money <span className="text-purple-400">Actually Going?</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Your income is only half the story. Affinzo shows how your monthly take-home pay is being consumed by housing, transportation, food, debt, subscriptions and lifestyle expenses.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Interactive Category Sliders */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Take-Home Pay Basis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Monthly Net Take-Home Pay</h2>
                  <p className="text-xs text-slate-500">The total spendable cash entering your bank each month</p>
                </div>
                <div className="w-36 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">$</span>
                  <input
                    type="number"
                    value={takeHomePay || ''}
                    onChange={(e) => setTakeHomePay(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-1.5 text-xs text-right font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Quick spending sliders */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Housing & Shelter</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={housingCost || ''}
                      onChange={(e) => setHousingCost(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Vehicle & Transportation</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={transportCost || ''}
                      onChange={(e) => setTransportCost(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Groceries & Essential Food</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={groceriesFood || ''}
                      onChange={(e) => setGroceriesFood(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Dining Out & Coffee</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={diningOut || ''}
                      onChange={(e) => setDiningOut(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Debt & Loan Payments</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={debtPayments || ''}
                      onChange={(e) => setDebtPayments(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Utilities, Phone & Internet</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={utilitiesPhone || ''}
                      onChange={(e) => setUtilitiesPhone(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Subscriptions & Apps</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={subscriptionsDigital || ''}
                      onChange={(e) => setSubscriptionsDigital(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Personal Shopping & Misc</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={lifestyleShopping || ''}
                      onChange={(e) => setLifestyleShopping(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Monthly Savings & Investments</span>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={savingsMonthly || ''}
                      onChange={(e) => setSavingsMonthly(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs text-right font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ranked Spending Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Ranked Monthly Money Drains</h3>
              <div className="space-y-3">
                {categories.map((c) => {
                  const pct = (c.amount / (takeHomePay || 1)) * 100;
                  return (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-800">
                        <span>{c.name}</span>
                        <span>${c.amount.toLocaleString()} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.color}`}
                          style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right: Where Money Goes Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cash Flow Balance Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900 text-white p-6 sm:p-7 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Monthly Cash-Flow Balance</span>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-4xl font-black tracking-tight ${remainingCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${Math.round(remainingCashFlow).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/ month left</span>
              </div>

              <div className="mt-2 text-xs text-slate-300">
                You retain <strong className="text-white">{remainingRate.toFixed(1)}%</strong> of your take-home pay after all fixed and lifestyle commitments.
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Take-Home Inflow:</span>
                  <span className="font-semibold text-white">${Math.round(takeHomePay).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>Total Monthly Outflows:</span>
                  <span className="font-semibold">-${Math.round(totalOutflows).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-300 font-bold">
                  <span>Remaining Unallocated Buffer:</span>
                  <span className={remainingCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    ${Math.round(remainingCashFlow).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Want Itemized Accuracy?</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Run the comprehensive 5-step analysis to calculate exact state tax withholdings, custom expense categories, and download an official PDF report.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-purple-100" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Cash-Flow PDF'}</span>
                </button>
                <button
                  onClick={onStartReport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Build Full Income Report</span>
                </button>
                <button
                  onClick={() => onNavigate('life-cost')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>See "What Is My Life Actually Costing Me?"</span>
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
