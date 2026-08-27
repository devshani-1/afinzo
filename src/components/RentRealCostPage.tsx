import React, { useState, useMemo } from 'react';
import { 
  Building, 
  ArrowLeft, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Wifi, 
  Car, 
  Key, 
  FileText, 
  Sliders, 
  HelpCircle,
  TrendingUp,
  Sparkles,
  Download
} from 'lucide-react';
import { FinancialFormData, FinancialCalculations } from '../types/financial';
import { generateRentCostPDF } from '../utils/pdfGenerator';

interface RentRealCostPageProps {
  formData: FinancialFormData;
  calculations: FinancialCalculations;
  onNavigate: (view: string) => void;
  onStartReport: () => void;
}

export const RentRealCostPage: React.FC<RentRealCostPageProps> = ({
  formData,
  calculations,
  onNavigate,
  onStartReport,
}) => {
  // Rent and Housing variables
  const [apartmentType, setApartmentType] = useState('1-Bedroom Urban Apartment');
  const [baseRent, setBaseRent] = useState<number>(2150);
  const [electricGas, setElectricGas] = useState<number>(125);
  const [waterSewerTrash, setWaterSewerTrash] = useState<number>(55);
  const [internet, setInternet] = useState<number>(75);
  const [rentersInsurance, setRentersInsurance] = useState<number>(20);
  const [parkingFee, setParkingFee] = useState<number>(125);
  const [amenityPetFees, setAmenityPetFees] = useState<number>(45);
  const [moveInFeesAmortized, setMoveInFeesAmortized] = useState<number>(75); // Application, admin, mover deposit amortized over 12mo

  // Presets
  const presets = [
    {
      name: 'Studio Apartment',
      base: 1450,
      electric: 85,
      water: 40,
      internet: 65,
      insurance: 15,
      parking: 50,
      amenity: 25,
      moveIn: 50,
    },
    {
      name: '1-Bedroom Urban',
      base: 2150,
      electric: 125,
      water: 55,
      internet: 75,
      insurance: 20,
      parking: 125,
      amenity: 45,
      moveIn: 75,
    },
    {
      name: '2-Bedroom Suburban',
      base: 2750,
      electric: 170,
      water: 75,
      internet: 85,
      insurance: 25,
      parking: 0, // included
      amenity: 50,
      moveIn: 90,
    },
    {
      name: '3-Bedroom Townhome',
      base: 3600,
      electric: 240,
      water: 95,
      internet: 95,
      insurance: 35,
      parking: 0,
      amenity: 70,
      moveIn: 120,
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setApartmentType(p.name);
    setBaseRent(p.base);
    setElectricGas(p.electric);
    setWaterSewerTrash(p.water);
    setInternet(p.internet);
    setRentersInsurance(p.insurance);
    setParkingFee(p.parking);
    setAmenityPetFees(p.amenity);
    setMoveInFeesAmortized(p.moveIn);
  };

  // Calculations
  const additionalHousingExpenses =
    electricGas +
    waterSewerTrash +
    internet +
    rentersInsurance +
    parkingFee +
    amenityPetFees +
    moveInFeesAmortized;

  const totalRealMonthlyHousing = baseRent + additionalHousingExpenses;
  const annualHousingCommitment = totalRealMonthlyHousing * 12;

  // Rules of thumb for salary needed:
  // 1. 40x rent rule (landlord standard): gross annual income = baseRent * 40
  const grossSalary40xRule = baseRent * 40;
  // 2. 30% gross rule on REAL housing: gross annual = (totalRealMonthlyHousing * 12) / 0.30
  const grossSalary30PercentRule = (totalRealMonthlyHousing * 12) / 0.3;
  // 3. 30% take-home rule: monthly take home needed = totalRealMonthlyHousing / 0.3
  const monthlyTakeHomeNeeded = totalRealMonthlyHousing / 0.3;

  // User's current numbers
  const userTakeHome = calculations.estimatedMonthlyTakeHome > 0 ? calculations.estimatedMonthlyTakeHome : 5500;
  const userCurrentBuffer = calculations.monthlyRemainingCashFlow;
  const currentExistingHousing = calculations.monthlyHousingTotal || 0;

  const shareOfTakeHome = (totalRealMonthlyHousing / userTakeHome) * 100;
  const newEstimatedBuffer = userCurrentBuffer - totalRealMonthlyHousing + currentExistingHousing;

  const isHealthyHousingRatio = shareOfTakeHome <= 33;
  const isPositiveCashFlow = newEstimatedBuffer >= 200;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = generateRentCostPDF({
        apartmentType,
        baseRent,
        electricGas,
        waterTrash: waterSewerTrash,
        internetFee: internet,
        parkingGarage: parkingFee,
        rentersInsurance,
        petRentOther: amenityPetFees,
        moveInFeesOneTime: moveInFeesAmortized * 12,
        totalRecurringUtilities: electricGas + waterSewerTrash + internet,
        totalRealMonthlyHousing,
        shareOfTakeHome,
        annualSalaryNeeded40x: grossSalary40xRule,
        recommendedTakeHomeMax: userTakeHome * 0.30,
        userTakeHome,
        userCurrentBuffer,
        newEstimatedBuffer,
        isAffordable40x: (calculations.estimatedTotalIncomeAnnual || userTakeHome * 14) >= grossSalary40xRule,
        isAffordable30Pct: isHealthyHousingRatio,
      });
      const filename = `rent-real-cost-report-${apartmentType.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating Rent Cost PDF:', err);
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
              className="inline-flex items-center gap-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/60 px-3.5 py-1 text-xs font-semibold text-sky-400 mb-4">
            <Building className="h-3.5 w-3.5" />
            <span>Search Intent & Real-Cost Decision</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How Much Will This Rent <span className="text-sky-400">Really Cost Me?</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            A ${baseRent.toLocaleString()} apartment isn't just a ${baseRent.toLocaleString()} monthly expense. Look beyond the listed price to see what utilities, parking, building fees, and renter's insurance actually do to your monthly cash flow.
          </p>

          {/* Quick Preset Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Load apartment example:</span>
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  apartmentType === p.name
                    ? 'bg-sky-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {p.name} (${p.base.toLocaleString()})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content & Interactive Tool */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Rent & Hidden Housing Costs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Base Rent Input Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">1. The Listed Sticker Price</h2>
                  <p className="text-xs text-slate-500 mt-0.5">The advertised base rent on the lease</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-400">Lease Base</span>
                  <div className="text-sm font-bold text-slate-900">${baseRent.toLocaleString()}/mo</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advertised Monthly Base Rent ($)
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    min={300}
                    step={50}
                    value={baseRent || ''}
                    onChange={(e) => setBaseRent(Number(e.target.value))}
                    className="block w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Hidden Utility & Amenity Add-ons */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">2. The True Living & Amenity Add-ons</h2>
                <p className="text-xs text-slate-500 mt-0.5">Mandatory utilities, insurance, parking, and building surcharges</p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Electricity & Gas</span>
                      <span className="text-[10px] text-slate-500">Heating, cooling, cooking energy</span>
                    </div>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={electricGas || ''}
                      onChange={(e) => setElectricGas(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Building className="h-4 w-4 text-blue-500" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Water, Sewer & Trash</span>
                      <span className="text-[10px] text-slate-500">Municipal water and valet trash</span>
                    </div>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={waterSewerTrash || ''}
                      onChange={(e) => setWaterSewerTrash(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Wifi className="h-4 w-4 text-indigo-500" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">High-Speed Internet</span>
                      <span className="text-[10px] text-slate-500">Broadband / fiber connection</span>
                    </div>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={internet || ''}
                      onChange={(e) => setInternet(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Renter's Insurance</span>
                      <span className="text-[10px] text-slate-500">Personal property & liability coverage</span>
                    </div>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={rentersInsurance || ''}
                      onChange={(e) => setRentersInsurance(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Car className="h-4 w-4 text-slate-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Reserved Parking Space</span>
                      <span className="text-[10px] text-slate-500">Garage or designated stall fee</span>
                    </div>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={parkingFee || ''}
                      onChange={(e) => setParkingFee(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Amenity & Pet Fees</span>
                      <span className="text-[10px] text-slate-500">Gym fee, package lockers, pet rent</span>
                    </div>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={amenityPetFees || ''}
                      onChange={(e) => setAmenityPetFees(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Key className="h-4 w-4 text-rose-500" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Move-in Surcharges (Amortized)</span>
                      <span className="text-[10px] text-slate-500">Application, admin, mover deposit / 12</span>
                    </div>
                  </div>
                  <div className="w-28 relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={moveInFeesAmortized || ''}
                      onChange={(e) => setMoveInFeesAmortized(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 pl-6 pr-2 py-1.5 text-xs text-right font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Add-on Living Expenses:</span>
                <span className="text-sm font-bold text-slate-900">+${Math.round(additionalHousingExpenses).toLocaleString()}/mo</span>
              </div>
            </div>

            {/* How Much Salary Do I Need To Afford This Rent? */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                How Much Salary Do I Need To Afford This Rent?
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Standard landlord standards vs. safe cash-flow benchmarks
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">40x Rent Rule (Landlord Standard)</span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">${Math.round(grossSalary40xRule).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">Gross annual salary</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">30% Gross Rule (Real Total)</span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">${Math.round(grossSalary30PercentRule).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">Gross annual salary</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">30% Net Take-Home</span>
                  <div className="text-base font-extrabold text-sky-700 mt-1">${Math.round(monthlyTakeHomeNeeded).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400">Net monthly paycheck</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Real Housing Total & Cash Flow Impact */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Total Real Housing Cost Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900 text-white p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Your Estimated Real Housing Cost</span>
                <span className="text-[10px] rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">All Included</span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-white">
                  ${Math.round(totalRealMonthlyHousing).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/ month</span>
              </div>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Your advertised rent is ${baseRent.toLocaleString()}/mo, but your real monthly shelter requirement is{' '}
                <strong className="text-sky-400">${Math.round(totalRealMonthlyHousing).toLocaleString()}/month</strong> (${Math.round(additionalHousingExpenses).toLocaleString()} in add-ons).
              </p>

              {/* Breakdown breakdown */}
              <div className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Lease Rent</span>
                  <span className="font-semibold text-white">${baseRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Utilities (Electric, Water, Net)</span>
                  <span className="font-semibold text-white">${Math.round(electricGas + waterSewerTrash + internet).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Parking, Insurance & Surcharges</span>
                  <span className="font-semibold text-white">${Math.round(rentersInsurance + parkingFee + amenityPetFees + moveInFeesAmortized).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-slate-400 text-[11px]">
                  <span>Annual Shelter Commitment:</span>
                  <span className="font-bold text-slate-200">${Math.round(annualHousingCommitment).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* How Would This Rent Affect Your Monthly Cash Flow? */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                How Would This Rent Affect Your Monthly Cash Flow?
              </h3>
              <p className="text-xs text-slate-500 mb-4">Cash flow before vs. after this lease</p>

              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Estimated Net Take-Home Pay</span>
                    <span className="text-[10px] text-slate-500">Based on user profile</span>
                  </div>
                  <span className="font-bold text-slate-900">${Math.round(userTakeHome).toLocaleString()}</span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Housing Share of Net Pay</span>
                    <span className="text-[10px] text-slate-500">Recommended benchmark: ≤30-33%</span>
                  </div>
                  <span className={`font-bold ${shareOfTakeHome > 33 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {shareOfTakeHome.toFixed(1)}%
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Current Cash-Flow Buffer:</span>
                    <span>${Math.round(userCurrentBuffer).toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Remaining Buffer After Rent:</span>
                    <span className={newEstimatedBuffer >= 0 ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                      ${Math.round(newEstimatedBuffer).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Affordability verdict */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Can I Afford This Apartment?</h3>

              {isHealthyHousingRatio && isPositiveCashFlow ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Comfortable Housing Buffer</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    This lease represents {shareOfTakeHome.toFixed(1)}% of your estimated monthly net take-home pay, leaving approximately ${Math.round(newEstimatedBuffer).toLocaleString()}/mo for living essentials, debt reduction, and savings.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Elevated Housing Burden</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Real housing expenses consume {shareOfTakeHome.toFixed(1)}% of estimated net income. Consider looking for an apartment with included utilities or lower parking fees to avoid monthly cash-flow strain.
                  </p>
                </div>
              )}

              {/* Call to action */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 py-2.5 text-xs font-bold text-slate-950 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-slate-950" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Rent Cost PDF Report'}</span>
                </button>
                <button
                  onClick={() => onNavigate('affordability')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5 text-sky-400" />
                  <span>Test with Affordability Simulator</span>
                </button>
                <button
                  onClick={onStartReport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>Create Complete Income Report</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
