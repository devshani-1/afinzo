import { GoogleGenAI, Type } from '@google/genai';
import { FinancialCalculations, AISummaryResponse } from '../types/financial';
import { generateDeterministicSummary } from '../utils/calculations';

export async function generateFinancialSummaryWithAI(
  calc: FinancialCalculations
): Promise<AISummaryResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment, falling back to deterministic summary.');
    return generateDeterministicSummary(calc);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptContext = {
      grossAnnualIncome: calc.grossAnnualIncome,
      estimatedMonthlyTakeHome: calc.estimatedMonthlyTakeHome,
      effectiveTaxRatePercent: (calc.effectiveTaxRate * 100).toFixed(1),
      totalMonthlyHousing: calc.monthlyHousingTotal,
      housingBurdenPercent: calc.housingBurdenRatio.toFixed(1),
      totalMonthlyTransportation: calc.monthlyTransportTotal,
      totalMonthlyDailyLiving: calc.monthlyLivingTotal,
      totalMonthlyDebtPayments: calc.monthlyDebtTotal,
      debtPaymentSharePercent: calc.debtToIncomeRatio.toFixed(1),
      totalMonthlySavingsInvestments: calc.monthlySavingsTotal,
      savingsRatePercent: calc.savingsRate.toFixed(1),
      monthlyRemainingCashFlow: calc.monthlyRemainingCashFlow,
      remainingCashFlowRatePercent: calc.remainingCashFlowRate.toFixed(1),
      emergencyFundMonths: calc.emergencyFundMonths.toFixed(1),
      topExpenseCategories: calc.categoryBreakdown.map((c) => ({
        category: c.name,
        amount: Math.round(c.amount),
        percentageOfIncome: c.percentageOfIncome.toFixed(1) + '%',
      })),
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Please analyze the following deterministic financial calculation results for an educational personal income report:
${JSON.stringify(promptContext, null, 2)}`,
      config: {
        systemInstruction: `You are Affordly's financial analysis assistant. Affordly is an educational personal cash-flow and affordability estimation tool, NOT a financial advisor.
Your role is to explain calculated numbers simply, calmly, and objectively.
GUIDELINES:
1. Do NOT calculate or change any numbers. The provided figures are deterministic.
2. Clearly explain:
   - The biggest expense categories and what share of take-home pay they absorb.
   - The monthly cash-flow position and buffer.
   - Objective observations without judgmental language (never use 'good' or 'bad', use 'Lower', 'Moderate', 'Higher', 'Conservative', 'Balanced').
   - 3 to 4 thoughtful questions or neutral considerations the user may want to evaluate.
3. STRICT PROHIBITIONS:
   - Never give personalized investment advice or product recommendations.
   - Never claim tax/legal certainty.
   - Never say 'You cannot afford this' or give definitive instructions. Use phrases like 'Based on the information provided...', 'Your estimated...', 'One area you may want to review...'.
4. Output must be valid JSON adhering to the provided schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: 'A 2-3 sentence overview of estimated income, total outflows, and resulting net cash flow buffer.',
            },
            cashFlowStatus: {
              type: Type.STRING,
              description: 'Short phrase describing cash flow position (e.g. Balanced Surplus, Tight Buffer, Strong Reserve)',
            },
            biggestExpenseDrivers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  monthlyAmount: { type: Type.NUMBER },
                  shareOfTakeHome: { type: Type.STRING },
                  observation: { type: Type.STRING },
                },
                required: ['category', 'monthlyAmount', 'shareOfTakeHome', 'observation'],
              },
            },
            keyConsiderations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 4 neutral, educational questions or observations to consider.',
            },
            bufferAssessment: {
              type: Type.STRING,
              description: 'Assessment of the monthly cash-flow buffer in dollars and percentage.',
            },
          },
          required: ['executiveSummary', 'cashFlowStatus', 'biggestExpenseDrivers', 'keyConsiderations', 'bufferAssessment'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return generateDeterministicSummary(calc);
    }

    const parsed = JSON.parse(text);
    return {
      ...parsed,
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isAiGenerated: true,
    };
  } catch (error) {
    console.error('Error generating AI financial summary with Gemini:', error);
    return generateDeterministicSummary(calc);
  }
}
