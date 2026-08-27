import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onNavigateHome: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Standard Terms</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-600">
            Affinzo Web Application
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Affinzo application, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Educational Use Only</h2>
            <p>
              Affinzo is provided as a self-directed informational and educational software tool. Users are solely responsible for verifying the accuracy and relevance of any financial estimations produced.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Limitation of Liability</h2>
            <p>
              Under no circumstances shall Affinzo, its creators, or its affiliates be liable for any direct, indirect, incidental, consequential, or punitive damages resulting from the use or inability to use this software or reliance upon any reports generated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Modifications to the Service</h2>
            <p>
              Affinzo reserves the right to improve, update, or discontinue features of the application at any time without prior notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
