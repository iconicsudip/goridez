'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

type ModalType = 'confirm' | 'alert' | 'success' | 'error';

interface ModalOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ModalType;
}

interface ModalContextValue {
  confirm: (opts: ModalOptions) => Promise<boolean>;
  alert: (opts: ModalOptions) => Promise<void>;
  showSuccess: (message: string, title?: string) => Promise<void>;
  showError: (message: string, title?: string) => Promise<void>;
}

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalState {
  open: boolean;
  opts: ModalOptions;
  resolve: ((val: boolean) => void) | null;
}

const defaultState: ModalState = {
  open: false,
  opts: { message: '' },
  resolve: null,
};

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>(defaultState);

  const openModal = useCallback((opts: ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, opts, resolve });
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setState((prev) => {
      prev.resolve?.(value);
      return defaultState;
    });
  }, []);

  const confirm = useCallback(
    (opts: ModalOptions) => openModal({ type: 'confirm', confirmLabel: 'Confirm', cancelLabel: 'Cancel', ...opts }),
    [openModal]
  );

  const alert = useCallback(
    async (opts: ModalOptions) => { await openModal({ type: 'alert', confirmLabel: 'OK', ...opts }); },
    [openModal]
  );

  const showSuccess = useCallback(
    async (message: string, title = 'Success') => { await openModal({ type: 'success', confirmLabel: 'OK', title, message }); },
    [openModal]
  );

  const showError = useCallback(
    async (message: string, title = 'Error') => { await openModal({ type: 'error', confirmLabel: 'OK', title, message }); },
    [openModal]
  );

  const { open, opts } = state;
  const isConfirm = opts.type === 'confirm';
  const isSuccess = opts.type === 'success';
  const isError = opts.type === 'error';

  const iconColor = isSuccess ? 'text-[#00ffaa]' : isError ? 'text-red-500' : 'text-brand-neon';
  const confirmBtnClass = isError
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : isSuccess
    ? 'bg-[#00ffaa] hover:bg-[#00e699] text-black'
    : isConfirm
    ? 'bg-brand-neon hover:bg-brand-hover text-black'
    : 'bg-brand-neon hover:bg-brand-hover text-black';

  return (
    <ModalContext.Provider value={{ confirm, alert, showSuccess, showError }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) close(false); }}
        >
          <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-white/5">
              {isSuccess && <CheckCircle size={20} className="text-[#00ffaa] flex-shrink-0" />}
              {isError && <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />}
              {!isSuccess && !isError && <Info size={20} className={`${iconColor} flex-shrink-0`} />}
              <h3 className="font-black uppercase tracking-tight text-white text-sm flex-1">
                {opts.title || (isSuccess ? 'Success' : isError ? 'Error' : isConfirm ? 'Confirm Action' : 'Notice')}
              </h3>
              <button onClick={() => close(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-white/70 font-mono leading-relaxed">{opts.message}</p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              {isConfirm && (
                <button
                  onClick={() => close(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  {opts.cancelLabel || 'Cancel'}
                </button>
              )}
              <button
                onClick={() => close(true)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${confirmBtnClass}`}
              >
                {opts.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>');
  return ctx;
}
