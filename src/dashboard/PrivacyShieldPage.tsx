import { Shield, Lock, Unlock, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyShieldPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-2rem)] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-[#0A0A0A] border border-[#0AF5D6]/15 rounded-3xl p-7 sm:p-10 shadow-[0_0_80px_-12px_rgba(10,245,214,0.12)]">
          <div className="text-center">
            <div className="relative mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20"
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield size={30} className="text-[#0AF5D6] sm:hidden" />
                <Shield size={36} className="text-[#0AF5D6] hidden sm:block" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed max-w-sm mx-auto">
              Privacy Shield is currently under development. ZK-SNARK powered shielded transfers across EVM chains will be available soon.
            </p>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
              {[
                { icon: Lock, label: 'Shield', desc: 'Public → Private' },
                { icon: Shield, label: 'Transfer', desc: 'Private → Private' },
                { icon: Unlock, label: 'Unshield', desc: 'Private → Public' },
              ].map((feature) => (
                <div key={feature.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 sm:p-3 text-center">
                  <feature.icon size={16} className="text-[#0AF5D6] mx-auto mb-1 sm:mb-1.5 sm:w-[18px] sm:h-[18px]" />
                  <span className="text-white text-[11px] sm:text-xs font-semibold block">{feature.label}</span>
                  <span className="text-gray-500 text-[9px] sm:text-[10px] block mt-0.5">{feature.desc}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-left mb-6">
              {[
                'Multi-chain support: Ethereum, Arbitrum, Polygon, BSC',
                'Zero-knowledge proof generation for full privacy',
                'Shielded balance tracking & operation history',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0AF5D6]/60 shrink-0 mt-1.5" />
                  <span className="text-gray-400 text-xs sm:text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 text-[#0AF5D6] font-semibold rounded-xl text-sm cursor-not-allowed opacity-60"
              >
                <Bell size={16} />
                Notify Me
              </button>
              <a
                href="/app"
                className="flex-1 py-3 bg-white/[0.04] border border-white/[0.06] text-gray-300 hover:text-white hover:border-white/10 font-semibold rounded-xl text-sm text-center transition-colors"
              >
                Back to Dashboard
              </a>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-[#0AF5D6]"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-gray-500 text-xs">In Development</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
