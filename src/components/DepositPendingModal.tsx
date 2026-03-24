import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Clock, ArrowRightLeft } from 'lucide-react';
import CurrencyBadge from './CurrencyBadge';

interface DepositPendingModalProps {
  open: boolean;
  onClose: () => void;
  depositAddress: string;
  sendAmount: string;
  sendCoin: string;
  receiveAmount: string;
  receiveCoin: string;
  exchangeRate: string;
  feePercent: number;
  recipientAddress: string;
  privacyLevel: string;
}

function CompactSpinner() {
  return (
    <div className="relative w-16 h-16 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="og1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0AF5D6" stopOpacity="1" />
            <stop offset="100%" stopColor="#0AF5D6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="og2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.circle cx="100" cy="100" r="70" fill="none" stroke="url(#og1)" strokeWidth="3" strokeDasharray="60 380" strokeLinecap="round" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />
        <motion.circle cx="100" cy="100" r="55" fill="none" stroke="url(#og2)" strokeWidth="2" strokeDasharray="40 306" strokeLinecap="round" animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />
        <motion.g animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: 'center' }}>
          <circle cx="100" cy="100" r="16" fill="#0A0A0A" stroke="#0AF5D6" strokeWidth="2" />
          <path d="M93 100 L100 107 L107 93" stroke="#0AF5D6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </svg>
    </div>
  );
}

export default function DepositPendingModal({ open, onClose, depositAddress, sendAmount, sendCoin, receiveAmount, receiveCoin, exchangeRate, feePercent, recipientAddress, privacyLevel }: DepositPendingModalProps) {
  const [copied, setCopied] = useState<'deposit' | 'recipient' | null>(null);

  async function handleCopy(text: string, type: 'deposit' | 'recipient') {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-y-auto"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />
          <div className="min-h-full flex items-start sm:items-center justify-center px-3 py-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0AF5D6]/50 to-transparent" />

              <div className="p-4 sm:p-6">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1 mb-2">
                    <Clock size={11} className="text-yellow-400" />
                    <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Awaiting Deposit</span>
                  </div>
                  <h2 className="text-white text-base sm:text-lg font-bold">Deposit to Complete Swap</h2>
                </div>

                <CompactSpinner />

                <div className="mt-3 bg-[#111111] rounded-xl border border-white/[0.06] p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">You Send</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-sm sm:text-base font-bold">{parseFloat(sendAmount).toLocaleString()}</span>
                      <CurrencyBadge currency={sendCoin} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center my-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#0AF5D6]/10 flex items-center justify-center">
                      <ArrowRightLeft size={11} className="text-[#0AF5D6]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">You Receive</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#0AF5D6] text-sm sm:text-base font-bold">{parseFloat(receiveAmount).toLocaleString()}</span>
                      <CurrencyBadge currency={receiveCoin} size="sm" />
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Rate: 1 {sendCoin} = {parseFloat(exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 6 })} {receiveCoin}</span>
                    <span className="text-gray-500">Fee: {feePercent}%</span>
                  </div>
                </div>

                <div className="mt-2.5 bg-[#111111] rounded-xl border border-white/[0.06] p-3">
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">
                    Deposit Address ({sendCoin})
                  </span>
                  <div className="bg-[#0A0A0A] rounded-lg border border-white/[0.04] p-2 flex items-center gap-2">
                    <span className="text-white text-[10px] font-mono break-all flex-1 leading-relaxed select-all">
                      {depositAddress}
                    </span>
                    <button
                      onClick={() => handleCopy(depositAddress, 'deposit')}
                      className="shrink-0 p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#0AF5D6]/10 transition-all group"
                      title="Copy deposit address"
                    >
                      {copied === 'deposit' ? (
                        <Check size={13} className="text-[#0AF5D6]" />
                      ) : (
                        <Copy size={13} className="text-gray-400 group-hover:text-[#0AF5D6]" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 bg-[#111111] rounded-xl border border-white/[0.06] p-3">
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">
                    Receive Address ({receiveCoin})
                  </span>
                  <div className="bg-[#0A0A0A] rounded-lg border border-white/[0.04] p-2 flex items-center gap-2">
                    <span className="text-gray-400 text-[10px] font-mono break-all flex-1 leading-relaxed">
                      {recipientAddress}
                    </span>
                    <button
                      onClick={() => handleCopy(recipientAddress, 'recipient')}
                      className="shrink-0 p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#0AF5D6]/10 transition-all group"
                      title="Copy receive address"
                    >
                      {copied === 'recipient' ? (
                        <Check size={13} className="text-[#0AF5D6]" />
                      ) : (
                        <Copy size={13} className="text-gray-400 group-hover:text-[#0AF5D6]" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between bg-[#111111] rounded-xl border border-white/[0.06] px-3 py-2">
                  <span className="text-gray-500 text-xs">Privacy</span>
                  <span className="text-[#0AF5D6] text-xs font-bold capitalize">{privacyLevel}</span>
                </div>

                <div className="mt-3 p-2.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                  <p className="text-yellow-400/80 text-[10px] sm:text-[11px] text-center leading-relaxed">
                    Send exactly <strong>{parseFloat(sendAmount).toLocaleString()} {sendCoin}</strong> to the deposit address.
                    You'll receive <strong>~{parseFloat(receiveAmount).toLocaleString()} {receiveCoin}</strong> once confirmed.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full mt-3 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white py-2.5 rounded-xl font-bold text-sm transition-all border border-white/[0.06]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
