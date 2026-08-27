import React, { useState } from 'react';
import { 
  FileText, 
  ArrowRight, 
  PieChart, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  HelpCircle,
  Car,
  Home,
  DollarSign,
  HeartHandshake,
  Sliders,
  Zap,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { SAMPLE_PROFILE_STANDARD, SAMPLE_PROFILE_FAMILY } from '../utils/sampleData';
import { FinancialFormData } from '../types/financial';

interface LandingPageProps {
  onStartReport: () => void;
  onLoadSample: (sample: FinancialFormData) => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartReport,
  onLoadSample,
  onNavigate,
}) => {
  // State for interactive Price vs Real Cost demo widget on the homepage
  const [activeTab, setActiveTab] = useState<'car' | 'rent' | 'salary'>('car');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      
      {/* 1. Hero Section - Core Intent & Positioning */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-18 sm:py-24 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-bold text-emerald-400 mb-6 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Don't just calculate the number. Understand what it means for your life.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]">
              What Will Your Life <br className="hidden sm:inline" />
              <span className="text-emerald-400">Actually Cost?</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="mt-6 text-base sm:text-xl font-normal leading-relaxed text-slate-300 max-w-2xl mx-auto">
              Affinzo helps you look beyond the sticker price. Understand how your income, fixed living expenses, and major purchases affect your real monthly cash flow.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                id="hero-primary-find-out-cta"
                onClick={onStartReport}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-extrabold text-slate-950 shadow-lg hover:bg-emerald-400 transition-all hover:shadow-emerald-500/20 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 cursor-pointer"
              >
                <span>Find Out What You Can Actually Afford</span>
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </button>

              <button
                id="hero-secondary-simulator-btn"
                onClick={() => onNavigate('affordability')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-4 text-sm font-bold text-white shadow-xs hover:bg-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              >
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>Test a Purchase Decision</span>
              </button>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
              <span className="font-medium text-slate-400">Or preview with instant profiles:</span>
              <button
                onClick={() => onLoadSample(SAMPLE_PROFILE_STANDARD)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:border-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                $85k Single Pro (TX)
              </button>
              <button
                onClick={() => onLoadSample(SAMPLE_PROFILE_FAMILY)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:border-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                $135k Joint Household (CA)
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE CORE CONCEPT: The Price Isn't the Real Cost (Interactive Showcase) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Affinzo's Core Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              The Price Isn't the Real Cost
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Sticker prices and salary numbers are misleading. Here is what things actually mean when broken down into monthly cash flow:
            </p>
          </div>

          {/* Interactive Switcher */}
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-8">
              <button
                onClick={() => setActiveTab('car')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'car'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Car className="h-4 w-4 text-emerald-400" />
                <span>A $30,000 Car</span>
              </button>

              <button
                onClick={() => setActiveTab('rent')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'rent'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Home className="h-4 w-4 text-sky-400" />
                <span>$2,000 / Mo Rent</span>
              </button>

              <button
                onClick={() => setActiveTab('salary')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'salary'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <DollarSign className="h-4 w-4 text-purple-400" />
                <span>An $85,000 Salary</span>
              </button>
            </div>

            {/* Tab Content 1: Car */}
            {activeTab === 'car' && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10 shadow-sm transition-all animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 mb-3">
                      <span>The Sticker Myth</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      $30,000 isn't the real cost of owning the car.
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      A $30,000 purchase price translates to a ~$480/mo loan payment. But once you add insurance, gas, tires, registration, and upkeep, that vehicle demands over $1,000 every month from your paycheck.
                    </p>
                    <button
                      onClick={() => onNavigate('car-cost')}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>Explore: "What Will This Car Actually Cost Me?"</span>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-600">Base Loan Payment (60 mo):</span>
                      <span className="font-bold text-slate-900">$480 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Auto Insurance Premium:</span>
                      <span className="font-medium text-slate-900">+$175 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Fuel / Charging:</span>
                      <span className="font-medium text-slate-900">+$180 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Maintenance & Tires:</span>
                      <span className="font-medium text-slate-900">+$85 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Registration, Taxes & Parking:</span>
                      <span className="font-medium text-slate-900">+$75 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200 font-extrabold text-slate-900">
                      <span className="text-emerald-700">Real Monthly Outflow:</span>
                      <span className="text-base text-emerald-700">$995 / month</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: Rent */}
            {activeTab === 'rent' && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10 shadow-sm transition-all animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 mb-3">
                      <span>The Lease Myth</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      Your $2,000 rent isn't a $2,000 monthly expense.
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      Landlord lease rates exclude power, water, high-speed fiber, parking spaces, renter's insurance, and building amenities. The real shelter commitment is often 20-30% higher.
                    </p>
                    <button
                      onClick={() => onNavigate('rent-cost')}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>Explore: "How Much Will This Rent Really Cost Me?"</span>
                      <ArrowRight className="h-3.5 w-3.5 text-sky-400" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-600">Base Advertised Rent:</span>
                      <span className="font-bold text-slate-900">$2,000 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Electricity & Gas:</span>
                      <span className="font-medium text-slate-900">+$125 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Water, Sewer & Trash:</span>
                      <span className="font-medium text-slate-900">+$55 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Internet & Insurance:</span>
                      <span className="font-medium text-slate-900">+$95 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Parking & Amenities:</span>
                      <span className="font-medium text-slate-900">+$170 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200 font-extrabold text-slate-900">
                      <span className="text-sky-700">Real Monthly Shelter Cost:</span>
                      <span className="text-base text-sky-700">$2,445 / month</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 3: Salary */}
            {activeTab === 'salary' && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10 shadow-sm transition-all animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 mb-3">
                      <span>The Gross Salary Myth</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      Your $85,000 salary isn't the amount you take home.
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      Federal brackets, state withholding, Social Security, Medicare, healthcare premiums, and 401(k) contributions turn $7,083/mo gross into ~$5,150/mo real spendable take-home cash.
                    </p>
                    <button
                      onClick={() => onNavigate('income-takehome')}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>Explore: "What Will I Actually Take Home?"</span>
                      <ArrowRight className="h-3.5 w-3.5 text-purple-400" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-600">Gross Monthly Earnings:</span>
                      <span className="font-bold text-slate-900">$7,083 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-600">
                      <span>Federal Income Tax:</span>
                      <span className="font-medium">-$810 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-600">
                      <span>FICA (Social Security & Medicare):</span>
                      <span className="font-medium">-$542 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-600">
                      <span>State Income Tax (e.g. NC/VA/IL):</span>
                      <span className="font-medium">-$295 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-purple-600">
                      <span>401(k) & Health Insurance:</span>
                      <span className="font-medium">-$550 / mo</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200 font-extrabold text-slate-900">
                      <span className="text-emerald-700">Actual Spendable Take-Home:</span>
                      <span className="text-base text-emerald-700">$4,886 / month</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 3. QUESTION-DRIVEN DECISION CENTERS: The Real Questions People Ask */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Search Intent & Real Decisions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Real Questions. Real Answers.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Choose the question you are trying to answer today:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Question 1: Car */}
            <div 
              onClick={() => onNavigate('car-cost')}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white mb-4 group-hover:scale-105 transition-transform">
                  <Car className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  "What will this car actually cost me?"
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  A $30,000 car doesn't cost $30,000. Calculate monthly loan payments, insurance, fuel, maintenance, and registration.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Vehicle Real Cost Tool</span>
                <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Question 2: Rent */}
            <div 
              onClick={() => onNavigate('rent-cost')}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white mb-4 group-hover:scale-105 transition-transform">
                  <Home className="h-5 w-5 text-sky-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  "How much will this rent really cost me?"
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Rent isn't the entire housing cost. Itemize utilities, parking, fees, renter's insurance, and find out what salary is required.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Housing Real Cost Tool</span>
                <ArrowRight className="h-4 w-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Question 3: Income / Take-Home */}
            <div 
              onClick={() => onNavigate('income-takehome')}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white mb-4 group-hover:scale-105 transition-transform">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  "What will I actually take home from my salary?"
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Model progressive federal taxes, all 50 state tax schedules, FICA, healthcare, and retirement deductions for real net pay.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Take-Home Pay Tool</span>
                <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Question 4: Budget / Where Going */}
            <div 
              onClick={() => onNavigate('budget-flow')}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white mb-4 group-hover:scale-105 transition-transform">
                  <PieChart className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  "Where is my money actually going?"
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Your income is only half the story. See how shelter, transport, food, debt minimums, and subscriptions consume your cash.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Cash Flow Breakdown</span>
                <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Question 5: Can I Afford This? */}
            <div 
              onClick={() => onNavigate('affordability')}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white mb-4 group-hover:scale-105 transition-transform">
                  <Sliders className="h-5 w-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                  "Can I actually afford this?"
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Test cars, apartment upgrades, vacations, personal loans, or subscriptions against your real monthly cash flow buffer.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Scenario Simulator</span>
                <ArrowRight className="h-4 w-4 text-rose-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Question 6: Life Cost */}
            <div 
              onClick={() => onNavigate('life-cost')}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white mb-4 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  "What is my life actually costing me?"
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Understand your true holistic cost of living. Calculate your monthly commitments and days of work needed each month.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Holistic Life Cost Analyzer</span>
                <ArrowRight className="h-4 w-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Complete Comprehensive 5-Step Report CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-900 bg-slate-900 p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20 mb-5">
                <FileText className="h-3.5 w-3.5" />
                <span>Comprehensive Assessment</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Ready to see your complete financial picture?
              </h2>

              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Build a 5-step Income Reality Report mapping all your income, taxes, fixed shelter, transportation, debt obligations, and discretionary spending. Export an official PDF report anytime.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  id="cta-start-report-btn"
                  onClick={onStartReport}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-md hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-slate-950" />
                  <span>Build My Income Reality Report</span>
                </button>

                <button
                  onClick={() => onNavigate('privacy')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-slate-400" />
                  <span>Local Private Storage Guarantee</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
