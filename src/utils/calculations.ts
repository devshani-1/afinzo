import {
  FinancialFormData,
  FinancialCalculations,
  IncomeData,
  HousingTransportData,
  LivingExpensesData,
  DebtSavingsData,
  ExpenseCategoryBreakdown,
  FinancialIndicator,
  AffordabilityScenario,
  AISummaryResponse,
  FilingStatus,
} from '../types/financial';
import {
  STANDARD_DEDUCTIONS,
  FEDERAL_BRACKETS_SINGLE,
  FEDERAL_BRACKETS_MARRIED,
  FEDERAL_BRACKETS_HOH,
  US_STATES,
} from './taxData';

/**
 * Calculates Gross Annual and Monthly Income from form inputs
 */
export function calculateGrossIncome(income: IncomeData): { grossAnnual: number; grossMonthly: number } {
  let grossAnnual = 0;

  if (income.employmentType === 'hourly') {
    const hourly = Math.max(0, Number(income.hourlyWage) || 0);
    const hours = Math.max(0, Number(income.hoursPerWeek) || 0);
    grossAnnual = hourly * hours * 52;
  } else {
    grossAnnual = Math.max(0, Number(income.annualGrossIncome) || 0);
  }

  // Add bonus/commission and other recurring income
  grossAnnual += Math.max(0, Number(income.bonusCommission) || 0);
  grossAnnual += Math.max(0, Number(income.otherIncome) || 0);

  const grossMonthly = grossAnnual / 12;

  return { grossAnnual, grossMonthly };
}

/**
 * Calculates Estimated Federal, State, and FICA taxes deterministically
 */
export function calculateTaxes(
  grossAnnual: number,
  stateCode: string,
  filingStatus: FilingStatus
): {
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  totalTax: number;
  effectiveTaxRate: number;
  annualTakeHome: number;
  monthlyTakeHome: number;
} {
  if (grossAnnual <= 0) {
    return {
      federalTax: 0,
      stateTax: 0,
      ficaTax: 0,
      totalTax: 0,
      effectiveTaxRate: 0,
      annualTakeHome: 0,
      monthlyTakeHome: 0,
    };
  }

  // 1. Standard Deduction
  const deduction = STANDARD_DEDUCTIONS[filingStatus] || STANDARD_DEDUCTIONS.single;
  const taxableIncomeFederal = Math.max(0, grossAnnual - deduction);

  // 2. Select Federal Brackets
  let brackets = FEDERAL_BRACKETS_SINGLE;
  if (filingStatus === 'married_joint') brackets = FEDERAL_BRACKETS_MARRIED;
  if (filingStatus === 'head_of_household') brackets = FEDERAL_BRACKETS_HOH;

  // Progressive Federal calculation
  let federalTax = 0;
  let prevLimit = 0;
  for (const bracket of brackets) {
    if (taxableIncomeFederal > prevLimit) {
      const taxableInBracket = Math.min(taxableIncomeFederal, bracket.upTo) - prevLimit;
      federalTax += taxableInBracket * bracket.rate;
      prevLimit = bracket.upTo;
    } else {
      break;
    }
  }

  // 3. FICA (Social Security 6.2% up to $168,600 + Medicare 1.45% + Additional Medicare 0.9% > $200k)
  const socialSecurityCap = 168600;
  const socialSecurityTax = Math.min(grossAnnual, socialSecurityCap) * 0.062;
  const standardMedicare = grossAnnual * 0.0145;
  const additionalMedicareThreshold = filingStatus === 'married_joint' ? 250000 : 200000;
  const additionalMedicare = grossAnnual > additionalMedicareThreshold ? (grossAnnual - additionalMedicareThreshold) * 0.009 : 0;
  const ficaTax = socialSecurityTax + standardMedicare + additionalMedicare;

  // 4. State Tax Estimate
  const stateObj = US_STATES.find((s) => s.code.toUpperCase() === stateCode.toUpperCase()) || US_STATES.find((s) => s.code === 'TX')!;
  const stateEffectiveRate = stateObj.estimatedEffectiveRate(grossAnnual, filingStatus);
  const stateTax = grossAnnual * stateEffectiveRate;

  // 5. Totals & Net Take-Home
  const totalTax = federalTax + stateTax + ficaTax;
  const effectiveTaxRate = grossAnnual > 0 ? (totalTax / grossAnnual) : 0;
  const annualTakeHome = Math.max(0, grossAnnual - totalTax);
  const monthlyTakeHome = annualTakeHome / 12;

  return {
    federalTax,
    stateTax,
    ficaTax,
    totalTax,
    effectiveTaxRate,
    annualTakeHome,
    monthlyTakeHome,
  };
}

/**
 * Calculates Monthly Expense category totals
 */
export function calculateExpenses(
  housing: HousingTransportData,
  living: LivingExpensesData,
  debtSavings: DebtSavingsData
) {
  const monthlyHousingTotal =
    (Number(housing.rentOrMortgage) || 0) +
    (Number(housing.utilities) || 0) +
    (Number(housing.homeInsurance) || 0) +
    (Number(housing.propertyTax) || 0);

  const monthlyTransportTotal =
    (Number(housing.carPayment) || 0) +
    (Number(housing.carInsurance) || 0) +
    (Number(housing.fuel) || 0) +
    (Number(housing.publicTransit) || 0) +
    (Number(housing.parkingTolls) || 0) +
    (Number(housing.maintenance) || 0);

  const customLivingTotal = (living.customExpenses || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const monthlyLivingTotal =
    (Number(living.foodGroceries) || 0) +
    (Number(living.restaurants) || 0) +
    (Number(living.healthcare) || 0) +
    (Number(living.phone) || 0) +
    (Number(living.internet) || 0) +
    (Number(living.subscriptions) || 0) +
    (Number(living.entertainment) || 0) +
    (Number(living.shopping) || 0) +
    (Number(living.childcare) || 0) +
    (Number(living.education) || 0) +
    (Number(living.personalCare) || 0) +
    (Number(living.otherExpenses) || 0) +
    customLivingTotal;

  const monthlyDebtTotal =
    (Number(debtSavings.creditCardPayments) || 0) +
    (Number(debtSavings.studentLoans) || 0) +
    (Number(debtSavings.personalLoans) || 0) +
    (Number(debtSavings.otherDebt) || 0);

  const monthlySavingsTotal =
    (Number(debtSavings.monthlySavings) || 0) +
    (Number(debtSavings.emergencyFundMonthly) || 0) +
    (Number(debtSavings.retirementMonthly) || 0);

  const totalMonthlyExpenses = monthlyHousingTotal + monthlyTransportTotal + monthlyLivingTotal;
  const totalMonthlyOutflows = totalMonthlyExpenses + monthlyDebtTotal + monthlySavingsTotal;

  return {
    monthlyHousingTotal,
    monthlyTransportTotal,
    monthlyLivingTotal,
    monthlyDebtTotal,
    monthlySavingsTotal,
    totalMonthlyExpenses,
    totalMonthlyOutflows,
  };
}

/**
 * Builds Financial Indicators with transparent formulas, neutral tiers (lower, moderate, higher)
 */
export function buildFinancialIndicators(
  monthlyTakeHome: number,
  housing: number,
  debt: number,
  living: number,
  transport: number,
  savings: number,
  currentSavings: number
): FinancialIndicator[] {
  const indicators: FinancialIndicator[] = [];
  const safeTakeHome = monthlyTakeHome > 0 ? monthlyTakeHome : 1;

  // 1. Housing Burden Ratio
  const housingRatio = (housing / safeTakeHome) * 100;
  let housingLevel: 'lower' | 'moderate' | 'higher' = 'moderate';
  let housingColor: 'emerald' | 'amber' | 'rose' = 'emerald';
  if (housingRatio <= 28) {
    housingLevel = 'lower';
    housingColor = 'emerald';
  } else if (housingRatio <= 36) {
    housingLevel = 'moderate';
    housingColor = 'amber';
  } else {
    housingLevel = 'higher';
    housingColor = 'rose';
  }

  indicators.push({
    id: 'housing-burden',
    title: 'Housing Burden Share',
    value: `${housingRatio.toFixed(1)}%`,
    rawValue: housingRatio,
    level: housingLevel,
    levelLabel: housingLevel === 'lower' ? 'Conservative' : housingLevel === 'moderate' ? 'Balanced' : 'High Share',
    color: housingColor,
    explanation: 'Represents the portion of your estimated monthly take-home income committed to rent/mortgage, property tax, insurance, and utilities.',
    formula: '(Total Monthly Housing / Estimated Monthly Take-Home) × 100',
    benchmark: 'Traditional personal finance frameworks benchmark housing between 25% and 30% of take-home income.',
  });

  // 2. Debt Payment Share (DTI on Net)
  const debtRatio = (debt / safeTakeHome) * 100;
  let debtLevel: 'lower' | 'moderate' | 'higher' = 'lower';
  let debtColor: 'emerald' | 'amber' | 'rose' = 'emerald';
  if (debtRatio <= 10) {
    debtLevel = 'lower';
    debtColor = 'emerald';
  } else if (debtRatio <= 20) {
    debtLevel = 'moderate';
    debtColor = 'amber';
  } else {
    debtLevel = 'higher';
    debtColor = 'rose';
  }

  indicators.push({
    id: 'debt-share',
    title: 'Monthly Debt Share',
    value: `${debtRatio.toFixed(1)}%`,
    rawValue: debtRatio,
    level: debtLevel,
    levelLabel: debtLevel === 'lower' ? 'Manageable' : debtLevel === 'moderate' ? 'Moderate' : 'Heavy Load',
    color: debtColor,
    explanation: 'The share of take-home pay dedicated to recurring minimum debt obligations (credit cards, student loans, personal loans).',
    formula: '(Total Monthly Debt Payments / Estimated Monthly Take-Home) × 100',
    benchmark: 'Lenders typically prefer non-mortgage debt obligations to remain under 15% to 20% of net income.',
  });

  // 3. Savings Contribution Rate
  const savingsRate = (savings / safeTakeHome) * 100;
  let savingsLevel: 'lower' | 'moderate' | 'higher' = 'moderate';
  let savingsColor: 'emerald' | 'amber' | 'rose' | 'blue' = 'emerald';
  if (savingsRate >= 20) {
    savingsLevel = 'higher';
    savingsColor = 'emerald';
  } else if (savingsRate >= 10) {
    savingsLevel = 'moderate';
    savingsColor = 'blue';
  } else {
    savingsLevel = 'lower';
    savingsColor = 'amber';
  }

  indicators.push({
    id: 'savings-rate',
    title: 'Savings & Investment Rate',
    value: `${savingsRate.toFixed(1)}%`,
    rawValue: savingsRate,
    level: savingsLevel,
    levelLabel: savingsLevel === 'higher' ? 'Strong' : savingsLevel === 'moderate' ? 'Active' : 'Modest',
    color: savingsColor,
    explanation: 'The proportion of net income you allocate monthly to general savings, emergency reserves, and retirement accounts.',
    formula: '(Monthly Savings & Retirement Contributions / Estimated Monthly Take-Home) × 100',
    benchmark: 'Standard 50/30/20 budget models aim for approximately 15% to 20% toward long-term savings and investments.',
  });

  // 4. Fixed Commitments (Housing + Debt)
  const fixedCommitments = ((housing + debt) / safeTakeHome) * 100;
  let fixedLevel: 'lower' | 'moderate' | 'higher' = 'moderate';
  let fixedColor: 'emerald' | 'amber' | 'rose' = 'emerald';
  if (fixedCommitments <= 40) {
    fixedLevel = 'lower';
    fixedColor = 'emerald';
  } else if (fixedCommitments <= 50) {
    fixedLevel = 'moderate';
    fixedColor = 'amber';
  } else {
    fixedLevel = 'higher';
    fixedColor = 'rose';
  }

  indicators.push({
    id: 'fixed-commitments',
    title: 'Fixed Monthly Commitments',
    value: `${fixedCommitments.toFixed(1)}%`,
    rawValue: fixedCommitments,
    level: fixedLevel,
    levelLabel: fixedLevel === 'lower' ? 'High Flexibility' : fixedLevel === 'moderate' ? 'Standard' : 'Tight Flexibility',
    color: fixedColor,
    explanation: 'The combined share of net pay locked into unavoidable recurring housing and contractual debt payments each month.',
    formula: '((Housing Total + Debt Total) / Estimated Monthly Take-Home) × 100',
    benchmark: 'Keeping fixed baseline commitments below 45-50% preserves discretionary spending agility.',
  });

  // 5. Emergency Fund Runway
  const monthlyExpensesAndDebt = housing + transport + living + debt;
  const emergencyMonths = monthlyExpensesAndDebt > 0 ? (currentSavings / monthlyExpensesAndDebt) : 0;
  let emergencyLevel: 'lower' | 'moderate' | 'higher' = 'moderate';
  let emergencyColor: 'emerald' | 'amber' | 'rose' | 'blue' = 'emerald';
  if (emergencyMonths >= 6) {
    emergencyLevel = 'higher';
    emergencyColor = 'emerald';
  } else if (emergencyMonths >= 3) {
    emergencyLevel = 'moderate';
    emergencyColor = 'blue';
  } else {
    emergencyLevel = 'lower';
    emergencyColor = 'amber';
  }

  indicators.push({
    id: 'emergency-runway',
    title: 'Emergency Reserve Runway',
    value: `${emergencyMonths.toFixed(1)} mos`,
    rawValue: emergencyMonths,
    level: emergencyLevel,
    levelLabel: emergencyLevel === 'higher' ? 'Robust Buffer' : emergencyLevel === 'moderate' ? 'Moderate Buffer' : 'Developing',
    color: emergencyColor,
    explanation: 'How many months your existing liquid savings could sustain essential living costs, housing, and minimum debt payments without new income.',
    formula: 'Current Liquid Savings / (Monthly Essential Living + Housing + Debt)',
    benchmark: 'Financial planners commonly suggest maintaining 3 to 6 months of essential living expenses in an accessible account.',
  });

  return indicators;
}

/**
 * Runs the entire comprehensive deterministic financial calculation engine
 */
export function runFullFinancialAnalysis(formData: FinancialFormData): FinancialCalculations {
  const { grossAnnual, grossMonthly } = calculateGrossIncome(formData.income);
  
  const tax = calculateTaxes(
    grossAnnual,
    formData.income.state || 'TX',
    formData.income.filingStatus || 'single'
  );

  const exp = calculateExpenses(
    formData.housingTransport,
    formData.livingExpenses,
    formData.debtSavings
  );

  const monthlyRemainingCashFlow = tax.monthlyTakeHome - exp.totalMonthlyOutflows;
  const operatingCashFlow = tax.monthlyTakeHome - (exp.totalMonthlyExpenses + exp.monthlyDebtTotal);

  const safeTakeHome = tax.monthlyTakeHome > 0 ? tax.monthlyTakeHome : 1;
  const safeExpenses = exp.totalMonthlyOutflows > 0 ? exp.totalMonthlyOutflows : 1;

  // Breakdown categories
  const categories: ExpenseCategoryBreakdown[] = [
    {
      id: 'housing',
      name: 'Housing & Utilities',
      amount: exp.monthlyHousingTotal,
      percentageOfIncome: (exp.monthlyHousingTotal / safeTakeHome) * 100,
      percentageOfExpenses: (exp.monthlyHousingTotal / safeExpenses) * 100,
      color: '#3b82f6', // blue
    },
    {
      id: 'transport',
      name: 'Transportation & Auto',
      amount: exp.monthlyTransportTotal,
      percentageOfIncome: (exp.monthlyTransportTotal / safeTakeHome) * 100,
      percentageOfExpenses: (exp.monthlyTransportTotal / safeExpenses) * 100,
      color: '#0ea5e9', // sky
    },
    {
      id: 'living',
      name: 'Food & Daily Living',
      amount: exp.monthlyLivingTotal,
      percentageOfIncome: (exp.monthlyLivingTotal / safeTakeHome) * 100,
      percentageOfExpenses: (exp.monthlyLivingTotal / safeExpenses) * 100,
      color: '#10b981', // emerald
    },
    {
      id: 'debt',
      name: 'Debt Payments',
      amount: exp.monthlyDebtTotal,
      percentageOfIncome: (exp.monthlyDebtTotal / safeTakeHome) * 100,
      percentageOfExpenses: (exp.monthlyDebtTotal / safeExpenses) * 100,
      color: '#f43f5e', // rose
    },
    {
      id: 'savings',
      name: 'Savings & Retirement',
      amount: exp.monthlySavingsTotal,
      percentageOfIncome: (exp.monthlySavingsTotal / safeTakeHome) * 100,
      percentageOfExpenses: (exp.monthlySavingsTotal / safeExpenses) * 100,
      color: '#8b5cf6', // violet
    },
  ];

  // Filter out 0 amounts and sort descending
  const sortedBreakdown = categories
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const indicators = buildFinancialIndicators(
    tax.monthlyTakeHome,
    exp.monthlyHousingTotal,
    exp.monthlyDebtTotal,
    exp.monthlyLivingTotal,
    exp.monthlyTransportTotal,
    exp.monthlySavingsTotal,
    Number(formData.debtSavings.currentSavings) || 0
  );

  return {
    grossAnnualIncome: grossAnnual,
    grossMonthlyIncome: grossMonthly,
    estimatedFederalTaxAnnual: tax.federalTax,
    estimatedStateTaxAnnual: tax.stateTax,
    estimatedFicaTaxAnnual: tax.ficaTax,
    estimatedTotalTaxAnnual: tax.totalTax,
    effectiveTaxRate: tax.effectiveTaxRate,
    estimatedAnnualTakeHome: tax.annualTakeHome,
    estimatedMonthlyTakeHome: tax.monthlyTakeHome,
    monthlyHousingTotal: exp.monthlyHousingTotal,
    monthlyTransportTotal: exp.monthlyTransportTotal,
    monthlyLivingTotal: exp.monthlyLivingTotal,
    monthlyDebtTotal: exp.monthlyDebtTotal,
    monthlySavingsTotal: exp.monthlySavingsTotal,
    totalMonthlyExpenses: exp.totalMonthlyExpenses,
    totalMonthlyOutflows: exp.totalMonthlyOutflows,
    monthlyRemainingCashFlow,
    operatingCashFlow,
    housingBurdenRatio: (exp.monthlyHousingTotal / safeTakeHome) * 100,
    debtToIncomeRatio: (exp.monthlyDebtTotal / safeTakeHome) * 100,
    fixedCommitmentsRatio: ((exp.monthlyHousingTotal + exp.monthlyDebtTotal) / safeTakeHome) * 100,
    savingsRate: (exp.monthlySavingsTotal / safeTakeHome) * 100,
    expenseShareRate: (exp.totalMonthlyExpenses / safeTakeHome) * 100,
    remainingCashFlowRate: (monthlyRemainingCashFlow / safeTakeHome) * 100,
    emergencyFundMonths: (Number(formData.debtSavings.currentSavings) || 0) / ((exp.totalMonthlyExpenses + exp.monthlyDebtTotal) || 1),
    categoryBreakdown: sortedBreakdown,
    indicators,
  };
}

/**
 * Calculates a Major Expense Affordability Scenario
 */
export function calculateAffordabilityScenario(
  calc: FinancialCalculations,
  scenarioInput: {
    id?: string;
    title: string;
    category: AffordabilityScenario['category'];
    purchasePrice: number;
    downPayment: number;
    monthlyPayment: number;
    loanTermMonths?: number;
    interestRate?: number;
    insuranceIncrease?: number;
    maintenanceOther?: number;
    notes?: string;
    isCustomPayment?: boolean;
  },
  baselineMonthlyBuffer?: number
): AffordabilityScenario {
  const purchasePrice = Number(scenarioInput.purchasePrice) || 0;
  const downPayment = Number(scenarioInput.downPayment) || 0;
  const loanTerm = Number(scenarioInput.loanTermMonths) > 0 ? Number(scenarioInput.loanTermMonths) : 60;
  const rate = Number(scenarioInput.interestRate) >= 0 ? Number(scenarioInput.interestRate) : 0;
  const insurance = Number(scenarioInput.insuranceIncrease) || 0;
  const maintenance = Number(scenarioInput.maintenanceOther) || 0;

  let monthlyPayment = Number(scenarioInput.monthlyPayment) || 0;

  // If financed purchase (price > down payment and category is financed / not pure rent/subscription)
  // and user is not explicitly in custom manual override mode, calculate exact amortization
  const isFinancedCategory = ['car', 'loan', 'furniture', 'education', 'vacation', 'other'].includes(scenarioInput.category);
  if ((!scenarioInput.isCustomPayment && isFinancedCategory && purchasePrice > 0) || monthlyPayment <= 0) {
    const principal = Math.max(0, purchasePrice - downPayment);
    if (principal > 0 && loanTerm > 0) {
      if (rate > 0) {
        const monthlyRate = rate / 100 / 12;
        monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
      } else {
        monthlyPayment = principal / loanTerm;
      }
    } else if (principal === 0 && purchasePrice > 0) {
      // Paid 100% upfront in cash
      monthlyPayment = 0;
    }
  }

  const additionalMonthlyCost = monthlyPayment + insurance + maintenance;
  const currentBuffer = baselineMonthlyBuffer !== undefined ? baselineMonthlyBuffer : calc.monthlyRemainingCashFlow;
  const newRemainingCashFlow = currentBuffer - additionalMonthlyCost;
  
  const bufferReductionPercent = currentBuffer > 0 
    ? Math.min(999, (additionalMonthlyCost / currentBuffer) * 100) 
    : (additionalMonthlyCost > 0 ? 100 : 0);

  let note = '';
  if (newRemainingCashFlow < 0) {
    note = `This decision would exceed your current estimated monthly cash flow by $${Math.abs(newRemainingCashFlow).toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo, resulting in a deficit unless other budget categories are trimmed.`;
  } else if (newRemainingCashFlow < 250) {
    note = `This commitment leaves a very tight remaining monthly cushion of ~$${newRemainingCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo, leaving little margin for unplanned emergencies.`;
  } else if (bufferReductionPercent > 50) {
    note = `This commitment would absorb ${bufferReductionPercent.toFixed(0)}% of your existing monthly cash-flow surplus, leaving $${newRemainingCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo unallocated.`;
  } else {
    note = `This commitment appears comfortably absorbed by your current surplus, leaving an estimated $${newRemainingCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo in discretionary buffer.`;
  }

  return {
    id: scenarioInput.id || `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: scenarioInput.title || 'New Expense',
    category: scenarioInput.category,
    purchasePrice,
    downPayment,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    loanTermMonths: loanTerm,
    interestRate: rate,
    insuranceIncrease: insurance,
    maintenanceOther: maintenance,
    additionalMonthlyCost: Math.round(additionalMonthlyCost * 100) / 100,
    newRemainingCashFlow: Math.round(newRemainingCashFlow * 100) / 100,
    bufferReductionPercent: Math.round(bufferReductionPercent * 10) / 10,
    notes: note,
  };
}

/**
 * Deterministic AI Summary generator (Fallback or baseline)
 * Follows strict educational guidelines: neutral tone, no financial advice, highlights key facts.
 */
export function generateDeterministicSummary(calc: FinancialCalculations): AISummaryResponse {
  const topCategories = calc.categoryBreakdown.slice(0, 3);
  const buffer = calc.monthlyRemainingCashFlow;
  const takeHome = calc.estimatedMonthlyTakeHome;

  let cashFlowStatus = 'Balanced Surplus';
  if (buffer < 0) {
    cashFlowStatus = 'Monthly Deficit';
  } else if (buffer < 250) {
    cashFlowStatus = 'Tight Buffer';
  } else if (buffer > 1000) {
    cashFlowStatus = 'Substantial Buffer';
  }

  const drivers = topCategories.map((c) => {
    let obs = '';
    if (c.id === 'housing') {
      obs = calc.housingBurdenRatio > 35
        ? 'Housing comprises a significant portion of monthly take-home pay, above the traditional 30% guideline.'
        : 'Housing costs remain within standard balanced budgetary ranges.';
    } else if (c.id === 'debt') {
      obs = calc.debtToIncomeRatio > 15
        ? 'Debt service obligations represent a notable ongoing drain on net monthly cash flow.'
        : 'Debt payments represent a modest commitment relative to take-home income.';
    } else if (c.id === 'transport') {
      obs = 'Auto payments, insurance, fuel, and upkeep form a core recurring line item in your monthly budget.';
    } else if (c.id === 'living') {
      obs = 'Living essentials and groceries form the primary day-to-day operating expense.';
    } else {
      obs = 'Allocations here represent disciplined forward-looking capital contributions.';
    }

    return {
      category: c.name,
      monthlyAmount: c.amount,
      shareOfTakeHome: `${c.percentageOfIncome.toFixed(1)}%`,
      observation: obs,
    };
  });

  const keyConsiderations: string[] = [];

  if (calc.housingBurdenRatio > 32) {
    keyConsiderations.push(
      `Your housing expenses currently represent ${calc.housingBurdenRatio.toFixed(1)}% of your estimated net take-home pay. Consider reviewing utility rates, insurance premiums, or refinancing opportunities if applicable.`
    );
  }

  if (calc.debtToIncomeRatio > 12) {
    keyConsiderations.push(
      `Monthly debt obligations total $${calc.monthlyDebtTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo (${calc.debtToIncomeRatio.toFixed(1)}% of net income). Prioritizing high-interest balances could free up monthly flexibility.`
    );
  }

  if (calc.emergencyFundMonths < 3) {
    keyConsiderations.push(
      `Your current liquid savings cover approximately ${calc.emergencyFundMonths.toFixed(1)} months of essential monthly outflows. Building toward a 3 to 6-month buffer provides a financial safety net.`
    );
  } else {
    keyConsiderations.push(
      `Your emergency reserve covers ~${calc.emergencyFundMonths.toFixed(1)} months of expenses, providing a solid foundation against unexpected income interruptions.`
    );
  }

  if (buffer > 500) {
    keyConsiderations.push(
      `You maintain an estimated unallocated monthly buffer of $${buffer.toLocaleString('en-US', { maximumFractionDigits: 0 })}. You may want to evaluate whether directing part of this surplus into targeted savings or debt reduction aligns with your priorities.`
    );
  } else if (buffer < 0) {
    keyConsiderations.push(
      `Your current estimated expenses exceed take-home pay by $${Math.abs(buffer).toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo. Reviewing discretionary food, subscription, and shopping line items can help restore positive cash flow.`
    );
  }

  const executiveSummary = `Based on the information provided, your estimated gross annual income of $${calc.grossAnnualIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })} translates to an estimated monthly take-home pay of $${takeHome.toLocaleString('en-US', { maximumFractionDigits: 0 })} after federal, state, and FICA tax estimates. Your total monthly outflows (living expenses, housing, transportation, debt payments, and active savings) total $${calc.totalMonthlyOutflows.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo, leaving an estimated ${buffer >= 0 ? 'remaining surplus of $' + buffer.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'monthly shortfall of $' + Math.abs(buffer).toLocaleString('en-US', { maximumFractionDigits: 0 })}.`;

  return {
    executiveSummary,
    cashFlowStatus,
    biggestExpenseDrivers: drivers,
    keyConsiderations,
    bufferAssessment: buffer >= 0
      ? `Your estimated cash flow leaves a $${buffer.toLocaleString('en-US', { maximumFractionDigits: 0 })}/month operating buffer (${calc.remainingCashFlowRate.toFixed(1)}% of take-home pay).`
      : `Your reported outflows currently exceed your estimated take-home pay by $${Math.abs(buffer).toLocaleString('en-US', { maximumFractionDigits: 0 })}/month.`,
    generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    isAiGenerated: false,
  };
}
