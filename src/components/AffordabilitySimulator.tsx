import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Car,
  Home,
  Plane,
  GraduationCap,
  Tv,
  HelpCircle,
  TrendingDown,
  DollarSign,
  Download,
  Sliders,
  Wallet,
  PieChart,
  RefreshCw,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FinancialCalculations, FinancialFormData, AffordabilityScenario } from '../types/financial';
import { calculateAffordabilityScenario } from '../utils/calculations';
import { generateAffordabilityPDF } from '../utils/pdfGenerator';

interface AffordabilitySimulatorProps {
  calculations: FinancialCalculations;
  formData?: FinancialFormData;
  setFormData?: React.Dispatch<React.SetStateAction<FinancialFormData>>;
  onBackToDashboard: () => void;
}

export const AffordabilitySimulator: React.FC<AffordabilitySimulatorProps> = ({
  calculations,
  formData,
  setFormData,
  onBackToDashboard,
}) => {
  // Baseline financial state (editable directly inside the simulator)
  const [baselineTakeHome, setBaselineTakeHome] = useState<number>(() => {
    return calculations.estimatedMonthlyTakeHome > 0 
      ? Math.round(calculations.estimatedMonthlyTakeHome) 
      : 5150;
  });

  const [baselineHousing, setBaselineHousing] = useState<number>(() => {
    return calculations.monthlyHousingTotal > 0 
      ? Math.round(calculations.monthlyHousingTotal) 
      : 1650;
  });

  const [baselineTransport, setBaselineTransport] = useState<number>(() => {
    return calculations.monthlyTransportTotal > 0 
      ? Math.round(calculations.monthlyTransportTotal) 
      : 550;
  });

  const [baselineLiving, setBaselineLiving] = useState<number>(() => {
    return calculations.monthlyLivingTotal > 0 
      ? Math.round(calculations.monthlyLivingTotal) 
      : 750;
  });

  const [baselineDebt, setBaselineDebt] = useState<number>(() => {
    return calculations.monthlyDebtTotal >= 0 
      ? Math.round(calculations.monthlyDebtTotal) 
      : 300;
  });

  const [baselineSavings, setBaselineSavings] = useState<number>(() => {
    return calculations.monthlySavingsTotal >= 0 
      ? Math.round(calculations.monthlySavingsTotal) 
      : 500;
  });

  const [isBaselineExpanded, setIsBaselineExpanded] = useState<boolean>(true);

  // Compute live baseline totals
  const totalBaselineOutflows = baselineHousing + baselineTransport + baselineLiving + baselineDebt + baselineSavings;
  const currentMonthlyBuffer = baselineTakeHome - totalBaselineOutflows;

  // Custom loan calculation vs manual payment override tracking
  const [isAutoCalcPayment, setIsAutoCalcPayment] = useState<Record<string, boolean>>({
    'init-car': true,
    'init-rent': false,
  });

  // Helper to calculate loan monthly payment
  const computeLoanPayment = (price: number, down: number, term: number, apr: number) => {
    const principal = Math.max(0, price - down);
    if (principal <= 0) return 0;
    if (term <= 0) return 0;
    if (apr > 0) {
      const monthlyRate = apr / 100 / 12;
      return (principal * (monthlyRate * Math.pow(1 + monthlyRate, term))) / (Math.pow(1 + monthlyRate, term) - 1);
    }
    return principal / term;
  };

  // Scenarios state with starter options
  const [scenarios, setScenarios] = useState<AffordabilityScenario[]>(() => {
    const carPayment = Math.round(computeLoanPayment(32000, 4000, 60, 5.5));
    const sc1 = calculateAffordabilityScenario(
      calculations,
      {
        id: 'init-car',
        title: 'Option A: New Vehicle Lease/Loan',
        category: 'car',
        purchasePrice: 32000,
        downPayment: 4000,
        monthlyPayment: carPayment,
        loanTermMonths: 60,
        interestRate: 5.5,
        insuranceIncrease: 80,
        maintenanceOther: 40,
        isCustomPayment: false,
      },
      currentMonthlyBuffer
    );

    const sc2 = calculateAffordabilityScenario(
      calculations,
      {
        id: 'init-rent',
        title: 'Option B: 2-Bedroom Apartment Move',
        category: 'rent',
        purchasePrice: 0,
        downPayment: 0,
        monthlyPayment: 450,
        loanTermMonths: 12,
        interestRate: 0,
        insuranceIncrease: 15,
        maintenanceOther: 35,
        isCustomPayment: true,
      },
      currentMonthlyBuffer
    );

    return [sc1, sc2];
  });

  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0]?.id || 'init-car');

  // Re-calculate all scenarios when baseline buffer changes
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Helper to re-evaluate active scenario with live baseline
  const handleUpdateActiveScenario = (field: string, rawValue: any) => {
    if (!activeScenario) return;

    const isAuto = isAutoCalcPayment[activeScenario.id] ?? (activeScenario.category !== 'rent' && activeScenario.category !== 'subscription');

    let updated = {
      ...activeScenario,
      [field]: rawValue,
    };

    // If changing price, down payment, loan term, or interest rate and in auto-calc mode, auto-compute payment
    if (isAuto && ['purchasePrice', 'downPayment', 'loanTermMonths', 'interestRate'].includes(field)) {
      const price = field === 'purchasePrice' ? (Number(rawValue) || 0) : (activeScenario.purchasePrice || 0);
      const down = field === 'downPayment' ? (Number(rawValue) || 0) : (activeScenario.downPayment || 0);
      const term = field === 'loanTermMonths' ? (Number(rawValue) || 60) : (activeScenario.loanTermMonths || 60);
      const rate = field === 'interestRate' ? (Number(rawValue) || 0) : (activeScenario.interestRate || 0);
      
      const computed = computeLoanPayment(price, down, term, rate);
      updated.monthlyPayment = Math.round(computed * 100) / 100;
    }

    // If user directly edits monthly payment, remember custom mode
    if (field === 'monthlyPayment') {
      setIsAutoCalcPayment((prev) => ({ ...prev, [activeScenario.id]: false }));
      updated.isCustomPayment = true;
    }

    const recalculated = calculateAffordabilityScenario(
      calculations,
      {
        ...updated,
        isCustomPayment: !isAuto,
      },
      currentMonthlyBuffer
    );

    setScenarios((prev) =>
      prev.map((s) => (s.id === activeScenario.id ? recalculated : s))
    );
  };

  // Re-sync all scenarios whenever baseline numbers change
  const handleBaselineChange = (updater: () => void) => {
    updater();
  };

  // Trigger scenario updates on baseline buffer changes
  React.useEffect(() => {
    setScenarios((prev) =>
      prev.map((sc) => {
        return calculateAffordabilityScenario(
          calculations,
          sc,
          currentMonthlyBuffer
        );
      })
    );
  }, [currentMonthlyBuffer]);

  const handleToggleAutoCalc = () => {
    if (!activeScenario) return;
    const currentIsAuto = isAutoCalcPayment[activeScenario.id] ?? false;
    const newIsAuto = !currentIsAuto;

    setIsAutoCalcPayment((prev) => ({ ...prev, [activeScenario.id]: newIsAuto }));

    if (newIsAuto) {
      const computed = computeLoanPayment(
        activeScenario.purchasePrice || 0,
        activeScenario.downPayment || 0,
        activeScenario.loanTermMonths || 60,
        activeScenario.interestRate || 0
      );
      const updated = {
        ...activeScenario,
        monthlyPayment: Math.round(computed * 100) / 100,
        isCustomPayment: false,
      };
      const recalculated = calculateAffordabilityScenario(calculations, updated, currentMonthlyBuffer);
      setScenarios((prev) =>
        prev.map((s) => (s.id === activeScenario.id ? recalculated : s))
      );
    }
  };

  const handleAddScenario = (presetType?: string) => {
    const nextLetter = String.fromCharCode(65 + scenarios.length);
    let newScenarioRaw = {
      id: `sc-${Date.now()}`,
      title: `Option ${nextLetter}: Custom Expense`,
      category: 'other' as AffordabilityScenario['category'],
      purchasePrice: 0,
      downPayment: 0,
      monthlyPayment: 300,
      loanTermMonths: 12,
      interestRate: 0,
      insuranceIncrease: 0,
      maintenanceOther: 0,
      isCustomPayment: false,
    };

    let autoCalc = false;

    if (presetType === 'car') {
      const p = Math.round(computeLoanPayment(28000, 3500, 60, 6.2));
      newScenarioRaw = {
        id: `sc-${Date.now()}`,
        title: `Option ${nextLetter}: New Vehicle`,
        category: 'car',
        purchasePrice: 28000,
        downPayment: 3500,
        monthlyPayment: p,
        loanTermMonths: 60,
        interestRate: 6.2,
        insuranceIncrease: 75,
        maintenanceOther: 45,
        isCustomPayment: false,
      };
      autoCalc = true;
    } else if (presetType === 'rent') {
      newScenarioRaw = {
        id: `sc-${Date.now()}`,
        title: `Option ${nextLetter}: Apartment Move`,
        category: 'rent',
        purchasePrice: 0,
        downPayment: 0,
        monthlyPayment: 500,
        loanTermMonths: 12,
        interestRate: 0,
        insuranceIncrease: 20,
        maintenanceOther: 60,
        isCustomPayment: true,
      };
      autoCalc = false;
    } else if (presetType === 'vacation') {
      newScenarioRaw = {
        id: `sc-${Date.now()}`,
        title: `Option ${nextLetter}: Vacation Trip`,
        category: 'vacation',
        purchasePrice: 3600,
        downPayment: 600,
        monthlyPayment: 250,
        loanTermMonths: 12,
        interestRate: 0,
        insuranceIncrease: 0,
        maintenanceOther: 0,
        isCustomPayment: true,
      };
      autoCalc = false;
    } else if (presetType === 'subscription') {
      newScenarioRaw = {
        id: `sc-${Date.now()}`,
        title: `Option ${nextLetter}: Memberships / Subs`,
        category: 'subscription',
        purchasePrice: 0,
        downPayment: 0,
        monthlyPayment: 85,
        loanTermMonths: 12,
        interestRate: 0,
        insuranceIncrease: 0,
        maintenanceOther: 0,
        isCustomPayment: true,
      };
      autoCalc = false;
    } else if (presetType === 'loan') {
      const p = Math.round(computeLoanPayment(12000, 0, 48, 8.5));
      newScenarioRaw = {
        id: `sc-${Date.now()}`,
        title: `Option ${nextLetter}: Personal Loan`,
        category: 'loan',
        purchasePrice: 12000,
        downPayment: 0,
        monthlyPayment: p,
        loanTermMonths: 48,
        interestRate: 8.5,
        insuranceIncrease: 0,
        maintenanceOther: 0,
        isCustomPayment: false,
      };
      autoCalc = true;
    } else if (presetType === 'furniture') {
      const p = Math.round(computeLoanPayment(2800, 400, 12, 0));
      newScenarioRaw = {
        id: `sc-${Date.now()}`,
        title: `Option ${nextLetter}: Home Furniture`,
        category: 'furniture',
        purchasePrice: 2800,
        downPayment: 400,
        monthlyPayment: p,
        loanTermMonths: 12,
        interestRate: 0,
        insuranceIncrease: 0,
        maintenanceOther: 0,
        isCustomPayment: false,
      };
      autoCalc = true;
    } else if (presetType === 'education') {
      const p = Math.round(computeLoanPayment(8500, 1000, 24, 4.5));
      newScenarioRaw = {
        id: `sc-${Date.now()}`,
        title: `Option ${nextLetter}: Tuition / Bootcamp`,
        category: 'education',
        purchasePrice: 8500,
        downPayment: 1000,
        monthlyPayment: p,
        loanTermMonths: 24,
        interestRate: 4.5,
        insuranceIncrease: 0,
        maintenanceOther: 0,
        isCustomPayment: false,
      };
      autoCalc = true;
    }

    setIsAutoCalcPayment((prev) => ({ ...prev, [newScenarioRaw.id]: autoCalc }));

    const calculated = calculateAffordabilityScenario(calculations, newScenarioRaw, currentMonthlyBuffer);
    setScenarios((prev) => [...prev, calculated]);
    setActiveScenarioId(calculated.id);
  };

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) {
      return;
    }
    const filtered = scenarios.filter((s) => s.id !== id);
    setScenarios(filtered);
    if (activeScenarioId === id) {
      setActiveScenarioId(filtered[0]?.id || '');
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      // Build updated calculations with live baseline values for accurate PDF export
      const customizedCalculations: FinancialCalculations = {
        ...calculations,
        estimatedMonthlyTakeHome: baselineTakeHome,
        monthlyHousingTotal: baselineHousing,
        monthlyTransportTotal: baselineTransport,
        monthlyLivingTotal: baselineLiving,
        monthlyDebtTotal: baselineDebt,
        monthlySavingsTotal: baselineSavings,
        totalMonthlyOutflows: totalBaselineOutflows,
        monthlyRemainingCashFlow: currentMonthlyBuffer,
      };

      const doc = generateAffordabilityPDF({
        calculations: customizedCalculations,
        scenarios,
        activeScenario,
      });
      const filename = `affordability-simulation-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating Affordability PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Reset baseline to initial profile defaults
  const handleResetBaselineToProfile = () => {
    setBaselineTakeHome(Math.round(calculations.estimatedMonthlyTakeHome || 5150));
    setBaselineHousing(Math.round(calculations.monthlyHousingTotal || 1650));
    setBaselineTransport(Math.round(calculations.monthlyTransportTotal || 550));
    setBaselineLiving(Math.round(calculations.monthlyLivingTotal || 750));
    setBaselineDebt(Math.round(calculations.monthlyDebtTotal || 300));
    setBaselineSavings(Math.round(calculations.monthlySavingsTotal || 500));
  };

  const isCurrentActiveAutoCalc = isAutoCalcPayment[activeScenario?.id] ?? (activeScenario?.category !== 'rent' && activeScenario?.category !== 'subscription');

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 bg-white p-6 sm:p-8 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToDashboard}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-800 mb-1">
                  <Sliders className="h-3 w-3 text-purple-600" />
                  <span>Decision Tool & Scenario Engine</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Can I Actually Afford This?
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  Enter your income and current expenses, then add something you're considering buying. Affinzo estimates how that decision could change your monthly cash flow.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
            {/* Current Baseline Buffer Pill */}
            <div className="flex flex-col sm:items-end gap-0.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-500">Current Monthly Buffer:</span>
              <span className={`text-base font-black ${currentMonthlyBuffer >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                ${Math.round(currentMonthlyBuffer).toLocaleString()}/mo
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: Interactive Income & Current Expenses Baseline Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Step 1: Your Baseline Financial Profile (Income & Outflows)
                </span>
                <p className="text-[11px] text-slate-500">
                  Adjust your income and baseline commitments to see your real spendable buffer.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetBaselineToProfile}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Reset to your saved profile"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
              <button
                onClick={() => setIsBaselineExpanded(!isBaselineExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isBaselineExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isBaselineExpanded && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                
                {/* 1. Monthly Take-Home Pay */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                    Monthly Take-Home Pay
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-emerald-700 text-xs font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={baselineTakeHome || ''}
                      onChange={(e) => setBaselineTakeHome(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="5150"
                      className="w-full rounded-lg border border-emerald-300 bg-white py-1.5 pl-6 pr-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-800/80 mt-1 block">
                    ~${Math.round(baselineTakeHome * 12).toLocaleString()}/yr net
                  </span>
                </div>

                {/* 2. Housing */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Housing (Rent/Mortgage)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={baselineHousing || ''}
                      onChange={(e) => setBaselineHousing(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="1650"
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Rent + utilities</span>
                </div>

                {/* 3. Transport */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Current Transportation
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={baselineTransport || ''}
                      onChange={(e) => setBaselineTransport(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="550"
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Auto, gas, insurance</span>
                </div>

                {/* 4. Living Essentials */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Food & Living Essentials
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={baselineLiving || ''}
                      onChange={(e) => setBaselineLiving(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="750"
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Groceries, dining, phone</span>
                </div>

                {/* 5. Debt Payments */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Debt Minimums
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={baselineDebt || ''}
                      onChange={(e) => setBaselineDebt(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="300"
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Loans & credit cards</span>
                </div>

                {/* 6. Active Savings */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Monthly Savings / 401k
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={baselineSavings || ''}
                      onChange={(e) => setBaselineSavings(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="500"
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Emergency & investing</span>
                </div>

              </div>

              {/* Baseline Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Outflows:</span>
                    <span className="text-sm font-extrabold text-slate-100">${totalBaselineOutflows.toLocaleString()}/mo</span>
                  </div>
                  <div className="h-6 w-px bg-slate-700 hidden sm:block" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Surplus Ratio:</span>
                    <span className="text-sm font-extrabold text-slate-100">
                      {((currentMonthlyBuffer / (baselineTakeHome || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-700 hidden sm:block" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Spendable Surplus:</span>
                    <span className={`text-sm font-extrabold ${currentMonthlyBuffer >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${Math.round(currentMonthlyBuffer).toLocaleString()}/month
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  {currentMonthlyBuffer >= 0 ? '✓ Positive operating cushion' : '⚠️ Baseline is currently in deficit'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: Quick Purchase Preset Picker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-900">
              Step 2: Add or test what you are considering buying:
            </span>
            <span className="text-[11px] text-slate-500">Click a preset to add a new option</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'car', label: '🚗 Vehicle / Car', desc: 'Auto loan & insurance' },
              { type: 'rent', label: '🏢 Apartment / Rent', desc: 'Lease upgrade' },
              { type: 'vacation', label: '✈️ Vacation / Travel', desc: 'Travel booking' },
              { type: 'subscription', label: '📺 Subscriptions / Club', desc: 'Monthly membership' },
              { type: 'loan', label: '💳 Personal Loan', desc: 'Debt consolidation' },
              { type: 'furniture', label: '🛋️ Furniture / Appliances', desc: 'Household upgrade' },
              { type: 'education', label: '🎓 Tuition / Bootcamp', desc: 'Course / degree' },
              { type: 'other', label: '📦 Custom Expense', desc: 'Major purchase' },
            ].map((p) => (
              <button
                key={p.type}
                onClick={() => handleAddScenario(p.type)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors cursor-pointer shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {scenarios.map((sc) => {
              const isActive = sc.id === activeScenario?.id;
              const isAffordable = sc.newRemainingCashFlow >= 0;
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{sc.title}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    isActive 
                      ? 'bg-slate-800 text-emerald-300' 
                      : (isAffordable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
                  }`}>
                    +${Math.round(sc.additionalMonthlyCost).toLocaleString()}/mo
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddScenario()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              <span>New Scenario</span>
            </button>
          </div>
        </div>

        {/* Active Scenario Simulator Area */}
        {activeScenario && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Configure Potential Purchase ({activeScenario.title})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Adjust price, financing terms, and ongoing upkeep costs to see the live cash-flow impact.
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteScenario(activeScenario.id)}
                  disabled={scenarios.length <= 1}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    scenarios.length <= 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title={scenarios.length <= 1 ? "At least one scenario is required" : "Delete this scenario"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scenario Title
                  </label>
                  <input
                    type="text"
                    value={activeScenario.title}
                    onChange={(e) => handleUpdateActiveScenario('title', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expense Category
                  </label>
                  <select
                    value={activeScenario.category}
                    onChange={(e) => handleUpdateActiveScenario('category', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="car">Vehicle / Auto Purchase or Lease</option>
                    <option value="rent">Housing / Rent / Mortgage Upgrade</option>
                    <option value="vacation">Vacation / Travel Trip</option>
                    <option value="loan">Personal Loan / Debt Consolidation</option>
                    <option value="furniture">Furniture / Major Appliance</option>
                    <option value="education">Education / Course / Tuition</option>
                    <option value="subscription">Recurring Subscription / Membership</option>
                    <option value="other">Other Major Recurring Expense</option>
                  </select>
                </div>
              </div>

              {/* Financial Inputs: Price, Down Payment, Monthly Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Price / Total Cost ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={activeScenario.purchasePrice || ''}
                      onChange={(e) => handleUpdateActiveScenario('purchasePrice', parseFloat(e.target.value) || 0)}
                      placeholder="32000"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Sticker / loan amount</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upfront Down Payment ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="250"
                      value={activeScenario.downPayment || ''}
                      onChange={(e) => handleUpdateActiveScenario('downPayment', parseFloat(e.target.value) || 0)}
                      placeholder="4000"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Cash paid upfront</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Monthly Base Payment ($)
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleAutoCalc}
                      className="text-[10px] font-bold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
                    >
                      {isCurrentActiveAutoCalc ? '⚡ Auto-Calculated' : '✍️ Custom Entry'}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={activeScenario.monthlyPayment || ''}
                      onChange={(e) => handleUpdateActiveScenario('monthlyPayment', parseFloat(e.target.value) || 0)}
                      placeholder="480"
                      className={`w-full rounded-xl border py-2 pl-7 pr-3 text-xs font-bold focus:outline-none ${
                        isCurrentActiveAutoCalc 
                          ? 'border-purple-300 bg-purple-50/40 text-purple-950 focus:border-purple-600' 
                          : 'border-slate-300 bg-white text-slate-900 focus:border-slate-900'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {isCurrentActiveAutoCalc ? 'Auto-calculated from loan terms' : 'Manual custom monthly payment'}
                  </span>
                </div>
              </div>

              {/* Financing Terms & Recurring Extras */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loan Term (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    step="12"
                    value={activeScenario.loanTermMonths || ''}
                    onChange={(e) => handleUpdateActiveScenario('loanTermMonths', parseInt(e.target.value) || 0)}
                    placeholder="60"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {activeScenario.loanTermMonths ? `${(activeScenario.loanTermMonths / 12).toFixed(1)} years` : 'Months'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interest Rate (% APR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={activeScenario.interestRate !== undefined ? activeScenario.interestRate : ''}
                    onChange={(e) => handleUpdateActiveScenario('interestRate', parseFloat(e.target.value) || 0)}
                    placeholder="5.5"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Annual interest</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Insurance / Protection ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={activeScenario.insuranceIncrease !== undefined ? activeScenario.insuranceIncrease : ''}
                      onChange={(e) => handleUpdateActiveScenario('insuranceIncrease', parseFloat(e.target.value) || 0)}
                      placeholder="80"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Added insurance premium</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maintenance & Upkeep ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={activeScenario.maintenanceOther !== undefined ? activeScenario.maintenanceOther : ''}
                      onChange={(e) => handleUpdateActiveScenario('maintenanceOther', parseFloat(e.target.value) || 0)}
                      placeholder="40"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Fuel, service, fees</span>
                </div>
              </div>

              {/* Total Monthly Math Callout */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Total Itemized Monthly Commitment:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      ${Math.round(activeScenario.monthlyPayment).toLocaleString()} (Payment)
                    </span>
                    <span className="text-slate-400">+</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ${Math.round(activeScenario.insuranceIncrease + activeScenario.maintenanceOther).toLocaleString()} (Upkeep)
                    </span>
                    <span className="text-slate-400">=</span>
                    <span className="font-black text-rose-700 text-base">
                      +${Math.round(activeScenario.additionalMonthlyCost).toLocaleString()} / month
                    </span>
                  </div>
                </div>

                {!isCurrentActiveAutoCalc && (
                  <button
                    type="button"
                    onClick={handleToggleAutoCalc}
                    className="rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold px-3 py-1.5 text-xs transition-colors cursor-pointer"
                  >
                    ⚡ Auto-calculate from price & loan APR
                  </button>
                )}
              </div>
            </div>

            {/* Right Col: Comparison & Cash Flow Impact Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Cash Flow Impact Assessment
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Real-time comparison against your live baseline surplus.
                </p>

                {/* Comparison Visualizer */}
                <div className="space-y-4">
                  {/* Current Remaining */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      1. Current Baseline Buffer
                    </span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      ${Math.round(currentMonthlyBuffer).toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Take-Home: ${baselineTakeHome.toLocaleString()} – Outflows: ${totalBaselineOutflows.toLocaleString()}
                    </p>
                  </div>

                  {/* New Monthly Cost */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                      2. New Monthly Commitment
                    </span>
                    <p className="text-2xl font-extrabold text-rose-950 mt-1">
                      +${Math.round(activeScenario.additionalMonthlyCost).toLocaleString()}
                      <span className="text-xs font-normal text-rose-700"> / month</span>
                    </p>
                    <p className="text-[11px] text-rose-700/80 mt-1">
                      Payment (${Math.round(activeScenario.monthlyPayment).toLocaleString()}) + Upkeep (${Math.round(activeScenario.insuranceIncrease + activeScenario.maintenanceOther).toLocaleString()})
                    </p>
                  </div>

                  {/* New Remaining Buffer */}
                  <div className={`rounded-xl border p-4 ${
                    activeScenario.newRemainingCashFlow >= 0
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                      : 'border-rose-300 bg-rose-50 text-rose-950'
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                      3. Estimated Remaining After Decision
                    </span>
                    <p className="text-2xl font-extrabold mt-1">
                      {activeScenario.newRemainingCashFlow >= 0 ? '$' : '-$'}
                      {Math.abs(Math.round(activeScenario.newRemainingCashFlow)).toLocaleString()}
                      <span className="text-xs font-normal opacity-80"> / month</span>
                    </p>
                    <p className="text-[11px] opacity-80 mt-1">
                      {activeScenario.newRemainingCashFlow >= 0 
                        ? 'Sustainable operating surplus remains' 
                        : 'Pushes monthly finances into cash-flow deficit'}
                    </p>
                  </div>
                </div>

                {/* Neutral Assessment Statement */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Deterministic Observation:</h4>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {activeScenario.notes}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Absorbs{' '}
                        <strong>{activeScenario.bufferReductionPercent.toFixed(0)}%</strong> of your current monthly surplus, leaving{' '}
                        <strong>${Math.round(activeScenario.newRemainingCashFlow).toLocaleString()}/mo</strong> in discretionary buffer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-purple-300" />
                  <span>{isGeneratingPdf ? 'Generating...' : 'Export Comparison PDF'}</span>
                </button>
                <button
                  onClick={onBackToDashboard}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Back to Dashboard →
                </button>
              </div>
            </div>

          </div>
        )}

        {/* All Scenarios Comparison Matrix */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Decision Matrix & Scenario Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare multiple purchase options simultaneously against your ${Math.round(currentMonthlyBuffer).toLocaleString()}/mo baseline buffer.
              </p>
            </div>
            
            <button
              onClick={() => handleAddScenario()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              <span>Add Another Option</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purchase Price</th>
                  <th className="py-3 px-4">Monthly Payment</th>
                  <th className="py-3 px-4">Added Upkeep</th>
                  <th className="py-3 px-4">Total Monthly Cost</th>
                  <th className="py-3 px-4">Remaining Buffer</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scenarios.map((sc) => {
                  const isSelected = sc.id === activeScenario?.id;
                  const isAffordable = sc.newRemainingCashFlow >= 0;
                  return (
                    <tr 
                      key={sc.id}
                      onClick={() => setActiveScenarioId(sc.id)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-purple-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-900 font-bold">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                          <span>{sc.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 uppercase text-[10px] font-semibold">
                        {sc.category}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {sc.purchasePrice > 0 ? `$${sc.purchasePrice.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-bold">
                        ${Math.round(sc.monthlyPayment).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        +${Math.round(sc.insuranceIncrease + sc.maintenanceOther).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-rose-700 font-bold">
                        +${Math.round(sc.additionalMonthlyCost).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${isAffordable ? 'text-emerald-700' : 'text-rose-600'}`}>
                          ${Math.round(sc.newRemainingCashFlow).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isAffordable 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isAffordable ? 'Sustainable' : 'Deficit Risk'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScenario(sc.id);
                          }}
                          disabled={scenarios.length <= 1}
                          className={`p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                            scenarios.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Delete scenario"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
