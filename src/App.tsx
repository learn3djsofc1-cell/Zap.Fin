import { useState } from 'react';
import { ArrowRight, Check, Lock, Zap, Globe, Shield, CreditCard, Wallet, Menu, X, Send, BarChart3, Bell, TrendingUp, Sparkles, ArrowUpRight, Layers, Repeat, Copy } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

function RevealOnScroll({ children, className, delay = 0, direction = 'up' }: { children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const offsets: Record<string, { x: number; y: number }> = {
    up: { y: 50, x: 0 }, down: { y: -50, x: 0 }, left: { x: 50, y: 0 }, right: { x: -50, y: 0 },
  };
  return (
    <motion.div ref={ref} initial={{ opacity: 0, ...offsets[direction] }} animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offsets[direction] }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerWrap({ children, className, gap = 0.1 }: { children: ReactNode; className?: string; gap?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }} className={className}>
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Cards', href: '#cards' },
    { name: 'Funding', href: '#funding' },
    { name: 'Security', href: '#security' },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="WispTap" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">WispTap</span>
        </a>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.name} href={l.href} className="text-sm text-gray-500 hover:text-[#FF5550] font-medium transition-colors">{l.name}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#FF5550]/20">Launch App</Link>
        </div>
        <button className="md:hidden text-[#1A1A1A] p-1.5" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg md:hidden flex flex-col px-5 py-4 gap-3 z-50">
            {links.map((l) => (<a key={l.name} href={l.href} className="text-gray-700 font-medium py-2 text-sm" onClick={() => setOpen(false)}>{l.name}</a>))}
            <Link to="/app" className="bg-[#FF5550] text-white px-5 py-3 rounded-xl font-semibold text-sm text-center mt-1" onClick={() => setOpen(false)}>Launch App</Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const [caCopied, setCaCopied] = useState(false);
  const CA = '9aQaewctzLanp5U4XQNqgiSxf6aHatsG1fBwoucKpump';

  const handleCopyCA = () => {
    navigator.clipboard.writeText(CA).then(() => {
      setCaCopied(true);
      setTimeout(() => setCaCopied(false), 2000);
    });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F5] via-white to-white z-0" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#FF5550]/5 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF5550]/3 rounded-full blur-3xl z-0" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-12 pb-20 lg:pt-20 lg:pb-28 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-14 lg:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 bg-[#FF5550]/8 border border-[#FF5550]/15 text-[#FF5550] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <Sparkles size={14} /> Built on Solana
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6">
            <button onClick={handleCopyCA} className="group inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200/80 border border-gray-200 rounded-full px-4 py-2 transition-all cursor-pointer">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CA</span>
              <span className="text-[11px] sm:text-xs font-mono text-gray-600 truncate max-w-[180px] sm:max-w-none">{CA}</span>
              {caCopied ? (
                <Check size={13} className="text-green-500 shrink-0" />
              ) : (
                <Copy size={13} className="text-gray-400 group-hover:text-[#FF5550] shrink-0 transition-colors" />
              )}
            </button>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }} className="text-[36px] sm:text-[50px] md:text-[64px] lg:text-[72px] font-extrabold leading-[1.06] tracking-tight text-[#1A1A1A] mb-6">
            Spend crypto like cash.<br className="hidden sm:block" /> <span className="text-[#FF5550]">Anywhere.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
            WispTap turns your Solana wallet into a spending account. Issue virtual Visa cards, convert SOL to stablecoins, and pay at merchants worldwide, all from one dashboard.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#FF5550]/20">
              <Send size={16} /> Get Started Free
            </Link>
            <Link to="/docs" className="text-gray-600 hover:text-[#1A1A1A] font-semibold text-sm flex items-center gap-1.5 px-5 py-3.5 transition-colors">
              Documentation <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="max-w-5xl mx-auto">
          <div className="bg-[#0D0E11] rounded-2xl sm:rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.35)] border border-white/[0.06] overflow-hidden">
            <div className="h-9 bg-[#161719] border-b border-white/5 flex items-center px-4">
              <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" /></div>
              <div className="mx-auto bg-[#0D0E11] rounded px-14 py-0.5 text-[9px] text-gray-600 font-mono border border-white/5">wisptap.xyz/app</div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="" className="w-5 h-5 rounded" />
                  <span className="text-white font-bold text-xs">WispTap</span>
                  <span className="text-gray-600 text-[10px] mx-2">|</span>
                  <span className="text-gray-400 text-[10px]">Overview</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1A1B1E] flex items-center justify-center"><Bell size={12} className="text-gray-500" /></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF5550] to-[#c43c38] flex items-center justify-center"><span className="text-white text-[8px] font-bold">JD</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
                <div className="bg-[#161719] rounded-xl p-3 sm:p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2"><span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">Balance</span><TrendingUp size={10} className="text-green-400" /></div>
                  <span className="text-lg sm:text-xl font-bold text-white block">$12,450</span>
                  <span className="text-green-400 text-[10px] font-bold">+8.2% ↑</span>
                </div>
                <div className="bg-[#161719] rounded-xl p-3 sm:p-4 border border-white/5">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-2">SOL Price</span>
                  <span className="text-lg sm:text-xl font-bold text-white block">$157.24</span>
                  <span className="text-green-400 text-[10px] font-bold">+3.1%</span>
                </div>
                <div className="bg-[#161719] rounded-xl p-3 sm:p-4 border border-white/5">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-2">Cards</span>
                  <span className="text-lg sm:text-xl font-bold text-white block">2</span>
                  <span className="text-gray-500 text-[10px]">Active</span>
                </div>
                <div className="bg-[#161719] rounded-xl p-3 sm:p-4 border border-white/5">
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-2">Spent</span>
                  <span className="text-lg sm:text-xl font-bold text-white block">$2,180</span>
                  <span className="text-gray-500 text-[10px]">This month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="sm:col-span-2 bg-[#161719] rounded-xl p-3 sm:p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-[11px] font-bold">Activity</span>
                    <div className="flex gap-1.5">
                      {['1D', '1W', '1M'].map(p => (<button key={p} className={`text-[8px] font-bold px-2 py-0.5 rounded ${p === '1W' ? 'bg-[#FF5550] text-white' : 'text-gray-500 bg-[#0D0E11]'}`}>{p}</button>))}
                    </div>
                  </div>
                  <div className="flex items-end gap-[3px] h-16 sm:h-20">
                    {[35, 50, 42, 65, 55, 72, 60, 80, 68, 90, 75, 95, 82, 70, 88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i >= 12 ? '#FF5550' : i >= 9 ? 'rgba(255,85,80,0.5)' : 'rgba(255,85,80,0.15)' }} />
                    ))}
                  </div>
                </div>

                <div className="bg-[#161719] rounded-xl p-3 sm:p-4 border border-white/5">
                  <span className="text-white text-[11px] font-bold block mb-3">Holdings</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'SOL', val: '45.2', usd: '$7,107', pct: 57, color: '#9945FF' },
                      { name: 'USDC', val: '3,200', usd: '$3,200', pct: 26, color: '#2775CA' },
                      { name: 'USDT', val: '2,143', usd: '$2,143', pct: 17, color: '#26A17B' },
                    ].map(t => (
                      <div key={t.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <img src={t.name === 'SOL' ? '/sol-logo.png' : t.name === 'USDC' ? '/usdc-logo.png' : '/usdt-logo.png'} alt={t.name} className="w-3.5 h-3.5 rounded-full" />
                            <span className="text-white text-[10px] font-medium">{t.name}</span>
                          </div>
                          <span className="text-gray-400 text-[9px]">{t.usd}</span>
                        </div>
                        <div className="w-full h-1 bg-[#0D0E11] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                        </div>
                      </div>
                    ))}
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
    { num: '01', title: 'Create Wallet', desc: 'Generate a self-custody Solana wallet in seconds. Your keys stay with you.', icon: <Wallet size={22} /> },
    { num: '02', title: 'Issue Cards', desc: 'Spin up virtual Visa cards instantly. Each card has its own limits and controls.', icon: <CreditCard size={22} /> },
    { num: '03', title: 'Fund & Spend', desc: 'Convert SOL to stablecoins and spend at any Visa-accepting merchant worldwide.', icon: <Zap size={22} /> },
  ];
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealOnScroll className="text-center mb-14">
          <span className="text-[#FF5550] text-xs font-bold uppercase tracking-widest block mb-3">How It Works</span>
          <h2 className="text-[32px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A1A]">
            Wallet to card in three steps
          </h2>
        </RevealOnScroll>
        <StaggerWrap className="grid grid-cols-1 md:grid-cols-3 gap-5" gap={0.1}>
          {steps.map((step) => (
            <motion.div key={step.num} variants={fadeUp} className="relative bg-[#FAFAFA] rounded-2xl p-7 border border-gray-100 hover:border-[#FF5550]/20 transition-colors group">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-[#FF5550]/8 rounded-xl flex items-center justify-center text-[#FF5550] group-hover:bg-[#FF5550] group-hover:text-white transition-all">{step.icon}</div>
                <span className="text-[#FF5550]/10 text-5xl font-black">{step.num}</span>
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function CardsShowcaseSection() {
  return (
    <section id="cards" className="py-20 lg:py-28 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <RevealOnScroll direction="left" className="flex-1 text-center lg:text-left">
            <span className="text-[#FF5550] text-xs font-bold uppercase tracking-widest block mb-3">Card Issuance</span>
            <h2 className="text-[32px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A1A] mb-5">
              Virtual cards,<br className="hidden sm:block" /> instant access
            </h2>
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-6">
              Issue Visa cards on demand for online shopping, subscriptions, and one-time purchases. Set individual spending limits and freeze any card with a single tap.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-4">
              {['Online payments', 'Subscriptions', 'One-time use', 'Team cards'].map(f => (
                <span key={f} className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg">{f}</span>
              ))}
            </div>
            <Link to="/app/cards" className="inline-flex items-center gap-2 text-[#FF5550] font-bold text-sm hover:gap-3 transition-all">Issue your first card <ArrowRight size={16} /></Link>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="flex-1 w-full max-w-[480px]">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-[280px] h-[170px] sm:w-[320px] sm:h-[190px] bg-gradient-to-br from-[#222] via-[#333] to-[#1a1a1a] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl border border-white/10 rotate-[-6deg] z-10">
                <div className="flex justify-between items-start"><div className="w-8 h-6 rounded bg-gradient-to-br from-[#e6d5a7] to-[#b89f65] border border-[#967d46]" /><span className="text-white/60 text-[8px] font-bold uppercase tracking-wider">Platinum</span></div>
                <div><div className="text-white/50 text-[10px] font-mono tracking-[3px] mb-1">•••• •••• •••• 4821</div><div className="flex justify-between"><span className="text-white/80 text-xs font-medium">J. Doe</span><span className="text-white font-bold text-xs italic">VISA</span></div></div>
              </div>
              <div className="relative ml-8 sm:ml-12 mt-6 w-[280px] h-[170px] sm:w-[320px] sm:h-[190px] bg-gradient-to-br from-[#FF5550] via-[#FF6B67] to-[#c43c38] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl rotate-[3deg] z-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10" />
                <div className="flex justify-between items-start relative z-10"><div className="w-8 h-6 rounded bg-white/25" /><span className="text-white/80 text-[8px] font-bold uppercase tracking-wider">Virtual</span></div>
                <div className="relative z-10"><div className="text-white/60 text-[10px] font-mono tracking-[3px] mb-1">•••• •••• •••• 7291</div><div className="flex justify-between"><span className="text-white text-xs font-medium">J. Doe</span><span className="text-white font-bold text-xs italic">VISA</span></div></div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

function FundingSection() {
  return (
    <section id="funding" className="py-20 lg:py-28 bg-[#0D0E11]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <RevealOnScroll direction="left" delay={0.1} className="flex-1 w-full max-w-[440px] order-2 lg:order-1">
            <div className="bg-[#161719] rounded-2xl p-5 sm:p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-5"><Repeat size={16} className="text-[#FF5550]" /><span className="text-white font-bold text-sm">Quick Convert</span></div>
              <div className="bg-[#0D0E11] rounded-xl p-4 border border-white/5">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-2">From</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">2.5000</span>
                  <div className="bg-[#161719] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10"><img src="/sol-logo.png" alt="SOL" className="w-4 h-4 rounded-full" /><span className="text-white text-xs font-bold">SOL</span></div>
                </div>
                <span className="text-gray-600 text-[10px] mt-1 block">≈ $392.50 USD</span>
              </div>
              <div className="flex justify-center -my-1.5 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#FF5550] flex items-center justify-center shadow-lg shadow-[#FF5550]/20"><ArrowRight size={14} className="text-white rotate-90" /></div>
              </div>
              <div className="bg-[#0D0E11] rounded-xl p-4 border border-white/5">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-2">To</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">392.50</span>
                  <div className="bg-[#161719] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10"><img src="/usdc-logo.png" alt="USDC" className="w-4 h-4 rounded-full" /><span className="text-white text-xs font-bold">USDC</span></div>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-[10px] text-gray-500"><span>Rate: 1 SOL = 157.00 USDC</span><span>Fee: ~0.0001 SOL</span></div>
              <button className="w-full mt-4 bg-[#FF5550] hover:bg-[#E84B47] text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">Convert Now</button>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="right" className="flex-1 text-center lg:text-left order-1 lg:order-2">
            <span className="text-[#FF5550] text-xs font-bold uppercase tracking-widest block mb-3">Instant Funding</span>
            <h2 className="text-[32px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.08] tracking-tight text-white mb-5">
              SOL in, dollars out
            </h2>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-7">
              Convert SOL to USDC or USDT with live rates and near-zero fees. Your card balance updates instantly. No bridging, no delays.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {[{ src: '/sol-logo.png', name: 'SOL' }, { src: '/usdc-logo.png', name: 'USDC' }, { src: '/usdt-logo.png', name: 'USDT' }].map(t => (
                <div key={t.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                  <img src={t.src} alt={t.name} className="w-5 h-5 rounded-full" /><span className="text-white font-bold text-xs">{t.name}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealOnScroll className="text-center mb-14">
          <span className="text-[#FF5550] text-xs font-bold uppercase tracking-widest block mb-3">Security First</span>
          <h2 className="text-[32px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A1A] mb-4">Your money, your control</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Granular controls for every card. Freeze, limit, and monitor in real time.</p>
        </RevealOnScroll>
        <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" gap={0.08}>
          {[
            { icon: <Lock size={20} />, title: 'Instant Freeze', desc: 'Pause transactions on any card with a single tap.' },
            { icon: <Shield size={20} />, title: 'Spending Limits', desc: 'Set daily or monthly caps per card to stay on budget.' },
            { icon: <Globe size={20} />, title: '200+ Countries', desc: 'Accepted at merchants worldwide on standard Visa rails.' },
            { icon: <Bell size={20} />, title: 'Live Alerts', desc: 'Real-time notifications for every transaction.' },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100 hover:border-[#FF5550]/20 transition-colors">
              <div className="w-10 h-10 bg-[#FF5550]/8 rounded-xl flex items-center justify-center text-[#FF5550] mb-4">{item.icon}</div>
              <h3 className="text-base font-bold text-[#1A1A1A] mb-1.5">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function PlatformSection() {
  const features = [
    {
      icon: <BarChart3 size={24} />,
      title: 'Portfolio Dashboard',
      desc: 'Real-time portfolio tracking with SOL, USDC, and USDT breakdowns. See your net worth at a glance with interactive charts and detailed analytics.',
      visual: (
        <div className="bg-[#161719] rounded-2xl p-5 border border-white/5 w-full max-w-[380px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-xs font-bold">Portfolio</span>
            <div className="flex gap-1">{['1D', '1W', '1M'].map(p => (<span key={p} className={`text-[8px] font-bold px-2 py-0.5 rounded ${p === '1M' ? 'bg-[#FF5550] text-white' : 'text-gray-500 bg-[#0D0E11]'}`}>{p}</span>))}</div>
          </div>
          <div className="flex items-end gap-[3px] h-24 mb-3">
            {[30, 45, 35, 55, 50, 70, 60, 80, 75, 90, 85, 95, 88, 92, 86].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `rgba(255,85,80,${0.15 + (i / 15) * 0.85})` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px]"><span className="text-gray-500">30 days ago</span><span className="text-[#FF5550] font-bold">+12.4%</span></div>
        </div>
      ),
    },
    {
      icon: <Layers size={24} />,
      title: 'Multi-Card Management',
      desc: 'Run multiple virtual cards simultaneously. One for subscriptions, one for shopping, one for travel. Each with independent limits and controls.',
      visual: (
        <div className="w-full max-w-[380px] relative">
          <div className="bg-gradient-to-br from-[#222] via-[#333] to-[#1a1a1a] rounded-xl p-4 border border-white/10 mb-[-30px] ml-4 relative z-10">
            <div className="flex justify-between mb-3"><span className="text-white/60 text-[9px] font-bold uppercase">Subscriptions</span><span className="text-white/40 text-[8px] italic font-bold">VISA</span></div>
            <span className="text-white/40 text-[9px] font-mono tracking-[2px]">•••• •••• •••• 4821</span>
          </div>
          <div className="bg-gradient-to-br from-[#FF5550] to-[#c43c38] rounded-xl p-4 border border-white/10 relative z-20 ml-0">
            <div className="flex justify-between mb-3"><span className="text-white/80 text-[9px] font-bold uppercase">Shopping</span><span className="text-white/60 text-[8px] italic font-bold">VISA</span></div>
            <span className="text-white/50 text-[9px] font-mono tracking-[2px]">•••• •••• •••• 7291</span>
          </div>
        </div>
      ),
    },
    {
      icon: <ArrowUpRight size={24} />,
      title: 'On-Chain Receipts',
      desc: 'Every transaction linked to verifiable on-chain evidence. Export proof bundles for tax compliance or personal record-keeping.',
      visual: (
        <div className="bg-[#161719] rounded-2xl p-5 border border-white/5 w-full max-w-[380px]">
          <span className="text-white text-xs font-bold block mb-3">Recent Proofs</span>
          <div className="flex flex-col gap-2">
            {[
              { tx: 'tx:8Kv2...mFx3', time: '2m ago', amt: '$42.50' },
              { tx: 'tx:3Jp4...nRw1', time: '1h ago', amt: '$127.00' },
              { tx: 'tx:9Bq7...kLm2', time: '3h ago', amt: '$15.99' },
            ].map(item => (
              <div key={item.tx} className="flex items-center justify-between bg-[#0D0E11] rounded-lg px-3 py-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center"><Check size={10} className="text-green-400" /></div>
                  <code className="text-[#FF5550] text-[9px] font-mono">{item.tx}</code>
                </div>
                <div className="text-right">
                  <span className="text-white text-[9px] font-bold block">{item.amt}</span>
                  <span className="text-gray-600 text-[8px]">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Cashback Rewards',
      desc: 'Earn tokenized cashback on every purchase. Refer friends to unlock bonus rewards credited directly to your WispTap balance.',
      visual: (
        <div className="bg-[#161719] rounded-2xl p-5 border border-white/5 w-full max-w-[380px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-xs font-bold">Rewards Earned</span>
            <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded">+3.2 this week</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-extrabold text-[#FF5550]">24.8</span>
            <img src="/logo.png" alt="" className="w-4 h-4 rounded" />
            <span className="text-gray-500 text-xs">tokens earned</span>
          </div>
          <div className="w-full h-1.5 bg-[#0D0E11] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#FF5550] to-[#FF7A76]" style={{ width: '62%' }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px]"><span className="text-gray-500">24.8 / 40 to next tier</span><span className="text-[#FF5550] font-bold">62%</span></div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#0D0E11]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#FF5550] text-xs font-bold uppercase tracking-widest block mb-3">Platform</span>
          <h2 className="text-[32px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">More than a card</h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">A complete financial toolkit built on Solana, from portfolio tracking to on-chain receipts.</p>
        </RevealOnScroll>

        <div className="flex flex-col gap-8">
          {features.map((f, idx) => (
            <RevealOnScroll key={f.title} delay={idx * 0.08} direction={idx % 2 === 0 ? 'left' : 'right'}>
              <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-14 bg-[#161719] rounded-2xl p-6 sm:p-8 lg:p-10 border border-white/5 hover:border-[#FF5550]/10 transition-colors`}>
                <div className="flex-1 text-center lg:text-left">
                  <div className="w-12 h-12 bg-[#FF5550]/10 rounded-xl flex items-center justify-center text-[#FF5550] mb-5 mx-auto lg:mx-0">{f.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">{f.desc}</p>
                </div>
                <div className="flex-1 flex justify-center lg:justify-end w-full">{f.visual}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.15} className="mt-10">
          <div className="bg-gradient-to-r from-[#FF5550]/10 to-transparent rounded-2xl p-6 sm:p-8 border border-[#FF5550]/10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF5550] rounded-xl flex items-center justify-center shrink-0"><Globe size={22} className="text-white" /></div>
              <div><h3 className="text-white font-bold text-lg">Accepted in 200+ countries</h3><p className="text-gray-400 text-sm">Standard Visa rails. Works at merchants worldwide.</p></div>
            </div>
            <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shrink-0">Get Started</Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-[#0D0E11] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="py-16 sm:py-20">
          <RevealOnScroll className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[40px] md:text-[48px] font-extrabold text-white tracking-tight mb-4">
              Ready to go borderless?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8">Join thousands using WispTap to spend crypto seamlessly.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF5550]/20"><Send size={16} /> Create Free Account</Link>
              <Link to="/docs" className="bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/10">Documentation</Link>
            </div>
          </RevealOnScroll>
        </div>

        <div className="border-t border-white/5 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="WispTap" className="w-7 h-7 rounded-lg" />
              <span className="text-white font-bold text-base">WispTap</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">Solana-powered finance. Your wallet, your card, your rules.</p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Product</h4>
            <div className="flex flex-col gap-2">
              <a href="#how-it-works" className="text-gray-400 text-sm hover:text-white transition-colors">How It Works</a>
              <a href="#cards" className="text-gray-400 text-sm hover:text-white transition-colors">Cards</a>
              <a href="#funding" className="text-gray-400 text-sm hover:text-white transition-colors">Funding</a>
              <a href="#security" className="text-gray-400 text-sm hover:text-white transition-colors">Security</a>
              <Link to="/docs" className="text-gray-400 text-sm hover:text-white transition-colors">Documentation</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Company</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Help Center</a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Connect</h4>
            <div className="flex flex-col gap-2">
              <a href="https://x.com/WispTapX" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter / X
              </a>
            </div>
            <div className="mt-5">
              <p className="text-gray-500 text-xs mb-2">Get product updates</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-1.5">
                <input type="email" placeholder="you@email.com" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5550]/50 transition-colors" />
                <button type="submit" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0">
                  <Send size={12} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600">
          <span>&copy; 2026 WispTap. All rights reserved.</span>
          <span>WispTap is a financial technology company, not a bank. Not FDIC insured.</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <CardsShowcaseSection />
      <FundingSection />
      <SecuritySection />
      <PlatformSection />
      <FooterSection />
    </div>
  );
}
