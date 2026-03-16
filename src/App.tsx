import { useState } from 'react';
import { ArrowRight, Check, Shield, Zap, Globe, Menu, X, Send, Code2, Cpu, Lock, Layers, Terminal, Activity, Wallet, ChevronRight } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

function RevealOnScroll({ children, className, delay = 0, direction = 'up' }: { children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const offsets: Record<string, { x: number; y: number }> = {
    up: { y: 60, x: 0 }, down: { y: -60, x: 0 }, left: { x: -60, y: 0 }, right: { x: 60, y: 0 },
  };
  return (
    <motion.div ref={ref} initial={{ opacity: 0, ...offsets[direction] }} animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offsets[direction] }} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function ScaleReveal({ children, className, delay = 0, ...rest }: { children: ReactNode; className?: string; delay?: number; [key: string]: unknown }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.92 }} animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerWrap({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }} className={className}>
      {children}
    </motion.div>
  );
}

const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { name: 'Features', href: '#features' },
    { name: 'Protocol', href: '#protocol' },
    { name: 'Developers', href: '#developers' },
    { name: 'Security', href: '#security' },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-[#08090C]/80 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/moltfin-logo.png" alt="Molt.Fin" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight text-white">Molt.Fin</span>
        </a>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.name} href={l.href} className="text-sm text-gray-500 hover:text-[#FF6940] font-medium transition-colors">{l.name}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/docs" className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-4 py-2">Docs</Link>
          <Link to="/app" className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#FF6940]/20">Launch App</Link>
        </div>
        <button className="md:hidden text-white p-1.5" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-full bg-[#0D0E12] border-b border-white/5 shadow-2xl md:hidden flex flex-col px-5 py-4 gap-3 z-50">
            {links.map((l) => (<a key={l.name} href={l.href} className="text-gray-300 font-medium py-2 text-sm" onClick={() => setOpen(false)}>{l.name}</a>))}
            <Link to="/docs" className="text-gray-300 font-medium py-2 text-sm" onClick={() => setOpen(false)}>Docs</Link>
            <Link to="/app" className="bg-[#FF6940] text-white px-5 py-3 rounded-xl font-semibold text-sm text-center mt-1" onClick={() => setOpen(false)}>Launch App</Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const codeY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[#08090C]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-[#FF6940]/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF6940]/3 rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }} className="text-[34px] sm:text-[48px] md:text-[58px] lg:text-[66px] font-extrabold leading-[1.04] tracking-tight text-white mb-6">
              Financial rails for{' '}<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#FF6940] to-[#FF8F6B] bg-clip-text text-transparent">autonomous agents</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }} className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Molt.Fin provides programmable bank accounts for AI agents. Sub-second settlement, cryptographic spending policies, and native SDK integration. Let your agents hold, send, and manage funds independently.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
              <a href="#get-started" className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#FF6940]/20">
                <Send size={16} /> Get started
              </a>
              <Link to="/docs" className="text-gray-400 hover:text-white font-semibold text-sm flex items-center gap-1.5 px-5 py-3.5 transition-colors">
                Read documentation <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>

          <motion.div style={{ y: codeY }} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex-1 w-full max-w-[540px]">
            <div className="bg-[#0D0E12] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/[0.06] overflow-hidden">
              <div className="h-10 bg-[#111318] border-b border-white/5 flex items-center px-4">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" /></div>
                <div className="mx-auto flex items-center gap-2 bg-[#0D0E12] rounded px-4 py-1 border border-white/5">
                  <Terminal size={10} className="text-gray-600" />
                  <span className="text-[10px] text-gray-500 font-mono">agent-banking.ts</span>
                </div>
              </div>
              <div className="p-5 font-mono text-[11px] sm:text-[12px] leading-[1.9] overflow-x-auto">
                <div><span className="text-purple-400">import</span> <span className="text-gray-300">{'{ MoltFin }'}</span> <span className="text-purple-400">from</span> <span className="text-[#FF6940]">'@moltfin/sdk'</span><span className="text-gray-600">;</span></div>
                <div className="mt-3"><span className="text-gray-600">{'// Initialize agent account'}</span></div>
                <div><span className="text-purple-400">const</span> <span className="text-blue-300">account</span> <span className="text-gray-500">=</span> <span className="text-purple-400">await</span> <span className="text-blue-300">moltfin</span><span className="text-gray-500">.</span><span className="text-yellow-200">accounts</span><span className="text-gray-500">.</span><span className="text-green-300">create</span><span className="text-gray-500">(</span><span className="text-gray-300">{'{'}</span></div>
                <div className="pl-4"><span className="text-gray-400">agentId</span><span className="text-gray-500">:</span> <span className="text-[#FF6940]">'agent_prod_01'</span><span className="text-gray-600">,</span></div>
                <div className="pl-4"><span className="text-gray-400">currency</span><span className="text-gray-500">:</span> <span className="text-[#FF6940]">'USDC'</span><span className="text-gray-600">,</span></div>
                <div className="pl-4"><span className="text-gray-400">policy</span><span className="text-gray-500">:</span> <span className="text-gray-300">{'{'}</span></div>
                <div className="pl-8"><span className="text-gray-400">maxPerTx</span><span className="text-gray-500">:</span> <span className="text-green-300">500</span><span className="text-gray-600">,</span></div>
                <div className="pl-8"><span className="text-gray-400">dailyLimit</span><span className="text-gray-500">:</span> <span className="text-green-300">5000</span><span className="text-gray-600">,</span></div>
                <div className="pl-8"><span className="text-gray-400">allowedMerchants</span><span className="text-gray-500">:</span> <span className="text-[#FF6940]">['*']</span></div>
                <div className="pl-4"><span className="text-gray-300">{'}'}</span></div>
                <div><span className="text-gray-300">{'}'}</span><span className="text-gray-500">);</span></div>
                <div className="mt-3"><span className="text-gray-600">{'// Execute payment - settles <400ms'}</span></div>
                <div><span className="text-purple-400">const</span> <span className="text-blue-300">tx</span> <span className="text-gray-500">=</span> <span className="text-purple-400">await</span> <span className="text-blue-300">account</span><span className="text-gray-500">.</span><span className="text-green-300">send</span><span className="text-gray-500">(</span><span className="text-gray-300">{'{'}</span></div>
                <div className="pl-4"><span className="text-gray-400">to</span><span className="text-gray-500">:</span> <span className="text-[#FF6940]">'merchant.moltfin'</span><span className="text-gray-600">,</span></div>
                <div className="pl-4"><span className="text-gray-400">amount</span><span className="text-gray-500">:</span> <span className="text-green-300">249.99</span></div>
                <div><span className="text-gray-300">{'}'}</span><span className="text-gray-500">);</span></div>
                <div className="mt-2"><span className="text-gray-600">{'// tx.settled: true, tx.latency: 380ms'}</span></div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="mt-20 flex flex-wrap items-center justify-center gap-10 sm:gap-14">
          <img src="/solana-logo.png" alt="Solana" className="h-7 sm:h-8 opacity-50 hover:opacity-80 transition-opacity object-contain" />
          <img src="/usdc-logo-new.png" alt="USDC" className="h-7 sm:h-8 opacity-50 hover:opacity-80 transition-opacity object-contain" />
          <img src="/mastercard-logo.png" alt="Mastercard" className="h-7 sm:h-8 opacity-50 hover:opacity-80 transition-opacity object-contain" />
          <img src="/aws-logo.png" alt="AWS" className="h-7 sm:h-8 opacity-50 hover:opacity-80 transition-opacity object-contain" />
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <Wallet size={22} />, title: 'Agent Bank Accounts', desc: 'Give every AI agent its own programmable bank account. Multi-currency support with USDC, SOL, and ETH. No human approval loops required.' },
    { icon: <Zap size={22} />, title: 'Sub-Second Settlement', desc: 'Transactions finalize in under 400ms with cryptographic proof on-chain. 100x faster than traditional payment rails.' },
    { icon: <Shield size={22} />, title: 'Policy-Based Authorization', desc: 'Define spending rules and enforce them cryptographically. Velocity limits, merchant whitelists, multi-sig thresholds validated on-chain.' },
    { icon: <Code2 size={22} />, title: 'Native SDK Integration', desc: 'First-class TypeScript and Python SDKs. Your agents interact with financial operations through a clean, type-safe API.' },
    { icon: <Globe size={22} />, title: 'Global Payment Network', desc: 'Settle across borders without intermediaries. Molt.Fin connects to Visa and Mastercard rails for worldwide merchant acceptance.' },
    { icon: <Cpu size={22} />, title: 'Conversational Operations', desc: 'Native MCP integration lets agents check balances, send payments, and manage spending through natural language prompts.' },
  ];

  return (
    <section id="features" className="py-24 lg:py-32 bg-[#08090C]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#FF6940] text-xs font-bold uppercase tracking-widest block mb-3">Core Capabilities</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Built for machines that move money
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">Everything an autonomous agent needs to operate financially, from dedicated accounts to cryptographic policy enforcement.</p>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" gap={0.06}>
          {features.map((f) => (
            <motion.div key={f.title} variants={cardReveal} className="group bg-[#0D0E12] rounded-2xl p-7 border border-white/[0.04] hover:border-[#FF6940]/15 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF6940]/[0.03]">
              <div className="w-12 h-12 bg-[#FF6940]/8 rounded-xl flex items-center justify-center text-[#FF6940] mb-5 group-hover:bg-[#FF6940] group-hover:text-white transition-all duration-300">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function ProtocolSection() {
  return (
    <section id="protocol" className="py-24 lg:py-32 bg-[#0D0E12] border-y border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          <RevealOnScroll direction="left" className="flex-1 text-center lg:text-left">
            <span className="text-[#FF6940] text-xs font-bold uppercase tracking-widest block mb-3">Settlement Engine</span>
            <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-5">
              Financial autonomy,<br className="hidden sm:block" /> verifiable on-chain
            </h2>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              Traditional banking was designed for humans: manual approvals, business-hour settlements, and phone-call disputes. Molt.Fin reimagines financial infrastructure for autonomous systems with dedicated accounts, instant finality, and programmable guardrails.
            </p>
            <div className="flex flex-col gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { label: 'Dedicated agent accounts', detail: 'Multi-currency support with programmable spending policies enforced cryptographically' },
                { label: 'Instant settlement', detail: 'Sub-400ms transaction finality with cryptographic proof of settlement on Solana' },
                { label: 'Natural language banking', detail: 'Native MCP integration enables agents to manage finances through conversational prompts' },
              ].map((item, i) => (
                <ScaleReveal delay={i * 0.08} key={item.label}>
                  <div className="flex items-start gap-3 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                    <div className="w-6 h-6 rounded-full bg-[#FF6940]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-[#FF6940]" />
                    </div>
                    <div>
                      <span className="text-white text-sm font-semibold block">{item.label}</span>
                      <span className="text-gray-500 text-xs leading-relaxed">{item.detail}</span>
                    </div>
                  </div>
                </ScaleReveal>
              ))}
            </div>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to="/docs" className="inline-flex items-center gap-2 text-[#FF6940] font-bold text-sm hover:gap-3 transition-all">
                View documentation <ChevronRight size={16} />
              </Link>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.12} className="flex-1 w-full max-w-[480px]">
            <div className="bg-[#111318] rounded-2xl p-6 border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={16} className="text-[#FF6940]" />
                <span className="text-white font-bold text-sm">Settlement Flow</span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { step: '01', label: 'Agent initiates payment', status: 'complete', time: '0ms' },
                  { step: '02', label: 'Policy engine validates', status: 'complete', time: '12ms' },
                  { step: '03', label: 'On-chain settlement', status: 'complete', time: '340ms' },
                  { step: '04', label: 'Merchant confirmation', status: 'complete', time: '380ms' },
                ].map((s, i) => (
                  <div key={s.step} className="flex items-center gap-4 bg-[#0D0E12] rounded-xl px-4 py-3 border border-white/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-[#FF6940]/8 flex items-center justify-center shrink-0">
                      <span className="text-[#FF6940] text-[10px] font-bold">{s.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-xs font-medium block">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-[10px] font-mono">{s.time}</span>
                      <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Check size={8} className="text-green-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between bg-green-500/5 rounded-xl px-4 py-3 border border-green-500/10">
                <span className="text-green-400 text-xs font-bold">Transaction settled</span>
                <span className="text-green-400/60 text-[10px] font-mono">380ms total latency</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

function DeveloperSection() {
  const metrics = [
    { value: '<400ms', label: 'Settlement' },
    { value: '99.99%', label: 'Uptime SLA' },
    { value: '3 lines', label: 'To integrate' },
    { value: '$0', label: 'Platform fee' },
  ];

  return (
    <section id="developers" className="py-24 lg:py-32 bg-[#08090C]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#FF6940] text-xs font-bold uppercase tracking-widest block mb-3">For Developers</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Three lines to financial autonomy
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Integrate Molt.Fin into any agent framework. TypeScript and Python SDKs with comprehensive documentation and sandbox environments.
          </p>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12" gap={0.06}>
          {metrics.map((m) => (
            <motion.div key={m.label} variants={cardReveal} className="bg-[#0D0E12] rounded-2xl p-6 border border-white/[0.04] text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block mb-1">{m.value}</span>
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{m.label}</span>
            </motion.div>
          ))}
        </StaggerWrap>

        <ScaleReveal>
          <div className="bg-[#0D0E12] rounded-2xl border border-white/[0.04] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.04]">
              <Terminal size={16} className="text-[#FF6940]" />
              <span className="text-white text-sm font-bold">Quick Start</span>
              <span className="text-gray-600 text-xs ml-auto font-mono">TypeScript</span>
            </div>
            <div className="p-6 font-mono text-[12px] sm:text-[13px] leading-[2] overflow-x-auto">
              <div><span className="text-gray-600">{'// 1. Install the SDK'}</span></div>
              <div><span className="text-green-400">$</span> <span className="text-gray-300">npm install @moltfin/sdk</span></div>
              <div className="mt-3"><span className="text-gray-600">{'// 2. Initialize with your API key'}</span></div>
              <div><span className="text-purple-400">const</span> <span className="text-blue-300">moltfin</span> <span className="text-gray-500">=</span> <span className="text-purple-400">new</span> <span className="text-yellow-200">MoltFin</span><span className="text-gray-500">(</span><span className="text-[#FF6940]">'mf_live_...'</span><span className="text-gray-500">);</span></div>
              <div className="mt-3"><span className="text-gray-600">{'// 3. Create an agent account and start transacting'}</span></div>
              <div><span className="text-purple-400">const</span> <span className="text-blue-300">agent</span> <span className="text-gray-500">=</span> <span className="text-purple-400">await</span> <span className="text-blue-300">moltfin</span><span className="text-gray-500">.</span><span className="text-green-300">createAgent</span><span className="text-gray-500">(</span><span className="text-[#FF6940]">'my-agent'</span><span className="text-gray-500">);</span></div>
              <div><span className="text-purple-400">await</span> <span className="text-blue-300">agent</span><span className="text-gray-500">.</span><span className="text-green-300">send</span><span className="text-gray-500">({'{'}</span> <span className="text-gray-400">to</span><span className="text-gray-500">:</span> <span className="text-[#FF6940]">'vendor.moltfin'</span><span className="text-gray-500">,</span> <span className="text-gray-400">amount</span><span className="text-gray-500">:</span> <span className="text-green-300">100</span> <span className="text-gray-500">{'}'})</span><span className="text-gray-600">;</span></div>
            </div>
          </div>
        </ScaleReveal>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="py-24 lg:py-32 bg-[#0D0E12] border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#FF6940] text-xs font-bold uppercase tracking-widest block mb-3">Trust Architecture</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">Cryptographic guardrails, not human gatekeepers</h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">Every transaction is verified against on-chain policies. No centralized enforcement, no single points of failure.</p>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" gap={0.06}>
          {[
            { icon: <Lock size={20} />, title: 'On-Chain Policies', desc: 'Spending rules validated by smart contracts. Immutable and transparent enforcement.' },
            { icon: <Shield size={20} />, title: 'Multi-Sig Thresholds', desc: 'High-value transactions require multiple cryptographic approvals before execution.' },
            { icon: <Layers size={20} />, title: 'Velocity Controls', desc: 'Programmable rate limits per agent, per merchant, per time window.' },
            { icon: <Globe size={20} />, title: 'Audit Trail', desc: 'Every transaction produces a verifiable on-chain receipt for compliance.' },
          ].map((item) => (
            <motion.div key={item.title} variants={cardReveal} className="bg-[#111318] rounded-2xl p-6 border border-white/[0.04] hover:border-[#FF6940]/10 transition-colors">
              <div className="w-10 h-10 bg-[#FF6940]/8 rounded-xl flex items-center justify-center text-[#FF6940] mb-4">{item.icon}</div>
              <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="get-started" className="py-24 lg:py-32 bg-[#08090C]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <ScaleReveal>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6940]/10 via-[#FF6940]/5 to-transparent" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF6940]/5 rounded-full blur-3xl" />
            <div className="relative border border-[#FF6940]/10 rounded-3xl p-10 sm:p-14 lg:p-20 text-center">
              <h2 className="text-[28px] sm:text-[40px] md:text-[48px] font-extrabold text-white tracking-tight mb-4 leading-tight">
                Built for autonomous systems.{' '}<br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#FF6940] to-[#FF8F6B] bg-clip-text text-transparent">Available today.</span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Give your AI agents the ability to hold and manage money independently. Join the developers building agent-driven financial operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://docs.moltfin.app" className="bg-[#FF6940] hover:bg-[#E85C38] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF6940]/20">
                  <Send size={16} /> Get started
                </a>
                <Link to="/docs" className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/10">
                  Read documentation
                </Link>
              </div>
            </div>
          </div>
        </ScaleReveal>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-[#08090C] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/moltfin-logo.png" alt="Molt.Fin" className="w-7 h-7 rounded-lg object-cover" />
              <span className="text-white font-bold text-base">Molt.Fin</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">Financial infrastructure for AI agents. Programmable accounts, instant settlement, cryptographic policies.</p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Product</h4>
            <div className="flex flex-col gap-2">
              <a href="#features" className="text-gray-400 text-sm hover:text-white transition-colors">Features</a>
              <a href="#protocol" className="text-gray-400 text-sm hover:text-white transition-colors">Protocol</a>
              <a href="#developers" className="text-gray-400 text-sm hover:text-white transition-colors">Developers</a>
              <a href="#security" className="text-gray-400 text-sm hover:text-white transition-colors">Security</a>
              <Link to="/docs" className="text-gray-400 text-sm hover:text-white transition-colors">Documentation</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Resources</h4>
            <div className="flex flex-col gap-2">
              <Link to="/docs" className="text-gray-400 text-sm hover:text-white transition-colors">Guides</Link>
              <Link to="/docs#sdk" className="text-gray-400 text-sm hover:text-white transition-colors">SDK Reference</Link>
              <Link to="/docs#settlement" className="text-gray-400 text-sm hover:text-white transition-colors">Settlement Docs</Link>
              <Link to="/docs#faq" className="text-gray-400 text-sm hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Community</h4>
            <div className="flex flex-col gap-2">
              <a href="https://x.com/MoltFinApp" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X / Twitter
              </a>
              <Link to="/docs#getting-started" className="text-gray-400 text-sm hover:text-white transition-colors">Getting Started</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600">
          <span>&copy; 2026 Molt.Fin. All rights reserved.</span>
          <span>Molt.Fin is a financial technology platform. Not a bank. Not FDIC insured.</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#08090C] font-sans">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ProtocolSection />
      <DeveloperSection />
      <SecuritySection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
