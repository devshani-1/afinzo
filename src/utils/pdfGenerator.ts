import { jsPDF } from 'jspdf';
import { FinancialCalculations, FinancialFormData, AISummaryResponse, AffordabilityScenario } from '../types/financial';
import { US_STATES } from './taxData';

// Common PDF Helper: Header and Footer
function drawHeaderFooter(doc: jsPDF, title: string, reportId: string, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`AFFINZO — ${title.toUpperCase()}`, margin, 10);
  doc.setFont('helvetica', 'normal');
  doc.text(`REPORT ID: ${reportId}`, pageWidth - margin, 10, { align: 'right' });
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, 12, pageWidth - margin, 12);

  // Footer
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential Educational Financial Analysis • Not Financial Advice', margin, pageHeight - 8);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
}

// Common Banner
function drawBanner(
  doc: jsPDF,
  margin: number,
  y: number,
  contentWidth: number,
  pageWidth: number,
  title: string,
  subtitle: string,
  subMeta: string,
  accentColor: [number, number, number] = [15, 23, 42]
) {
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('AFFINZO', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(title, margin + 6, y + 16);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(subtitle, margin + 6, y + 21);
  doc.text(subMeta, pageWidth - margin - 6, y + 21, { align: 'right' });
}

// -------------------------------------------------------------
// 1. CAR REAL COST PDF
// -------------------------------------------------------------
export interface CarCostPDFData {
  carName: string;
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermMonths: number;
  monthlyLoanPayment: number;
  monthlyInsurance: number;
  monthlyFuelOrCharge: number;
  monthlyMaintenance: number;
  monthlyRegistrationTaxes: number;
  monthlyParkingTolls: number;
  financedAmount: number;
  operatingCosts: number;
  totalMonthlyRealCost: number;
  total5YearCost: number;
  userTakeHome: number;
  shareOfTakeHome: number;
  currentBuffer: number;
  newEstimatedBuffer: number;
  isHealthyPercentage: boolean;
  isBufferPositive: boolean;
}

export function generateCarCostPDF(data: CarCostPDFData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const reportId = `CAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  let y = margin;

  // Banner
  drawBanner(
    doc,
    margin,
    y,
    contentWidth,
    pageWidth,
    'What Will This Car Actually Cost Me?',
    `Vehicle Analysis: ${data.carName}`,
    `Prepared: ${reportDate}`,
    [15, 23, 42]
  );
  y += 29;

  // Disclaimer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('EDUCATIONAL PLANNING ESTIMATE:', margin + 4, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Calculated estimates include financing amortizations, recurring operating overhead, and standard maintenance amortizations.', margin + 4, y + 8);
  y += 15;

  // 4 Top Key Metrics
  const cardW = (contentWidth - 6) / 2;
  const cardH = 20;

  // Card 1: Sticker Loan Payment
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('STICKER LOAN PAYMENT', margin + 4, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.monthlyLoanPayment).toLocaleString()} / mo`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`$${Math.round(data.financedAmount).toLocaleString()} financed @ ${data.interestRate}% (${data.loanTermMonths} mo)`, margin + 4, y + 17.5);

  // Card 2: Total Real Monthly Cost
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.text('TOTAL REAL MONTHLY COST', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(`$${Math.round(data.totalMonthlyRealCost).toLocaleString()} / mo`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(6, 95, 70);
  doc.text(`Includes fuel, insurance, upkeep & taxes`, margin + cardW + 10, y + 17.5);

  y += cardH + 4;

  // Card 3: Share of Take-Home Pay
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SHARE OF NET TAKE-HOME PAY', margin + 4, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(data.shareOfTakeHome > 15 ? 225 : 15, data.shareOfTakeHome > 15 ? 29 : 23, data.shareOfTakeHome > 15 ? 72 : 42);
  doc.text(`${data.shareOfTakeHome.toFixed(1)}%`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Recommended auto budget benchmark: ≤15%`, margin + 4, y + 17.5);

  // Card 4: 5-Year Total Commitment
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ESTIMATED 5-YEAR OUTFLOW', margin + cardW + 10, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.total5YearCost).toLocaleString()}`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payments + operating costs across 60 months`, margin + cardW + 10, y + 17.5);

  y += cardH + 7;

  // Section 1: Detailed Ownership Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Itemized Vehicle Cost Breakdown', margin, y);
  y += 4.5;

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('EXPENSE CATEGORY', margin + 2, y);
  doc.text('DETAILS / FORMULA', margin + 70, y);
  doc.text('MONTHLY', margin + 135, y, { align: 'right' });
  doc.text('5-YEAR SUM', pageWidth - margin - 4, y, { align: 'right' });
  y += 6;

  const itemRow = (label: string, detail: string, mo: number, yr5: number, isBold = false, bg = false) => {
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.2, 'F');
    }
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, margin + 2, y);
    doc.text(detail, margin + 70, y);
    doc.text(`$${Math.round(mo).toLocaleString()}`, margin + 135, y, { align: 'right' });
    doc.text(`$${Math.round(yr5).toLocaleString()}`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5.2;
  };

  itemRow('Loan Principal & Interest', `${data.loanTermMonths} mo loan @ ${data.interestRate}% on $${Math.round(data.financedAmount).toLocaleString()}`, data.monthlyLoanPayment, data.monthlyLoanPayment * 60, false, true);
  itemRow('Comprehensive Auto Insurance', 'Full coverage collision + liability premium', data.monthlyInsurance, data.monthlyInsurance * 60);
  itemRow('Fuel / EV Electricity', 'Monthly gas or home charging electricity', data.monthlyFuelOrCharge, data.monthlyFuelOrCharge * 60, false, true);
  itemRow('Routine Maintenance & Tires', 'Oil changes, brakes, scheduled servicing, tires amortized', data.monthlyMaintenance, data.monthlyMaintenance * 60);
  itemRow('Registration, Fees & Taxes', 'Annual tag, inspection, and local vehicle property tax / 12', data.monthlyRegistrationTaxes, data.monthlyRegistrationTaxes * 60, false, true);
  itemRow('Parking & Highway Tolls', 'Commuter passes, garage permits, express lanes', data.monthlyParkingTolls, data.monthlyParkingTolls * 60);
  
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  itemRow('Total True Monthly Commitment', 'All financing + ongoing ownership overhead', data.totalMonthlyRealCost, data.total5YearCost, true, true);

  y += 6;

  // Section 2: Budget Fit & Affordability Decision
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Monthly Cash-Flow Impact & Affordability Assessment', margin, y);
  y += 4.5;

  const isFit = data.isHealthyPercentage && data.isBufferPositive;
  doc.setFillColor(isFit ? 240 : 254, isFit ? 253 : 243, isFit ? 244 : 199);
  doc.setDrawColor(isFit ? 187 : 252, isFit ? 247 : 211, isFit ? 208 : 77);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(isFit ? 22 : 146, isFit ? 101 : 64, isFit ? 52 : 14);
  doc.text(isFit ? 'STATUS: REALISTIC CASH-FLOW FIT' : 'STATUS: CAUTION — HIGH CASH-FLOW COMMITMENT', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const fitText = isFit
    ? `At $${Math.round(data.totalMonthlyRealCost).toLocaleString()}/month, this vehicle accounts for ${data.shareOfTakeHome.toFixed(1)}% of your estimated net take-home pay ($${Math.round(data.userTakeHome).toLocaleString()}/mo). Your remaining discretionary cash-flow buffer after purchasing this car is estimated at $${Math.round(data.newEstimatedBuffer).toLocaleString()}/mo.`
    : `Total ownership cost represents ${data.shareOfTakeHome.toFixed(1)}% of your net monthly take-home pay ($${Math.round(data.userTakeHome).toLocaleString()}/mo), exceeding standard 15% vehicle budget guidelines. Your projected remaining buffer is $${Math.round(data.newEstimatedBuffer).toLocaleString()}/mo. Consider increasing your down payment ($${Math.round(data.downPayment).toLocaleString()}) or choosing a certified pre-owned model.`;
  doc.text(fitText, margin + 4, y + 10.5, { maxWidth: contentWidth - 8 });

  y += 28;

  // Section 3: Summary Rules Comparison
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Benchmark Rules Comparison (The 20/4/10 Rule)', margin, y);
  y += 4.5;

  const dpPct = (data.downPayment / (data.purchasePrice || 1)) * 100;
  const ruleRow = (ruleName: string, benchmark: string, userVal: string, status: string) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(ruleName, margin + 4, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Benchmark: ${benchmark}`, margin + 55, y + 4.5);
    doc.text(`Your Plan: ${userVal}`, margin + 115, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(status, pageWidth - margin - 4, y + 4.5, { align: 'right' });
    y += 8.5;
  };

  ruleRow('20% Down Payment', '≥ 20% down', `${dpPct.toFixed(1)}% ($${Math.round(data.downPayment).toLocaleString()})`, dpPct >= 20 ? 'PASSED' : 'BELOW TARGET');
  ruleRow('4-Year Max Term', '≤ 48 months', `${data.loanTermMonths} months`, data.loanTermMonths <= 48 ? 'PASSED' : 'EXTENDED TERM');
  ruleRow('10-15% Total Pay', '≤ 15% take-home', `${data.shareOfTakeHome.toFixed(1)}% of net`, data.shareOfTakeHome <= 15 ? 'PASSED' : 'HIGH SHARE');

  drawHeaderFooter(doc, 'Vehicle Real-Cost Report', reportId, 1, 1);
  return doc;
}

// -------------------------------------------------------------
// 2. RENT REAL COST PDF
// -------------------------------------------------------------
export interface RentCostPDFData {
  apartmentType: string;
  baseRent: number;
  electricGas: number;
  waterTrash: number;
  internetFee: number;
  parkingGarage: number;
  rentersInsurance: number;
  petRentOther: number;
  moveInFeesOneTime: number;
  totalRecurringUtilities: number;
  totalRealMonthlyHousing: number;
  shareOfTakeHome: number;
  annualSalaryNeeded40x: number;
  recommendedTakeHomeMax: number;
  userTakeHome: number;
  userCurrentBuffer: number;
  newEstimatedBuffer: number;
  isAffordable40x: boolean;
  isAffordable30Pct: boolean;
}

export function generateRentCostPDF(data: RentCostPDFData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const reportId = `RNT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  let y = margin;

  // Banner
  drawBanner(
    doc,
    margin,
    y,
    contentWidth,
    pageWidth,
    'How Much Will This Rent Really Cost Me?',
    `Apartment / Residence Analysis: ${data.apartmentType}`,
    `Prepared: ${reportDate}`,
    [15, 23, 42]
  );
  y += 29;

  // Disclaimer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('EDUCATIONAL HOUSING ESTIMATE:', margin + 4, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Estimates include mandatory utilities, parking fees, renter insurance premiums, and upfront security deposit requirements.', margin + 4, y + 8);
  y += 15;

  // 4 Top Key Metrics
  const cardW = (contentWidth - 6) / 2;
  const cardH = 20;

  // Card 1: Listed Base Rent
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('LISTED BASE LEASE RENT', margin + 4, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.baseRent).toLocaleString()} / mo`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Sticker advertised lease price`, margin + 4, y + 17.5);

  // Card 2: Total Real Monthly Housing
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(3, 105, 161);
  doc.text('TOTAL REAL MONTHLY HOUSING', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(2, 132, 199);
  doc.text(`$${Math.round(data.totalRealMonthlyHousing).toLocaleString()} / mo`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(3, 105, 161);
  doc.text(`+$${Math.round(data.totalRecurringUtilities).toLocaleString()} in utilities, parking & insurance`, margin + cardW + 10, y + 17.5);

  y += cardH + 4;

  // Card 3: Share of Take-Home Pay
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SHARE OF NET TAKE-HOME PAY', margin + 4, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(data.shareOfTakeHome > 30 ? 225 : 15, data.shareOfTakeHome > 30 ? 29 : 23, data.shareOfTakeHome > 30 ? 72 : 42);
  doc.text(`${data.shareOfTakeHome.toFixed(1)}%`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Standard housing guideline: ≤30%`, margin + 4, y + 17.5);

  // Card 4: Upfront Move-in Outlay
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('UPFRONT MOVE-IN CAPITAL', margin + cardW + 10, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.moveInFeesOneTime).toLocaleString()}`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Deposit, first month & move-in fees`, margin + cardW + 10, y + 17.5);

  y += cardH + 7;

  // Section 1: Itemized Rent & Utility Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Itemized Monthly Housing Commitment', margin, y);
  y += 4.5;

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('HOUSING LINE ITEM', margin + 2, y);
  doc.text('EXPENSE DETAILS', margin + 70, y);
  doc.text('MONTHLY', margin + 135, y, { align: 'right' });
  doc.text('ANNUAL SUM', pageWidth - margin - 4, y, { align: 'right' });
  y += 6;

  const rentRow = (label: string, detail: string, mo: number, isBold = false, bg = false) => {
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.2, 'F');
    }
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, margin + 2, y);
    doc.text(detail, margin + 70, y);
    doc.text(`$${Math.round(mo).toLocaleString()}`, margin + 135, y, { align: 'right' });
    doc.text(`$${Math.round(mo * 12).toLocaleString()}`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5.2;
  };

  rentRow('Base Lease Rent', 'Core contractual monthly rent on lease agreement', data.baseRent, false, true);
  rentRow('Electric & Gas Utilities', 'Heating, cooling, cooking gas, electric usage', data.electricGas);
  rentRow('Water, Sewer & Trash', 'Municipal and building utility bill-backs', data.waterTrash, false, true);
  rentRow('High-Speed Internet / WiFi', 'Fiber or cable broadband service', data.internetFee);
  rentRow('Assigned Parking / Garage', 'Dedicated covered parking space or permit', data.parkingGarage, false, true);
  rentRow("Renter's Insurance Policy", 'Personal property and liability coverage ($100k+)', data.rentersInsurance);
  rentRow('Pet Rent & Building Amenity Surcharges', 'Monthly pet fees, gym/trash valet charges', data.petRentOther, false, true);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  rentRow('Total All-Inclusive Housing Outflow', 'Base rent + all mandatory utility & building surcharges', data.totalRealMonthlyHousing, true, true);

  y += 6;

  // Section 2: Landlord Qualification & Rules Check
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Landlord Qualification & Income Rules Evaluation', margin, y);
  y += 4.5;

  const isFit = data.isAffordable30Pct;
  doc.setFillColor(isFit ? 240 : 254, isFit ? 253 : 243, isFit ? 244 : 199);
  doc.setDrawColor(isFit ? 187 : 252, isFit ? 247 : 211, isFit ? 208 : 77);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(isFit ? 22 : 146, isFit ? 101 : 64, isFit ? 52 : 14);
  doc.text(isFit ? 'HOUSING QUALIFICATION STATUS: HEALTHY & SUSTAINABLE' : 'HOUSING QUALIFICATION STATUS: CAUTION — HIGH HOUSING BURDEN', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`• 40x Landlord Rule: Most landlords require an annual gross salary of at least $${Math.round(data.annualSalaryNeeded40x).toLocaleString()}/year (40x monthly rent).`, margin + 4, y + 10.5);
  doc.text(`• 30% Net Income Rule: Safe recommended max rent on your take-home pay ($${Math.round(data.userTakeHome).toLocaleString()}/mo) is $${Math.round(data.recommendedTakeHomeMax).toLocaleString()}/mo.`, margin + 4, y + 14.5);
  doc.text(`• Projected Monthly Cash Buffer: After accounting for total real housing costs, your remaining discretionary buffer is estimated at $${Math.round(data.newEstimatedBuffer).toLocaleString()}/mo.`, margin + 4, y + 18.5);

  drawHeaderFooter(doc, 'Rent Real-Cost Report', reportId, 1, 1);
  return doc;
}

// -------------------------------------------------------------
// 3. TAKE-HOME PAY & TAX ESTIMATE PDF
// -------------------------------------------------------------
export interface TaxCalculationResult {
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  totalTax: number;
  effectiveTaxRate: number;
  annualTakeHome: number;
  monthlyTakeHome: number;
}

export interface TakeHomePDFData {
  grossAnnual: number;
  stateCode: string;
  filingStatus: string;
  payFrequency: string;
  paychecksPerYear: number;
  retirementPercent: number;
  monthlyHealthDental: number;
  monthlyHsaFsa: number;
  totalPreTaxDeductions: number;
  taxableFederalIncome: number;
  taxResults: TaxCalculationResult;
  annualTakeHome: number;
  monthlyTakeHome: number;
  paycheckTakeHome: number;
  effectiveTaxRate: number;
  recommendedMaxHousing: number;
  recommendedMaxAuto: number;
  recommendedMonthlySavings: number;
}

export function generateTakeHomePDF(data: TakeHomePDFData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const stateName = US_STATES.find((s) => s.code === data.stateCode)?.name || data.stateCode;
  const reportId = `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  let y = margin;

  // Banner
  drawBanner(
    doc,
    margin,
    y,
    contentWidth,
    pageWidth,
    'What Will I Actually Take Home?',
    `State: ${stateName} • Filing: ${data.filingStatus.replace('_', ' ').toUpperCase()} • Frequency: ${data.payFrequency.toUpperCase()}`,
    `Prepared: ${reportDate}`,
    [15, 23, 42]
  );
  y += 29;

  // Disclaimer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('PROGRESSIVE TAX WITHHOLDINGS NOTICE:', margin + 4, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Modeled using 2024/2025 IRS federal tax brackets, standard deduction, FICA wage caps, and state tax rate schedules.', margin + 4, y + 8);
  y += 15;

  // 4 Top Key Metrics
  const cardW = (contentWidth - 6) / 2;
  const cardH = 20;

  // Card 1: Estimated Net Paycheck
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(109, 40, 217);
  doc.text(`ESTIMATED NET PER PAYCHECK (${data.payFrequency.toUpperCase()})`, margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(124, 58, 237);
  doc.text(`$${Math.round(data.paycheckTakeHome).toLocaleString()}`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(109, 40, 217);
  doc.text(`${data.paychecksPerYear} pay periods per calendar year`, margin + 4, y + 17.5);

  // Card 2: Estimated Monthly Take-Home
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ESTIMATED MONTHLY TAKE-HOME', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.monthlyTakeHome).toLocaleString()} / mo`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Annual net: $${Math.round(data.annualTakeHome).toLocaleString()}`, margin + cardW + 10, y + 17.5);

  y += cardH + 4;

  // Card 3: Total Estimated Taxes
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL TAX WITHHOLDINGS', margin + 4, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.taxResults.totalTax).toLocaleString()} / yr`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Effective Tax Rate: ${data.effectiveTaxRate.toFixed(1)}% of gross`, margin + 4, y + 17.5);

  // Card 4: Pre-Tax Deductions
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PRE-TAX DEDUCTIONS (401K/HEALTH)', margin + cardW + 10, y + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.totalPreTaxDeductions).toLocaleString()} / yr`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`$${Math.round(data.totalPreTaxDeductions / 12).toLocaleString()}/mo in pre-tax benefits`, margin + cardW + 10, y + 17.5);

  y += cardH + 7;

  // Section 1: Detailed Tax & Payroll Withholdings Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Full Payroll & Tax Withholding Breakdown', margin, y);
  y += 4.5;

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('LINE ITEM', margin + 2, y);
  doc.text('ANNUAL', margin + 85, y, { align: 'right' });
  doc.text('MONTHLY', margin + 130, y, { align: 'right' });
  doc.text('PER CHECK', pageWidth - margin - 4, y, { align: 'right' });
  y += 6;

  const taxRow = (label: string, annual: number, isBold = false, bg = false) => {
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.2, 'F');
    }
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, margin + 2, y);
    doc.text(`$${Math.round(annual).toLocaleString()}`, margin + 85, y, { align: 'right' });
    doc.text(`$${Math.round(annual / 12).toLocaleString()}`, margin + 130, y, { align: 'right' });
    doc.text(`$${Math.round(annual / data.paychecksPerYear).toLocaleString()}`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5.2;
  };

  taxRow('Gross Compensation', data.grossAnnual, true, true);
  taxRow(`Pre-Tax 401(k) Contribution (${data.retirementPercent}%)`, (data.grossAnnual * data.retirementPercent) / 100);
  taxRow('Pre-Tax Health, Dental & Vision Premiums', data.monthlyHealthDental * 12, false, true);
  taxRow('Pre-Tax HSA / FSA Contributions', data.monthlyHsaFsa * 12);
  taxRow('Est. Federal Income Tax', data.taxResults.federalTax, false, true);
  taxRow(`Est. State Income Tax (${stateName})`, data.taxResults.stateTax);
  taxRow('Est. FICA Tax (Social Security & Medicare)', data.taxResults.ficaTax, false, true);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  taxRow('Estimated Net Take-Home Pay', data.annualTakeHome, true, true);

  y += 7;

  // Section 2: Budgeting from Net Paycheck
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Safe Spending Guidelines Derived from Net Pay', margin, y);
  y += 4.5;

  const budgetCard = (title: string, rule: string, amt: number, desc: string, xPos: number, w: number) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, y, w, 22, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, xPos + 3, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(`$${Math.round(amt).toLocaleString()}/mo`, xPos + 3, y + 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(rule, xPos + 3, y + 16);
    doc.text(desc, xPos + 3, y + 19.5);
  };

  const colW = (contentWidth - 6) / 3;
  budgetCard('Max Housing Budget', '≤ 30% of Net Take-Home', data.recommendedMaxHousing, 'Includes rent/mortgage & bills', margin, colW);
  budgetCard('Max Auto / Transport', '≤ 15% of Net Take-Home', data.recommendedMaxAuto, 'Loan, gas, insurance & upkeep', margin + colW + 3, colW);
  budgetCard('Target Savings & Buffer', '≥ 20% of Net Take-Home', data.recommendedMonthlySavings, 'Emergency fund & investments', margin + (colW * 2) + 6, colW);

  drawHeaderFooter(doc, 'Take-Home Pay & Tax Report', reportId, 1, 1);
  return doc;
}

// -------------------------------------------------------------
// 4. BUDGET & CASH FLOW PDF
// -------------------------------------------------------------
export interface BudgetFlowPDFData {
  takeHomePay: number;
  housingCost: number;
  transportCost: number;
  groceriesFood: number;
  diningOut: number;
  debtPayments: number;
  subscriptionsDigital: number;
  utilitiesPhone: number;
  lifestyleShopping: number;
  savingsMonthly: number;
  totalOutflows: number;
  remainingCashFlow: number;
  savingsRate: number;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
}

export function generateBudgetFlowPDF(data: BudgetFlowPDFData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const reportId = `BDG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  let y = margin;

  // Banner
  drawBanner(
    doc,
    margin,
    y,
    contentWidth,
    pageWidth,
    'Where Is My Money Going?',
    'Monthly Cash Flow & Expense Outflow Analysis',
    `Prepared: ${reportDate}`,
    [15, 23, 42]
  );
  y += 29;

  // 4 Top Key Metrics
  const cardW = (contentWidth - 6) / 2;
  const cardH = 20;

  // Card 1: Net Inflow
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('MONTHLY TAKE-HOME INFLOW', margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.takeHomePay).toLocaleString()} / mo`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total disposable monthly net income`, margin + 4, y + 17.5);

  // Card 2: Total Outflows
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL MONTHLY OUTFLOWS', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.totalOutflows).toLocaleString()} / mo`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${((data.totalOutflows / (data.takeHomePay || 1)) * 100).toFixed(1)}% of net monthly income`, margin + cardW + 10, y + 17.5);

  y += cardH + 4;

  // Card 3: Remaining Buffer
  const isPos = data.remainingCashFlow >= 0;
  doc.setFillColor(isPos ? 236 : 254, isPos ? 253 : 242, isPos ? 245 : 242);
  doc.setDrawColor(isPos ? 167 : 254, isPos ? 243 : 205, isPos ? 208 : 211);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(isPos ? 6 : 159, isPos ? 95 : 18, isPos ? 70 : 57);
  doc.text('ESTIMATED REMAINING BUFFER', margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(isPos ? 5 : 225, isPos ? 150 : 29, isPos ? 105 : 72);
  doc.text(`${isPos ? '$' : '-$'}${Math.abs(Math.round(data.remainingCashFlow)).toLocaleString()} / mo`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(isPos ? 6 : 159, isPos ? 95 : 18, isPos ? 70 : 57);
  doc.text(isPos ? `Discretionary cash-flow cushion` : `Operating monthly deficit`, margin + 4, y + 17.5);

  // Card 4: Savings Rate
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ACTIVE SAVINGS RATE', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.savingsRate.toFixed(1)}%`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`$${Math.round(data.savingsMonthly).toLocaleString()}/mo directed to savings & investing`, margin + cardW + 10, y + 17.5);

  y += cardH + 7;

  // Section 1: Itemized Cash-Flow Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Categorized Monthly Outflows Breakdown', margin, y);
  y += 4.5;

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('SPENDING CATEGORY', margin + 2, y);
  doc.text('MONTHLY AMOUNT', margin + 110, y, { align: 'right' });
  doc.text('% OF TAKE-HOME', pageWidth - margin - 4, y, { align: 'right' });
  y += 6;

  const flowRow = (label: string, amt: number, bg = false) => {
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.2, 'F');
    }
    const pct = (amt / (data.takeHomePay || 1)) * 100;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    doc.text(label, margin + 2, y);
    doc.text(`$${Math.round(amt).toLocaleString()}`, margin + 110, y, { align: 'right' });
    doc.text(`${pct.toFixed(1)}%`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5.2;
  };

  flowRow('Housing & Shelter (Rent/Mortgage)', data.housingCost, true);
  flowRow('Transportation (Auto loan, gas, transit)', data.transportCost);
  flowRow('Food & Groceries (Essential supermarkets)', data.groceriesFood, true);
  flowRow('Dining Out, Coffee & Bars', data.diningOut);
  flowRow('Debt Obligations (Credit cards, loans)', data.debtPayments, true);
  flowRow('Digital Subscriptions & Streaming', data.subscriptionsDigital);
  flowRow('Utilities, Internet & Mobile Phone', data.utilitiesPhone, true);
  flowRow('Personal Shopping & Lifestyle', data.lifestyleShopping);
  flowRow('Active Monthly Savings Contribution', data.savingsMonthly, true);

  y += 5;

  // Section 2: 50/30/20 Framework Evaluation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. 50/30/20 Budget Framework Evaluation', margin, y);
  y += 4.5;

  const bCardW = (contentWidth - 6) / 3;
  const bCard = (name: string, target: string, actual: number, x: number) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, bCardW, 20, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(name, x + 3, y + 5);
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text(`${actual.toFixed(1)}%`, x + 3, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Target guideline: ${target}`, x + 3, y + 16.5);
  };

  bCard('NEEDS (Fixed Essentials)', '≤ 50%', data.needsPct, margin);
  bCard('WANTS (Discretionary)', '≤ 30%', data.wantsPct, margin + bCardW + 3);
  bCard('SAVINGS & DEBT PAYDOWN', '≥ 20%', data.savingsPct, margin + (bCardW * 2) + 6);

  drawHeaderFooter(doc, 'Cash-Flow & Budget Report', reportId, 1, 1);
  return doc;
}

// -------------------------------------------------------------
// 5. HOLISTIC LIFE COST PDF
// -------------------------------------------------------------
export interface LifeCostPDFData {
  takeHomePay: number;
  hourlyWage: number;
  housing: number;
  transportation: number;
  foodGroceries: number;
  healthcare: number;
  debtObligations: number;
  subscriptions: number;
  entertainmentTravel: number;
  familyPersonal: number;
  savingsMonthly: number;
  monthlyCostOfLiving: number;
  annualCostOfLiving: number;
  survivalCost: number;
  hoursToSurvive: number;
  workDaysForFixed: number;
  discretionaryBuffer: number;
  savingsRate: number;
}

export function generateLifeCostPDF(data: LifeCostPDFData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const reportId = `LIF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  let y = margin;

  // Banner
  drawBanner(
    doc,
    margin,
    y,
    contentWidth,
    pageWidth,
    'What Is My Life Costing Me?',
    'Holistic Living Cost & Work-Hours Financial Conversion',
    `Prepared: ${reportDate}`,
    [15, 23, 42]
  );
  y += 29;

  // 4 Top Key Metrics
  const cardW = (contentWidth - 6) / 2;
  const cardH = 20;

  // Card 1: Monthly Cost of Living
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL MONTHLY LIVING BASELINE', margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(data.monthlyCostOfLiving).toLocaleString()} / mo`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Annual baseline living cost: $${Math.round(data.annualCostOfLiving).toLocaleString()}`, margin + 4, y + 17.5);

  // Card 2: Work Hours to Cover Survival
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(153, 246, 228);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 118, 110);
  doc.text('WORK HOURS TO COVER SURVIVAL', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(13, 148, 136);
  doc.text(`${Math.round(data.hoursToSurvive)} hrs / mo`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(15, 118, 110);
  doc.text(`~${data.workDaysForFixed.toFixed(1)} work days/mo just to pay survival obligations`, margin + cardW + 10, y + 17.5);

  y += cardH + 4;

  // Card 3: Hourly Life Cost Burn Rate
  const hourlyBurn = data.monthlyCostOfLiving / 160;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('HOURLY LIFE COST BURN RATE', margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${hourlyBurn.toFixed(2)} / hr`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Based on 160 monthly full-time working hours`, margin + 4, y + 17.5);

  // Card 4: Discretionary Surplus
  const isPos = data.discretionaryBuffer >= 0;
  doc.setFillColor(isPos ? 236 : 254, isPos ? 253 : 242, isPos ? 245 : 242);
  doc.setDrawColor(isPos ? 167 : 254, isPos ? 243 : 205, isPos ? 208 : 211);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(isPos ? 6 : 159, isPos ? 95 : 18, isPos ? 70 : 57);
  doc.text('MONTHLY DISCRETIONARY BUFFER', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(isPos ? 5 : 225, isPos ? 150 : 29, isPos ? 105 : 72);
  doc.text(`${isPos ? '$' : '-$'}${Math.abs(Math.round(data.discretionaryBuffer)).toLocaleString()} / mo`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(isPos ? 6 : 159, isPos ? 95 : 18, isPos ? 70 : 57);
  doc.text(isPos ? `Uncommitted surplus after all living categories` : `Monthly operating deficit`, margin + cardW + 10, y + 17.5);

  y += cardH + 7;

  // Section 1: Itemized Life Cost Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Itemized Holistic Living Expenses', margin, y);
  y += 4.5;

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('LIVING CATEGORY', margin + 2, y);
  doc.text('MONTHLY', margin + 110, y, { align: 'right' });
  doc.text('WORK HOURS EQUIVALENT', pageWidth - margin - 4, y, { align: 'right' });
  y += 6;

  const lifeRow = (label: string, amt: number, bg = false) => {
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.2, 'F');
    }
    const hrs = data.hourlyWage > 0 ? (amt / data.hourlyWage).toFixed(1) : '—';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    doc.text(label, margin + 2, y);
    doc.text(`$${Math.round(amt).toLocaleString()}`, margin + 110, y, { align: 'right' });
    doc.text(`${hrs} hrs`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5.2;
  };

  lifeRow('Housing & Shelter (Mortgage/Rent & Utilities)', data.housing, true);
  lifeRow('Transportation (Vehicle loan, fuel & upkeep)', data.transportation);
  lifeRow('Groceries & Essential Nutrition', data.foodGroceries, true);
  lifeRow('Healthcare, Dental & Wellness', data.healthcare);
  lifeRow('Debt Obligations & Student Loans', data.debtObligations, true);
  lifeRow('Digital Subscriptions & Media', data.subscriptions);
  lifeRow('Dining Out, Travel & Entertainment', data.entertainmentTravel, true);
  lifeRow('Family, Pets & Personal Expenses', data.familyPersonal);
  lifeRow('Active Savings & Investment Contributions', data.savingsMonthly, true);

  drawHeaderFooter(doc, 'Holistic Life Cost Report', reportId, 1, 1);
  return doc;
}

// -------------------------------------------------------------
// 6. AFFORDABILITY SIMULATOR PDF
// -------------------------------------------------------------
export interface AffordabilityPDFData {
  calculations: FinancialCalculations;
  scenarios: AffordabilityScenario[];
  activeScenario: AffordabilityScenario;
}

export function generateAffordabilityPDF(data: AffordabilityPDFData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const reportId = `AFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  let y = margin;

  // Banner
  drawBanner(
    doc,
    margin,
    y,
    contentWidth,
    pageWidth,
    'Can I Actually Afford This?',
    `Decision Simulation: ${data.activeScenario.title}`,
    `Prepared: ${reportDate}`,
    [15, 23, 42]
  );
  y += 29;

  // 4 Top Key Metrics
  const cardW = (contentWidth - 6) / 2;
  const cardH = 20;

  // Card 1: Current Baseline Buffer
  const currBuf = data.calculations.monthlyRemainingCashFlow;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CURRENT BASELINE MONTHLY BUFFER', margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(currBuf).toLocaleString()} / mo`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Take-home pay: $${Math.round(data.calculations.estimatedMonthlyTakeHome).toLocaleString()}/mo`, margin + 4, y + 17.5);

  // Card 2: Simulated New Total Monthly Outflow Impact
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('NEW MONTHLY COMMITMENT IMPACT', margin + cardW + 10, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`+$${Math.round(data.activeScenario.additionalMonthlyCost).toLocaleString()} / mo`, margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment: $${Math.round(data.activeScenario.monthlyPayment).toLocaleString()} + $${Math.round(data.activeScenario.insuranceIncrease + data.activeScenario.maintenanceOther).toLocaleString()} upkeep`, margin + cardW + 10, y + 17.5);

  y += cardH + 4;

  // Card 3: New Remaining Buffer After Decision
  const newBuf = data.activeScenario.newRemainingCashFlow;
  const isPos = newBuf >= 0;
  doc.setFillColor(isPos ? 236 : 254, isPos ? 253 : 242, isPos ? 245 : 242);
  doc.setDrawColor(isPos ? 167 : 254, isPos ? 243 : 205, isPos ? 208 : 211);
  doc.roundedRect(margin, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(isPos ? 6 : 159, isPos ? 95 : 18, isPos ? 70 : 57);
  doc.text('PROJECTED BUFFER AFTER PURCHASE', margin + 4, y + 5.5);
  doc.setFontSize(14);
  doc.setTextColor(isPos ? 5 : 225, isPos ? 150 : 29, isPos ? 105 : 72);
  doc.text(`${isPos ? '$' : '-$'}${Math.abs(Math.round(newBuf)).toLocaleString()} / mo`, margin + 4, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(isPos ? 6 : 159, isPos ? 95 : 18, isPos ? 70 : 57);
  doc.text(isPos ? `Remaining discretionary safety cushion` : `Pushes monthly finances into deficit`, margin + 4, y + 17.5);

  // Card 4: Affordability Verdict
  const isAffordable = data.activeScenario.newRemainingCashFlow >= 0;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + cardW + 6, y, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DECISION VERDICT', margin + cardW + 10, y + 5.5);
  doc.setFontSize(12);
  doc.setTextColor(isAffordable ? 5 : 225, isAffordable ? 150 : 29, isAffordable ? 105 : 72);
  doc.text(isAffordable ? 'SUSTAINABLE FIT' : 'TIGHT CASH-FLOW', margin + cardW + 10, y + 13);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${((data.activeScenario.additionalMonthlyCost / (data.calculations.estimatedMonthlyTakeHome || 1)) * 100).toFixed(1)}% of take-home pay`, margin + cardW + 10, y + 17.5);

  y += cardH + 7;

  // Section 1: Scenarios Comparison Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Simulated Decision Scenarios Comparison', margin, y);
  y += 4.5;

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('SCENARIO OPTION', margin + 2, y);
  doc.text('CATEGORY', margin + 65, y);
  doc.text('MONTHLY IMPACT', margin + 115, y, { align: 'right' });
  doc.text('NEW BUFFER', margin + 150, y, { align: 'right' });
  doc.text('STATUS', pageWidth - margin - 4, y, { align: 'right' });
  y += 6;

  data.scenarios.forEach((sc, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.2, 'F');
    }
    const scAffordable = sc.newRemainingCashFlow >= 0;
    doc.setFont('helvetica', sc.id === data.activeScenario.id ? 'bold' : 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(sc.id === data.activeScenario.id ? 15 : 71, sc.id === data.activeScenario.id ? 23 : 85, sc.id === data.activeScenario.id ? 42 : 105);
    doc.text(sc.title, margin + 2, y);
    doc.text(sc.category.toUpperCase(), margin + 65, y);
    doc.text(`+$${Math.round(sc.additionalMonthlyCost).toLocaleString()}`, margin + 115, y, { align: 'right' });
    doc.text(`$${Math.round(sc.newRemainingCashFlow).toLocaleString()}`, margin + 150, y, { align: 'right' });
    doc.text(scAffordable ? 'PASS' : 'RISK', pageWidth - margin - 4, y, { align: 'right' });
    y += 5.2;
  });

  drawHeaderFooter(doc, 'Affordability Simulator Report', reportId, 1, 1);
  return doc;
}

// -------------------------------------------------------------
// 7. GENERAL INCOME REALITY PDF (Exported Main Report)
// -------------------------------------------------------------
export function generateIncomeRealityPDF(
  calc: FinancialCalculations,
  formData: FinancialFormData,
  aiSummary: AISummaryResponse | null
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const stateName = US_STATES.find((s) => s.code === formData.income.state)?.name || formData.income.state;
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const reportId = `AFZ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Helper for drawing headers
  const addHeaderFooter = (pageNumber: number, totalPages: number) => {
    // Header
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('AFFINZO — INCOME REALITY REPORT', margin, 10);
    doc.text(`REPORT ID: ${reportId}`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Confidential Educational Financial Analysis • Not Financial Advice', margin, pageHeight - 8);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // Helper for section header
  const drawSectionTitle = (title: string, sub?: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title, margin, y);
    y += 5;
    if (sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(sub, margin, y);
      y += 4;
    }
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // PAGE 1: COVER & EXECUTIVE SNAPSHOT
  // Title Banner
  doc.setFillColor(15, 23, 42); // Navy primary
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('AFFINZO', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text('Income Reality & Cash Flow Analysis Report', margin + 6, y + 18);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Prepared: ${reportDate} • State: ${stateName} • Filing: ${formData.income.filingStatus.replace('_', ' ').toUpperCase()}`, pageWidth - margin - 6, y + 17, { align: 'right' });

  y += 32;

  // Disclaimer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('EDUCATIONAL PLANNING TOOL NOTICE:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This report contains estimates based on user-provided inputs and simplified tax estimation models. It is designed for informational planning and does NOT constitute certified financial, tax, or investment advice.',
    margin + 4,
    y + 9.5,
    { maxWidth: contentWidth - 8 }
  );

  y += 19;

  // 4 Large Key Snapshot Cards
  drawSectionTitle('1. Executive Financial Snapshot', 'Core estimated monthly figures and cash-flow positioning.');

  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 22;

  // Card 1: Estimated Monthly Take-Home
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('ESTIMATED MONTHLY TAKE-HOME', margin + 4, y + 6);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(calc.estimatedMonthlyTakeHome).toLocaleString()}`, margin + 4, y + 14);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Annual gross: $${Math.round(calc.grossAnnualIncome).toLocaleString()}`, margin + 4, y + 19);

  // Card 2: Total Monthly Expenses
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardWidth + 6, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL MONTHLY EXPENSES', margin + cardWidth + 10, y + 6);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(calc.totalMonthlyExpenses).toLocaleString()}`, margin + cardWidth + 10, y + 14);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Housing, transit & living essentials`, margin + cardWidth + 10, y + 19);

  y += cardHeight + 4;

  // Card 3: Monthly Debt Payments
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('MONTHLY DEBT OBLIGATIONS', margin + 4, y + 6);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${Math.round(calc.monthlyDebtTotal).toLocaleString()}`, margin + 4, y + 14);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${calc.debtToIncomeRatio.toFixed(1)}% of net monthly take-home`, margin + 4, y + 19);

  // Card 4: Estimated Monthly Remaining
  const isPositive = calc.monthlyRemainingCashFlow >= 0;
  doc.setFillColor(isPositive ? 236 : 254, isPositive ? 253 : 242, isPositive ? 245 : 242);
  doc.setDrawColor(isPositive ? 167 : 254, isPositive ? 243 : 205, isPositive ? 208 : 211);
  doc.roundedRect(margin + cardWidth + 6, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(isPositive ? 6 : 159, isPositive ? 95 : 18, isPositive ? 70 : 57);
  doc.text('ESTIMATED MONTHLY REMAINING', margin + cardWidth + 10, y + 6);
  doc.setFontSize(14);
  doc.setTextColor(isPositive ? 5 : 225, isPositive ? 150 : 29, isPositive ? 105 : 72);
  doc.text(
    `${isPositive ? '$' : '-$'}${Math.abs(Math.round(calc.monthlyRemainingCashFlow)).toLocaleString()}`,
    margin + cardWidth + 10,
    y + 14
  );
  doc.setFontSize(7.5);
  doc.setTextColor(isPositive ? 6 : 159, isPositive ? 95 : 18, isPositive ? 70 : 57);
  doc.text(
    isPositive ? `Discretionary cash-flow cushion (${calc.remainingCashFlowRate.toFixed(1)}%)` : `Monthly deficit before adjustments`,
    margin + cardWidth + 10,
    y + 19
  );

  y += cardHeight + 8;

  // Section 2: Income & Estimated Taxes Breakdown Table
  drawSectionTitle('2. Income & Estimated Taxes Breakdown', 'Calculations are estimates using 2024/2025 federal tax brackets and state rates.');

  const tableRow = (label: string, annualVal: number, monthlyVal: number, pct?: string, isBold = false, bg = false) => {
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
    }
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
    doc.text(label, margin + 2, y);
    doc.text(`$${Math.round(annualVal).toLocaleString()}`, margin + 85, y, { align: 'right' });
    doc.text(`$${Math.round(monthlyVal).toLocaleString()}`, margin + 130, y, { align: 'right' });
    doc.text(pct || '—', pageWidth - margin - 4, y, { align: 'right' });
    y += 5.5;
  };

  // Table header
  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('LINE ITEM', margin + 2, y);
  doc.text('ANNUAL', margin + 85, y, { align: 'right' });
  doc.text('MONTHLY', margin + 130, y, { align: 'right' });
  doc.text('% OF GROSS', pageWidth - margin - 4, y, { align: 'right' });
  y += 6.5;

  tableRow('Gross Annual Compensation', calc.grossAnnualIncome, calc.grossMonthlyIncome, '100.0%', true, true);
  tableRow('Est. Federal Income Tax', calc.estimatedFederalTaxAnnual, calc.estimatedFederalTaxAnnual / 12, `${((calc.estimatedFederalTaxAnnual / (calc.grossAnnualIncome || 1)) * 100).toFixed(1)}%`);
  tableRow(`Est. State Income Tax (${stateName})`, calc.estimatedStateTaxAnnual, calc.estimatedStateTaxAnnual / 12, `${((calc.estimatedStateTaxAnnual / (calc.grossAnnualIncome || 1)) * 100).toFixed(1)}%`, false, true);
  tableRow('Est. FICA Tax (Social Security & Medicare)', calc.estimatedFicaTaxAnnual, calc.estimatedFicaTaxAnnual / 12, `${((calc.estimatedFicaTaxAnnual / (calc.grossAnnualIncome || 1)) * 100).toFixed(1)}%`);
  tableRow('Total Estimated Tax Withholdings', calc.estimatedTotalTaxAnnual, calc.estimatedTotalTaxAnnual / 12, `${(calc.effectiveTaxRate * 100).toFixed(1)}%`, true, true);
  tableRow('Estimated Net Take-Home Pay', calc.estimatedAnnualTakeHome, calc.estimatedMonthlyTakeHome, `${((calc.estimatedAnnualTakeHome / (calc.grossAnnualIncome || 1)) * 100).toFixed(1)}%`, true);

  y += 4;

  // Section 3: Monthly Cash Flow Allocation
  drawSectionTitle('3. Monthly Cash Flow Allocation', 'How monthly take-home pay is allocated across commitments.');

  // Cash Flow Table
  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CATEGORY', margin + 2, y);
  doc.text('MONTHLY AMOUNT', margin + 110, y, { align: 'right' });
  doc.text('% OF TAKE-HOME', pageWidth - margin - 4, y, { align: 'right' });
  y += 6.5;

  const flowRow = (cat: string, amt: number, pct: number, bg = false) => {
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3.5, contentWidth, 5.2, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(cat, margin + 2, y);
    doc.text(`$${Math.round(amt).toLocaleString()}`, margin + 110, y, { align: 'right' });
    doc.text(`${pct.toFixed(1)}%`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5.2;
  };

  flowRow('Housing (Rent/Mortgage, Utilities, Insurance, Tax)', calc.monthlyHousingTotal, calc.housingBurdenRatio, true);
  flowRow('Transportation (Vehicle, Gas, Transit, Maintenance)', calc.monthlyTransportTotal, (calc.monthlyTransportTotal / (calc.estimatedMonthlyTakeHome || 1)) * 100);
  flowRow('Living & Food (Groceries, Dining, Phone, Personal)', calc.monthlyLivingTotal, (calc.monthlyLivingTotal / (calc.estimatedMonthlyTakeHome || 1)) * 100, true);
  flowRow('Debt Obligations (Credit Cards, Student/Personal Loans)', calc.monthlyDebtTotal, calc.debtToIncomeRatio);
  flowRow('Active Savings & Retirement Contributions', calc.monthlySavingsTotal, calc.savingsRate, true);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Estimated Monthly Unallocated Cash Flow', margin + 2, y);
  doc.text(`$${Math.round(calc.monthlyRemainingCashFlow).toLocaleString()}`, margin + 110, y, { align: 'right' });
  doc.text(`${calc.remainingCashFlowRate.toFixed(1)}%`, pageWidth - margin - 4, y, { align: 'right' });
  y += 8;

  // PAGE 2: INDICATORS, AI ANALYSIS & METHODOLOGY
  doc.addPage();
  y = margin;

  // Section 4: Financial Indicators
  drawSectionTitle('4. Key Financial Health Indicators', 'Evaluated using transparent benchmark standards without subjective judgment.');

  calc.indicators.forEach((ind) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 16.5, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(ind.title, margin + 4, y + 5);

    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(ind.value, margin + 85, y + 5);

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`[${ind.levelLabel}]`, margin + 110, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(ind.explanation, margin + 4, y + 10, { maxWidth: contentWidth - 8 });
    doc.text(`Formula: ${ind.formula}`, margin + 4, y + 14, { maxWidth: contentWidth - 8 });

    y += 19.5;
  });

  y += 2;

  // Section 5: AI-Generated Analysis & Key Observations
  drawSectionTitle('5. Financial Summary & Considerations', 'Synthesized educational overview and exploratory questions.');

  const summaryData = aiSummary || {
    executiveSummary: `Based on your reported gross compensation and estimated net take-home pay of $${Math.round(calc.estimatedMonthlyTakeHome).toLocaleString()}/mo, your current outflows represent $${Math.round(calc.totalMonthlyOutflows).toLocaleString()}/mo across essential living, debt, and active savings.`,
    cashFlowStatus: calc.monthlyRemainingCashFlow >= 0 ? 'Operating Surplus' : 'Operating Deficit',
    biggestExpenseDrivers: calc.categoryBreakdown.slice(0, 3).map((c) => ({
      category: c.name,
      monthlyAmount: c.amount,
      shareOfTakeHome: `${c.percentageOfIncome.toFixed(1)}%`,
      observation: `Represents $${Math.round(c.amount).toLocaleString()}/mo (${c.percentageOfIncome.toFixed(1)}% of take-home pay).`,
    })),
    keyConsiderations: [
      `Your housing allocation stands at ${calc.housingBurdenRatio.toFixed(1)}% of estimated net income.`,
      `Debt service commitments require $${Math.round(calc.monthlyDebtTotal).toLocaleString()} each month.`,
      `Your current liquid savings provide approximately ${calc.emergencyFundMonths.toFixed(1)} months of emergency buffer.`,
    ],
    bufferAssessment: `Your current monthly buffer is estimated at $${Math.round(calc.monthlyRemainingCashFlow).toLocaleString()}/mo.`,
    generatedAt: reportDate,
    isAiGenerated: false,
  };

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE SYNTHESIS', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(summaryData.executiveSummary, margin + 4, y + 9.5, { maxWidth: contentWidth - 8 });
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('QUESTIONS & AREAS TO CONSIDER:', margin, y);
  y += 4.5;

  summaryData.keyConsiderations.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`• ${item}`, margin + 2, y, { maxWidth: contentWidth - 4 });
    y += 5.5;
  });

  y += 4;

  // Section 6: Assumptions & Limitations
  drawSectionTitle('6. Assumptions & Limitations', 'How numbers were derived and important disclaimers.');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const notes = [
    '1. Tax Estimates: Federal income tax is approximated using 2024/2025 IRS tax brackets and standard deductions. State taxes are estimated using representative state rate schedules.',
    '2. FICA Calculation: 6.2% Social Security up to wage ceiling and 1.45% Medicare (plus additional high-income Medicare surcharge where applicable) are modeled.',
    '3. Pre-Tax Deductions: Health insurance premiums, FSA/HSA, or pre-tax 401(k) payroll withholdings reduce gross taxable wages in practice; this model assumes standard post-tax baseline inputs unless specified.',
    '4. Disclaimer of Liability: Affordly provides educational cash-flow models and does not provide financial, legal, or tax advice. Consult a certified financial planner or CPA for individualized counsel.',
  ];

  notes.forEach((n) => {
    doc.text(n, margin, y, { maxWidth: contentWidth });
    y += 5;
  });

  // Apply Headers & Footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  return doc;
}
