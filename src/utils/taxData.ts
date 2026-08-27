export interface USStateInfo {
  code: string;
  name: string;
  type: 'none' | 'flat' | 'progressive';
  topRate: number; // For display/estimation
  estimatedEffectiveRate: (grossIncome: number, filingStatus: string) => number;
}

// 2024/2025 Standard Deductions
export const STANDARD_DEDUCTIONS = {
  single: 14600,
  married_joint: 29200,
  head_of_household: 21900,
};

// 2024/2025 Federal Tax Brackets (Single)
export const FEDERAL_BRACKETS_SINGLE = [
  { rate: 0.10, upTo: 11600 },
  { rate: 0.12, upTo: 47150 },
  { rate: 0.22, upTo: 100525 },
  { rate: 0.24, upTo: 191950 },
  { rate: 0.32, upTo: 243725 },
  { rate: 0.35, upTo: 609350 },
  { rate: 0.37, upTo: Infinity },
];

// 2024/2025 Federal Tax Brackets (Married Filing Jointly)
export const FEDERAL_BRACKETS_MARRIED = [
  { rate: 0.10, upTo: 23200 },
  { rate: 0.12, upTo: 94300 },
  { rate: 0.22, upTo: 201050 },
  { rate: 0.24, upTo: 383900 },
  { rate: 0.32, upTo: 487450 },
  { rate: 0.35, upTo: 731200 },
  { rate: 0.37, upTo: Infinity },
];

// 2024/2025 Federal Tax Brackets (Head of Household)
export const FEDERAL_BRACKETS_HOH = [
  { rate: 0.10, upTo: 16550 },
  { rate: 0.12, upTo: 63100 },
  { rate: 0.22, upTo: 100500 },
  { rate: 0.24, upTo: 191950 },
  { rate: 0.32, upTo: 243700 },
  { rate: 0.35, upTo: 609350 },
  { rate: 0.37, upTo: Infinity },
];

// All 50 U.S. States + DC with accurate state income tax models
export const US_STATES: USStateInfo[] = [
  { code: 'AL', name: 'Alabama', type: 'progressive', topRate: 0.05, estimatedEffectiveRate: (g) => Math.min(0.045, Math.max(0.02, (g - 10000) * 0.045 / g || 0)) },
  { code: 'AK', name: 'Alaska', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'AZ', name: 'Arizona', type: 'flat', topRate: 0.025, estimatedEffectiveRate: (g) => g > 15000 ? 0.025 * (g - 14600) / g : 0.015 },
  { code: 'AR', name: 'Arkansas', type: 'progressive', topRate: 0.044, estimatedEffectiveRate: (g) => g > 20000 ? 0.038 : 0.02 },
  { code: 'CA', name: 'California', type: 'progressive', topRate: 0.133, estimatedEffectiveRate: (g) => {
    if (g < 25000) return 0.015;
    if (g < 60000) return 0.038;
    if (g < 120000) return 0.065;
    if (g < 250000) return 0.088;
    return 0.105;
  }},
  { code: 'CO', name: 'Colorado', type: 'flat', topRate: 0.044, estimatedEffectiveRate: (g) => g > 15000 ? 0.044 * (g - 14600) / g : 0.025 },
  { code: 'CT', name: 'Connecticut', type: 'progressive', topRate: 0.0699, estimatedEffectiveRate: (g) => g > 100000 ? 0.055 : (g > 50000 ? 0.045 : 0.03) },
  { code: 'DE', name: 'Delaware', type: 'progressive', topRate: 0.066, estimatedEffectiveRate: (g) => g > 75000 ? 0.05 : 0.035 },
  { code: 'DC', name: 'District of Columbia', type: 'progressive', topRate: 0.1075, estimatedEffectiveRate: (g) => g > 100000 ? 0.065 : 0.045 },
  { code: 'FL', name: 'Florida', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'GA', name: 'Georgia', type: 'flat', topRate: 0.0549, estimatedEffectiveRate: (g) => g > 20000 ? 0.048 : 0.03 },
  { code: 'HI', name: 'Hawaii', type: 'progressive', topRate: 0.11, estimatedEffectiveRate: (g) => g > 80000 ? 0.072 : 0.05 },
  { code: 'ID', name: 'Idaho', type: 'flat', topRate: 0.058, estimatedEffectiveRate: (g) => g > 18000 ? 0.05 : 0.03 },
  { code: 'IL', name: 'Illinois', type: 'flat', topRate: 0.0495, estimatedEffectiveRate: (g) => g > 10000 ? 0.046 : 0.03 },
  { code: 'IN', name: 'Indiana', type: 'flat', topRate: 0.0305, estimatedEffectiveRate: (g) => g > 10000 ? 0.0305 : 0.02 },
  { code: 'IA', name: 'Iowa', type: 'flat', topRate: 0.038, estimatedEffectiveRate: (g) => g > 20000 ? 0.038 : 0.02 },
  { code: 'KS', name: 'Kansas', type: 'progressive', topRate: 0.057, estimatedEffectiveRate: (g) => g > 50000 ? 0.048 : 0.035 },
  { code: 'KY', name: 'Kentucky', type: 'flat', topRate: 0.04, estimatedEffectiveRate: (g) => g > 12000 ? 0.04 : 0.025 },
  { code: 'LA', name: 'Louisiana', type: 'progressive', topRate: 0.0425, estimatedEffectiveRate: (g) => g > 50000 ? 0.038 : 0.025 },
  { code: 'ME', name: 'Maine', type: 'progressive', topRate: 0.0715, estimatedEffectiveRate: (g) => g > 60000 ? 0.058 : 0.04 },
  { code: 'MD', name: 'Maryland', type: 'progressive', topRate: 0.0575, estimatedEffectiveRate: (g) => (g > 100000 ? 0.05 : 0.042) + 0.028 /* Local county tax avg */ },
  { code: 'MA', name: 'Massachusetts', type: 'flat', topRate: 0.05, estimatedEffectiveRate: (g) => g > 15000 ? 0.048 : 0.03 },
  { code: 'MI', name: 'Michigan', type: 'flat', topRate: 0.0425, estimatedEffectiveRate: (g) => g > 12000 ? 0.04 : 0.025 },
  { code: 'MN', name: 'Minnesota', type: 'progressive', topRate: 0.0985, estimatedEffectiveRate: (g) => g > 90000 ? 0.068 : (g > 40000 ? 0.052 : 0.035) },
  { code: 'MS', name: 'Mississippi', type: 'flat', topRate: 0.047, estimatedEffectiveRate: (g) => g > 20000 ? 0.042 : 0.02 },
  { code: 'MO', name: 'Missouri', type: 'progressive', topRate: 0.048, estimatedEffectiveRate: (g) => g > 40000 ? 0.042 : 0.025 },
  { code: 'MT', name: 'Montana', type: 'progressive', topRate: 0.059, estimatedEffectiveRate: (g) => g > 40000 ? 0.049 : 0.03 },
  { code: 'NE', name: 'Nebraska', type: 'progressive', topRate: 0.0584, estimatedEffectiveRate: (g) => g > 50000 ? 0.048 : 0.03 },
  { code: 'NV', name: 'Nevada', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'NH', name: 'New Hampshire', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'NJ', name: 'New Jersey', type: 'progressive', topRate: 0.1075, estimatedEffectiveRate: (g) => g > 150000 ? 0.065 : (g > 75000 ? 0.048 : 0.028) },
  { code: 'NM', name: 'New Mexico', type: 'progressive', topRate: 0.059, estimatedEffectiveRate: (g) => g > 50000 ? 0.045 : 0.03 },
  { code: 'NY', name: 'New York', type: 'progressive', topRate: 0.109, estimatedEffectiveRate: (g) => g > 120000 ? 0.062 : (g > 60000 ? 0.051 : 0.038) },
  { code: 'NC', name: 'North Carolina', type: 'flat', topRate: 0.045, estimatedEffectiveRate: (g) => g > 15000 ? 0.042 : 0.025 },
  { code: 'ND', name: 'North Dakota', type: 'progressive', topRate: 0.025, estimatedEffectiveRate: (g) => g > 50000 ? 0.018 : 0.01 },
  { code: 'OH', name: 'Ohio', type: 'progressive', topRate: 0.035, estimatedEffectiveRate: (g) => g > 50000 ? 0.028 : 0.018 },
  { code: 'OK', name: 'Oklahoma', type: 'progressive', topRate: 0.0475, estimatedEffectiveRate: (g) => g > 40000 ? 0.04 : 0.025 },
  { code: 'OR', name: 'Oregon', type: 'progressive', topRate: 0.099, estimatedEffectiveRate: (g) => g > 80000 ? 0.078 : (g > 40000 ? 0.065 : 0.045) },
  { code: 'PA', name: 'Pennsylvania', type: 'flat', topRate: 0.0307, estimatedEffectiveRate: (g) => g > 10000 ? 0.0307 : 0.02 },
  { code: 'RI', name: 'Rhode Island', type: 'progressive', topRate: 0.0599, estimatedEffectiveRate: (g) => g > 60000 ? 0.048 : 0.035 },
  { code: 'SC', name: 'South Carolina', type: 'progressive', topRate: 0.064, estimatedEffectiveRate: (g) => g > 50000 ? 0.052 : 0.03 },
  { code: 'SD', name: 'South Dakota', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'TN', name: 'Tennessee', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'TX', name: 'Texas', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'UT', name: 'Utah', type: 'flat', topRate: 0.0465, estimatedEffectiveRate: (g) => g > 15000 ? 0.044 : 0.03 },
  { code: 'VT', name: 'Vermont', type: 'progressive', topRate: 0.0875, estimatedEffectiveRate: (g) => g > 70000 ? 0.062 : 0.042 },
  { code: 'VA', name: 'Virginia', type: 'progressive', topRate: 0.0575, estimatedEffectiveRate: (g) => g > 50000 ? 0.051 : 0.038 },
  { code: 'WA', name: 'Washington', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
  { code: 'WV', name: 'West Virginia', type: 'progressive', topRate: 0.0512, estimatedEffectiveRate: (g) => g > 50000 ? 0.044 : 0.03 },
  { code: 'WI', name: 'Wisconsin', type: 'progressive', topRate: 0.0765, estimatedEffectiveRate: (g) => g > 75000 ? 0.058 : 0.042 },
  { code: 'WY', name: 'Wyoming', type: 'none', topRate: 0.0, estimatedEffectiveRate: () => 0 },
];
