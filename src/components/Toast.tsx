'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let borderColor = 'border-l-4 border-l-[#1793E8]';
        let Icon = Info;
        let iconColor = 'text-[#1793E8]';

        if (toast.type === 'success') {
          borderColor = 'border-l-4 border-l-[#1FA579]';
          Icon = CheckCircle2;
          iconColor = 'text-[#1FA579]';
        } else if (toast.type === 'warning' || toast.type === 'error') {
          borderColor = 'border-l-4 border-l-[#E9A23B]';
          Icon = AlertCircle;
          iconColor = 'text-[#E9A23B]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[var(--navy-raised)] border border-[var(--navy-line)] ${borderColor} text-[var(--white)] py-3 px-4 rounded-[10px] shadow-2xl flex items-center gap-3 text-[13px] font-semibold transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 min-w-[280px] max-w-[420px]`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--slate-400)] hover:text-[var(--white)] p-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
