import { useState } from 'react';
import { Send, Lock, RefreshCw, Copy, ChevronDown, MoreHorizontal, Eye, Wifi, ChevronLeft, ArrowRight, Menu, X } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

function AnimatedSection({ children, className, delay = 0, direction = 'up' }: { children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const directionMap = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionMap[direction] }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className, staggerDelay = 0.1 }: { children: ReactNode; className?: string; staggerDelay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const ZapLogo = ({ className }: { className?: string }) => (
  <img src="/logo.png" alt="Zap.Fin" className={`${className || ''} rounded-lg`} />
);

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Cards', href: '#cards' },
    { name: 'Top-ups', href: '#topups' },
    { name: 'Controls', href: '#controls' },
  ];

  return (
    <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-50">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <ZapLogo className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight text-[#0F1014]">Zap.Fin</span>
        </a>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-gray-500 hover:text-[#FF6940] transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button className="bg-[#0F1014] hover:bg-black text-[#FF6940] px-6 py-2.5 rounded-full font-medium flex items-center gap-2 text-sm transition-colors">
            Launch App
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-[#0F1014] p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg md:hidden flex flex-col px-6 py-4 gap-4 z-50">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-gray-800 font-medium py-2 hover:text-[#FF6940] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <button className="bg-[#0F1014] hover:bg-black text-[#FF6940] px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 text-base transition-colors mt-2 w-full">
            Launch App
          </button>
        </div>
      )}
    </nav>
  );
}

function HeroLeft() {
  return (
    <div className="w-full lg:w-[55%] z-10 pt-10 lg:pt-20">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[84px] font-extrabold leading-[1.05] tracking-tight text-[#0F1014]"
      >
        INSTANT CRYPTO<br />
        TOP-UPS &<br />
        GLOBAL SPENDING
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-[20px] sm:text-[24px] md:text-[32px] font-normal text-[#0F1014] mt-6 md:mt-8 leading-[1.2]"
      >
        Card control from your<br />
        web dApp dashboard.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-8 md:mt-12 bg-[#0F1014] hover:bg-black text-[#FF6940] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium flex items-center justify-center sm:justify-start gap-3 text-base sm:text-lg transition-colors w-full sm:w-auto"
      >
        <Send size={20} className="fill-[#FF6940]" />
        Launch Dashboard
      </motion.button>
    </div>
  );
}

function HeroRight() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full lg:w-[45%] h-[300px] sm:h-[400px] lg:h-[500px] mt-8 lg:mt-0 flex justify-center items-center pointer-events-none"
    >
      <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
      {/* Yellow Circle Background */}
      <div className="absolute w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] bg-[#FF6940] rounded-full right-[-5%] lg:right-[-10%] top-1/2 -translate-y-1/2 z-0"></div>

      {/* Web App Dashboard Mockup */}
      <div className="absolute z-10 w-[640px] h-[420px] bg-[#0F1014] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden flex flex-col animate-float">
        {/* Browser/App Header */}
        <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="mx-auto bg-[#0F1014] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">zap-finance.xyz</div>
        </div>
        
        {/* Dashboard Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2 mb-4">
               <ZapLogo className="w-6 h-6" />
               <span className="text-white font-bold text-sm">Zap.Fin</span>
            </div>
            <div className="flex items-center gap-3 text-[#FF6940] bg-[#FF6940]/10 px-3 py-2 rounded-lg text-xs font-medium">
              <div className="w-4 h-4 rounded-full bg-[#FF6940] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Dashboard
            </div>
            <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Cards
            </div>
            <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Top-ups
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6 flex flex-col gap-6 bg-[#0F1014] overflow-hidden">
            {/* Top Bar */}
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-white text-lg font-bold">Overview</h2>
              <div className="flex items-center gap-3">
                <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/5 font-mono">0x1234...5678</div>
                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                  <img src="https://picsum.photos/seed/user3/50/50" alt="user" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            
            {/* Balance & Card */}
            <div className="flex gap-4 shrink-0">
              {/* Balance Card */}
              <div className="flex-1 bg-[#1A1B1F] rounded-xl p-5 border border-white/5 flex flex-col justify-between">
                <span className="text-gray-400 text-xs font-medium">Total Balance (USDC)</span>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">$1,286</span>
                  <span className="text-xl text-gray-400">.34</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-[#FF6940] text-black text-xs font-bold py-2 rounded-lg">Top Up</button>
                  <button className="flex-1 bg-[#2A2B30] text-white text-xs font-bold py-2 rounded-lg">Send</button>
                </div>
              </div>
              
              {/* Virtual Card */}
              <div className="w-[200px] bg-gradient-to-br from-[#FF6940] to-[#D95A36] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-6 h-4 bg-black/20 rounded-sm"></div>
                  <span className="text-black font-bold text-xs italic">VISA</span>
                </div>
                <div className="relative z-10 mt-6">
                  <div className="text-black/60 text-[10px] font-mono mb-1 tracking-widest">•••• •••• •••• 1919</div>
                  <div className="flex justify-between items-end">
                    <span className="text-black font-bold text-sm">Virtual Card</span>
                    <span className="text-black/80 text-[10px] font-mono">12/28</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-[#1A1B1F] rounded-xl p-5 border border-white/5 flex-1 flex flex-col">
              <span className="text-white text-sm font-bold mb-4 block">Recent Activity</span>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <img src="/netflix.png" alt="Netflix" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Netflix Subscription</div>
                      <div className="text-gray-500 text-[10px]">Today, 14:20</div>
                    </div>
                  </div>
                  <span className="text-white text-xs font-bold">-$15.99</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <img src="/usdc.png" alt="USDC" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">USDC Top-up</div>
                      <div className="text-gray-500 text-[10px]">Yesterday, 09:45</div>
                    </div>
                  </div>
                  <span className="text-[#FF6940] text-xs font-bold">+$500.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

function GetCardSection() {
  return (
    <section id="cards" className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <AnimatedSection className="text-center mb-16">
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Zap.Fin is a web dApp that turns crypto into everyday spending. Issue virtual or metal Visa-compatible cards, top up instantly from your wallet, and manage everything from a single dashboard no separate apps required.</p>
      </AnimatedSection>
      <div className="flex flex-col lg:flex-row items-center">
      <AnimatedSection direction="left" className="w-full lg:w-1/2 relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px]">
        <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
        
        {/* Web App Dashboard Mockup for Cards */}
        <div className="absolute z-10 w-[640px] h-[420px] bg-[#0F1014] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden flex flex-col animate-float" style={{ animationDelay: '0.5s' }}>
          {/* Browser/App Header */}
          <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="mx-auto bg-[#0F1014] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">zap-finance.xyz/cards</div>
          </div>
          
          {/* Dashboard Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                 <ZapLogo className="w-6 h-6" />
                 <span className="text-white font-bold text-sm">Zap.Fin</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Dashboard
              </div>
              <div className="flex items-center gap-3 text-[#FF6940] bg-[#FF6940]/10 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-[#FF6940] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Cards
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Top-ups
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col gap-6 bg-[#0F1014] overflow-hidden">
              <div className="flex justify-between items-center shrink-0">
                <h2 className="text-white text-lg font-bold">My Cards</h2>
                <button className="bg-[#FF6940] text-black text-xs font-bold px-4 py-2 rounded-lg">+ New Card</button>
              </div>
              
              <div className="flex gap-4 overflow-hidden">
                {/* Metal Card */}
                <div className="w-[240px] shrink-0 bg-gradient-to-br from-[#8a8a8a] via-[#6a6a6a] to-[#4a4a4a] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden border border-white/20 shadow-lg">
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 3px, rgba(0,0,0,0.8) 3px, rgba(0,0,0,0.8) 4px)' }}></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="w-8 h-6 rounded bg-gradient-to-br from-[#e6d5a7] to-[#b89f65] border border-[#967d46] opacity-90"></div>
                    <span className="bg-black/40 text-white text-[8px] px-2 py-1 rounded font-bold uppercase tracking-wider border border-white/10">Physical Metal</span>
                  </div>
                  <div className="relative z-10 mt-8">
                    <div className="text-white/80 text-xs font-mono mb-1 tracking-widest">•••• •••• •••• 1919</div>
                    <div className="flex justify-between items-end">
                      <span className="text-white font-bold text-sm">John Doe</span>
                      <div className="text-right">
                        <h3 className="text-xl font-extrabold text-white italic leading-none">VISA</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Virtual Card */}
                <div className="w-[240px] shrink-0 bg-gradient-to-br from-[#FF6940] to-[#D95A36] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="w-8 h-6 rounded bg-black/20"></div>
                    <span className="bg-black/10 text-black text-[8px] px-2 py-1 rounded font-bold uppercase tracking-wider border border-black/10">Virtual</span>
                  </div>
                  <div className="relative z-10 mt-8">
                    <div className="text-black/60 text-xs font-mono mb-1 tracking-widest">•••• •••• •••• 4242</div>
                    <div className="flex justify-between items-end">
                      <span className="text-black font-bold text-sm">Online Subs</span>
                      <div className="text-right">
                        <h3 className="text-xl font-extrabold text-black italic leading-none">VISA</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Settings */}
              <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5 flex-1 flex flex-col">
                <span className="text-white text-sm font-bold mb-3 block">Card Settings (Metal •••• 1919)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#2A2B30] p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-gray-400" />
                      <span className="text-gray-300 text-xs font-medium">Show Details</span>
                    </div>
                    <div className="w-8 h-4 bg-[#FF6940] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-black rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-[#2A2B30] p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-gray-400" />
                      <span className="text-gray-300 text-xs font-medium">Freeze Card</span>
                    </div>
                    <div className="w-8 h-4 bg-gray-600 rounded-full relative">
                      <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-[#2A2B30] p-3 rounded-lg flex items-center justify-between col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-xs font-medium">Monthly Limit</span>
                    </div>
                    <span className="text-[#FF6940] text-xs font-bold">$5,000 / $10,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </AnimatedSection>

      <AnimatedSection direction="right" delay={0.2} className="w-full lg:w-1/2 lg:pl-24 mt-8 sm:mt-16 lg:mt-0 text-center lg:text-left">
        <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-[#0F1014]">
          VIRTUAL & PHYSICAL CARDS
        </h2>
        <p className="text-[20px] sm:text-[24px] md:text-[28px] font-normal text-gray-800 mt-6 leading-[1.3] max-w-lg mx-auto lg:mx-0">
          Issue virtual cards instantly for online use or request metal cards for premium access.
        </p>
      </AnimatedSection>
      </div>
    </section>
  );
}

function TopUpSection() {
  return (
    <section id="topups" className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-400 mb-4">Instant Top-ups</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Convert crypto to card balance in one flow using integrated on-chain swaps and relays.</p>
      </AnimatedSection>
      <div className="flex flex-col-reverse lg:flex-row items-center">
      <AnimatedSection direction="left" className="w-full lg:w-1/2 lg:pr-16 text-center lg:text-right mt-8 sm:mt-16 lg:mt-0">
        <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-[#0F1014]">
          INSTANT CRYPTO<br />
          TOP-UPS
        </h2>
        <p className="text-[20px] sm:text-[24px] md:text-[28px] font-normal text-gray-800 mt-6 leading-[1.3] mx-auto lg:ml-auto lg:mr-0 max-w-lg">
          Select wallet, choose amount, preview conversion and fees, confirm - balance updates instantly.
        </p>
      </AnimatedSection>

      <AnimatedSection direction="right" delay={0.2} className="w-full lg:w-1/2 relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px]">
        <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
        
        {/* Web App Dashboard Mockup for Top-ups */}
        <div className="absolute z-10 w-[640px] h-[420px] bg-[#0F1014] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden flex flex-col animate-float" style={{ animationDelay: '0.2s' }}>
          {/* Browser/App Header */}
          <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="mx-auto bg-[#0F1014] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">zap-finance.xyz/topup</div>
          </div>
          
          {/* Dashboard Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                 <ZapLogo className="w-6 h-6" />
                 <span className="text-white font-bold text-sm">Zap.Fin</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Dashboard
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Cards
              </div>
              <div className="flex items-center gap-3 text-[#FF6940] bg-[#FF6940]/10 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-[#FF6940] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Top-ups
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col bg-[#0F1014] overflow-hidden">
              <div className="flex justify-between items-center shrink-0 mb-6">
                <h2 className="text-white text-lg font-bold">Top-up Balance</h2>
                <div className="text-gray-400 text-xs font-medium">Available: <span className="text-white">1,286.34 USDC</span></div>
              </div>
              
              <div className="flex gap-6 h-full">
                {/* Top-up Form */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 block">Select Asset</label>
                    <div className="flex items-center justify-between bg-[#0F1014] p-3 rounded-lg border border-white/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                          <img src="/usdt.png" alt="USDT" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-white text-sm font-bold">USDT <span className="text-gray-500 font-normal">Tether</span></span>
                      </div>
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>

                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 block">Amount</label>
                    <div className="flex items-center justify-between bg-[#0F1014] p-3 rounded-lg border border-white/5">
                      <span className="text-white text-xl font-bold">500.00</span>
                      <span className="text-gray-500 text-sm font-bold">USDT</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500 text-[10px]">≈ $500.00 USD</span>
                      <div className="flex gap-2">
                        <span className="text-[#FF6940] text-[10px] bg-[#FF6940]/10 px-2 py-0.5 rounded cursor-pointer">25%</span>
                        <span className="text-[#FF6940] text-[10px] bg-[#FF6940]/10 px-2 py-0.5 rounded cursor-pointer">50%</span>
                        <span className="text-[#FF6940] text-[10px] bg-[#FF6940]/10 px-2 py-0.5 rounded cursor-pointer">MAX</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary & Confirm */}
                <div className="w-[200px] flex flex-col gap-4">
                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5 flex-1 flex flex-col">
                    <span className="text-white text-sm font-bold mb-4 block">Summary</span>
                    
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">You send</span>
                        <span className="text-white font-medium">500.00 USDT</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Network Fee</span>
                        <span className="text-white font-medium">1.50 USDT</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Rate</span>
                        <span className="text-white font-medium">1 USDT = $1 USD</span>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs font-bold">You receive</span>
                          <span className="text-[#FF6940] text-sm font-bold">$498.50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    Confirm Top-up <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </AnimatedSection>
      </div>
    </section>
  );
}

function SpendControlSection() {
  return (
    <section id="controls" className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-400 mb-4">Card Controls & Feed</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Full card lifecycle management in-browser: limits, freezes, merchant controls, statements, and exports.</p>
      </AnimatedSection>
      <div className="flex flex-col lg:flex-row items-center">
      <AnimatedSection direction="left" className="w-full lg:w-1/2 relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px] mb-8 sm:mb-16 lg:mb-0">
        <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
        
        {/* Web App Dashboard Mockup for Controls & Feed */}
        <div className="absolute z-10 w-[640px] h-[420px] bg-[#0F1014] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden flex flex-col animate-float" style={{ animationDelay: '0.4s' }}>
          {/* Browser/App Header */}
          <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="mx-auto bg-[#0F1014] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">zap-finance.xyz/controls</div>
          </div>
          
          {/* Dashboard Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                 <ZapLogo className="w-6 h-6" />
                 <span className="text-white font-bold text-sm">Zap.Fin</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Dashboard
              </div>
              <div className="flex items-center gap-3 text-[#FF6940] bg-[#FF6940]/10 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-[#FF6940] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Cards
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Top-ups
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col gap-4 bg-[#0F1014] overflow-hidden">
              <div className="flex justify-between items-center shrink-0">
                <h2 className="text-white text-lg font-bold">Card Controls</h2>
                <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-lg text-xs text-white border border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF6940]"></div> Active
                </div>
              </div>
              
              <div className="flex gap-4 h-full overflow-hidden">
                {/* Left Column: Card & Toggles */}
                <div className="w-[220px] flex flex-col gap-4 shrink-0">
                  {/* Card Mini */}
                  <div className="w-full bg-[#FF6940] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-[#FF6940]/10 h-[130px]">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, black 2px, black 4px)' }}></div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="w-6 h-4 rounded bg-black/20"></div>
                      <span className="text-black font-bold text-[10px] italic">VISA</span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <div className="text-black/80 text-xs font-mono mb-1 tracking-widest">•••• 1919</div>
                    </div>
                  </div>

                  {/* Security Toggles */}
                  <div className="bg-[#1A1B1F] rounded-xl p-3 border border-white/5 flex-1 flex flex-col gap-3">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Security</span>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs">Freeze Card</span>
                      <div className="w-8 h-4 bg-gray-600 rounded-full relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs">Online Payments</span>
                      <div className="w-8 h-4 bg-[#FF6940] rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-black rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs">Contactless</span>
                      <div className="w-8 h-4 bg-[#FF6940] rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-black rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Limits & Feed */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
                  {/* Limits */}
                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5 shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Monthly Limit</span>
                      <span className="text-[#FF6940] text-xs font-bold">$2,450 / $5,000</span>
                    </div>
                    <div className="w-full h-2 bg-[#0F1014] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6940] w-[49%]"></div>
                    </div>
                  </div>

                  {/* Transaction Feed */}
                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5 flex-1 flex flex-col min-w-0">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-3 block">Recent Transactions</span>
                    
                    <div className="flex flex-col gap-3 min-w-0">
                      <div className="flex items-center justify-between bg-[#0F1014] p-2.5 rounded-lg border border-white/5 min-w-0 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.586 16.424C16.38 16.762 15.945 16.865 15.607 16.658C12.809 14.95 9.339 14.546 5.478 15.428C5.101 15.514 4.726 15.276 4.64 14.899C4.554 14.522 4.792 14.147 5.169 14.061C9.397 13.096 13.235 13.551 16.332 15.449C16.67 15.656 16.773 16.086 16.586 16.424ZM17.91 13.338C17.653 13.757 17.108 13.882 16.689 13.624C13.483 11.654 8.859 11.074 5.305 12.152C4.836 12.294 4.337 12.029 4.195 11.56C4.053 11.091 4.318 10.592 4.787 10.45C8.865 9.214 14.004 9.866 17.662 12.119C18.081 12.377 18.206 12.922 17.91 13.338ZM18.054 10.122C14.336 7.912 8.328 7.708 4.855 8.763C4.288 8.935 3.682 8.613 3.51 8.046C3.338 7.479 3.66 6.873 4.227 6.701C8.216 5.489 14.846 5.727 19.13 8.271C19.643 8.576 19.812 9.24 19.507 9.753C19.202 10.266 18.538 10.435 18.054 10.122Z"/>
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-xs font-medium truncate">Spotify</p>
                            <p className="text-gray-500 text-[10px] truncate">Today, 19:19</p>
                          </div>
                        </div>
                        <span className="text-white text-xs font-bold whitespace-nowrap flex-shrink-0">-14.87 USDC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </AnimatedSection>

      <AnimatedSection direction="right" delay={0.2} className="w-full lg:w-1/2 lg:pl-24 text-center lg:text-left">
        <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-[#0F1014]">
          SPEND WITH FULL<br />
          CONTROL
        </h2>
        <p className="text-[20px] sm:text-[24px] md:text-[28px] font-normal text-gray-800 mt-6 leading-[1.3] max-w-lg mx-auto lg:mx-0">
          Freeze/unfreeze, set per-merchant limits, enable contactless/online spending toggles, and schedule recurring top-ups.
        </p>
      </AnimatedSection>
      </div>
    </section>
  );
}

function OtherFeaturesSection() {
  return (
    <section id="features" className="bg-black py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-12 sm:mb-16">
          <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto mb-8">Everything you need to manage your crypto spending securely and efficiently.</p>
          <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-white">
            Other Features
          </h2>
        </AnimatedSection>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.12}>
          
          {/* Cashback and Rewards (Tall Card) */}
          <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#FF6940] to-[#0F1014] rounded-[32px] p-8 flex flex-col lg:row-span-2 relative overflow-hidden border border-[#FF6940]/20">
            <div className="w-16 h-16 bg-[#FF6940] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#FF6940]/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 17L19 19M19 17L17 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Rewards & Referrals</h3>
            <p className="text-[#9CA3AF] leading-relaxed mb-8">
              Tokenized cashback and referral bonuses credited automatically to your Zap.Fin balance.
            </p>
            
            {/* Inner Mockup */}
            <div className="bg-[#141315] rounded-[24px] p-6 mt-auto border border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[40px] font-bold text-[#FF6940] leading-none">24.850</span>
                <ZapLogo className="w-8 h-8" />
              </div>

              <div className="space-y-4">
                {/* Apple */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM15.5 16.5C14.5 17.5 13.5 17.5 12 17.5C10.5 17.5 9.5 17.5 8.5 16.5C7.5 15.5 7.5 14.5 7.5 13C7.5 11.5 7.5 10.5 8.5 9.5C9.5 8.5 10.5 8.5 12 8.5C13.5 8.5 14.5 8.5 15.5 9.5C16.5 10.5 16.5 11.5 16.5 13C16.5 14.5 16.5 15.5 15.5 16.5Z"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">Apple Gift Card $100</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">10.000</span>
                    <ZapLogo className="w-3 h-3" />
                  </div>
                </div>
                {/* Airbnb */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FF5A5F] rounded-full flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.03125C11.625 2.03125 11.25 2.17188 10.9688 2.45312L2.53125 10.8906C1.96875 11.4531 1.96875 12.3906 2.53125 12.9531L3.59375 14.0156C3.875 14.2969 4.34375 14.2969 4.625 14.0156L5.6875 12.9531C5.96875 12.6719 5.96875 12.2031 5.6875 11.9219L4.625 10.8594L12 3.48438L19.375 10.8594L18.3125 11.9219C18.0312 12.2031 18.0312 12.6719 18.3125 12.9531L19.375 14.0156C19.6562 14.2969 20.125 14.2969 20.4062 14.0156L21.4688 12.9531C22.0312 12.3906 22.0312 11.4531 21.4688 10.8906L13.0312 2.45312C12.75 2.17188 12.375 2.03125 12 2.03125ZM12 6.25C9.9375 6.25 8.25 7.9375 8.25 10C8.25 12.0625 9.9375 13.75 12 13.75C14.0625 13.75 15.75 12.0625 15.75 10C15.75 7.9375 14.0625 6.25 12 6.25ZM12 7.75C13.2656 7.75 14.25 8.73438 14.25 10C14.25 11.2656 13.2656 12.25 12 12.25C10.7344 12.25 9.75 11.2656 9.75 10C9.75 8.73438 10.7344 7.75 12 7.75ZM6.75 12.5C5.90625 12.5 5.25 13.1562 5.25 14C5.25 16.8594 7.21875 19.3125 9.9375 20.0625C10.5938 20.25 11.2969 20.3438 12 20.3438C12.7031 20.3438 13.4062 20.25 14.0625 20.0625C16.7812 19.3125 18.75 16.8594 18.75 14C18.75 13.1562 18.0938 12.5 17.25 12.5C16.4062 12.5 15.75 13.1562 15.75 14C15.75 15.6875 14.625 17.1562 13.0312 17.6562C12.7031 17.75 12.3594 17.8125 12 17.8125C11.6406 17.8125 11.2969 17.75 10.9688 17.6562C9.375 17.1562 8.25 15.6875 8.25 14C8.25 13.1562 7.59375 12.5 6.75 12.5Z"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">Airbnb</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">20.000</span>
                    <ZapLogo className="w-3 h-3" />
                  </div>
                </div>
                {/* Spotify */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.586 16.424C16.38 16.762 15.945 16.865 15.607 16.658C12.809 14.95 9.339 14.546 5.478 15.428C5.101 15.514 4.726 15.276 4.64 14.899C4.554 14.522 4.792 14.147 5.169 14.061C9.397 13.096 13.235 13.551 16.332 15.449C16.67 15.656 16.773 16.086 16.586 16.424ZM17.91 13.338C17.653 13.757 17.108 13.882 16.689 13.624C13.483 11.654 8.859 11.074 5.305 12.152C4.836 12.294 4.337 12.029 4.195 11.56C4.053 11.091 4.318 10.592 4.787 10.45C8.865 9.214 14.004 9.866 17.662 12.119C18.081 12.377 18.206 12.922 17.91 13.338ZM18.054 10.122C14.336 7.912 8.328 7.708 4.855 8.763C4.288 8.935 3.682 8.613 3.51 8.046C3.338 7.479 3.66 6.873 4.227 6.701C8.216 5.489 14.846 5.727 19.13 8.271C19.643 8.576 19.812 9.24 19.507 9.753C19.202 10.266 18.538 10.435 18.054 10.122Z"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">Spotify Premium</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">5.000</span>
                    <ZapLogo className="w-3 h-3" />
                  </div>
                </div>
                {/* Netflix */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-gray-800">
                      <span className="text-[#E50914] font-bold text-lg leading-none">N</span>
                    </div>
                    <span className="text-white text-sm font-medium">Netflix 1 month</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">5.000</span>
                    <ZapLogo className="w-3 h-3" />
                  </div>
                </div>
                {/* Telegram */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2AABEE] rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">Telegram Premium</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">5.000</span>
                    <ZapLogo className="w-3 h-3" />
                  </div>
                </div>
              </div>
              {/* Fade out bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0F1014] to-transparent pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Auditable Receipts */}
          <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#0F1014] to-[#FF6940]/40 rounded-[32px] p-8 border border-[#FF6940]/20">
            <div className="w-16 h-16 bg-[#FF6940] rounded-2xl flex items-center justify-center mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 8H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Auditable Receipts</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              Exportable proof bundles linking each top-up or payment to its on-chain evidence.
            </p>
          </motion.div>

          {/* Developer APIs */}
          <motion.div variants={staggerItem} className="bg-gradient-to-bl from-[#0F1014] to-[#FF6940]/40 rounded-[32px] p-8 border border-[#FF6940]/20">
            <div className="w-16 h-16 bg-[#FF6940] rounded-2xl flex items-center justify-center mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18L22 12L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6L2 12L8 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Developer APIs</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              SDKs and webhooks for merchants, payroll, and treasury integrations.
            </p>
          </motion.div>

          {/* Security & Compliance (Wide Card) */}
          <motion.div variants={staggerItem} className="bg-gradient-to-r from-[#FF6940]/30 to-[#0F1014] rounded-[32px] p-8 lg:col-span-2 flex flex-col md:flex-row gap-8 border border-[#FF6940]/20 overflow-hidden">
            <div className="flex-1">
              <div className="w-16 h-16 bg-[#FF6940] rounded-2xl flex items-center justify-center mb-8">
                <Lock size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Security & Compliance</h3>
              <p className="text-[#9CA3AF] leading-relaxed mb-4">
                Non-custodial flows where possible; custodied rails clearly disclosed. Encrypted keys and secrets, device sessions, and 2FA for dashboard access.
              </p>
              <p className="text-[#9CA3AF] leading-relaxed">
                Optional KYC for fiat rails, bank transfers, and higher limits. Partnership-ready compliance for regions and card networks.
              </p>
            </div>
            
            {/* Security Mockup */}
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <div className="w-full max-w-sm bg-[#1A1210] rounded-2xl p-6 border border-[#FF6940]/20 shadow-[0_0_30px_rgba(255,105,64,0.1)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#FF6940]/20 rounded-full flex items-center justify-center">
                    <Lock size={20} className="text-[#FF6940]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">2FA Enabled</h4>
                    <p className="text-gray-400 text-sm">Your account is secure</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#1A1210] p-3 rounded-xl">
                    <span className="text-gray-300 text-sm">Device Sessions</span>
                    <span className="text-[#FF6940] text-sm font-bold">Active (1)</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#1A1210] p-3 rounded-xl">
                    <span className="text-gray-300 text-sm">KYC Status</span>
                    <span className="text-[#FF6940] text-sm font-bold">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Global Spending */}
          <motion.div variants={staggerItem} className="bg-gradient-to-l from-[#FF6940]/30 to-[#0F1014] rounded-[32px] p-8 lg:col-span-2 flex flex-col md:flex-row items-center gap-8 border border-[#FF6940]/20 overflow-hidden">
            <div className="flex-1">
              <div className="w-16 h-16 bg-[#FF6940] rounded-2xl flex items-center justify-center mb-8">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Spend worldwide.<br className="hidden md:block" />Standard card rails.</h3>
              <p className="text-[#9CA3AF] leading-relaxed">
                Card works at merchants and ATMs via standard card rails. Ideal for travelers and remote workers needing simple cross-border payments.
              </p>
            </div>
            
            {/* Flags Grid Mockup */}
            <div className="flex-1 grid grid-cols-5 gap-2 opacity-50">
              {/* Just rendering colored boxes to simulate flags for now to keep it simple and performant */}
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="w-8 h-6 rounded-sm" style={{
                  background: `linear-gradient(${Math.random() * 360}deg, hsl(${Math.random() * 360}, 70%, 50%), hsl(${Math.random() * 360}, 70%, 50%))`
                }}></div>
              ))}
            </div>
          </motion.div>

          {/* Fee-Subsidized Flows */}
          <motion.div variants={staggerItem} className="bg-gradient-to-tl from-[#FF6940]/40 to-[#0F1014] rounded-[32px] p-8 border border-[#FF6940]/20">
            <div className="w-16 h-16 bg-[#FF6940] rounded-2xl flex items-center justify-center mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Fee-Subsidized Flows</h3>
            <p className="text-[#9CA3AF] leading-relaxed text-sm">
              Optional sponsored-transaction rails to reduce user friction for small purchases.
            </p>
          </motion.div>

        </StaggerChildren>

        <AnimatedSection delay={0.3}>
        <div className="mt-12 bg-[#1C1A1E] rounded-[32px] md:rounded-full py-6 px-6 sm:px-8 flex flex-col md:flex-row items-center justify-center gap-4 border border-white/5 text-center">
          <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold">All features are available directly in your</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FF6940] rounded-full flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5">
                <path d="M21 12V7H3V12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3H3V7H21V3Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H3V21H21V12Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[#FF6940] text-xl sm:text-2xl md:text-3xl font-bold">Web dApp Dashboard</span>
          </div>
        </div>
        </AnimatedSection>

      </div>
    </section>
  );
}

function CTAAndFooterSection() {
  return (
    <section className="bg-[#FF6940] relative overflow-hidden pt-24 pb-8">
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] pointer-events-none opacity-[0.06] z-0">
        <svg viewBox="0 0 1000 1000" className="w-full h-full animate-[spin_60s_linear_infinite]">
          <path id="textPath" d="M 500, 500 m -320, 0 a 320,320 0 1,1 640,0 a 320,320 0 1,1 -640,0" fill="transparent" />
          <text className="text-[110px] font-black tracking-[0.05em] fill-black uppercase">
            <textPath href="#textPath" startOffset="0%">
              * ZAP.FIN * VIRTUAL CARD * ZAP.FIN * VIRTUAL CARD
            </textPath>
          </text>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <AnimatedSection>
        <h2 className="text-[32px] sm:text-[40px] md:text-[56px] font-extrabold text-[#0F1014] text-center mb-8 tracking-tight">
          Are you Ready? Join now!
        </h2>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
        <button className="bg-[#0F1014] hover:bg-black text-[#FF6940] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold flex items-center justify-center gap-3 text-base sm:text-lg transition-colors mb-16 sm:mb-24 shadow-xl w-full sm:w-auto">
          <Send size={20} className="fill-[#FF6940]" />
          Launch Dashboard
        </button>
        </AnimatedSection>

        <StaggerChildren className="w-full grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.15}>
          {/* Left Card */}
          <motion.div variants={staggerItem} className="bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 md:p-14 flex flex-col justify-between min-h-[350px] sm:min-h-[450px] shadow-sm">
            <h3 className="text-[48px] sm:text-[56px] md:text-[72px] font-extrabold leading-[1.05] tracking-tight text-[#0F1014]">
              Store,<br/>spend,<br/>exchange.
            </h3>
            <div className="mt-16">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <ZapLogo className="w-8 h-8" />
                <span className="text-3xl font-bold tracking-tight text-[#0F1014]">Zap.Fin</span>
              </div>
              <p className="text-[15px] font-medium text-gray-900">©2026 All Rights Reserved, Zap.Fin.</p>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={staggerItem} className="flex flex-col gap-6">
            {/* Support Card */}
            <div className="bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 md:p-14 flex-1 shadow-sm">
              <h3 className="text-[32px] sm:text-[40px] md:text-[48px] font-extrabold text-[#0F1014] mb-6 sm:mb-10 tracking-tight">Support</h3>
              <p className="text-[17px] sm:text-[19px] text-gray-900 mb-6 sm:mb-10 font-medium leading-relaxed">
                Visit our <a href="#" className="underline underline-offset-4 decoration-2 hover:text-black transition-colors">Help Center</a> for answers and support.
              </p>
              <p className="text-[17px] sm:text-[19px] text-gray-900 font-medium">
                Follow us on <a href="https://x.com/ZapFinBank" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4 decoration-2 hover:text-black transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </a>
              </p>
            </div>

            {/* Links Card */}
            <div className="bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 md:p-12 flex flex-wrap items-center gap-6 sm:gap-10 shadow-sm">
              <a href="#" className="text-[17px] font-semibold text-gray-900 underline underline-offset-4 decoration-2 hover:text-black transition-colors">Terms of use</a>
              <a href="#" className="text-[17px] font-semibold text-gray-900 underline underline-offset-4 decoration-2 hover:text-black transition-colors">Privacy Policy</a>
            </div>
          </motion.div>
        </StaggerChildren>

        {/* Footer text */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center mt-16 text-[13px] font-medium text-black/40 text-center md:text-left gap-4 px-4">
          <p>Zap.Fin products may not be available to all customers.</p>
          <p>We are financial technology company, not a bank and not insured by the FDIC.</p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pb-24 flex flex-col lg:flex-row items-center relative">
        <HeroLeft />
        <HeroRight />
      </main>
      
      <GetCardSection />
      <TopUpSection />
      <SpendControlSection />
      <OtherFeaturesSection />
      <CTAAndFooterSection />
      
    </div>
  );
}
