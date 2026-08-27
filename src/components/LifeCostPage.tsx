import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  ArrowLeft, 
  DollarSign, 
  HelpCircle, 
  FileText, 
  Sliders, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Briefcase,
  Download
} from 'lucide-react';
import { FinancialFormData, FinancialCalculations } from '../types/financial';
import { generateLifeCostPDF } from '../utils/pdfGenerator';

interface LifeCostPageProps {
  formData: FinancialFormData;
  calculations: FinancialCalculations;
  onNavigate: (view: string) => void;
  onStartReport: () => void;
}

export const LifeCostPage: React.FC<LifeCostPageProps> = ({
  formData,
  calculations,
  onNavigate,
  onStartReport,
}) => {
  // Monthly life items
  const [takeHomePay, setTakeHomePay] = useState<number>(
    calculations.estimatedMonthlyTakeHome > 0 ? Math.round(calculations.estimatedMonthlyTakeHome) : 5600
  );
  const [housing, setHousing] = useState<number>(
    calculations.monthlyHousingTotal > 0 ? Math.round(calculations.monthlyHousingTotal) : 1900
  );
  const [transportation, setTransportation] = useState<number>(
    calculations.monthlyTransportTotal > 0 ? Math.round(calculations.monthlyTransportTotal) : 620
  );
  const [foodGroceries, setFoodGroceries] = useState<number>(
    formData.livingExpenses.foodGroceries > 0 ? formData.livingExpenses.foodGroceries : 650
  );
  const [healthcare, setHealthcare] = useState<number>(
    formData.livingExpenses.healthcare > 0 ? formData.livingExpenses.healthcare : 180
  );
  const [debtObligations, setDebtObligations] = useState<number>(
    calculations.monthlyDebtTotal > 0 ? Math.round(calculations.monthlyDebtTotal) : 380
  );
  const [subscriptions, setSubscriptions] = useState<number>(
    formData.livingExpenses.subscriptions > 0 ? formData.livingExpenses.subscriptions : 110
  );
  const [entertainmentTravel, setEntertainmentTravel] = useState<number>(
    (formData.livingExpenses.restaurants + formData.livingExpenses.shopping) || 450
  );
  const [familyPersonal, setFamilyPersonal] = useState<number>(
    formData.livingExpenses.customExpenses?.reduce((sum, item) => sum + item.amount, 0) || 200
  );
  const [savingsMonthly, setSavingsMonthly] = useState<number>(
    formData.debtSavings.monthlySavings > 0 ? formData.debtSavings.monthlySavings : 500
  );

  // Computations
  const monthlyCostOfLiving =
    housing +
    transportation +
    foodGroceries +
    healthcare +
    debtObligations +
    subscriptions +
    entertainmentTravel +
    familyPersonal;

  const totalMonthlyOutflowsWithSavings = monthlyCostOfLiving + savingsMonthly;
  const annualCostOfLiving = monthlyCostOfLiving * 12;
  const annualTotalOutflows = totalMonthlyOutflowsWithSavings * 12;

  const monthlyRemainingBuffer = takeHomePay - totalMonthlyOutflowsWithSavings;
  const annualRemainingBuffer = monthlyRemainingBuffer * 12;

  // Work days analysis (assuming ~21.6 working days per month)
  const workDaysPerMonth = 21.6;
  const dailyEarnings = takeHomePay / workDaysPerMonth;
  const daysToCoverLife = dailyEarnings > 0 ? monthlyCostOfLiving / dailyEarnings : 0;
  const daysOfFreedom = Math.max(0, workDaysPerMonth - daysToCoverLife);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const essentialSurvivalCost = housing + transportation + foodGroceries + healthcare + debtObligations;
      const hourlyRate = takeHomePay / 160;
      const hoursWorkedForSurvival = hourlyRate > 0 ? essentialSurvivalCost / hourlyRate : 0;

      const doc = generateLifeCostPDF({
        takeHomePay,
        hourlyWage: hourlyRate,
        housing,
        transportation,
        foodGroceries,
        healthcare,
        debtObligations,
        subscriptions,
        entertainmentTravel,
        familyPersonal,
        savingsMonthly,
        monthlyCostOfLiving,
        annualCostOfLiving,
        survivalCost: essentialSurvivalCost,
        hoursToSurvive: hoursWorkedForSurvival,
        workDaysForFixed: daysToCoverLife,
        discretionaryBuffer: monthlyRemainingBuffer,
        savingsRate: (savingsMonthly / (takeHomePay || 1)) * 100,
      });
      const filename = `life-cost-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating Life Cost PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Question Header */}
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
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3.5 py-1 text-xs font-semibold text-teal-400 mb-4">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Search Intent & Real-Cost Decision</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            What Is My Life <span className="text-teal-400">Actually Costing Me?</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Understand your true holistic cost of living. Calculate your real monthly and annual commitments across every dimension of life, and see how many days of work you need each month just to break even.
          </p>
        </div>
      </section>

      {/* Main Interactive Tool */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: All Life Dimensions */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">1. Monthly Net Take-Home Pay</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your monthly spendable paycheck</p>
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

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Housing & Shelter</span>
                    <span className="text-[10px] text-slate-500">Rent, mortgage, property tax, utilities</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={housing || ''}
                      onChange={(e) => setHousing(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Transportation & Mobility</span>
                    <span className="text-[10px] text-slate-500">Auto loan, insurance, fuel, maintenance</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={transportation || ''}
                      onChange={(e) => setTransportation(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Food & Household Essentials</span>
                    <span className="text-[10px] text-slate-500">Groceries, household supplies</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={foodGroceries || ''}
                      onChange={(e) => setFoodGroceries(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Healthcare & Wellness</span>
                    <span className="text-[10px] text-slate-500">Out-of-pocket medical, gym, rx</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={healthcare || ''}
                      onChange={(e) => setHealthcare(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Debt & Loans Obligations</span>
                    <span className="text-[10px] text-slate-500">Student loans, credit cards, personal loans</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={debtObligations || ''}
                      onChange={(e) => setDebtObligations(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Subscriptions & Digital Life</span>
                    <span className="text-[10px] text-slate-500">Streaming, software, memberships</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={subscriptions || ''}
                      onChange={(e) => setSubscriptions(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Entertainment, Dining & Travel</span>
                    <span className="text-[10px] text-slate-500">Restaurants, events, weekend trips</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={entertainmentTravel || ''}
                      onChange={(e) => setEntertainmentTravel(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Personal, Pets & Family</span>
                    <span className="text-[10px] text-slate-500">Childcare, pet food, clothing, personal care</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={familyPersonal || ''}
                      onChange={(e) => setFamilyPersonal(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 block">Active Monthly Savings & Growth</span>
                    <span className="text-[10px] text-slate-500">Emergency fund, brokerage, investment goals</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={savingsMonthly || ''}
                      onChange={(e) => setSavingsMonthly(Number(e.target.value))}
                      className="w-full rounded-lg border border-emerald-300 bg-emerald-50/50 pl-6 pr-2 py-1.5 text-xs text-right font-bold text-emerald-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Days Analysis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Your "Work Days for Life" Ratio</h3>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Assuming a typical 21.6 working-day month, how many days of labor are required to fund your life before you keep a single dollar?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Days to Fund Baseline Life</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{daysToCoverLife.toFixed(1)} days</div>
                  <span className="text-[10px] text-slate-400">of 21.6 working days</span>
                </div>

                <div className="rounded-xl bg-teal-50 p-4 border border-teal-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Days of Net Financial Freedom</span>
                  <div className="text-2xl font-black text-teal-800 mt-1">{daysOfFreedom.toFixed(1)} days</div>
                  <span className="text-[10px] text-teal-600">to save, invest, or buffer</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Real Life Cost Synthesis */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real Life Cost Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900 text-white p-6 sm:p-7 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Total Monthly Cost of Living</span>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-white">
                  ${Math.round(monthlyCostOfLiving).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/ month</span>
              </div>

              <div className="mt-1 text-xs text-slate-300">
                ≈ ${Math.round(annualCostOfLiving).toLocaleString()} per year for baseline living
              </div>

              {/* Summary rows */}
              <div className="mt-5 space-y-2.5 border-t border-slate-800 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Monthly Take-Home Pay:</span>
                  <span className="font-semibold text-white">${Math.round(takeHomePay).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>Baseline Life Expenses:</span>
                  <span className="font-semibold">-${Math.round(monthlyCostOfLiving).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>Active Monthly Savings:</span>
                  <span className="font-semibold">-${Math.round(savingsMonthly).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-200 font-bold">
                  <span>Remaining Unallocated Buffer:</span>
                  <span className={monthlyRemainingBuffer >= 0 ? 'text-teal-400 font-black' : 'text-rose-400 font-black'}>
                    ${Math.round(monthlyRemainingBuffer).toLocaleString()}/mo
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  (${Math.round(annualRemainingBuffer).toLocaleString()}/year)
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Build Your Official Reality Report</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Turn your numbers into a comprehensive PDF report with progressive tax withholdings and debt-to-income benchmarks.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-teal-100" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Holistic Life Cost PDF'}</span>
                </button>
                <button
                  onClick={onStartReport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-teal-400" />
                  <span>Start 5-Step Income Report</span>
                </button>
                <button
                  onClick={() => onNavigate('affordability')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>Simulate Major Purchase Decisions</span>
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
