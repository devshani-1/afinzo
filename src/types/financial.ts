export type EmploymentType = 'salaried' | 'hourly' | 'self_employed' | 'multiple';
export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
export type FilingStatus = 'single' | 'married_joint' | 'head_of_household';

export interface CustomExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

export interface IncomeData {
  employmentType: EmploymentType;
  annualGrossIncome: number;
  hourlyWage: number;
  hoursPerWeek: number;
  payFrequency: PayFrequency;
  bonusCommission: number;
  otherIncome: number;
  state: string; // U.S. State abbreviation e.g. "CA", "TX"
  filingStatus: FilingStatus;
}

export interface HousingTransportData {
  rentOrMortgage: number;
  utilities: number;
  homeInsurance: number;
  propertyTax: number;
  carPayment: number;
  carInsurance: number;
  fuel: number;
  publicTransit: number;
  parkingTolls: number;
  maintenance: number;
}

export interface LivingExpensesData {
  foodGroceries: number;
  restaurants: number;
  healthcare: number;
  phone: number;
  internet: number;
  subscriptions: number;
  entertainment: number;
  shopping: number;
  childcare: number;
  education: number;
  personalCare: number;
  otherExpenses: number;
  customExpenses: CustomExpenseItem[];
}

export interface DebtSavingsData {
  creditCardPayments: number;
  studentLoans: number;
  personalLoans: number;
  otherDebt: number;
  currentSavings: number;
  monthlySavings: number;
  emergencyFundMonthly: number;
  retirementMonthly: number;
}

export interface FinancialFormData {
  income: IncomeData;
  housingTransport: HousingTransportData;
  livingExpenses: LivingExpensesData;
  debtSavings: DebtSavingsData;
}

export interface ExpenseCategoryBreakdown {
  id: string;
  name: string;
  amount: number;
  percentageOfIncome: number;
  percentageOfExpenses: number;
  color: string;
}

export interface FinancialIndicator {
  id: string;
  title: string;
  value: string;
  rawValue: number;
  level: 'lower' | 'moderate' | 'higher';
  levelLabel: string;
  color: 'emerald' | 'amber' | 'rose' | 'blue';
  explanation: string;
  formula: string;
  benchmark: string;
}

export interface FinancialCalculations {
  grossAnnualIncome: number;
  grossMonthlyIncome: number;
  
  // Taxes
  estimatedFederalTaxAnnual: number;
  estimatedStateTaxAnnual: number;
  estimatedFicaTaxAnnual: number;
  estimatedTotalTaxAnnual: number;
  effectiveTaxRate: number;
  
  // Net
  estimatedAnnualTakeHome: number;
  estimatedMonthlyTakeHome: number;
  
  // Monthly Category Totals
  monthlyHousingTotal: number;
  monthlyTransportTotal: number;
  monthlyLivingTotal: number;
  monthlyDebtTotal: number;
  monthlySavingsTotal: number;
  
  // Aggregated Outflows
  totalMonthlyExpenses: number; // Housing + Transport + Living
  totalMonthlyOutflows: number; // Expenses + Debt + Savings
  
  // Cash Flow
  monthlyRemainingCashFlow: number; // TakeHome - (Expenses + Debt + Savings)
  operatingCashFlow: number; // TakeHome - (Expenses + Debt) [before discretionary savings]
  
  // Key Ratios
  housingBurdenRatio: number; // Housing / TakeHome
  debtToIncomeRatio: number; // Debt / TakeHome
  fixedCommitmentsRatio: number; // (Housing + Debt) / TakeHome
  savingsRate: number; // Savings / TakeHome
  expenseShareRate: number; // Expenses / TakeHome
  remainingCashFlowRate: number; // Remaining / TakeHome
  emergencyFundMonths: number; // CurrentSavings / (Expenses + Debt)
  
  // Visual breakdown & indicators
  categoryBreakdown: ExpenseCategoryBreakdown[];
  indicators: FinancialIndicator[];
}

export interface AffordabilityScenario {
  id: string;
  title: string;
  category: 'car' | 'rent' | 'vacation' | 'subscription' | 'loan' | 'furniture' | 'education' | 'other';
  purchasePrice: number;
  downPayment: number;
  monthlyPayment: number;
  loanTermMonths: number;
  interestRate: number;
  insuranceIncrease: number;
  maintenanceOther: number;
  additionalMonthlyCost: number;
  newRemainingCashFlow: number;
  bufferReductionPercent: number;
  notes: string;
}

export interface AISummaryResponse {
  executiveSummary: string;
  cashFlowStatus: string;
  biggestExpenseDrivers: Array<{
    category: string;
    monthlyAmount: number;
    shareOfTakeHome: string;
    observation: string;
  }>;
  keyConsiderations: string[];
  bufferAssessment: string;
  generatedAt: string;
  isAiGenerated: boolean;
}
