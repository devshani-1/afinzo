import React, { useState, useEffect, useMemo } from 'react';
import { 
  FinancialFormData, 
  FinancialCalculations, 
  AISummaryResponse 
} from './types/financial';
import { DEFAULT_FORM_DATA, SAMPLE_PROFILE_STANDARD, SAMPLE_PROFILE_FAMILY } from './utils/sampleData';
import { runFullFinancialAnalysis } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ReportForm } from './components/ReportForm';
import { DashboardView } from './components/DashboardView';
import { AffordabilitySimulator } from './components/AffordabilitySimulator';
import { CarRealCostPage } from './components/CarRealCostPage';
import { RentRealCostPage } from './components/RentRealCostPage';
import { IncomeTakeHomePage } from './components/IncomeTakeHomePage';
import { BudgetWhereGoingPage } from './components/BudgetWhereGoingPage';
import { LifeCostPage } from './components/LifeCostPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { PrivacyPage } from './components/PrivacyPage';
import { DisclaimerPage } from './components/DisclaimerPage';
import { TermsPage } from './components/TermsPage';
import { ResetDataModal } from './components/ResetDataModal';
import { CheckCircle2, X } from 'lucide-react';

const LOCAL_STORAGE_FORM_KEY = 'affinzo_user_form_data';
const LOCAL_STORAGE_AI_KEY = 'affinzo_user_ai_summary';
const LOCAL_STORAGE_GENERATED_KEY = 'affinzo_has_generated';

export default function App() {
  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('landing');

  // Reset confirmation modal & success toast
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [showResetToast, setShowResetToast] = useState<boolean>(false);

  // Stored form data
  const [formData, setFormData] = useState<FinancialFormData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FORM_KEY) || localStorage.getItem('affordly_user_form_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse local storage form data:', e);
    }
    return DEFAULT_FORM_DATA;
  });

  // Flag if report has been generated at least once
  const [hasGeneratedReport, setHasGeneratedReport] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_GENERATED_KEY) === 'true' || localStorage.getItem('affordly_has_generated') === 'true';
    } catch {
      return false;
    }
  });

  // AI summary state
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_AI_KEY) || localStorage.getItem('affordly_user_ai_summary');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Sync form data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FORM_KEY, JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form to localStorage:', e);
    }
  }, [formData]);

  // Sync AI summary to localStorage
  useEffect(() => {
    try {
      if (aiSummary) {
        localStorage.setItem(LOCAL_STORAGE_AI_KEY, JSON.stringify(aiSummary));
      }
    } catch (e) {
      console.warn('Could not save AI summary to localStorage:', e);
    }
  }, [aiSummary]);

  // Deterministic calculation engine output
  const calculations: FinancialCalculations = useMemo(() => {
    return runFullFinancialAnalysis(formData);
  }, [formData]);

  // Fetch AI analysis from server API
  const fetchAiAnalysis = async (calcs: FinancialCalculations, form: FinancialFormData) => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/analyze-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calculations: calcs, formData: form }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.summary) {
        setAiSummary(data.summary);
      } else if (data && data.executiveSummary) {
        setAiSummary(data);
      } else {
        throw new Error('Invalid summary format from API');
      }
    } catch (err) {
      console.warn('Server AI call failed, generating deterministic fallback summary:', err);
      // Fallback deterministic summary if Gemini API is temporarily unreachable
      const fallbackSummary: AISummaryResponse = {
        executiveSummary: `Based on an estimated annual gross income of $${Math.round(calcs.grossAnnualIncome).toLocaleString()} in ${form.income.state}, your estimated monthly take-home pay is $${Math.round(calcs.estimatedMonthlyTakeHome).toLocaleString()}. After total monthly outflows of $${Math.round(calcs.totalMonthlyOutflows).toLocaleString()}, you retain an estimated monthly discretionary buffer of $${Math.round(calcs.monthlyRemainingCashFlow).toLocaleString()} (${calcs.remainingCashFlowRate.toFixed(1)}% of take-home pay).`,
        cashFlowStatus: calcs.monthlyRemainingCashFlow >= 0 ? 'Positive Surplus Buffer' : 'Monthly Deficit',
        biggestExpenseDrivers: calcs.categoryBreakdown.slice(0, 3).map((c) => ({
          category: c.name,
          monthlyAmount: Math.round(c.amount),
          shareOfTakeHome: `${c.percentageOfIncome.toFixed(1)}% of net pay`,
          observation: `${c.name} represents $${Math.round(c.amount).toLocaleString()} per month, making it one of your primary monthly cash allocations.`,
        })),
        keyConsiderations: [
          `Housing accounts for ${calcs.housingBurdenRatio.toFixed(1)}% of estimated net take-home pay (standard benchmark recommends keeping shelter under 30%).`,
          `Contractual debt service requires ${calcs.debtToIncomeRatio.toFixed(1)}% of net monthly income.`,
          `Current liquid savings cover approximately ${calcs.emergencyFundMonths.toFixed(1)} months of baseline living expenses.`,
        ],
        bufferAssessment: calcs.monthlyRemainingCashFlow >= 0 
          ? `Your unallocated cash-flow buffer provides agility for unexpected expenses or targeted savings.`
          : `Monthly outflows exceed estimated take-home pay. Review discretionary expenses and fixed obligations.`,
        generatedAt: new Date().toISOString(),
        isAiGenerated: false,
      };
      setAiSummary(fallbackSummary);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Generate Report action from form
  const handleGenerateReport = () => {
    setHasGeneratedReport(true);
    localStorage.setItem(LOCAL_STORAGE_GENERATED_KEY, 'true');
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAiAnalysis(calculations, formData);
  };

  // Load sample dataset
  const handleLoadSample = (sample: FinancialFormData) => {
    setFormData(sample);
    setHasGeneratedReport(true);
    localStorage.setItem(LOCAL_STORAGE_GENERATED_KEY, 'true');
    const newCalcs = runFullFinancialAnalysis(sample);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAiAnalysis(newCalcs, sample);
  };

  // Auto-dismiss reset success toast
  useEffect(() => {
    if (showResetToast) {
      const timer = setTimeout(() => {
        setShowResetToast(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [showResetToast]);

  // Open Reset Data Modal
  const handleOpenResetModal = () => {
    setIsResetModalOpen(true);
  };

  // Perform absolute data wipe and state reset
  const handleConfirmResetData = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage.clear encountered an issue, removing specific keys:', e);
      localStorage.removeItem(LOCAL_STORAGE_FORM_KEY);
      localStorage.removeItem(LOCAL_STORAGE_AI_KEY);
      localStorage.removeItem(LOCAL_STORAGE_GENERATED_KEY);
      localStorage.removeItem('affordly_user_form_data');
      localStorage.removeItem('affordly_user_ai_summary');
      localStorage.removeItem('affordly_has_generated');
    }
    setFormData(DEFAULT_FORM_DATA);
    setAiSummary(null);
    setHasGeneratedReport(false);
    setIsResetModalOpen(false);
    setShowResetToast(true);
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasExistingReport={hasGeneratedReport}
        onResetData={handleOpenResetModal}
      />

      {/* Main View Switcher */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLoadSample={handleLoadSample}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Real Cost Pages */}
        {currentView === 'car-cost' && (
          <CarRealCostPage
            formData={formData}
            calculations={calculations}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'rent-cost' && (
          <RentRealCostPage
            formData={formData}
            calculations={calculations}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'income-takehome' && (
          <IncomeTakeHomePage
            formData={formData}
            calculations={calculations}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'budget-flow' && (
          <BudgetWhereGoingPage
            formData={formData}
            calculations={calculations}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'life-cost' && (
          <LifeCostPage
            formData={formData}
            calculations={calculations}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'report' && (
          <ReportForm
            formData={formData}
            setFormData={setFormData}
            onGenerateReport={handleGenerateReport}
            onCancel={() => {
              setCurrentView(hasGeneratedReport ? 'dashboard' : 'landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            calculations={calculations}
            formData={formData}
            aiSummary={aiSummary}
            isLoadingAi={isLoadingAi}
            onRefreshAi={() => fetchAiAnalysis(calculations, formData)}
            onNavigateToAffordability={() => {
              setCurrentView('affordability');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onEditReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartNewReport={() => {
              setFormData(DEFAULT_FORM_DATA);
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'affordability' && (
          <AffordabilitySimulator
            calculations={calculations}
            formData={formData}
            setFormData={setFormData}
            onBackToDashboard={() => {
              setCurrentView(hasGeneratedReport ? 'dashboard' : 'landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksPage
            onStartReport={() => {
              setCurrentView('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyPage
            onResetData={handleOpenResetModal}
            onNavigateHome={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'disclaimer' && (
          <DisclaimerPage
            onNavigateHome={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'terms' && (
          <TermsPage
            onNavigateHome={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>

      {/* Global Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onResetData={handleOpenResetModal}
      />

      {/* Reset Data Confirmation Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmResetData}
      />

      {/* Success Toast Notification */}
      {showResetToast && (
        <div
          id="reset-success-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-900 text-white px-4 py-3 shadow-xl animate-in slide-in-from-bottom-5 duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">All Stored Data Erased</p>
            <p className="text-emerald-200">Local financial records and scenarios have been wiped.</p>
          </div>
          <button
            onClick={() => setShowResetToast(false)}
            className="ml-2 rounded p-1 text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
