import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 6000); // Auto-dismiss after 6 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  };

  const bgColors = {
    success: 'bg-[#0f241a] border-emerald-500/20 text-emerald-100',
    error: 'bg-[#291717] border-rose-500/20 text-rose-100',
    warning: 'bg-[#261d11] border-amber-500/20 text-amber-100',
    info: 'bg-[#121c36] border-blue-500/20 text-blue-100'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${bgColors[toast.type]} shadow-2xl glass transition-all duration-300 animate-slide-in max-w-sm w-full md:w-80`}>
      {icons[toast.type]}
      <div className="flex-1 text-sm font-medium leading-5">
        {toast.message}
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-full max-w-[calc(100vw-40px)] pointer-events-none md:max-w-xs">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
