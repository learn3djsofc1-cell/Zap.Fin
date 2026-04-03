import { Shield, Lock, Unlock, ArrowRight, Globe, Fingerprint, Zap, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyShieldPage() {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-2rem)] overflow-hidden">
      <div className="select-none pointer-events-none opacity-40" aria-hidden="true">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 flex items-center justify-center">
              <Shield size={20} className="text-[#0AF5D6]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Shield</h1>
              <p className="text-gray-500 text-sm">ZK-SNARK Private Transfers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Shielded Ops', value: '—', icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Private Transfers', value: '—', icon: Shield, color: 'text-[#0AF5D6]', bg: 'bg-[#0AF5D6]/10' },
            { label: 'Privacy Score', value: '—', icon: Fingerprint, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Networks', value: '—', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map((s) => (
            <div key={s.label} className="bg-[#0A0A0A] rounded-2xl p-4 border border-white/[0.04]">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon size={14} className={s.color} />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white block">{s.value}</span>
              <span className="text-gray-500 text-[10px] sm:text-xs block">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
              <div className="flex border-b border-white/[0.04]">
                {([
                  { label: 'Shield', icon: Lock, desc: 'Public → Private', color: 'text-emerald-400' },
                  { label: 'Transfer', icon: Shield, desc: 'Private → Private', color: 'text-[#0AF5D6]' },
                  { label: 'Unshield', icon: Unlock, desc: 'Private → Public', color: 'text-amber-400' },
                ] as const).map((tab, i) => (
                  <div
                    key={tab.label}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 sm:py-4 text-xs sm:text-sm font-medium relative ${
                      i === 0 ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    <tab.icon size={18} className={i === 0 ? tab.color : ''} />
                    <span>{tab.label}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-600">{tab.desc}</span>
                    {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0AF5D6]" />}
                  </div>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-4">
                  {[
                    { icon: Globe, label: 'Public Wallet' },
                    { icon: Fingerprint, label: 'ZK-SNARK Proof' },
                    { icon: Shield, label: 'Privacy Pool' },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20 flex items-center justify-center">
                          <step.icon size={18} className="text-[#0AF5D6]" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500 text-center max-w-[70px] sm:max-w-[80px] leading-tight">{step.label}</span>
                      </div>
                      {i < 2 && <ArrowRight size={16} className="text-[#0AF5D6]/50 mt-[-16px]" />}
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Network</label>
                    <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-500">Select Network</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Token</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['ETH', 'USDC', 'USDT', 'DAI'].map((t, i) => (
                        <div key={t} className={`px-3 py-2 rounded-xl text-sm font-medium border text-center ${i === 0 ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border-[#0AF5D6]/20' : 'bg-white/[0.03] text-gray-400 border-white/[0.06]'}`}>{t}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Amount</label>
                    <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-600">0.00</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Source Public Address</label>
                    <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-600 font-mono text-xs">0x...</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <Zap size={12} className="text-[#0AF5D6] shrink-0" />
                    <span className="text-gray-500 text-[10px] sm:text-xs truncate">Contract: <span className="text-gray-400 font-mono">0x••••••••••••</span></span>
                  </div>
                  <div className="w-full py-3 sm:py-3.5 bg-gray-700 text-gray-500 font-bold rounded-xl text-sm text-center">Shield Tokens</div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={14} className="text-[#0AF5D6]" />
                <span className="text-white text-sm font-bold">Supported Networks</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Ethereum', chain: 1, tokens: ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC'] },
                  { name: 'Arbitrum', chain: 42161, tokens: ['ETH', 'USDC', 'USDT', 'DAI'] },
                  { name: 'Polygon', chain: 137, tokens: ['MATIC', 'USDC', 'USDT', 'DAI'] },
                  { name: 'BNB Chain', chain: 56, tokens: ['BNB', 'USDC', 'USDT', 'BUSD'] },
                ].map(net => (
                  <div key={net.name} className="px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-sm font-semibold">{net.name}</span>
                      <span className="text-gray-600 text-[10px]">Chain {net.chain}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {net.tokens.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-white/[0.04] rounded text-[10px] text-gray-400">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
              <div className="px-4 sm:px-5 py-4 border-b border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={14} className="text-[#0AF5D6]" />
                    <span className="text-white text-sm font-bold">Operation History</span>
                  </div>
                  <span className="text-gray-600 text-xs">0 ops</span>
                </div>
                <div className="flex gap-1.5">
                  {['All', 'Shield', 'Transfer', 'Unshield'].map((f, i) => (
                    <span key={f} className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium ${i === 0 ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border border-[#0AF5D6]/20' : 'text-gray-500 border border-transparent'}`}>{f}</span>
                  ))}
                </div>
              </div>
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#0AF5D6]/10 flex items-center justify-center">
                  <Shield size={24} className="text-[#0AF5D6]" />
                </div>
                <p className="text-white text-sm font-medium mb-1">No operations yet</p>
                <p className="text-gray-500 text-xs">Shield, transfer, or unshield tokens to see your history here.</p>
              </div>
            </div>

            <div className="mt-6 bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <EyeOff size={14} className="text-[#0AF5D6]" />
                <span className="text-white text-sm font-bold">Shielded Balances</span>
              </div>
              <div className="px-4 py-6 text-center">
                <Eye size={20} className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-500 text-xs">No shielded balances</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-50 flex items-start justify-center pt-6 sm:pt-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="pointer-events-auto"
        >
          <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-[#0AF5D6]/15 rounded-3xl px-8 py-8 sm:px-12 sm:py-10 shadow-[0_0_80px_-12px_rgba(10,245,214,0.12)] text-center max-w-sm mx-4">
            <div className="relative mx-auto mb-5 w-16 h-16">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-[#0AF5D6]/10 border border-[#0AF5D6]/20"
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield size={28} className="text-[#0AF5D6]" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Privacy Shield is currently under development. ZK-SNARK powered shielded transfers across EVM chains will be available soon.
            </p>

            <div className="flex items-center justify-center gap-1.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-[#0AF5D6]"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-gray-500 text-xs">In Development</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
