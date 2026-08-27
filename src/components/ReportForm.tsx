import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Info, 
  Sparkles, 
  Building2, 
  Car, 
  ShoppingCart, 
  PiggyBank, 
  FileCheck2,
  DollarSign,
  HelpCircle,
  Edit2
} from 'lucide-react';
import { 
  FinancialFormData, 
  EmploymentType, 
  PayFrequency, 
  FilingStatus, 
  CustomExpenseItem 
} from '../types/financial';
import { US_STATES } from '../utils/taxData';
import { runFullFinancialAnalysis } from '../utils/calculations';
import { SAMPLE_PROFILE_STANDARD, SAMPLE_PROFILE_FAMILY } from '../utils/sampleData';

interface ReportFormProps {
  formData: FinancialFormData;
  setFormData: React.Dispatch<React.SetStateAction<FinancialFormData>>;
  onGenerateReport: () => void;
  onCancel: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  formData,
  setFormData,
  onGenerateReport,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations for live totals and preview
  const currentCalc = runFullFinancialAnalysis(formData);

  // Income helpers
  const handleIncomeChange = <K extends keyof FinancialFormData['income']>(
    field: K,
    value: FinancialFormData['income'][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      income: {
        ...prev.income,
        [field]: value,
      },
    }));
  };

  // Housing / Transport helpers
  const handleHousingTransportChange = <K extends keyof FinancialFormData['housingTransport']>(
    field: K,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      housingTransport: {
        ...prev.housingTransport,
        [field]: Math.max(0, value || 0),
      },
    }));
  };

  // Living expenses helpers
  const handleLivingExpenseChange = <K extends keyof FinancialFormData['livingExpenses']>(
    field: K,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      livingExpenses: {
        ...prev.livingExpenses,
        [field]: value,
      },
    }));
  };

  // Debt & Savings helpers
  const handleDebtSavingsChange = <K extends keyof FinancialFormData['debtSavings']>(
    field: K,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      debtSavings: {
        ...prev.debtSavings,
        [field]: Math.max(0, value || 0),
      },
    }));
  };

  // Custom expense handlers
  const handleAddCustomExpense = () => {
    const newItem: CustomExpenseItem = {
      id: `custom-${Date.now()}`,
      category: 'Custom Expense',
      description: 'Recurring monthly cost',
      amount: 50,
    };
    handleLivingExpenseChange('customExpenses', [
      ...(formData.livingExpenses.customExpenses || []),
      newItem,
    ]);
  };

  const handleUpdateCustomExpense = (
    id: string,
    field: keyof CustomExpenseItem,
    value: any
  ) => {
    const updated = (formData.livingExpenses.customExpenses || []).map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'amount' ? Math.max(0, Number(value) || 0) : value,
        };
      }
      return item;
    });
    handleLivingExpenseChange('customExpenses', updated);
  };

  const handleRemoveCustomExpense = (id: string) => {
    const filtered = (formData.livingExpenses.customExpenses || []).filter(
      (item) => item.id !== id
    );
    handleLivingExpenseChange('customExpenses', filtered);
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (formData.income.employmentType === 'hourly') {
        if (!formData.income.hourlyWage || formData.income.hourlyWage <= 0) {
          newErrors.hourlyWage = 'Please enter an hourly wage greater than $0';
        }
        if (!formData.income.hoursPerWeek || formData.income.hoursPerWeek <= 0) {
          newErrors.hoursPerWeek = 'Please enter average hours per week';
        }
      } else {
        if (!formData.income.annualGrossIncome || formData.income.annualGrossIncome <= 0) {
          newErrors.annualGrossIncome = 'Please enter an annual gross income';
        }
      }
      if (!formData.income.state) {
        newErrors.state = 'Please select your state';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepsMeta = [
    { num: 1, title: 'Income & Taxes', icon: DollarSign },
    { num: 2, title: 'Housing & Transit', icon: Building2 },
    { num: 3, title: 'Monthly Expenses', icon: ShoppingCart },
    { num: 4, title: 'Debt & Savings', icon: PiggyBank },
    { num: 5, title: 'Review & Confirm', icon: FileCheck2 },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header & Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel / Home</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Step {currentStep} of 5</span>
            <span className="text-xs text-slate-400">({stepsMeta[currentStep - 1].title})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormData(SAMPLE_PROFILE_STANDARD)}
              className="text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              title="Fill standard $85k sample profile"
            >
              Fill Sample Data
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {stepsMeta.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.num);
                  }
                }}
                className={`flex flex-col items-center gap-1.5 rounded-lg py-2 px-1 text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : isCompleted
                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  {isCompleted ? (
                    <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
                  ) : (
                    <span>{s.num}.</span>
                  )}
                  <span className="hidden sm:inline truncate max-w-[80px]">{s.title.split(' ')[0]}</span>
                </div>
                <div
                  className={`h-1 w-full rounded-full ${
                    isCurrent
                      ? 'bg-emerald-400'
                      : isCompleted
                      ? 'bg-emerald-600'
                      : 'bg-slate-200'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* ================= STEP 1: INCOME ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Let's start with your income.
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Enter your gross earnings and state. Affordly models federal and state tax withholdings to estimate your true net take-home pay.
              </p>
            </div>

            {/* Employment Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Employment Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'salaried', label: 'Salaried' },
                  { id: 'hourly', label: 'Hourly' },
                  { id: 'self_employed', label: 'Self-employed' },
                  { id: 'multiple', label: 'Multiple Sources' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleIncomeChange('employmentType', t.id as EmploymentType)}
                    className={`rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                      formData.income.employmentType === t.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Inputs (Dynamic for hourly vs salaried) */}
            {formData.income.employmentType === 'hourly' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hourly Wage ($ / hr) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.income.hourlyWage || ''}
                      onChange={(e) => handleIncomeChange('hourlyWage', parseFloat(e.target.value) || 0)}
                      placeholder="35.00"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  {errors.hourlyWage && <p className="mt-1 text-xs text-rose-600">{errors.hourlyWage}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Average Hours Per Week *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.income.hoursPerWeek || ''}
                    onChange={(e) => handleIncomeChange('hoursPerWeek', parseFloat(e.target.value) || 0)}
                    placeholder="40"
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  {errors.hoursPerWeek && <p className="mt-1 text-xs text-rose-600">{errors.hoursPerWeek}</p>}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Gross Base Income ($ / year) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.income.annualGrossIncome || ''}
                    onChange={(e) => handleIncomeChange('annualGrossIncome', parseFloat(e.target.value) || 0)}
                    placeholder="85000"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                {errors.annualGrossIncome && <p className="mt-1 text-xs text-rose-600">{errors.annualGrossIncome}</p>}
              </div>
            )}

            {/* Pay Frequency & Additional Income */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pay Frequency
                </label>
                <select
                  value={formData.income.payFrequency}
                  onChange={(e) => handleIncomeChange('payFrequency', e.target.value as PayFrequency)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="weekly">Weekly (52 paychecks/yr)</option>
                  <option value="biweekly">Biweekly (26 paychecks/yr)</option>
                  <option value="semimonthly">Semimonthly (24 paychecks/yr)</option>
                  <option value="monthly">Monthly (12 paychecks/yr)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Bonus / Commissions
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.income.bonusCommission || ''}
                    onChange={(e) => handleIncomeChange('bonusCommission', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Other Recurring Income (Annual)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.income.otherIncome || ''}
                    onChange={(e) => handleIncomeChange('otherIncome', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* State & Filing Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  U.S. State (For State Tax Model) *
                </label>
                <select
                  value={formData.income.state}
                  onChange={(e) => handleIncomeChange('state', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code}) — {s.type === 'none' ? 'No State Income Tax' : `${s.type === 'flat' ? 'Flat' : 'Progressive'} ~${(s.topRate * 100).toFixed(1)}%`}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="mt-1 text-xs text-rose-600">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax Filing Status
                </label>
                <select
                  value={formData.income.filingStatus}
                  onChange={(e) => handleIncomeChange('filingStatus', e.target.value as FilingStatus)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="single">Single Filer ($14,600 Std Deduction)</option>
                  <option value="married_joint">Married Filing Jointly ($29,200 Std Deduction)</option>
                  <option value="head_of_household">Head of Household ($21,900 Std Deduction)</option>
                </select>
              </div>
            </div>

            {/* Real-time Estimated Take-Home Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Estimated Monthly Take-Home
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Estimate
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 mt-0.5">
                  Gross: ${Math.round(currentCalc.grossMonthlyIncome).toLocaleString()}/mo • Est. Tax: ~{(currentCalc.effectiveTaxRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-2xl font-black text-emerald-950">
                ${Math.round(currentCalc.estimatedMonthlyTakeHome).toLocaleString()}
                <span className="text-xs font-normal text-emerald-700"> / month</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: HOUSING & TRANSPORTATION ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Housing & Transportation
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Enter your recurring shelter and mobility commitments. Enter 0 for items that do not apply to you.
              </p>
            </div>

            {/* Housing Sub-section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Housing Costs</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Subtotal: ${Math.round(currentCalc.monthlyHousingTotal).toLocaleString()}/mo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Rent or Mortgage ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.rentOrMortgage || ''}
                      onChange={(e) => handleHousingTransportChange('rentOrMortgage', parseFloat(e.target.value))}
                      placeholder="1650"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Utilities (Electric, Gas, Water, Trash) ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.utilities || ''}
                      onChange={(e) => handleHousingTransportChange('utilities', parseFloat(e.target.value))}
                      placeholder="200"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Home / Renters Insurance ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.homeInsurance || ''}
                      onChange={(e) => handleHousingTransportChange('homeInsurance', parseFloat(e.target.value))}
                      placeholder="35"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Tax (If not included in mortgage) ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.propertyTax || ''}
                      onChange={(e) => handleHousingTransportChange('propertyTax', parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transportation Sub-section */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Car className="h-4 w-4 text-sky-600" />
                  <span>Transportation & Vehicle</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Subtotal: ${Math.round(currentCalc.monthlyTransportTotal).toLocaleString()}/mo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Car Loan / Lease Payment
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.carPayment || ''}
                      onChange={(e) => handleHousingTransportChange('carPayment', parseFloat(e.target.value))}
                      placeholder="380"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Auto Insurance
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.carInsurance || ''}
                      onChange={(e) => handleHousingTransportChange('carInsurance', parseFloat(e.target.value))}
                      placeholder="130"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fuel / Gas / EV Charging
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.fuel || ''}
                      onChange={(e) => handleHousingTransportChange('fuel', parseFloat(e.target.value))}
                      placeholder="140"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Public Transit Passes
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.publicTransit || ''}
                      onChange={(e) => handleHousingTransportChange('publicTransit', parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parking & Tolls
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.parkingTolls || ''}
                      onChange={(e) => handleHousingTransportChange('parkingTolls', parseFloat(e.target.value))}
                      placeholder="30"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Maintenance Reserve
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.housingTransport.maintenance || ''}
                      onChange={(e) => handleHousingTransportChange('maintenance', parseFloat(e.target.value))}
                      placeholder="60"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: MONTHLY EXPENSES ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Monthly Living Expenses
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Categorize your groceries, dining, phone, entertainment, and other daily living expenditures.
              </p>
            </div>

            {/* Standard Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'foodGroceries', label: 'Food & Groceries', placeholder: '450' },
                { key: 'restaurants', label: 'Restaurants & Dining Out', placeholder: '250' },
                { key: 'healthcare', label: 'Healthcare & Medical Out-of-Pocket', placeholder: '120' },
                { key: 'phone', label: 'Phone & Mobile Plan', placeholder: '75' },
                { key: 'internet', label: 'Home Internet & Wi-Fi', placeholder: '65' },
                { key: 'subscriptions', label: 'Subscriptions (Netflix, Spotify, etc.)', placeholder: '45' },
                { key: 'entertainment', label: 'Entertainment & Hobbies', placeholder: '120' },
                { key: 'shopping', label: 'Shopping & Goods', placeholder: '150' },
                { key: 'childcare', label: 'Childcare & Daycare', placeholder: '0' },
                { key: 'education', label: 'Education & Tuitions', placeholder: '0' },
                { key: 'personalCare', label: 'Personal Care & Hygiene', placeholder: '80' },
                { key: 'otherExpenses', label: 'Other Miscellaneous', placeholder: '60' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 truncate" title={item.label}>
                    {item.label}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={(formData.livingExpenses as any)[item.key] || ''}
                      onChange={(e) => handleLivingExpenseChange(item.key as any, parseFloat(e.target.value) || 0)}
                      placeholder={item.placeholder}
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Expense Items */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Custom Expense Items
                  </h3>
                  <p className="text-[11px] text-slate-500">Add any unique recurring items not covered above.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomExpense}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Add Custom Expense</span>
                </button>
              </div>

              {(formData.livingExpenses.customExpenses || []).length > 0 && (
                <div className="space-y-2.5 mt-2">
                  {(formData.livingExpenses.customExpenses || []).map((custom) => (
                    <div
                      key={custom.id}
                      className="flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5"
                    >
                      <input
                        type="text"
                        value={custom.category}
                        onChange={(e) => handleUpdateCustomExpense(custom.id, 'category', e.target.value)}
                        placeholder="Category (e.g. Pet Care)"
                        className="w-full sm:w-1/3 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={custom.description}
                        onChange={(e) => handleUpdateCustomExpense(custom.id, 'description', e.target.value)}
                        placeholder="Description (e.g. Dog food & vet plan)"
                        className="w-full sm:flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-28">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            value={custom.amount || ''}
                            onChange={(e) => handleUpdateCustomExpense(custom.id, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="50"
                            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomExpense(custom.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove custom expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Total Ticker */}
            <div className="rounded-xl bg-slate-900 p-4 text-white flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Total Monthly Living Expenses (Food, Utilities, Subscriptions, Personal)
              </span>
              <span className="text-lg font-bold text-emerald-400">
                ${Math.round(currentCalc.monthlyLivingTotal).toLocaleString()}
                <span className="text-xs font-normal text-slate-400"> / mo</span>
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 4: DEBT & SAVINGS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Debt Obligations & Savings
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Enter your monthly minimum debt payments and target savings contributions.
              </p>
            </div>

            {/* Debt Sub-section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Monthly Debt Payments</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Contractual Minimums
                  </span>
                </h3>
                <span className="text-xs font-semibold text-rose-600">
                  Total Debt: ${Math.round(currentCalc.monthlyDebtTotal).toLocaleString()}/mo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credit Card Minimum Payments ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.creditCardPayments || ''}
                      onChange={(e) => handleDebtSavingsChange('creditCardPayments', parseFloat(e.target.value))}
                      placeholder="150"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Loan Payments ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.studentLoans || ''}
                      onChange={(e) => handleDebtSavingsChange('studentLoans', parseFloat(e.target.value))}
                      placeholder="280"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Personal Loans & Installment Debt ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.personalLoans || ''}
                      onChange={(e) => handleDebtSavingsChange('personalLoans', parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other Contractual Debt ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.otherDebt || ''}
                      onChange={(e) => handleDebtSavingsChange('otherDebt', parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Sub-section */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Savings & Investments</span>
                </h3>
                <span className="text-xs font-semibold text-purple-600">
                  Total Monthly Savings: ${Math.round(currentCalc.monthlySavingsTotal).toLocaleString()}/mo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Total Liquid Savings Balance (Bank, HYSA, Money Market) ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.currentSavings || ''}
                      onChange={(e) => handleDebtSavingsChange('currentSavings', parseFloat(e.target.value))}
                      placeholder="14500"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Used to calculate emergency fund months of runway.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    General Monthly Savings Contribution ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.monthlySavings || ''}
                      onChange={(e) => handleDebtSavingsChange('monthlySavings', parseFloat(e.target.value))}
                      placeholder="400"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Fund Contribution ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.emergencyFundMonthly || ''}
                      onChange={(e) => handleDebtSavingsChange('emergencyFundMonthly', parseFloat(e.target.value))}
                      placeholder="200"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Retirement / IRA Contribution ($/mo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.debtSavings.retirementMonthly || ''}
                      onChange={(e) => handleDebtSavingsChange('retirementMonthly', parseFloat(e.target.value))}
                      placeholder="350"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW & SUMMARY ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Review Your Financial Summary
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Verify your inputs before generating your official Income Reality Report and dashboard.
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Gross Annual</span>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  ${Math.round(currentCalc.grossAnnualIncome).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Est. Take-Home</span>
                <p className="mt-1 text-lg font-bold text-emerald-950">
                  ${Math.round(currentCalc.estimatedMonthlyTakeHome).toLocaleString()}
                  <span className="text-xs font-normal text-emerald-700">/mo</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Outflows</span>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  ${Math.round(currentCalc.totalMonthlyOutflows).toLocaleString()}
                  <span className="text-xs font-normal text-slate-500">/mo</span>
                </p>
              </div>

              <div className={`rounded-xl border p-4 ${
                currentCalc.monthlyRemainingCashFlow >= 0
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900'
              }`}>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Remaining Buffer</span>
                <p className="mt-1 text-lg font-bold">
                  {currentCalc.monthlyRemainingCashFlow >= 0 ? '$' : '-$'}
                  {Math.abs(Math.round(currentCalc.monthlyRemainingCashFlow)).toLocaleString()}
                  <span className="text-xs font-normal">/mo</span>
                </p>
              </div>
            </div>

            {/* Detailed Section Breakdown with Edit Jump Links */}
            <div className="space-y-3">
              {/* Section 1 Review */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-white">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">1. Income & Tax Model</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formData.income.employmentType.toUpperCase()} • State: {formData.income.state} • Est. Effective Tax: {(currentCalc.effectiveTaxRate * 100).toFixed(1)}%
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1.5 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Section 2 Review */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-white">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">2. Housing & Transportation</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Housing: ${Math.round(currentCalc.monthlyHousingTotal).toLocaleString()}/mo • Transit: ${Math.round(currentCalc.monthlyTransportTotal).toLocaleString()}/mo
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1.5 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Section 3 Review */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-white">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3. Monthly Living Expenses</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Food, Daily Essentials, Subscriptions: ${Math.round(currentCalc.monthlyLivingTotal).toLocaleString()}/mo
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1.5 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Section 4 Review */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-white">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">4. Debt & Savings</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Debt: ${Math.round(currentCalc.monthlyDebtTotal).toLocaleString()}/mo • Active Savings: ${Math.round(currentCalc.monthlySavingsTotal).toLocaleString()}/mo
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1.5 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            {/* Ready to generate notice */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Clicking <strong>Generate My Report</strong> will process your deterministic financial dashboard, synthesize an AI explanation, and prepare your downloadable PDF report.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons (Back / Continue / Submit) */}
        <div className="mt-8 border-t border-slate-100 pt-5 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              id="form-prev-btn"
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              id="form-next-btn"
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </button>
          ) : (
            <button
              id="form-generate-btn"
              type="button"
              onClick={onGenerateReport}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all hover:shadow-lg cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate My Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
