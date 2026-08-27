import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  Sparkles, 
  RefreshCw, 
  Calculator, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  TrendingUp, 
  PieChart as PieIcon, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Edit, 
  Printer,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { 
  FinancialCalculations, 
  FinancialFormData, 
  AISummaryResponse 
} from '../types/financial';
import { DonutChart } from './DonutChart';
import { generateIncomeRealityPDF } from '../utils/pdfGenerator';

interface DashboardViewProps {
  calculations: FinancialCalculations;
  formData: FinancialFormData;
  aiSummary: AISummaryResponse | null;
  isLoadingAi: boolean;
  onRefreshAi: () => void;
  onNavigateToAffordability: () => void;
  onEditReport: () => void;
  onStartNewReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  calculations,
  formData,
  aiSummary,
  isLoadingAi,
  onRefreshAi,
  onNavigateToAffordability,
  onEditReport,
  onStartNewReport,
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);

  const handleDownloadPDF = () => {
    try {
      setDownloadingPdf(true);
      const pdf = generateIncomeRealityPDF(calculations, formData, aiSummary);
      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`Affinzo-Income-Reality-Report-${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate PDF. Please check your browser print settings.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const isPositiveBuffer = calculations.monthlyRemainingCashFlow >= 0;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Action Bar */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Your Income Reality
              </h1>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                Generated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on ${Math.round(calculations.grossAnnualIncome).toLocaleString()} gross income • {formData.income.state} tax schedule
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onEditReport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Numbers</span>
            </button>

            <button
              id="dashboard-download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>

            <button
              id="dashboard-can-i-afford-btn"
              onClick={onNavigateToAffordability}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Can I Afford It?</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">
        {/* ================= 1. FOUR LARGE KPI CARDS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Estimated Monthly Take-Home */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Estimated Monthly Take-Home
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  ${Math.round(calculations.estimatedMonthlyTakeHome).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/mo</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
              After ~{(calculations.effectiveTaxRate * 100).toFixed(1)}% estimated federal, state & FICA tax
            </p>
          </div>

          {/* Card 2: Total Monthly Expenses */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Monthly Expenses
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  ${Math.round(calculations.totalMonthlyExpenses).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/mo</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
              Housing, transit, food & daily living essentials
            </p>
          </div>

          {/* Card 3: Monthly Debt Payments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Monthly Debt Payments
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  ${Math.round(calculations.monthlyDebtTotal).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/mo</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
              {calculations.debtToIncomeRatio.toFixed(1)}% of net monthly take-home income
            </p>
          </div>

          {/* Card 4: Estimated Monthly Remaining */}
          <div className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between ${
            isPositiveBuffer
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
              : 'border-rose-200 bg-rose-50/70 text-rose-950'
          }`}>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                Estimated Monthly Remaining
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {isPositiveBuffer ? '$' : '-$'}
                  {Math.abs(Math.round(calculations.monthlyRemainingCashFlow)).toLocaleString()}
                </span>
                <span className="text-xs font-medium opacity-80">/mo</span>
              </div>
            </div>
            <p className="mt-4 text-xs opacity-90 border-t border-current/10 pt-3">
              {isPositiveBuffer
                ? `Discretionary buffer (${calculations.remainingCashFlowRate.toFixed(1)}% of take-home)`
                : `Shortfall before adjustments`}
            </p>
          </div>
        </section>

        {/* ================= 2. CASH FLOW WATERFALL ================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Cash Flow Breakdown</h2>
              <p className="text-xs text-slate-500">
                Step-by-step subtraction from estimated take-home pay to your unallocated buffer.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Net Inflow: ${Math.round(calculations.estimatedMonthlyTakeHome).toLocaleString()}
            </div>
          </div>

          {/* Visual Step-by-Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            {/* Take-Home Base */}
            <div className="rounded-xl border border-slate-300 bg-slate-100/80 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-500">Take-Home</span>
              <p className="text-base font-bold text-slate-900 mt-1">
                +${Math.round(calculations.estimatedMonthlyTakeHome).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">100% Inflow</span>
            </div>

            {/* Minus Housing */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <span className="text-[10px] font-bold uppercase text-blue-700">Housing</span>
              <p className="text-base font-bold text-blue-900 mt-1">
                -${Math.round(calculations.monthlyHousingTotal).toLocaleString()}
              </p>
              <span className="text-[10px] text-blue-600">{calculations.housingBurdenRatio.toFixed(0)}% of pay</span>
            </div>

            {/* Minus Transport */}
            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
              <span className="text-[10px] font-bold uppercase text-sky-700">Transit</span>
              <p className="text-base font-bold text-sky-900 mt-1">
                -${Math.round(calculations.monthlyTransportTotal).toLocaleString()}
              </p>
              <span className="text-[10px] text-sky-600">
                {((calculations.monthlyTransportTotal / (calculations.estimatedMonthlyTakeHome || 1)) * 100).toFixed(0)}% of pay
              </span>
            </div>

            {/* Minus Living & Food */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Food & Living</span>
              <p className="text-base font-bold text-emerald-900 mt-1">
                -${Math.round(calculations.monthlyLivingTotal).toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-600">
                {((calculations.monthlyLivingTotal / (calculations.estimatedMonthlyTakeHome || 1)) * 100).toFixed(0)}% of pay
              </span>
            </div>

            {/* Minus Debt */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <span className="text-[10px] font-bold uppercase text-rose-700">Debt</span>
              <p className="text-base font-bold text-rose-900 mt-1">
                -${Math.round(calculations.monthlyDebtTotal).toLocaleString()}
              </p>
              <span className="text-[10px] text-rose-600">{calculations.debtToIncomeRatio.toFixed(0)}% of pay</span>
            </div>

            {/* Minus Savings */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
              <span className="text-[10px] font-bold uppercase text-purple-700">Savings</span>
              <p className="text-base font-bold text-purple-900 mt-1">
                -${Math.round(calculations.monthlySavingsTotal).toLocaleString()}
              </p>
              <span className="text-[10px] text-purple-600">{calculations.savingsRate.toFixed(0)}% of pay</span>
            </div>
          </div>

          {/* Cash Flow Result Bar */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900">
                Operating Cash Flow Result:
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Total monthly outflows represent ${Math.round(calculations.totalMonthlyOutflows).toLocaleString()} across all categories.
              </p>
            </div>
            <div className="text-right">
              <span className={`text-xl font-extrabold ${isPositiveBuffer ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isPositiveBuffer ? '+$' : '-$'}
                {Math.abs(Math.round(calculations.monthlyRemainingCashFlow)).toLocaleString()} / mo
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                {isPositiveBuffer ? 'Net Unallocated Surplus' : 'Net Monthly Deficit'}
              </span>
            </div>
          </div>
        </section>

        {/* ================= 3. EXPENSE BREAKDOWN (DONUT + RANKED LIST) ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donut Chart Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-slate-900 mb-1 w-full text-left">
              Outflow Allocation
            </h3>
            <p className="text-xs text-slate-500 mb-6 w-full text-left">
              Proportion of total monthly expenditures.
            </p>
            <DonutChart
              data={calculations.categoryBreakdown}
              centerLabel="Total Outflows"
              centerValue={`$${Math.round(calculations.totalMonthlyOutflows).toLocaleString()}`}
              size={230}
            />
          </div>

          {/* Ranked Category List */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Ranked Spending Categories
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  Sorted by dollar magnitude
                </span>
              </div>

              <div className="space-y-3.5">
                {calculations.categoryBreakdown.map((cat, idx) => (
                  <div key={cat.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                          {idx + 1}
                        </span>
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-bold text-slate-900">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">
                          ${Math.round(cat.amount).toLocaleString()} / mo
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                          {cat.percentageOfIncome.toFixed(1)}% of Net
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, cat.percentageOfIncome)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Combined outflows: ${Math.round(calculations.totalMonthlyOutflows).toLocaleString()} / mo</span>
              <span>Available buffer: ${Math.round(calculations.monthlyRemainingCashFlow).toLocaleString()} / mo</span>
            </div>
          </div>
        </section>

        {/* ================= 4. FINANCIAL INDICATORS ================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Financial Health Indicators
            </h2>
            <p className="text-xs text-slate-500">
              Formulas and benchmarks evaluated with transparent criteria. We do not use subjective "good" or "bad" labels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculations.indicators.map((ind) => {
              const isSelected = selectedIndicatorId === ind.id;
              return (
                <div
                  key={ind.id}
                  onClick={() => setSelectedIndicatorId(isSelected ? null : ind.id)}
                  className={`rounded-xl border p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/90 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{ind.title}</span>
                      <p className="text-2xl font-extrabold text-slate-900 mt-1">{ind.value}</p>
                    </div>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        ind.level === 'lower'
                          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20'
                          : ind.level === 'moderate'
                          ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-600/20'
                          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20'
                      }`}
                    >
                      {ind.levelLabel}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {ind.explanation}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1">
                    <p><span className="font-semibold text-slate-700">Formula:</span> {ind.formula}</p>
                    <p><span className="font-semibold text-slate-700">Benchmark:</span> {ind.benchmark}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= 5. AI FINANCIAL SUMMARY ================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Your Financial Summary</h2>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    AI Synthesis
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Concise explanation generated from your calculated numbers.
                </p>
              </div>
            </div>

            <button
              onClick={onRefreshAi}
              disabled={isLoadingAi}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAi ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>{isLoadingAi ? 'Analyzing...' : 'Regenerate Analysis'}</span>
            </button>
          </div>

          {isLoadingAi ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-emerald-500" />
              <p className="text-xs font-semibold text-slate-700">Synthesizing educational cash-flow analysis...</p>
              <p className="text-[11px] text-slate-400">Evaluating deterministic ratios and expense drivers</p>
            </div>
          ) : aiSummary ? (
            <div className="space-y-6">
              {/* Executive Overview */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                  Executive Overview
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {aiSummary.executiveSummary}
                </p>
              </div>

              {/* Expense Drivers Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Key Expense Drivers & Observations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aiSummary.biggestExpenseDrivers.map((driver, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{driver.category}</span>
                        <span className="text-emerald-700 font-semibold">{driver.shareOfTakeHome}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 leading-normal">
                        {driver.observation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions & Considerations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Questions & Considerations to Review
                </h4>
                <ul className="space-y-2.5">
                  {aiSummary.keyConsiderations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Guardrails Disclaimer */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>Analysis generated via Gemini 3.7 Flash using deterministic outputs</span>
                <span>Affordly Educational Engine</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              No summary available. Click "Regenerate Analysis" above.
            </div>
          )}
        </section>

        {/* ================= 6. NEXT STEP: AFFORDABILITY CHECK BANNER ================= */}
        <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 mb-3">
              <Calculator className="h-3.5 w-3.5" />
              <span>Next Step: Decision Simulator</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Thinking about a major purchase or life change?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Test whether a new car, higher rent, tuition, or loan fits into your current ${Math.round(calculations.monthlyRemainingCashFlow).toLocaleString()}/month buffer.
            </p>
          </div>

          <button
            onClick={onNavigateToAffordability}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-all cursor-pointer font-bold"
          >
            <span>Launch Affordability Check</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      </main>
    </div>
  );
};
