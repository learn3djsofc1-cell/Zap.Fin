import { useState, useMemo } from 'react';
import { ArrowRight, Copy, Check, ChevronRight, Lock, Zap, Globe, Shield, CreditCard, Wallet, Menu, X, Send } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

function RevealOnScroll({ children, className, delay = 0, direction = 'up' }: { children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const offsets: Record<string, { x: number; y: number }> = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offsets[direction] }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerWrap({ children, className, gap = 0.1 }: { children: ReactNode; className?: string; gap?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const WispTapLogo = ({ className }: { className?: string }) => (
  <img src="/logo.png" alt="WispTap" className={`${className || ''} rounded-lg`} />
);

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Cards', href: '#cards' },
    { name: 'Funding', href: '#funding' },
    { name: 'Security', href: '#security' },
  ];

  return (
    <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-50">
      <a href="#" className="flex items-center gap-2.5">
        <WispTapLogo className="w-9 h-9" />
        <span className="text-2xl font-bold tracking-tight text-[#1A1A1A]">WispTap</span>
      </a>

      <div className="hidden md:flex items-center gap-8 font-medium">
        {links.map((l) => (
          <a key={l.name} href={l.href} className="text-gray-500 hover:text-[#FF5550] transition-colors duration-200">{l.name}</a>
        ))}
      </div>

      <div className="hidden md:block">
        <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#FF5550]/20 hover:shadow-[#FF5550]/30">
          Launch App
        </Link>
      </div>

      <button className="md:hidden text-[#1A1A1A] p-2" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg md:hidden flex flex-col px-6 py-4 gap-4 z-50"
        >
          {links.map((l) => (
            <a key={l.name} href={l.href} className="text-gray-800 font-medium py-2 hover:text-[#FF5550] transition-colors" onClick={() => setOpen(false)}>{l.name}</a>
          ))}
          <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-6 py-3 rounded-full font-semibold text-center transition-all duration-200 mt-2" onClick={() => setOpen(false)}>
            Launch App
          </Link>
        </motion.div>
      )}
    </nav>
  );
}

function HeroSection() {
  const [caCopied, setCaCopied] = useState(false);
  const CA = '9ABFVNCk4SDrM2GwjHDMMio7NvF2VcMBGHEUwTQgpump';

  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(CA);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = CA;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCaCopied(true);
    setTimeout(() => setCaCopied(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pt-10 pb-24 lg:pt-16 lg:pb-32">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-[#FF5550]/8 border border-[#FF5550]/15 text-[#FF5550] text-sm font-semibold px-4 py-1.5 rounded-full mb-7"
          >
            <Zap size={14} />
            Solana-powered finance
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-[38px] sm:text-[52px] md:text-[64px] lg:text-[76px] font-extrabold leading-[1.05] tracking-tight text-[#1A1A1A]"
          >
            YOUR WALLET.<br />
            YOUR CARD.<br />
            <span className="text-[#FF5550]">YOUR RULES.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-gray-500 mt-6 leading-relaxed max-w-xl"
          >
            Connect your Solana wallet, issue virtual Visa cards, and spend crypto anywhere — managed from a single dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-lg transition-all duration-200 shadow-xl shadow-[#FF5550]/20 hover:shadow-[#FF5550]/35">
              <Send size={20} />
              Open Dashboard
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <div className="bg-[#1A1A1A] rounded-2xl p-4 inline-flex items-center gap-3 w-full sm:w-auto">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider shrink-0">CA</span>
              <code className="text-[#FF5550] text-xs sm:text-sm font-mono break-all">{CA}</code>
              <button onClick={copyCA} className="text-gray-400 hover:text-white transition-colors shrink-0">
                {caCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 relative w-full max-w-[580px] pointer-events-none"
        >
          <div className="absolute -top-12 -right-12 w-[320px] h-[320px] lg:w-[420px] lg:h-[420px] bg-[#FF5550] rounded-full blur-2xl opacity-20 z-0" />

          <div className="relative z-10 bg-[#111113] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden animate-float">
            <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="mx-auto bg-[#111113] rounded-md px-20 py-1 text-[10px] text-gray-500 font-mono border border-white/5">wisptap.xyz</div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WispTapLogo className="w-5 h-5" />
                  <span className="text-white font-bold text-sm">WispTap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#1A1B1F] px-3 py-1 rounded-full text-[10px] text-gray-400 font-mono border border-white/5">sol:8Kv2...mFx3</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF5550] to-[#D94440] flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">AK</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-2">Portfolio Value</span>
                  <span className="text-2xl font-bold text-white">$4,821</span>
                  <span className="text-lg text-gray-400">.50</span>
                  <div className="mt-3 flex gap-2">
                    <div className="bg-green-500/15 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded">+12.4%</div>
                    <span className="text-gray-500 text-[10px]">24h</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#FF5550] to-[#D94440] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-8 -translate-y-8" />
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-5 h-3.5 bg-white/20 rounded-sm" />
                    <span className="text-white font-bold text-[10px] italic">VISA</span>
                  </div>
                  <div className="relative z-10 mt-4">
                    <div className="text-white/60 text-[9px] font-mono tracking-widest mb-0.5">•••• •••• •••• 7291</div>
                    <span className="text-white font-bold text-xs">WispTap Virtual</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5">
                <span className="text-white text-xs font-bold mb-3 block">Recent Transactions</span>
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0"><img src="/spotify.png" alt="Spotify" className="w-full h-full object-cover" /></div>
                      <div><div className="text-white text-[11px] font-medium">Spotify Premium</div><div className="text-gray-500 text-[9px]">2 min ago</div></div>
                    </div>
                    <span className="text-white text-[11px] font-bold">-$11.99</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0"><img src="/usdc.png" alt="USDC" className="w-full h-full object-cover" /></div>
                      <div><div className="text-white text-[11px] font-medium">SOL → USDC Swap</div><div className="text-gray-500 text-[9px]">1 hour ago</div></div>
                    </div>
                    <span className="text-[#FF5550] text-[11px] font-bold">+$250.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0"><img src="/netflix.png" alt="Netflix" className="w-full h-full object-cover" /></div>
                      <div><div className="text-white text-[11px] font-medium">Netflix Standard</div><div className="text-gray-500 text-[9px]">Yesterday</div></div>
                    </div>
                    <span className="text-white text-[11px] font-bold">-$15.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Connect Wallet', desc: 'Generate a Solana wallet directly from the dashboard — your keys, your custody.', icon: <Wallet size={24} /> },
    { num: '02', title: 'Issue a Card', desc: 'Spin up a virtual Visa card in seconds. No paperwork, no waiting.', icon: <CreditCard size={24} /> },
    { num: '03', title: 'Fund & Spend', desc: 'Top up with SOL, convert to stablecoins, and spend at 80M+ merchants worldwide.', icon: <Zap size={24} /> },
  ];

  return (
    <section id="how-it-works" className="bg-[#FAFAFA] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#FF5550] text-sm font-bold uppercase tracking-widest block mb-4">How It Works</span>
          <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A1A]">
            Three steps to<br className="hidden sm:block" /> crypto-powered spending
          </h2>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 md:grid-cols-3 gap-8" gap={0.12}>
          {steps.map((step) => (
            <motion.div key={step.num} variants={fadeUp} className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#FF5550]/8 rounded-2xl flex items-center justify-center text-[#FF5550]">
                  {step.icon}
                </div>
                <span className="text-[#FF5550] text-5xl font-extrabold opacity-15">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function CardsShowcaseSection() {
  return (
    <section id="cards" className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <RevealOnScroll direction="right" className="flex-1 order-2 lg:order-1">
          <div className="relative max-w-[520px] mx-auto">
            <div className="bg-[#111113] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="h-9 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="mx-auto bg-[#111113] rounded px-16 py-0.5 text-[9px] text-gray-500 font-mono border border-white/5">wisptap.xyz/cards</div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-bold">Card Vault</span>
                  <button className="bg-[#FF5550] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">+ Issue Card</button>
                </div>

                <div className="flex gap-3 overflow-hidden">
                  <div className="w-[200px] shrink-0 bg-gradient-to-br from-[#8a8a8a] via-[#6a6a6a] to-[#4a4a4a] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden border border-white/20 h-[120px]">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 3px, rgba(0,0,0,0.8) 3px, rgba(0,0,0,0.8) 4px)' }} />
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="w-7 h-5 rounded bg-gradient-to-br from-[#e6d5a7] to-[#b89f65] border border-[#967d46] opacity-90" />
                      <span className="bg-black/40 text-white text-[7px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-white/10">Metal</span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <div className="text-white/80 text-[10px] font-mono tracking-widest">•••• 4821</div>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-white font-bold text-xs">Primary</span>
                        <span className="text-white font-bold text-[10px] italic">VISA</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-[200px] shrink-0 bg-gradient-to-br from-[#FF5550] to-[#D94440] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden h-[120px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full blur-2xl translate-x-8 -translate-y-8" />
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="w-7 h-5 rounded bg-white/20" />
                      <span className="bg-white/10 text-white text-[7px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-white/10">Virtual</span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <div className="text-white/60 text-[10px] font-mono tracking-widest">•••• 1337</div>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-white font-bold text-xs">Subscriptions</span>
                        <span className="text-white font-bold text-[10px] italic">VISA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1B1F] rounded-xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">This Month</span>
                    <span className="text-[#FF5550] text-[10px] font-bold">$1,247 / $5,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#111113] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF5550] rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="left" delay={0.1} className="flex-1 order-1 lg:order-2 text-center lg:text-left">
          <span className="text-[#FF5550] text-sm font-bold uppercase tracking-widest block mb-4">Virtual & Physical</span>
          <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A1A] mb-6">
            Issue cards in seconds, not days
          </h2>
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
            Spin up virtual Visa cards instantly for online purchases. Request a premium metal card for in-store and contactless payments. Each card gets its own spending limits and security controls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/app/cards" className="inline-flex items-center gap-2 text-[#FF5550] font-bold hover:gap-3 transition-all duration-200">
              Start issuing cards <ArrowRight size={18} />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function FundingSection() {
  return (
    <section id="funding" className="bg-[#111113] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <RevealOnScroll direction="right" className="flex-1 text-center lg:text-left">
            <span className="text-[#FF5550] text-sm font-bold uppercase tracking-widest block mb-4">Instant Funding</span>
            <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold leading-[1.08] tracking-tight text-white mb-6">
              From SOL to spendable balance in one flow
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              Pick an amount, preview the conversion rate, confirm — and your card balance updates in real time. No bridging, no third-party swaps, no delays.
            </p>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <img src="/sol-logo.png" alt="SOL" className="w-6 h-6 rounded-full" />
                <span className="text-white font-bold text-sm">SOL</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="/usdc-logo.png" alt="USDC" className="w-6 h-6 rounded-full" />
                <span className="text-white font-bold text-sm">USDC</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="/usdt-logo.png" alt="USDT" className="w-6 h-6 rounded-full" />
                <span className="text-white font-bold text-sm">USDT</span>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="left" delay={0.1} className="flex-1 w-full max-w-[480px]">
            <div className="bg-[#1A1B1F] rounded-2xl p-6 border border-white/5 animate-float" style={{ animationDelay: '1s' }}>
              <span className="text-white font-bold block mb-5">Convert & Fund</span>

              <div className="bg-[#111113] rounded-xl p-4 mb-3 border border-white/5">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-2">You Send</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">2.5000</span>
                  <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                    <img src="/sol-logo.png" alt="SOL" className="w-4 h-4 rounded-full" />
                    <span className="text-white text-xs font-bold">SOL</span>
                  </div>
                </div>
                <span className="text-gray-500 text-[10px] mt-1 block">Balance: 14.2831 SOL</span>
              </div>

              <div className="flex justify-center -my-1.5 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#FF5550] flex items-center justify-center">
                  <ChevronRight size={14} className="text-white rotate-90" />
                </div>
              </div>

              <div className="bg-[#111113] rounded-xl p-4 mt-0 border border-white/5">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-2">You Receive</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">392.50</span>
                  <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                    <img src="/usdc-logo.png" alt="USDC" className="w-4 h-4 rounded-full" />
                    <span className="text-white text-xs font-bold">USDC</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500">
                <div className="flex justify-between"><span>Rate</span><span className="text-gray-300">1 SOL = 157.00 USDC</span></div>
                <div className="flex justify-between"><span>Network Fee</span><span className="text-gray-300">~0.0001 SOL</span></div>
              </div>

              <button className="w-full mt-5 bg-[#FF5550] hover:bg-[#E84B47] text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2">
                Confirm Conversion <ArrowRight size={14} />
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <RevealOnScroll className="text-center mb-16">
        <span className="text-[#FF5550] text-sm font-bold uppercase tracking-widest block mb-4">Security & Control</span>
        <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A1A] mb-6">
          Built for peace of mind
        </h2>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Every card comes with granular controls. Freeze instantly, limit merchants, toggle contactless — all from your dashboard.
        </p>
      </RevealOnScroll>

      <StaggerWrap className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" gap={0.08}>
        {[
          { icon: <Lock size={22} />, title: 'Freeze Instantly', desc: 'One tap to pause all transactions. Unfreeze just as fast.' },
          { icon: <Shield size={22} />, title: 'Spending Limits', desc: 'Set monthly caps per card. Get notified when approaching limits.' },
          { icon: <Globe size={22} />, title: 'Global Acceptance', desc: 'Works at 80M+ merchants and ATMs via standard Visa rails.' },
          { icon: <Zap size={22} />, title: 'Real-Time Alerts', desc: 'Every transaction triggers an instant notification in your dashboard.' },
        ].map((item) => (
          <motion.div key={item.title} variants={fadeUp} className="bg-[#FAFAFA] rounded-2xl p-7 border border-gray-100 hover:border-[#FF5550]/20 transition-colors duration-300">
            <div className="w-12 h-12 bg-[#FF5550]/8 rounded-xl flex items-center justify-center text-[#FF5550] mb-5">
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </StaggerWrap>
    </section>
  );
}

function CapabilitiesSection() {
  const flagColors = useMemo(() =>
    Array.from({ length: 25 }).map(() => ({
      deg: Math.random() * 360,
      h1: Math.random() * 360,
      h2: Math.random() * 360,
    })), []
  );

  return (
    <section className="bg-[#111113] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-14">
          <span className="text-[#FF5550] text-sm font-bold uppercase tracking-widest block mb-4">Platform</span>
          <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold leading-[1.08] tracking-tight text-white">
            Everything in one place
          </h2>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" gap={0.1}>
          <motion.div variants={fadeUp} className="bg-gradient-to-br from-[#FF5550] to-[#111113] rounded-[28px] p-7 flex flex-col lg:row-span-2 relative overflow-hidden border border-[#FF5550]/20">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7 shadow-lg shadow-[#FF5550]/30">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Rewards & Cashback</h3>
            <p className="text-[#9CA3AF] leading-relaxed mb-7">
              Earn tokenized cashback on every purchase. Refer friends and unlock bonus rewards — credited automatically to your WispTap balance.
            </p>

            <div className="bg-[#141315] rounded-[20px] p-5 mt-auto border border-white/5">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[36px] font-bold text-[#FF5550] leading-none">24.850</span>
                <WispTapLogo className="w-7 h-7" />
              </div>
              <div className="space-y-3.5">
                {[
                  { img: '/apple.png', name: 'Apple Gift Card $100', pts: '10.000' },
                  { img: '/airbnb.png', name: 'Airbnb', pts: '20.000' },
                  { img: '/spotify.png', name: 'Spotify Premium', pts: '5.000' },
                  { img: '/netflix.png', name: 'Netflix 1 month', pts: '5.000' },
                  { img: '/telegram.jpg', name: 'Telegram Premium', pts: '5.000' },
                ].map((r) => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0"><img src={r.img} alt={r.name} className="w-full h-full object-cover" /></div>
                      <span className="text-white text-sm font-medium">{r.name}</span>
                    </div>
                    <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                      <span className="text-white text-xs font-medium">{r.pts}</span>
                      <WispTapLogo className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111113] to-transparent pointer-events-none" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-gradient-to-br from-[#111113] to-[#FF5550]/30 rounded-[28px] p-7 border border-[#FF5550]/15">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M9 8H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">On-Chain Receipts</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              Every top-up and payment links to verifiable on-chain evidence. Export proof bundles for accounting or compliance.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-gradient-to-bl from-[#111113] to-[#FF5550]/30 rounded-[28px] p-7 border border-[#FF5550]/15">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Developer APIs</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              SDKs and webhooks for merchants, payroll, and treasury automation. Build on top of WispTap infrastructure.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-gradient-to-r from-[#FF5550]/25 to-[#111113] rounded-[28px] p-7 lg:col-span-2 flex flex-col md:flex-row gap-7 border border-[#FF5550]/15 overflow-hidden">
            <div className="flex-1">
              <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
                <Lock size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Non-Custodial Security</h3>
              <p className="text-[#9CA3AF] leading-relaxed mb-4">
                Your keys stay with you. Non-custodial wallet flows where possible; custodied rails clearly disclosed. Encrypted secrets, device sessions, and 2FA for dashboard access.
              </p>
              <p className="text-[#9CA3AF] leading-relaxed">
                Optional KYC for fiat rails, bank transfers, and higher limits. Partnership-ready compliance for card networks.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <div className="w-full max-w-sm bg-[#1A1210] rounded-2xl p-6 border border-[#FF5550]/15 shadow-[0_0_30px_rgba(255,85,80,0.08)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#FF5550]/15 rounded-full flex items-center justify-center">
                    <Lock size={20} className="text-[#FF5550]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">2FA Active</h4>
                    <p className="text-gray-400 text-sm">Account secured</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#1A1210] p-3 rounded-xl">
                    <span className="text-gray-300 text-sm">Active Sessions</span>
                    <span className="text-[#FF5550] text-sm font-bold">1 device</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#1A1210] p-3 rounded-xl">
                    <span className="text-gray-300 text-sm">KYC Status</span>
                    <span className="text-[#FF5550] text-sm font-bold">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-gradient-to-l from-[#FF5550]/25 to-[#111113] rounded-[28px] p-7 lg:col-span-2 flex flex-col md:flex-row items-center gap-7 border border-[#FF5550]/15 overflow-hidden">
            <div className="flex-1">
              <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
                <Globe size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Accepted worldwide.<br className="hidden md:block" />Standard Visa rails.</h3>
              <p className="text-[#9CA3AF] leading-relaxed">
                Pay at merchants and ATMs across 200+ countries via standard card networks. Built for travelers, remote workers, and global teams.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-5 gap-2 opacity-50">
              {flagColors.map((c, i) => (
                <div key={i} className="w-8 h-6 rounded-sm" style={{
                  background: `linear-gradient(${c.deg}deg, hsl(${c.h1}, 70%, 50%), hsl(${c.h2}, 70%, 50%))`
                }} />
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-gradient-to-tl from-[#FF5550]/30 to-[#111113] rounded-[28px] p-7 border border-[#FF5550]/15">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Low-Fee Transactions</h3>
            <p className="text-[#9CA3AF] leading-relaxed text-sm">
              Sponsored-transaction rails reduce friction on everyday purchases. Keep more of what you spend.
            </p>
          </motion.div>
        </StaggerWrap>

        <RevealOnScroll delay={0.2}>
          <div className="mt-10 bg-[#1C1A1E] rounded-[28px] md:rounded-full py-5 px-8 flex flex-col md:flex-row items-center justify-center gap-4 border border-white/5 text-center">
            <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold">Everything managed from your</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FF5550] rounded-full flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-white" />
              </div>
              <span className="text-[#FF5550] text-xl sm:text-2xl md:text-3xl font-bold">Web Dashboard</span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function CTAFooterSection() {
  return (
    <section className="bg-[#FF5550] relative overflow-hidden pt-20 pb-8">
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] pointer-events-none opacity-[0.05] z-0">
        <svg viewBox="0 0 1000 1000" className="w-full h-full animate-[spin_60s_linear_infinite]">
          <path id="textPath" d="M 500, 500 m -320, 0 a 320,320 0 1,1 640,0 a 320,320 0 1,1 -640,0" fill="transparent" />
          <text className="text-[110px] font-black tracking-[0.05em] fill-black uppercase">
            <textPath href="#textPath" startOffset="0%">
              * WISPTAP * CRYPTO FINANCE * WISPTAP * CRYPTO FINANCE
            </textPath>
          </text>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <RevealOnScroll>
          <h2 className="text-[28px] sm:text-[36px] md:text-[52px] font-extrabold text-white text-center mb-8 tracking-tight">
            Ready to take control?
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <Link to="/app" className="bg-white hover:bg-gray-50 text-[#FF5550] px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-lg transition-all duration-200 mb-20 shadow-xl">
            <Send size={20} />
            Launch Dashboard
          </Link>
        </RevealOnScroll>

        <StaggerWrap className="w-full grid grid-cols-1 md:grid-cols-2 gap-5" gap={0.1}>
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 md:p-12 flex flex-col justify-between min-h-[320px] sm:min-h-[400px] shadow-sm">
            <h3 className="text-[40px] sm:text-[48px] md:text-[64px] font-extrabold leading-[1.05] tracking-tight text-[#1A1A1A]">
              Hold,<br/>spend,<br/>convert.
            </h3>
            <div className="mt-14">
              <div className="flex items-center gap-2 mb-6">
                <WispTapLogo className="w-8 h-8" />
                <span className="text-3xl font-bold tracking-tight text-[#1A1A1A]">WispTap</span>
              </div>
              <p className="text-[15px] font-medium text-gray-900">2026 All Rights Reserved, WispTap.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 md:p-12 flex-1 shadow-sm">
              <h3 className="text-[28px] sm:text-[36px] md:text-[44px] font-extrabold text-[#1A1A1A] mb-6 sm:mb-8 tracking-tight">Get in Touch</h3>
              <p className="text-base sm:text-lg text-gray-900 mb-5 sm:mb-8 font-medium leading-relaxed">
                Questions? Visit our <a href="#" className="underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">Help Center</a> for guides and support.
              </p>
              <p className="text-base sm:text-lg text-gray-900 font-medium">
                Follow us on <a href="https://x.com/WispTapX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </a>
              </p>
            </div>

            <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 flex flex-wrap items-center gap-6 sm:gap-10 shadow-sm">
              <a href="#" className="text-base font-semibold text-gray-900 underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">Terms of Use</a>
              <a href="#" className="text-base font-semibold text-gray-900 underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">Privacy Policy</a>
            </div>
          </motion.div>
        </StaggerWrap>

        <div className="w-full flex flex-col md:flex-row justify-between items-center mt-14 text-[13px] font-medium text-white/40 text-center md:text-left gap-4 px-4">
          <p>WispTap products may not be available in all regions.</p>
          <p>WispTap is a financial technology company, not a bank. Not FDIC insured.</p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <CardsShowcaseSection />
      <FundingSection />
      <SecuritySection />
      <CapabilitiesSection />
      <CTAFooterSection />
    </div>
  );
}
