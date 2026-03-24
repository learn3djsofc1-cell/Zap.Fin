import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Clock, ArrowDown } from 'lucide-react';
import CurrencyBadge from './CurrencyBadge';

interface DepositPendingModalProps {
  open: boolean;
  onClose: () => void;
  depositAddress: string;
  amount: string;
  coin: string;
  privacyLevel: string;
}

function OrbitalSpinner() {
  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0AF5D6" stopOpacity="1" />
            <stop offset="100%" stopColor="#0AF5D6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="orbitGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="orbitGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#0AF5D6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0AF5D6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="50" fill="url(#centerGlow)" />

        <motion.circle
          cx="100" cy="100" r="70"
          fill="none" stroke="url(#orbitGrad1)" strokeWidth="2"
          strokeDasharray="60 380"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.circle
          cx="100" cy="100" r="55"
          fill="none" stroke="url(#orbitGrad2)" strokeWidth="1.5"
          strokeDasharray="40 306"
          strokeLinecap="round"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.circle
          cx="100" cy="100" r="85"
          fill="none" stroke="url(#orbitGrad3)" strokeWidth="1"
          strokeDasharray="50 484"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.circle
          cx="100" cy="30" r="3"
          fill="#0AF5D6"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />
        <motion.circle
          cx="100" cy="30" r="6"
          fill="#0AF5D6"
          opacity="0.2"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />

        <motion.circle
          cx="155" cy="100" r="2.5"
          fill="#8B5CF6"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />
        <motion.circle
          cx="155" cy="100" r="5"
          fill="#8B5CF6"
          opacity="0.2"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />

        <motion.circle
          cx="100" cy="15" r="2"
          fill="#06B6D4"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />

        <motion.circle
          cx="100" cy="100" r="20"
          fill="none" stroke="#0AF5D6" strokeWidth="1.5"
          strokeDasharray="10 116"
          strokeLinecap="round"
          opacity="0.5"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.g
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: 'center' }}
        >
          <circle cx="100" cy="100" r="12" fill="#0A0A0A" stroke="#0AF5D6" strokeWidth="1.5" />
          <path d="M95 100 L100 105 L105 95" stroke="#0AF5D6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </svg>
    </div>
  );
}

export default function DepositPendingModal({ open, onClose, depositAddress, amount, coin, privacyLevel }: DepositPendingModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = depositAddress;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0AF5D6]/50 to-transparent" />

            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5 mb-4"
                >
                  <Clock size={12} className="text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Awaiting Deposit</span>
                </motion.div>

                <h2 className="text-white text-lg sm:text-xl font-bold mb-1">Deposit to Complete Mix</h2>
                <p className="text-gray-500 text-sm">Send the exact amount to the address below</p>
              </div>

              <OrbitalSpinner />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 bg-[#111111] rounded-xl border border-white/[0.06] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Amount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-lg font-bold">{parseFloat(amount).toLocaleString()}</span>
                    <CurrencyBadge currency={coin} size="md" />
                  </div>
                </div>

                <div className="flex items-center justify-center my-2">
                  <ArrowDown size={16} className="text-[#0AF5D6]" />
                </div>

                <div className="mb-2">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">Deposit Address</span>
                  <div className="bg-[#0A0A0A] rounded-lg border border-white/[0.04] p-3 flex items-center gap-2">
                    <span className="text-white text-[11px] sm:text-xs font-mono break-all flex-1 leading-relaxed select-all">
                      {depositAddress}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 p-2 rounded-lg bg-white/[0.04] hover:bg-[#0AF5D6]/10 transition-all group"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check size={14} className="text-[#0AF5D6]" />
                      ) : (
                        <Copy size={14} className="text-gray-400 group-hover:text-[#0AF5D6]" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[#0AF5D6] text-[10px] mt-1 block text-right"
                    >
                      Copied to clipboard
                    </motion.span>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex items-center justify-between bg-[#111111] rounded-xl border border-white/[0.06] p-3"
              >
                <span className="text-gray-500 text-xs">Privacy Level</span>
                <span className="text-[#0AF5D6] text-xs font-bold capitalize">{privacyLevel}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl"
              >
                <p className="text-yellow-400/80 text-[11px] text-center leading-relaxed">
                  Send exactly <strong>{parseFloat(amount).toLocaleString()} {coin}</strong> to the deposit address above. The mixing process will begin automatically once the deposit is confirmed on the blockchain.
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="w-full mt-6 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white py-3 rounded-xl font-bold text-sm transition-all border border-white/[0.06]"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
