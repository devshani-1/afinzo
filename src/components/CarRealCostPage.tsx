import React, { useState, useMemo } from 'react';
import { 
  Car, 
  ArrowRight, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  TrendingDown, 
  Fuel, 
  ShieldCheck, 
  Wrench, 
  FileText, 
  ArrowLeft,
  Info,
  Sliders,
  Download
} from 'lucide-react';
import { FinancialFormData, FinancialCalculations } from '../types/financial';
import { generateCarCostPDF } from '../utils/pdfGenerator';

interface CarRealCostPageProps {
  formData: FinancialFormData;
  calculations: FinancialCalculations;
  onNavigate: (view: string) => void;
  onStartReport: () => void;
}

export const CarRealCostPage: React.FC<CarRealCostPageProps> = ({
  formData,
  calculations,
  onNavigate,
  onStartReport,
}) => {
  // Car variables
  const [carName, setCarName] = useState('2024 Midsize SUV');
  const [purchasePrice, setPurchasePrice] = useState<number>(34000);
  const [downPayment, setDownPayment] = useState<number>(4000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(60);
  const [interestRateApr, setInterestRateApr] = useState<number>(6.8);
  const [monthlyInsurance, setMonthlyInsurance] = useState<number>(175);
  const [monthlyFuelOrCharge, setMonthlyFuelOrCharge] = useState<number>(185);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState<number>(85);
  const [monthlyRegistrationTaxes, setMonthlyRegistrationTaxes] = useState<number>(35);
  const [monthlyParkingTolls, setMonthlyParkingTolls] = useState<number>(40);

  // Quick Presets
  const presets = [
    {
      name: 'Reliable Commuter Sedan',
      price: 22000,
      down: 3000,
      term: 48,
      apr: 6.2,
      insurance: 140,
      fuel: 145,
      maint: 60,
      reg: 25,
      parking: 20,
    },
    {
      name: 'Popular Family SUV',
      price: 35000,
      down: 5000,
      term: 60,
      apr: 6.8,
      insurance: 180,
      fuel: 200,
      maint: 90,
      reg: 40,
      parking: 40,
    },
    {
      name: 'Modern Electric EV',
      price: 44000,
      down: 6000,
      term: 60,
      apr: 5.9,
      insurance: 210,
      fuel: 65, // charging is cheaper
      maint: 50,
      reg: 45,
      parking: 30,
    },
    {
      name: 'Luxury / Performance',
      price: 62000,
      down: 8000,
      term: 60,
      apr: 7.2,
      insurance: 290,
      fuel: 260,
      maint: 160,
      reg: 75,
      parking: 80,
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setCarName(p.name);
    setPurchasePrice(p.price);
    setDownPayment(p.down);
    setLoanTermMonths(p.term);
    setInterestRateApr(p.apr);
    setMonthlyInsurance(p.insurance);
    setMonthlyFuelOrCharge(p.fuel);
    setMonthlyMaintenance(p.maint);
    setMonthlyRegistrationTaxes(p.reg);
    setMonthlyParkingTolls(p.parking);
  };

  // Financing calculation
  const financedAmount = Math.max(0, purchasePrice - downPayment);
  const monthlyInterestRate = interestRateApr / 100 / 12;
  const monthlyLoanPayment = useMemo(() => {
    if (financedAmount <= 0) return 0;
    if (monthlyInterestRate <= 0) return financedAmount / (loanTermMonths || 1);
    const pmt =
      (financedAmount *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths))) /
      (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
    return isNaN(pmt) ? 0 : pmt;
  }, [financedAmount, monthlyInterestRate, loanTermMonths]);

  // Ownership expenses
  const operatingCosts =
    monthlyInsurance +
    monthlyFuelOrCharge +
    monthlyMaintenance +
    monthlyRegistrationTaxes +
    monthlyParkingTolls;

  const totalMonthlyRealCost = monthlyLoanPayment + operatingCosts;
  const total5YearCost = totalMonthlyRealCost * 60 + downPayment;

  // Monthly budget comparison
  const userTakeHome = calculations.estimatedMonthlyTakeHome > 0 ? calculations.estimatedMonthlyTakeHome : 5500;
  const currentBuffer = calculations.monthlyRemainingCashFlow;
  const currentExistingAuto = calculations.monthlyTransportTotal || 0;

  // Real cost as % of take-home
  const shareOfTakeHome = (totalMonthlyRealCost / userTakeHome) * 100;
  const newEstimatedBuffer = currentBuffer - totalMonthlyRealCost + currentExistingAuto;

  // Affordability status check (10% - 15% rule for total auto)
  const isHealthyPercentage = shareOfTakeHome <= 15;
  const isBufferPositive = newEstimatedBuffer >= 250;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = generateCarCostPDF({
        carName,
        purchasePrice,
        downPayment,
        interestRate: interestRateApr,
        loanTermMonths,
        monthlyLoanPayment,
        monthlyInsurance,
        monthlyFuelOrCharge,
        monthlyMaintenance,
        monthlyRegistrationTaxes,
        monthlyParkingTolls,
        financedAmount,
        operatingCosts,
        totalMonthlyRealCost,
        total5YearCost,
        userTakeHome,
        shareOfTakeHome,
        currentBuffer,
        newEstimatedBuffer,
        isHealthyPercentage,
        isBufferPositive,
      });
      const filename = `car-real-cost-report-${carName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating Car Cost PDF:', err);
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
            <Car className="h-3.5 w-3.5" />
            <span>Search Intent & Real-Cost Decision</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            What Will This Car <span className="text-emerald-400">Actually Cost Me?</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            A ${purchasePrice.toLocaleString()} car doesn't really cost ${purchasePrice.toLocaleString()}. See what your loan payment, auto insurance, fuel, maintenance, registration, and hidden ownership costs could mean for your monthly budget.
          </p>

          {/* Quick Preset Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Load vehicle example:</span>
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  carName === p.name
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {p.name} (${(p.price / 1000).toFixed(0)}k)
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Tool Grid */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Cost Breakdown Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: The Price Isn't the Real Cost */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">1. The Price Isn't the Real Cost</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Financing terms & vehicle purchase price</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-400">Financed Amount</span>
                  <div className="text-sm font-bold text-slate-900">${Math.round(financedAmount).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Purchase Price ($)
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={purchasePrice || ''}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="block w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Down Payment ($)
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      step={250}
                      value={downPayment || ''}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="block w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loan Term (Months)
                  </label>
                  <select
                    value={loanTermMonths}
                    onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none bg-white"
                  >
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                    <option value={72}>72 Months (6 Years)</option>
                    <option value={84}>84 Months (7 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interest Rate (APR %)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={25}
                    value={interestRateApr || ''}
                    onChange={(e) => setInterestRateApr(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Monthly Loan Payment Highlight */}
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Estimated Monthly Loan Payment:</span>
                <span className="text-base font-extrabold text-slate-900">${Math.round(monthlyLoanPayment).toLocaleString()}/mo</span>
              </div>
            </div>

            {/* Section 2: Real Monthly Operating & Ownership Costs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">2. The Hidden Ownership Costs</h2>
                <p className="text-xs text-slate-500 mt-0.5">Insurance, energy, upkeep, and road fees that dealers leave out</p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Auto Insurance</span>
                      <span className="text-[10px] text-slate-500">Comprehensive, collision & liability</span>
                    </div>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={monthlyInsurance || ''}
                      onChange={(e) => setMonthlyInsurance(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Fuel className="h-4 w-4 text-amber-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Fuel / EV Electricity</span>
                      <span className="text-[10px] text-slate-500">Monthly gas or home charging costs</span>
                    </div>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={monthlyFuelOrCharge || ''}
                      onChange={(e) => setMonthlyFuelOrCharge(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Wrench className="h-4 w-4 text-indigo-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Maintenance & Tires</span>
                      <span className="text-[10px] text-slate-500">Oil changes, brakes, tires amortized</span>
                    </div>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={monthlyMaintenance || ''}
                      onChange={(e) => setMonthlyMaintenance(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 text-rose-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Registration & Taxes</span>
                      <span className="text-[10px] text-slate-500">Annual plate tag / 12</span>
                    </div>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={monthlyRegistrationTaxes || ''}
                      onChange={(e) => setMonthlyRegistrationTaxes(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Car className="h-4 w-4 text-slate-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Parking & Highway Tolls</span>
                      <span className="text-[10px] text-slate-500">Work parking, meters, express lane pass</span>
                    </div>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={monthlyParkingTolls || ''}
                      onChange={(e) => setMonthlyParkingTolls(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Operating Expenses Subtotal:</span>
                <span className="text-sm font-bold text-slate-900">${Math.round(operatingCosts).toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Cost Synthesis & Affordability Decision */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Total Real Cost Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900 text-white p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Real Monthly Cost</span>
                <span className="text-[10px] rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">All-Inclusive</span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-white">
                  ${Math.round(totalMonthlyRealCost).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/ month</span>
              </div>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                While the sticker loan payment is ${Math.round(monthlyLoanPayment).toLocaleString()}/mo, total operating ownership is actually{' '}
                <strong className="text-emerald-400">${Math.round(totalMonthlyRealCost).toLocaleString()} every single month</strong>.
              </p>

              {/* Water-fall item breakdown */}
              <div className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Loan Principal & Interest</span>
                  <span className="font-semibold text-white">${Math.round(monthlyLoanPayment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Insurance & Fuel</span>
                  <span className="font-semibold text-white">${Math.round(monthlyInsurance + monthlyFuelOrCharge).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Upkeep, Reg & Parking</span>
                  <span className="font-semibold text-white">${Math.round(monthlyMaintenance + monthlyRegistrationTaxes + monthlyParkingTolls).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-400 text-[11px]">
                  <span>Estimated 5-Year Total Cost:</span>
                  <span className="font-bold text-slate-200">${Math.round(total5YearCost).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* How Will This Car Change My Monthly Budget? */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">How Will This Car Change My Monthly Budget?</h3>
              <p className="text-xs text-slate-500 mb-4">Cash flow before vs. after purchasing this vehicle</p>

              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Monthly Take-Home Pay</span>
                    <span className="text-[10px] text-slate-500">Based on user income profile</span>
                  </div>
                  <span className="font-bold text-slate-900">${Math.round(userTakeHome).toLocaleString()}</span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Car Share of Take-Home</span>
                    <span className="text-[10px] text-slate-500">Recommended benchmark: ≤15%</span>
                  </div>
                  <span className={`font-bold ${shareOfTakeHome > 15 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {shareOfTakeHome.toFixed(1)}%
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Current Cash-Flow Buffer:</span>
                    <span>${Math.round(currentBuffer).toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Remaining Buffer After Car:</span>
                    <span className={newEstimatedBuffer >= 0 ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                      ${Math.round(newEstimatedBuffer).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Can I Actually Afford This Car? Decision Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-slate-900">Can I Actually Afford This Car?</h3>
              </div>

              {isHealthyPercentage && isBufferPositive ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Realistic Cash-Flow Fit</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    This vehicle represents {shareOfTakeHome.toFixed(1)}% of your estimated monthly net take-home pay, keeping you within standard 10-15% transportation benchmarks with an estimated ${Math.round(newEstimatedBuffer).toLocaleString()} remaining monthly buffer.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Tight Cash-Flow Impact</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Total ownership costs absorb {shareOfTakeHome.toFixed(1)}% of estimated net income. Consider a larger down payment, certified pre-owned model, or lower insurance rates to protect your emergency savings buffer.
                  </p>
                </div>
              )}

              {/* Call to action */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-100" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Car Cost PDF Report'}</span>
                </button>
                <button
                  onClick={() => onNavigate('affordability')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Compare in Affordability Simulator</span>
                </button>
                <button
                  onClick={onStartReport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>Run Full 5-Step Income Report</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
