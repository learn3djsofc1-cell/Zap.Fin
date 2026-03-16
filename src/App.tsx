import { useState, useMemo } from 'react';
import { Send, Lock, RefreshCw, Copy, Check, ChevronDown, MoreHorizontal, Eye, Wifi, ChevronLeft, ArrowRight, Menu, X } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

function AnimatedSection({ children, className, delay = 0, direction = 'up' }: { children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const directionMap = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionMap[direction] }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className, staggerDelay = 0.08 }: { children: ReactNode; className?: string; staggerDelay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

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
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const WispTapLogo = ({ className }: { className?: string }) => (
  <img src="/logo.png" alt="WispTap" className={`${className || ''} rounded-lg`} />
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
    <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-50">
      <div className="flex items-center justify-between w-full">
        <a href="#" className="flex items-center gap-2.5">
          <WispTapLogo className="w-9 h-9" />
          <span className="text-2xl font-bold tracking-tight text-[#1A1A1A]">WispTap</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-gray-500 hover:text-[#FF5550] transition-colors duration-300">
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 text-sm transition-all duration-300 shadow-lg shadow-[#FF5550]/20 hover:shadow-[#FF5550]/30">
            Get Started
          </Link>
        </div>

        <button 
          className="md:hidden text-[#1A1A1A] p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg md:hidden flex flex-col px-6 py-4 gap-4 z-50"
        >
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-gray-800 font-medium py-2 hover:text-[#FF5550] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <Link to="/app" className="bg-[#FF5550] hover:bg-[#E84B47] text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 text-base transition-all duration-300 mt-2 w-full" onClick={() => setIsMenuOpen(false)}>
            Get Started
          </Link>
        </motion.div>
      )}
    </nav>
  );
}

function HeroLeft() {
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
    <div className="w-full lg:w-[55%] z-10 pt-8 lg:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-block bg-[#FF5550]/10 text-[#FF5550] text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
      >
        Crypto meets everyday spending
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A1A]"
      >
        TAP INTO<br />
        SEAMLESS<br />
        CRYPTO SPENDING
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="text-[18px] sm:text-[22px] md:text-[26px] font-normal text-gray-500 mt-5 md:mt-6 leading-[1.3]"
      >
        Your crypto wallet, Visa cards, and<br className="hidden sm:block" />
        spending controls — all in one dashboard.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6"
      >
        <div className="bg-[#1A1A1A] rounded-2xl p-4 inline-block w-full sm:w-auto">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">CA</span>
          <div className="flex items-center gap-3">
            <code className="text-[#FF5550] text-xs sm:text-sm font-mono break-all">{CA}</code>
            <button
              onClick={copyCA}
              className="text-gray-400 hover:text-white transition-colors shrink-0"
            >
              {caCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/app" className="mt-6 bg-[#FF5550] hover:bg-[#E84B47] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold flex items-center justify-center sm:justify-start gap-3 text-base sm:text-lg transition-all duration-300 w-full sm:w-auto inline-flex shadow-lg shadow-[#FF5550]/25 hover:shadow-[#FF5550]/40">
          <Send size={20} />
          Open Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

function HeroRight() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full lg:w-[45%] h-[300px] sm:h-[400px] lg:h-[500px] mt-8 lg:mt-0 flex justify-center items-center pointer-events-none"
    >
      <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
      <div className="absolute w-[300px] h-[300px] lg:w-[420px] lg:h-[420px] bg-[#FF5550] rounded-full right-[-5%] lg:right-[-10%] top-1/2 -translate-y-1/2 z-0 blur-sm opacity-80"></div>

      <div className="absolute z-10 w-[640px] h-[420px] bg-[#111113] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden flex flex-col animate-float">
        <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="mx-auto bg-[#111113] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">wisptap.xyz</div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2 mb-4">
               <WispTapLogo className="w-6 h-6" />
               <span className="text-white font-bold text-sm">WispTap</span>
            </div>
            <div className="flex items-center gap-3 text-[#FF5550] bg-[#FF5550]/10 px-3 py-2 rounded-lg text-xs font-medium">
              <div className="w-4 h-4 rounded-full bg-[#FF5550] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-sm"></div></div> Dashboard
            </div>
            <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Cards
            </div>
            <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Top-ups
            </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col gap-6 bg-[#111113] overflow-hidden">
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-white text-lg font-bold">Overview</h2>
              <div className="flex items-center gap-3">
                <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/5 font-mono">0x1234...5678</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5550] to-[#D94440] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">JD</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 shrink-0">
              <div className="flex-1 bg-[#1A1B1F] rounded-xl p-5 border border-white/5 flex flex-col justify-between">
                <span className="text-gray-400 text-xs font-medium">Total Balance (USDC)</span>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">$1,286</span>
                  <span className="text-xl text-gray-400">.34</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-[#FF5550] text-white text-xs font-bold py-2 rounded-lg">Top Up</button>
                  <button className="flex-1 bg-[#2A2B30] text-white text-xs font-bold py-2 rounded-lg">Send</button>
                </div>
              </div>
              
              <div className="w-[200px] bg-gradient-to-br from-[#FF5550] to-[#D94440] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-6 h-4 bg-white/20 rounded-sm"></div>
                  <span className="text-white font-bold text-xs italic">VISA</span>
                </div>
                <div className="relative z-10 mt-6">
                  <div className="text-white/60 text-[10px] font-mono mb-1 tracking-widest">•••• •••• •••• 1919</div>
                  <div className="flex justify-between items-end">
                    <span className="text-white font-bold text-sm">Virtual Card</span>
                    <span className="text-white/80 text-[10px] font-mono">12/28</span>
                  </div>
                </div>
              </div>
            </div>
            
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
                  <span className="text-[#FF5550] text-xs font-bold">+$500.00</span>
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
    <section id="cards" className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
      <AnimatedSection className="text-center mb-14">
        <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">WispTap is a web dApp that bridges crypto and real-world spending. Issue virtual or metal Visa-compatible cards, fund them instantly from your wallet, and manage everything from a unified dashboard — no separate apps needed.</p>
      </AnimatedSection>
      <div className="flex flex-col lg:flex-row items-center">
      <AnimatedSection direction="right" className="w-full lg:w-1/2 relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px]">
        <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
        
        <div className="absolute z-10 w-[640px] h-[420px] bg-[#111113] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden flex flex-col animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="mx-auto bg-[#111113] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">wisptap.xyz/cards</div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                 <WispTapLogo className="w-6 h-6" />
                 <span className="text-white font-bold text-sm">WispTap</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Dashboard
              </div>
              <div className="flex items-center gap-3 text-[#FF5550] bg-[#FF5550]/10 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-[#FF5550] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-sm"></div></div> Cards
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Top-ups
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-6 bg-[#111113] overflow-hidden">
              <div className="flex justify-between items-center shrink-0">
                <h2 className="text-white text-lg font-bold">My Cards</h2>
                <button className="bg-[#FF5550] text-white text-xs font-bold px-4 py-2 rounded-lg">+ New Card</button>
              </div>
              
              <div className="flex gap-4 overflow-hidden">
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

                <div className="w-[240px] shrink-0 bg-gradient-to-br from-[#FF5550] to-[#D94440] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="w-8 h-6 rounded bg-white/20"></div>
                    <span className="bg-white/10 text-white text-[8px] px-2 py-1 rounded font-bold uppercase tracking-wider border border-white/10">Virtual</span>
                  </div>
                  <div className="relative z-10 mt-8">
                    <div className="text-white/60 text-xs font-mono mb-1 tracking-widest">•••• •••• •••• 4242</div>
                    <div className="flex justify-between items-end">
                      <span className="text-white font-bold text-sm">Online Subs</span>
                      <div className="text-right">
                        <h3 className="text-xl font-extrabold text-white italic leading-none">VISA</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5 flex-1 flex flex-col">
                <span className="text-white text-sm font-bold mb-3 block">Card Settings (Metal •••• 1919)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#2A2B30] p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-gray-400" />
                      <span className="text-gray-300 text-xs font-medium">Show Details</span>
                    </div>
                    <div className="w-8 h-4 bg-[#FF5550] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
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
                    <span className="text-[#FF5550] text-xs font-bold">$5,000 / $10,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </AnimatedSection>

      <AnimatedSection direction="left" delay={0.15} className="w-full lg:w-1/2 lg:pl-20 mt-8 sm:mt-16 lg:mt-0 text-center lg:text-left">
        <h2 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-extrabold leading-[1.1] tracking-tight text-[#1A1A1A]">
          VIRTUAL & PHYSICAL CARDS
        </h2>
        <p className="text-[18px] sm:text-[22px] md:text-[26px] font-normal text-gray-500 mt-5 leading-[1.3] max-w-lg mx-auto lg:mx-0">
          Generate virtual cards instantly for online purchases or request premium metal cards for in-store use.
        </p>
      </AnimatedSection>
      </div>
    </section>
  );
}

function TopUpSection() {
  return (
    <section id="topups" className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
      <AnimatedSection className="text-center mb-14">
        <h2 className="text-3xl font-bold text-gray-400 mb-4">Instant Funding</h2>
        <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">Convert crypto to card balance in a single flow using integrated on-chain swaps and relay networks.</p>
      </AnimatedSection>
      <div className="flex flex-col lg:flex-row-reverse items-center">
      <AnimatedSection direction="left" className="w-full lg:w-1/2 relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px]">
        <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
        
        <div className="absolute z-10 w-[640px] h-[420px] bg-[#111113] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden flex flex-col animate-float" style={{ animationDelay: '1s' }}>
          <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="mx-auto bg-[#111113] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">wisptap.xyz/topups</div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                 <WispTapLogo className="w-6 h-6" />
                 <span className="text-white font-bold text-sm">WispTap</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Dashboard
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Cards
              </div>
              <div className="flex items-center gap-3 text-[#FF5550] bg-[#FF5550]/10 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-[#FF5550] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-sm"></div></div> Top-ups
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col bg-[#111113] overflow-hidden">
              <div className="flex justify-between items-center shrink-0 mb-6">
                <h2 className="text-white text-lg font-bold">Fund Your Card</h2>
                <div className="text-gray-400 text-xs font-medium">Available: <span className="text-white">1,286.34 USDC</span></div>
              </div>
              
              <div className="flex gap-6 h-full">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 block">Select Asset</label>
                    <div className="flex items-center justify-between bg-[#111113] p-3 rounded-lg border border-white/5 cursor-pointer">
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
                    <div className="flex items-center justify-between bg-[#111113] p-3 rounded-lg border border-white/5">
                      <span className="text-white text-xl font-bold">500.00</span>
                      <span className="text-gray-500 text-sm font-bold">USDT</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500 text-[10px]">≈ $500.00 USD</span>
                      <div className="flex gap-2">
                        <span className="text-[#FF5550] text-[10px] bg-[#FF5550]/10 px-2 py-0.5 rounded cursor-pointer">25%</span>
                        <span className="text-[#FF5550] text-[10px] bg-[#FF5550]/10 px-2 py-0.5 rounded cursor-pointer">50%</span>
                        <span className="text-[#FF5550] text-[10px] bg-[#FF5550]/10 px-2 py-0.5 rounded cursor-pointer">MAX</span>
                      </div>
                    </div>
                  </div>
                </div>

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
                          <span className="text-[#FF5550] text-sm font-bold">$498.50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-[#FF5550] hover:bg-[#E84B47] text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2">
                    Confirm Top-up <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </AnimatedSection>

      <AnimatedSection direction="right" delay={0.15} className="w-full lg:w-1/2 lg:pr-20 mt-8 sm:mt-16 lg:mt-0 text-center lg:text-left">
        <h2 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-extrabold leading-[1.1] tracking-tight text-[#1A1A1A]">
          INSTANT CRYPTO TOP-UPS
        </h2>
        <p className="text-[18px] sm:text-[22px] md:text-[26px] font-normal text-gray-500 mt-5 leading-[1.3] max-w-lg mx-auto lg:mx-0">
          Pick your wallet, choose an amount, preview conversion rates and fees, confirm — your card balance updates in seconds.
        </p>
      </AnimatedSection>
      </div>
    </section>
  );
}

function SpendControlSection() {
  return (
    <section id="controls" className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
      <AnimatedSection className="text-center mb-14">
        <h2 className="text-3xl font-bold text-gray-400 mb-4">Card Management</h2>
        <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">Complete card lifecycle management right in your browser: limits, freezes, merchant controls, statements, and exports.</p>
      </AnimatedSection>
      <div className="flex flex-col lg:flex-row items-center">
      <AnimatedSection direction="right" className="w-full lg:w-1/2 relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px] mb-8 sm:mb-16 lg:mb-0">
        <div className="relative w-[600px] h-[400px] flex justify-center items-center transform scale-[0.55] sm:scale-[0.75] lg:scale-100">
        
        <div className="absolute z-10 w-[640px] h-[420px] bg-[#111113] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden flex flex-col animate-float" style={{ animationDelay: '0.4s' }}>
          <div className="h-10 bg-[#1A1B1F] border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="mx-auto bg-[#111113] rounded-md px-32 py-1 text-[10px] text-gray-500 font-mono border border-white/5">wisptap.xyz/controls</div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-48 bg-[#16171B] border-r border-white/5 p-4 flex flex-col gap-4 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                 <WispTapLogo className="w-6 h-6" />
                 <span className="text-white font-bold text-sm">WispTap</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Dashboard
              </div>
              <div className="flex items-center gap-3 text-[#FF5550] bg-[#FF5550]/10 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-[#FF5550] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-sm"></div></div> Cards
              </div>
              <div className="flex items-center gap-3 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-sm"></div></div> Top-ups
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-4 bg-[#111113] overflow-hidden">
              <div className="flex justify-between items-center shrink-0">
                <h2 className="text-white text-lg font-bold">Card Controls</h2>
                <div className="bg-[#1A1B1F] px-3 py-1.5 rounded-lg text-xs text-white border border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF5550]"></div> Active
                </div>
              </div>
              
              <div className="flex gap-4 h-full overflow-hidden">
                <div className="w-[220px] flex flex-col gap-4 shrink-0">
                  <div className="w-full bg-[#FF5550] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-[#FF5550]/10 h-[130px]">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, black 2px, black 4px)' }}></div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="w-6 h-4 rounded bg-white/20"></div>
                      <span className="text-white font-bold text-[10px] italic">VISA</span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <div className="text-white/80 text-xs font-mono mb-1 tracking-widest">•••• 1919</div>
                    </div>
                  </div>

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
                      <div className="w-8 h-4 bg-[#FF5550] rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs">Contactless</span>
                      <div className="w-8 h-4 bg-[#FF5550] rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5 shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Monthly Limit</span>
                      <span className="text-[#FF5550] text-xs font-bold">$2,450 / $5,000</span>
                    </div>
                    <div className="w-full h-2 bg-[#111113] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF5550] w-[49%]"></div>
                    </div>
                  </div>

                  <div className="bg-[#1A1B1F] rounded-xl p-4 border border-white/5 flex-1 flex flex-col min-w-0">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-3 block">Recent Transactions</span>
                    
                    <div className="flex flex-col gap-3 min-w-0">
                      <div className="flex items-center justify-between bg-[#111113] p-2.5 rounded-lg border border-white/5 min-w-0 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                            <img src="/spotify.png" alt="Spotify" className="w-full h-full object-cover" />
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

      <AnimatedSection direction="left" delay={0.15} className="w-full lg:w-1/2 lg:pl-20 text-center lg:text-left">
        <h2 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-extrabold leading-[1.1] tracking-tight text-[#1A1A1A]">
          SPEND WITH FULL<br />
          CONTROL
        </h2>
        <p className="text-[18px] sm:text-[22px] md:text-[26px] font-normal text-gray-500 mt-5 leading-[1.3] max-w-lg mx-auto lg:mx-0">
          Freeze or unfreeze in one tap, set per-merchant limits, toggle contactless and online spending, and schedule recurring top-ups.
        </p>
      </AnimatedSection>
      </div>
    </section>
  );
}

function OtherFeaturesSection() {
  const flagColors = useMemo(() => 
    Array.from({ length: 25 }).map(() => ({
      deg: Math.random() * 360,
      h1: Math.random() * 360,
      h2: Math.random() * 360,
    })), []
  );

  return (
    <section id="features" className="bg-[#111113] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-12 sm:mb-14">
          <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto mb-8">Everything you need to manage crypto spending securely and efficiently.</p>
          <h2 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-extrabold leading-[1.1] tracking-tight text-white">
            More Capabilities
          </h2>
        </AnimatedSection>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.1}>
          
          <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#FF5550] to-[#111113] rounded-[28px] p-7 flex flex-col lg:row-span-2 relative overflow-hidden border border-[#FF5550]/20">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7 shadow-lg shadow-[#FF5550]/30">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 17L19 19M19 17L17 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Rewards & Referrals</h3>
            <p className="text-[#9CA3AF] leading-relaxed mb-7">
              Tokenized cashback and referral bonuses credited automatically to your WispTap balance.
            </p>
            
            <div className="bg-[#141315] rounded-[20px] p-5 mt-auto border border-white/5">
              <div className="flex items-center gap-3 mb-7">
                <span className="text-[36px] font-bold text-[#FF5550] leading-none">24.850</span>
                <WispTapLogo className="w-7 h-7" />
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden p-1.5">
                      <img src="/apple.png" alt="Apple" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-white text-sm font-medium">Apple Gift Card $100</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">10.000</span>
                    <WispTapLogo className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img src="/airbnb.png" alt="Airbnb" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-sm font-medium">Airbnb</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">20.000</span>
                    <WispTapLogo className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img src="/spotify.png" alt="Spotify" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-sm font-medium">Spotify Premium</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">5.000</span>
                    <WispTapLogo className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img src="/netflix.png" alt="Netflix" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-sm font-medium">Netflix 1 month</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">5.000</span>
                    <WispTapLogo className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img src="/telegram.jpg" alt="Telegram" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-sm font-medium">Telegram Premium</span>
                  </div>
                  <div className="bg-[#2A2A2A] rounded-full px-3 py-1 flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">5.000</span>
                    <WispTapLogo className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111113] to-transparent pointer-events-none"></div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#111113] to-[#FF5550]/30 rounded-[28px] p-7 border border-[#FF5550]/15">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          <motion.div variants={staggerItem} className="bg-gradient-to-bl from-[#111113] to-[#FF5550]/30 rounded-[28px] p-7 border border-[#FF5550]/15">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18L22 12L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6L2 12L8 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Developer APIs</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              SDKs and webhooks for merchants, payroll, and treasury integrations.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="bg-gradient-to-r from-[#FF5550]/25 to-[#111113] rounded-[28px] p-7 lg:col-span-2 flex flex-col md:flex-row gap-7 border border-[#FF5550]/15 overflow-hidden">
            <div className="flex-1">
              <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
                <Lock size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Security & Compliance</h3>
              <p className="text-[#9CA3AF] leading-relaxed mb-4">
                Non-custodial flows where possible; custodied rails clearly disclosed. Encrypted keys and secrets, device sessions, and 2FA for dashboard access.
              </p>
              <p className="text-[#9CA3AF] leading-relaxed">
                Optional KYC for fiat rails, bank transfers, and higher limits. Partnership-ready compliance for regions and card networks.
              </p>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <div className="w-full max-w-sm bg-[#1A1210] rounded-2xl p-6 border border-[#FF5550]/15 shadow-[0_0_30px_rgba(255,85,80,0.08)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#FF5550]/15 rounded-full flex items-center justify-center">
                    <Lock size={20} className="text-[#FF5550]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">2FA Enabled</h4>
                    <p className="text-gray-400 text-sm">Your account is secure</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#1A1210] p-3 rounded-xl">
                    <span className="text-gray-300 text-sm">Device Sessions</span>
                    <span className="text-[#FF5550] text-sm font-bold">Active (1)</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#1A1210] p-3 rounded-xl">
                    <span className="text-gray-300 text-sm">KYC Status</span>
                    <span className="text-[#FF5550] text-sm font-bold">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="bg-gradient-to-l from-[#FF5550]/25 to-[#111113] rounded-[28px] p-7 lg:col-span-2 flex flex-col md:flex-row items-center gap-7 border border-[#FF5550]/15 overflow-hidden">
            <div className="flex-1">
              <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            
            <div className="flex-1 grid grid-cols-5 gap-2 opacity-50">
              {flagColors.map((c, i) => (
                <div key={i} className="w-8 h-6 rounded-sm" style={{
                  background: `linear-gradient(${c.deg}deg, hsl(${c.h1}, 70%, 50%), hsl(${c.h2}, 70%, 50%))`
                }}></div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="bg-gradient-to-tl from-[#FF5550]/30 to-[#111113] rounded-[28px] p-7 border border-[#FF5550]/15">
            <div className="w-14 h-14 bg-[#FF5550] rounded-2xl flex items-center justify-center mb-7">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        <AnimatedSection delay={0.2}>
        <div className="mt-10 bg-[#1C1A1E] rounded-[28px] md:rounded-full py-5 px-6 sm:px-8 flex flex-col md:flex-row items-center justify-center gap-4 border border-white/5 text-center">
          <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold">All features available in your</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FF5550] rounded-full flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5">
                <path d="M21 12V7H3V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3H3V7H21V3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H3V21H21V12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[#FF5550] text-xl sm:text-2xl md:text-3xl font-bold">Web Dashboard</span>
          </div>
        </div>
        </AnimatedSection>

      </div>
    </section>
  );
}

function CTAAndFooterSection() {
  return (
    <section className="bg-[#FF5550] relative overflow-hidden pt-20 pb-8">
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] pointer-events-none opacity-[0.05] z-0">
        <svg viewBox="0 0 1000 1000" className="w-full h-full animate-[spin_60s_linear_infinite]">
          <path id="textPath" d="M 500, 500 m -320, 0 a 320,320 0 1,1 640,0 a 320,320 0 1,1 -640,0" fill="transparent" />
          <text className="text-[110px] font-black tracking-[0.05em] fill-black uppercase">
            <textPath href="#textPath" startOffset="0%">
              * WISPTAP * VIRTUAL CARD * WISPTAP * VIRTUAL CARD
            </textPath>
          </text>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <AnimatedSection>
        <h2 className="text-[28px] sm:text-[36px] md:text-[52px] font-extrabold text-white text-center mb-8 tracking-tight">
          Ready to tap in? Join now!
        </h2>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
        <Link to="/app" className="bg-white hover:bg-gray-50 text-[#FF5550] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold flex items-center justify-center gap-3 text-base sm:text-lg transition-all duration-300 mb-16 sm:mb-20 shadow-xl w-full sm:w-auto inline-flex">
          <Send size={20} />
          Open Dashboard
        </Link>
        </AnimatedSection>

        <StaggerChildren className="w-full grid grid-cols-1 md:grid-cols-2 gap-5" staggerDelay={0.1}>
          <motion.div variants={staggerItem} className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 md:p-12 flex flex-col justify-between min-h-[320px] sm:min-h-[400px] shadow-sm">
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

          <motion.div variants={staggerItem} className="flex flex-col gap-5">
            <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 md:p-12 flex-1 shadow-sm">
              <h3 className="text-[28px] sm:text-[36px] md:text-[44px] font-extrabold text-[#1A1A1A] mb-6 sm:mb-8 tracking-tight">Support</h3>
              <p className="text-[16px] sm:text-[18px] text-gray-900 mb-5 sm:mb-8 font-medium leading-relaxed">
                Visit our <a href="#" className="underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">Help Center</a> for answers and support.
              </p>
              <p className="text-[16px] sm:text-[18px] text-gray-900 font-medium">
                Follow us on <a href="https://x.com/WispTapX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </a>
              </p>
            </div>

            <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 md:p-10 flex flex-wrap items-center gap-6 sm:gap-10 shadow-sm">
              <a href="#" className="text-[16px] font-semibold text-gray-900 underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">Terms of use</a>
              <a href="#" className="text-[16px] font-semibold text-gray-900 underline underline-offset-4 decoration-2 hover:text-[#FF5550] transition-colors">Privacy Policy</a>
            </div>
          </motion.div>
        </StaggerChildren>

        <div className="w-full flex flex-col md:flex-row justify-between items-center mt-14 text-[13px] font-medium text-white/40 text-center md:text-left gap-4 px-4">
          <p>WispTap products may not be available to all customers.</p>
          <p>We are a financial technology company, not a bank and not insured by the FDIC.</p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pb-20 flex flex-col lg:flex-row items-center relative">
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
