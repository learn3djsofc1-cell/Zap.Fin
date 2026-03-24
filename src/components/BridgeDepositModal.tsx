import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Clock, ArrowRight, Globe } from 'lucide-react';

interface BridgeDepositModalProps {
  open: boolean;
  onClose: () => void;
  depositAddress: string;
  amount: string;
  token: string;
  sourceChain: string;
  destChain: string;
  recipientAddress: string;
  sourceChainLogo?: string | null;
  destChainLogo?: string | null;
}

function BridgeSpinner() {
  return (
    <div className="relative w-16 h-16 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="1" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0AF5D6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0AF5D6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.circle cx="100" cy="100" r="70" fill="none" stroke="url(#bg1)" strokeWidth="3" strokeDasharray="60 380" strokeLinecap="round" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />
        <motion.circle cx="100" cy="100" r="55" fill="none" stroke="url(#bg2)" strokeWidth="2" strokeDasharray="40 306" strokeLinecap="round" animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: 'center' }} />
        <motion.g animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: 'center' }}>
          <circle cx="100" cy="100" r="16" fill="#0A0A0A" stroke="#22C55E" strokeWidth="2" />
          <path d="M90 100 L100 100 L110 100 M105 95 L110 100 L105 105" stroke="#22C55E" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </svg>
    </div>
  );
}

function ChainIcon({ chainId, logo, size = 11 }: { chainId: string; logo?: string | null; size?: number }) {
  if (logo) {
    return <img src={logo} alt={chainId} style={{ width: size, height: size }} className="object-contain" />;
  }
  return <Globe size={size} className="text-green-400" />;
}

export default function BridgeDepositModal({ open, onClose, depositAddress, amount, token, sourceChain, destChain, recipientAddress, sourceChainLogo, destChainLogo }: BridgeDepositModalProps) {
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

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg" />
          <div className="min-h-full flex items-start sm:items-center justify-center px-3 py-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

              <div className="p-4 sm:p-6">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2.5 py-1 mb-2">
                    <Clock size={11} className="text-yellow-400" />
                    <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Awaiting Deposit</span>
                  </div>
                  <h2 className="text-white text-base sm:text-lg font-bold">Deposit to Complete Bridge</h2>
                </div>

                <BridgeSpinner />

                <div className="mt-3 bg-[#111111] rounded-xl border border-white/[0.06] p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Transfer</span>
                    <span className="text-white text-sm sm:text-base font-bold">{parseFloat(amount).toLocaleString()} {token}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-1.5">
                    <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-2.5 py-1.5">
                      <ChainIcon chainId={sourceChain} logo={sourceChainLogo} size={14} />
                      <span className="text-white text-xs font-semibold capitalize">{sourceChain}</span>
                    </div>
                    <ArrowRight size={14} className="text-green-400 shrink-0" />
                    <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-2.5 py-1.5">
                      <ChainIcon chainId={destChain} logo={destChainLogo} size={14} />
                      <span className="text-white text-xs font-semibold capitalize">{destChain}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 bg-[#111111] rounded-xl border border-white/[0.06] p-3">
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">
                    Deposit Address ({sourceChain})
                  </span>
                  <div className="bg-[#0A0A0A] rounded-lg border border-white/[0.04] p-2 flex items-center gap-2">
                    <span className="text-white text-[10px] font-mono break-all flex-1 leading-relaxed select-all">
                      {depositAddress}
                    </span>
                    <button
                      onClick={() => handleCopy(depositAddress, 'deposit')}
                      className="shrink-0 p-1.5 rounded-lg bg-white/[0.04] hover:bg-green-500/10 transition-all group"
                      title="Copy deposit address"
                    >
                      {copied === 'deposit' ? (
                        <Check size={13} className="text-green-400" />
                      ) : (
                        <Copy size={13} className="text-gray-400 group-hover:text-green-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 bg-[#111111] rounded-xl border border-white/[0.06] p-3">
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">
                    Receive Address ({destChain})
                  </span>
                  <div className="bg-[#0A0A0A] rounded-lg border border-white/[0.04] p-2 flex items-center gap-2">
                    <span className="text-gray-400 text-[10px] font-mono break-all flex-1 leading-relaxed">
                      {recipientAddress}
                    </span>
                    <button
                      onClick={() => handleCopy(recipientAddress, 'recipient')}
                      className="shrink-0 p-1.5 rounded-lg bg-white/[0.04] hover:bg-green-500/10 transition-all group"
                      title="Copy receive address"
                    >
                      {copied === 'recipient' ? (
                        <Check size={13} className="text-green-400" />
                      ) : (
                        <Copy size={13} className="text-gray-400 group-hover:text-green-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                  <p className="text-yellow-400/80 text-[10px] sm:text-[11px] text-center leading-relaxed">
                    Send exactly <strong>{parseFloat(amount).toLocaleString()} {token}</strong> to the deposit address.
                    Your tokens will be bridged to <strong className="capitalize">{destChain}</strong> once confirmed.
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
    </AnimatePresence>,
    document.body
  );
}
