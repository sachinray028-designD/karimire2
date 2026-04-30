import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { X, CalendarDays } from 'lucide-react';
import InquiryForm from './InquiryForm';

type Ctx = { open: (source?: string) => void; close: () => void };

const ConsultationCtx = createContext<Ctx>({ open: () => {}, close: () => {} });

export function useConsultation() {
  return useContext(ConsultationCtx);
}

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('Consultation Request');

  const open = useCallback((src?: string) => {
    setSource(src || 'Consultation Request');
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  return (
    <ConsultationCtx.Provider value={{ open, close }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm animate-fade-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consultation-title"
          onClick={close}
        >
          <div
            className="relative w-full max-w-lg bg-white max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close consultation form"
              onClick={close}
              className="absolute top-4 right-4 text-navy/60 hover:text-crimson transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="px-6 pt-8 pb-4 md:px-8 border-b border-navy/10">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-crimson">
                <CalendarDays size={12} />
                Private Consultation
              </div>
              <h2 id="consultation-title" className="mt-3 font-display text-3xl text-navy leading-tight">
                Book a 30-minute call
              </h2>
              <p className="mt-2 text-sm text-navy/65 leading-relaxed">
                No obligation. No commission. A senior advisor will reach out within one business hour to schedule your private session.
              </p>
            </div>
            <div className="px-6 py-6 md:px-8">
              <InquiryForm propertyName={source} />
            </div>
          </div>
        </div>
      )}
    </ConsultationCtx.Provider>
  );
}

type ButtonProps = {
  source?: string;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
};

export function BookConsultationButton({ source, className, children, icon }: ButtonProps) {
  const { open } = useConsultation();
  return (
    <button type="button" onClick={() => open(source)} className={className}>
      {icon}
      {children}
    </button>
  );
}
