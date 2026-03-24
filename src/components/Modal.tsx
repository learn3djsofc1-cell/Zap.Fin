import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="min-h-full flex items-start sm:items-center justify-center px-3 py-4 sm:p-6">
        <div
          className={`relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 w-full ${maxWidth} my-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-[#0A0A0A] flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.06] rounded-t-2xl">
            <h2 className="text-white font-bold text-base">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.05]">
              <X size={18} />
            </button>
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
