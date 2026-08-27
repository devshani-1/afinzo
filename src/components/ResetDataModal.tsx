import React from 'react';
import { Trash2, AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="reset-data-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="reset-data-modal-container"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-7"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        {/* Header with icon and close */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <Trash2 className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-2">
          <h3 id="reset-modal-title" className="text-lg font-bold text-slate-900">
            Delete All Stored Financial Data?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            This will immediately remove all entered income numbers, debt obligations, living expenses, custom affordability simulator scenarios, and AI analysis reports from your browser’s local storage (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">localStorage</code>).
          </p>
        </div>

        {/* Reassurance note */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Because Affinzo operates with local-first privacy, your data lives solely on this device. Once deleted, it cannot be recovered.
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
          <button
            id="reset-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="inline-flex justify-center items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="reset-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="inline-flex justify-center items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Yes, Delete All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
