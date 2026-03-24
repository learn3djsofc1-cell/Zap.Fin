import { useState } from 'react';
import { ArrowRight, Check, Shield, Zap, Globe, Menu, X, Eye, EyeOff, Code2, Lock, Layers, Terminal, ChevronRight, ChevronDown, Shuffle, MessageSquare, ArrowLeftRight, Wifi } from 'lucide-react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';

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

function ScaleReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
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
  const { user } = useAuth();
  const appLink = user ? '/app' : '/login';
  const links = [
    { name: 'Ux402', href: '#ux402' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Supported Assets', href: '#assets' },
    { name: 'FAQ', href: '#faq' },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
          <img src="/ghostlane-logo.png" alt="GhostLane" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight text-white">GhostLane</span>
        </Link>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.name} href={l.href} className="text-sm text-gray-500 hover:text-[#0AF5D6] font-medium transition-colors">{l.name}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to={appLink} className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#0AF5D6]/20">{user ? 'Dashboard' : 'Launch App'}</Link>
        </div>
        <button className="md:hidden text-white p-1.5" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-full bg-[#0A0A0A] border-b border-white/5 shadow-2xl md:hidden flex flex-col px-5 py-4 gap-3 z-50">
            {links.map((l) => (<a key={l.name} href={l.href} className="text-gray-300 font-medium py-2 text-sm" onClick={() => setOpen(false)}>{l.name}</a>))}
            <Link to={appLink} className="bg-[#0AF5D6] text-black px-5 py-3 rounded-xl font-semibold text-sm text-center mt-1" onClick={() => setOpen(false)}>{user ? 'Dashboard' : 'Launch App'}</Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const floatY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[#000000]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[900px] bg-gradient-radial from-[#0AF5D6]/20 via-[#0AF5D6]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#0AF5D6]/12 rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-[#0AF5D6]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[800px] h-[300px] bg-gradient-to-t from-[#0AF5D6]/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-20 pb-28 lg:pt-32 lg:pb-40 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="inline-flex items-center gap-2 bg-[#0AF5D6]/8 border border-[#0AF5D6]/15 rounded-full px-4 py-1.5 mb-8">
            <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest">Complete Privacy Ecosystem</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="text-[36px] sm:text-[52px] md:text-[64px] lg:text-[76px] font-extrabold leading-[1.02] tracking-tight text-white mb-6">
            Transact Privately,{' '}<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#0AF5D6] to-[#06B89E] bg-clip-text text-transparent">Secure Your Legacy</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Advanced cryptocurrency mixing, encrypted messaging, privacy bridge, and secure VPN - all powered by zero-knowledge technology. Send and receive on-chain with complete privacy while protecting your digital assets with military-grade encryption.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
            <Link to={user ? '/app' : '/login'} className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-8 py-4 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20">
              Launch App <ArrowRight size={16} />
            </Link>
            <Link to="/docs" className="text-gray-400 hover:text-white font-semibold text-sm flex items-center gap-1.5 px-6 py-4 transition-colors border border-white/[0.06] rounded-xl hover:border-white/10">
              Documentation <ArrowRight size={15} />
            </Link>
          </motion.div>

          <motion.div style={{ y: floatY }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {[
              { label: 'Zero-Knowledge', icon: <Lock size={16} /> },
              { label: 'Encryption', icon: <Shield size={16} /> },
              { label: 'Multi-Chain', icon: <Layers size={16} /> },
              { label: '4 Products', icon: <Zap size={16} /> },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className="flex items-center gap-2 text-gray-500">
                <span className="text-[#0AF5D6]">{item.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  const products = [
    { icon: <Shuffle size={22} />, stat: '99.9%', statLabel: 'Privacy', title: 'GhostLane Mixer', desc: 'Advanced cryptocurrency mixing with zero-knowledge proofs. Break transaction links with massive anonymity sets.', tags: ['Multi-chain support', 'Zero logs', 'Instant mixing'] },
    { icon: <MessageSquare size={22} />, stat: '256-bit', statLabel: 'Encryption', title: 'Privacy Encrypted Messenger', desc: 'End-to-end encrypted messaging with disappearing messages and zero metadata collection.', tags: ['Self-destructing messages', 'Anonymous chat', 'No metadata'] },
    { icon: <ArrowLeftRight size={22} />, stat: '15+', statLabel: 'Chains', title: 'Privacy Bridge', desc: 'Cross-chain asset transfers with complete anonymity. Move assets between blockchains without leaving a trace.', tags: ['Cross-chain swaps', 'Privacy preserved', 'Low fees'] },
    { icon: <Wifi size={22} />, stat: '50+', statLabel: 'Countries', title: 'GhostLane VPN', desc: 'Military-grade VPN with no-logs policy and Tor integration. Browse and transact with full anonymity.', tags: ['No logs policy', 'Tor integration', 'Kill switch'] },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#000000] via-[#0AF5D6]/[0.08] to-[#000000]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#0AF5D6]/6 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">Our Privacy Products</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Complete privacy ecosystem designed<br className="hidden md:block" /> to protect your digital life
          </h2>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 gap-5" gap={0.08}>
          {products.map((p) => (
            <motion.div key={p.title} variants={cardReveal} className="group bg-[#0A0A0A] rounded-2xl p-7 border border-white/[0.04] hover:border-[#0AF5D6]/15 transition-all duration-300 hover:shadow-lg hover:shadow-[#0AF5D6]/[0.03]">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-[#0AF5D6]/8 rounded-xl flex items-center justify-center text-[#0AF5D6] group-hover:bg-[#0AF5D6] group-hover:text-black transition-all duration-300">{p.icon}</div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white block leading-none">{p.stat}</span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{p.statLabel}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold text-[#0AF5D6]/70 bg-[#0AF5D6]/5 px-2.5 py-1 rounded-md">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function Ux402Section() {
  const [activeTab, setActiveTab] = useState<'typescript' | 'python' | 'rust'>('typescript');

  const codeSnippets: Record<string, string[]> = {
    typescript: [
      "import { Ux402Client } from '@ghostlane/ux402-sdk';",
      "",
      "const client = new Ux402Client({",
      "  network: 'mainnet',",
      "  rpcUrl: 'https://api.ghostlane.net/ux402',",
      "});",
      "",
      "// Initiate private cross-chain transfer",
      "const transfer = await client.createTransfer({",
      "  sourceChain: 'ethereum',",
      "  destChain: 'solana',",
      "  amount: '1.5',",
      "  token: 'ETH',",
      "  recipientAddress: 'Sol1abc...xyz',",
      "  privacyLevel: 'maximum',",
      "});",
      "",
      "// Monitor transaction status",
      "const status = await client.getTransferStatus(transfer.id);",
      "console.log(status); // 'complete'",
    ],
    python: [
      "from ghostlane import Ux402Client",
      "",
      "client = Ux402Client(",
      "    network='mainnet',",
      "    rpc_url='https://api.ghostlane.net/ux402',",
      ")",
      "",
      "# Initiate private cross-chain transfer",
      "transfer = await client.create_transfer(",
      "    source_chain='ethereum',",
      "    dest_chain='solana',",
      "    amount='1.5',",
      "    token='ETH',",
      "    recipient_address='Sol1abc...xyz',",
      "    privacy_level='maximum',",
      ")",
      "",
      "# Monitor transaction status",
      "status = await client.get_transfer_status(transfer.id)",
      "print(status)  # 'complete'",
    ],
    rust: [
      "use ghostlane::Ux402Client;",
      "",
      "let client = Ux402Client::new(",
      "    \"mainnet\",",
      "    \"https://api.ghostlane.net/ux402\",",
      ");",
      "",
      "// Initiate private cross-chain transfer",
      "let transfer = client.create_transfer(",
      "    TransferParams {",
      "        source_chain: \"ethereum\",",
      "        dest_chain: \"solana\",",
      "        amount: \"1.5\",",
      "        token: \"ETH\",",
      "        recipient: \"Sol1abc...xyz\",",
      "        privacy_level: PrivacyLevel::Maximum,",
      "    }",
      ").await?;",
      "",
      "let status = client.get_status(transfer.id).await?;",
    ],
  };

  const features = [
    { icon: <Shield size={18} />, title: 'Zero-Knowledge Proofs', desc: 'Advanced zk-SNARKs implementation hiding transaction details while maintaining verifiability' },
    { icon: <ArrowLeftRight size={18} />, title: 'Cross-Chain Privacy', desc: 'Seamlessly transfer assets between chains while maintaining complete anonymity' },
    { icon: <Zap size={18} />, title: 'Solana Speed', desc: 'Leverages Solana\'s high throughput for instant private transactions at minimal cost' },
    { icon: <Shuffle size={18} />, title: 'Untraceable Routing', desc: 'Multi-hop routing through privacy pools making transaction paths impossible to trace' },
  ];

  return (
    <section id="ux402" className="relative py-24 lg:py-32 border-y border-white/[0.03] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#0AF5D6]/[0.12] to-[#000000]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AF5D6]/8 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">Next-Gen Protocol</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Ux402 Protocol
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Shielded Cross-Chain Facilitator on Solana. The world's first untraceable x402 implementation for complete transaction privacy across blockchains.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 gap-4" gap={0.06}>
            {features.map((f) => (
              <motion.div key={f.title} variants={cardReveal} className="bg-[#0A0A0A] rounded-xl p-5 border border-white/[0.04]">
                <div className="w-10 h-10 bg-[#0AF5D6]/8 rounded-lg flex items-center justify-center text-[#0AF5D6] mb-3">{f.icon}</div>
                <h4 className="text-white font-bold text-sm mb-1">{f.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </StaggerWrap>

          <ScaleReveal delay={0.1}>
            <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden h-full">
              <div className="flex items-center gap-1 px-4 py-3 border-b border-white/[0.04] bg-[#080808]">
                <Terminal size={14} className="text-[#0AF5D6] mr-2" />
                <span className="text-white text-xs font-bold mr-auto">Quick Start</span>
                {(['typescript', 'python', 'rust'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-[#0AF5D6]/10 text-[#0AF5D6]' : 'text-gray-600 hover:text-gray-400'}`}>
                    {tab === 'typescript' ? 'TS' : tab === 'python' ? 'PY' : 'RS'}
                  </button>
                ))}
              </div>
              <div className="p-5 font-mono text-[11px] sm:text-[12px] leading-[1.9] overflow-x-auto">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    {codeSnippets[activeTab].map((line, i) => (
                      <div key={i}>
                        {line === '' ? <br /> : (
                          <span className={
                            line.startsWith('import') || line.startsWith('from') || line.startsWith('use') ? 'text-purple-400' :
                            line.startsWith('//') || line.startsWith('#') ? 'text-gray-600' :
                            line.includes('const ') || line.includes('let ') ? 'text-blue-300' :
                            'text-gray-300'
                          }>{line}</span>
                        )}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </ScaleReveal>
        </div>

        <RevealOnScroll className="text-center">
          <div className="inline-flex items-center gap-3">
            <Link to="/docs" className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-6 py-3 rounded-xl font-bold text-sm transition-all">
              View Full Documentation
            </Link>
            <Link to="/docs" className="text-gray-400 hover:text-white font-semibold text-sm flex items-center gap-1.5 px-5 py-3 transition-colors border border-white/[0.06] rounded-xl hover:border-white/10">
              API Reference <ArrowRight size={14} />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function WhySection() {
  const reasons = [
    { icon: <Lock size={22} />, title: 'Zero-Knowledge Privacy', desc: 'Advanced cryptographic proofs ensure your transactions remain completely untraceable and private.' },
    { icon: <Globe size={22} />, title: 'Multi-Chain Support', desc: 'Mix assets across 15+ blockchains including Bitcoin, Ethereum, and Monero.' },
    { icon: <Zap size={22} />, title: 'Instant Processing', desc: 'Lightning-fast mixing with customizable delay options for enhanced security.' },
    { icon: <Layers size={22} />, title: 'Large Liquidity Pools', desc: 'Massive anonymity sets ensure maximum privacy protection for every transaction.' },
    { icon: <Shield size={22} />, title: 'Decentralized Infrastructure', desc: 'No single point of failure with distributed nodes across the globe ensuring maximum uptime and security.' },
    { icon: <Eye size={22} />, title: 'Fully Auditable', desc: 'Open-source smart contracts and third-party audits ensure transparency without compromising user privacy.' },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-[#000000] via-[#0AF5D6]/[0.08] to-[#000000]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-[#0AF5D6]/6 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">Why GhostLane</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Advanced privacy technology meets<br className="hidden md:block" /> user-friendly design
          </h2>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" gap={0.06}>
          {reasons.map((r) => (
            <motion.div key={r.title} variants={cardReveal} className="group bg-[#0A0A0A] rounded-2xl p-7 border border-white/[0.04] hover:border-[#0AF5D6]/15 transition-all duration-300">
              <div className="w-12 h-12 bg-[#0AF5D6]/8 rounded-xl flex items-center justify-center text-[#0AF5D6] mb-5 group-hover:bg-[#0AF5D6] group-hover:text-black transition-all duration-300">{r.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{r.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { step: '01', title: 'Deposit Assets', desc: 'Send your digital assets to our secure mixing pool with complete confidentiality.', icon: <ArrowRight size={20} /> },
    { step: '02', title: 'Mixing Process', desc: 'Assets are mixed using advanced zero-knowledge algorithms that break all transaction links.', icon: <Shuffle size={20} /> },
    { step: '03', title: 'Receive Clean Assets', desc: 'Withdraw mixed assets with complete privacy. No connection to the original transaction.', icon: <Check size={20} /> },
  ];

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 border-y border-white/[0.03] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0AF5D6]/[0.08] via-[#0AF5D6]/[0.10] to-[#000000]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#0AF5D6]/6 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">How GhostLane Works</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Simple, secure, and completely private
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">Three easy steps to complete transaction privacy</p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((s, i) => (
            <RevealOnScroll key={s.step} delay={i * 0.1}>
              <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-white/[0.04] text-center relative overflow-hidden group hover:border-[#0AF5D6]/15 transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0AF5D6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 bg-[#0AF5D6]/8 rounded-2xl flex items-center justify-center text-[#0AF5D6] mx-auto mb-5">
                  <span className="text-2xl font-extrabold">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <ScaleReveal>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#0AF5D6]/10 text-center">
            <h3 className="text-xl font-bold text-white mb-3">Complete Privacy Guaranteed</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
              Our advanced mixing technology ensures that your transaction history is completely untraceable. With zero-knowledge proofs and military-grade encryption, your financial privacy is our top priority.
            </p>
          </div>
        </ScaleReveal>
      </div>
    </section>
  );
}

function TechnologySection() {
  const tech = [
    { title: 'Zero-Knowledge Proofs', desc: 'Advanced cryptographic protocols ensure complete transaction privacy', tags: ['zk-SNARKs', 'Bulletproofs', 'Ring Signatures'], icon: <Lock size={20} /> },
    { title: 'Advanced Algorithms', desc: 'Sophisticated mixing algorithms that break transaction patterns', tags: ['CoinJoin', 'Stealth Addresses', 'Decoy Transactions'], icon: <Code2 size={20} /> },
    { title: 'Distributed Architecture', desc: 'Decentralized infrastructure across multiple nodes worldwide', tags: ['Global Network', 'Load Balancing', 'Redundant Systems'], icon: <Globe size={20} /> },
    { title: 'Military-Grade Security', desc: 'Bank-level security measures protect your assets at all times', tags: ['AES-256', 'Multi-Sig', 'Cold Storage'], icon: <Shield size={20} /> },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tl from-[#000000] via-[#0AF5D6]/[0.08] to-[#000000]" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-[#0AF5D6]/6 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">Cutting-Edge Technology</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Built with the latest cryptographic<br className="hidden md:block" /> innovations
          </h2>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 gap-5" gap={0.08}>
          {tech.map((t) => (
            <motion.div key={t.title} variants={cardReveal} className="bg-[#0A0A0A] rounded-2xl p-7 border border-white/[0.04] group hover:border-[#0AF5D6]/15 transition-all duration-300">
              <div className="w-12 h-12 bg-[#0AF5D6]/8 rounded-xl flex items-center justify-center text-[#0AF5D6] mb-5 group-hover:bg-[#0AF5D6] group-hover:text-black transition-all duration-300">{t.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{t.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{t.desc}</p>
              <div className="flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold text-gray-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function SupportedAssetsSection() {
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', logo: '/crypto-bitcoin.png' },
    { symbol: 'ETH', name: 'Ethereum', logo: '/crypto-ethereum.png' },
    { symbol: 'XMR', name: 'Monero', logo: '/crypto-monero.png' },
    { symbol: 'LTC', name: 'Litecoin', logo: '/crypto-litecoin.png' },
    { symbol: 'DASH', name: 'Dash', logo: '/crypto-dash.png' },
    { symbol: 'ZEC', name: 'Zcash', logo: '/crypto-zcash.png' },
    { symbol: 'BCH', name: 'Bitcoin Cash', logo: '/crypto-bitcoin-cash.png' },
    { symbol: 'DOGE', name: 'Dogecoin', logo: '/crypto-dogecoin.png' },
  ];

  return (
    <section id="assets" className="relative py-24 lg:py-32 border-y border-white/[0.03] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-l from-[#000000] via-[#0AF5D6]/[0.10] to-[#0AF5D6]/[0.05]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#0AF5D6]/8 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">Supported Assets</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Mix assets across multiple blockchains
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">Same level of security and privacy for every supported asset</p>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-2 sm:grid-cols-4 gap-4" gap={0.05}>
          {assets.map((a) => (
            <motion.div key={a.symbol} variants={cardReveal} className="bg-[#0A0A0A] rounded-2xl p-6 border border-white/[0.04] text-center group hover:border-[#0AF5D6]/15 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img src={a.logo} alt={a.name} className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-white font-bold text-sm mb-0.5">{a.name}</h3>
              <span className="text-gray-600 text-xs font-mono">{a.symbol}</span>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const features = [
    'Zero-knowledge proofs',
    'Multi-chain support',
    'No registration required',
    'Tor network support',
    'Custom delay options',
    'Large liquidity pools',
    '24/7 customer support',
    'Open source code',
    'Insurance fund protection',
    'Advanced mixing algorithms',
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#000000] via-[#0AF5D6]/[0.08] to-[#000000]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#0AF5D6]/6 rounded-full blur-3xl" />
      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">Comparison</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Why Choose GhostLane?
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">See how we compare to other privacy solutions in the market</p>
        </RevealOnScroll>

        <ScaleReveal>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.04]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0A0A0A]">
                  <th className="text-left text-gray-300 font-semibold px-5 py-4 text-xs uppercase tracking-wider">Features</th>
                  <th className="text-center text-gray-500 font-semibold px-4 py-4 text-xs uppercase tracking-wider">Traditional</th>
                  <th className="text-center text-gray-500 font-semibold px-4 py-4 text-xs uppercase tracking-wider">Others</th>
                  <th className="text-center text-[#0AF5D6] font-bold px-4 py-4 text-xs uppercase tracking-wider">GhostLane</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={f} className="border-t border-white/[0.04]">
                    <td className="text-gray-400 px-5 py-3.5 text-sm">{f}</td>
                    <td className="text-center px-4 py-3.5"><X size={14} className="text-red-500/60 mx-auto" /></td>
                    <td className="text-center px-4 py-3.5">{i < 2 ? <Check size={14} className="text-gray-500 mx-auto" /> : <X size={14} className="text-red-500/60 mx-auto" />}</td>
                    <td className="text-center px-4 py-3.5"><Check size={14} className="text-[#0AF5D6] mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScaleReveal>
      </div>
    </section>
  );
}

function SecuritySection() {
  const items = [
    { icon: <EyeOff size={20} />, title: 'Zero Logs', desc: 'No transaction logs or personal data stored' },
    { icon: <Globe size={20} />, title: 'Decentralized', desc: 'Distributed infrastructure with no single point of failure' },
    { icon: <Shield size={20} />, title: 'Tor Support', desc: 'Full Tor network compatibility for enhanced anonymity' },
    { icon: <Layers size={20} />, title: 'Multi-Layer', desc: 'Multiple privacy layers for maximum protection' },
  ];

  return (
    <section id="security" className="relative py-24 lg:py-32 border-y border-white/[0.03] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#0AF5D6]/[0.10] to-[#000000]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[400px] bg-[#0AF5D6]/7 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">Security & Privacy</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Your privacy and security<br className="hidden md:block" /> are our top priorities
          </h2>
        </RevealOnScroll>

        <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" gap={0.06}>
          {items.map((item) => (
            <motion.div key={item.title} variants={cardReveal} className="bg-[#0A0A0A] rounded-2xl p-6 border border-white/[0.04] text-center group hover:border-[#0AF5D6]/15 transition-all duration-300">
              <div className="w-14 h-14 bg-[#0AF5D6]/8 rounded-2xl flex items-center justify-center text-[#0AF5D6] mx-auto mb-4 group-hover:bg-[#0AF5D6] group-hover:text-black transition-all duration-300">{item.icon}</div>
              <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </StaggerWrap>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    { q: 'How does GhostLane ensure complete privacy?', a: 'GhostLane uses advanced zero-knowledge proofs (zk-SNARKs), ring signatures, and multi-hop routing to ensure that no transaction can be traced back to its origin. We maintain zero logs and our decentralized infrastructure has no single point of failure.' },
    { q: 'Is using a crypto mixer legal?', a: 'The legality of using crypto mixing services varies by jurisdiction. GhostLane is a privacy tool designed to protect users\' financial privacy, similar to using encrypted messaging or a VPN. We encourage all users to comply with their local laws and regulations.' },
    { q: 'What fees does GhostLane charge?', a: 'GhostLane charges a small service fee that varies by asset and mixing complexity. Fees are transparently displayed before each transaction. Our competitive fee structure ensures privacy is accessible to everyone.' },
    { q: 'How long does the mixing process take?', a: 'Standard mixing completes in seconds to minutes depending on the asset and privacy level selected. Users can also enable custom delays to further enhance anonymity by breaking temporal patterns.' },
    { q: 'What happens if there\'s a technical issue?', a: 'Our 24/7 support team is available via Telegram and email. Funds are always safe thanks to our multi-signature cold storage system and insurance fund. In the unlikely event of an issue, our redundant systems ensure zero loss of funds.' },
  ];

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-[#000000] via-[#0AF5D6]/[0.08] to-[#000000]" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] bg-[#0AF5D6]/6 rounded-full blur-3xl" />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 relative z-10">
        <RevealOnScroll className="text-center mb-16">
          <span className="text-[#0AF5D6] text-xs font-bold uppercase tracking-widest block mb-3">FAQ</span>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
        </RevealOnScroll>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <RevealOnScroll key={i} delay={i * 0.04}>
              <div className="bg-[#0A0A0A] rounded-xl border border-white/[0.04] overflow-hidden">
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} className="text-[#0AF5D6] shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                      <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/[0.04] pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { user } = useAuth();

  return (
    <section className="relative py-24 lg:py-32 border-t border-white/[0.03] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#0AF5D6]/[0.12] to-[#000000]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0AF5D6]/10 rounded-full blur-3xl" />
      <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center relative z-10">
        <RevealOnScroll>
          <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold leading-[1.08] tracking-tight text-white mb-5">
            Ready to Protect<br className="hidden sm:block" /> Your Privacy?
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of users who trust GhostLane for their digital asset privacy needs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to={user ? '/app' : '/login'} className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-8 py-4 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20">
              Launch App <ArrowRight size={16} />
            </Link>
            <a href="https://x.com/GhostLane_" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white font-semibold text-sm flex items-center gap-2 px-6 py-4 transition-colors border border-white/[0.06] rounded-xl hover:border-white/10">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Follow on X
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function FooterSection() {
  const productLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Supported Assets', href: '#assets' },
    { label: 'Security', href: '#security' },
    { label: 'FAQ', href: '#faq' },
  ];

  const supportLinks = [
    { label: 'Documentation', href: '/docs' },
    { label: 'Ux402 Protocol', href: '#ux402' },
  ];

  const resourceLinks = [
    { label: 'API Reference', href: '/docs' },
    { label: 'Features', href: '#features' },
  ];

  return (
    <footer className="relative border-t border-white/[0.04] pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0AF5D6]/[0.08] via-[#000000] to-[#000000]" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/ghostlane-logo.png" alt="GhostLane" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-lg font-bold tracking-tight text-white">GhostLane</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-4 max-w-xs">
              Complete financial privacy through advanced cryptocurrency mixing technology and zero-knowledge proofs.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://x.com/GhostLane_" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#0AF5D6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-4">Product</span>
            <div className="flex flex-col gap-2.5">
              {productLinks.map((l) => (
                <a key={l.label} href={l.href} className="text-gray-500 hover:text-white text-xs font-medium transition-colors">{l.label}</a>
              ))}
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-4">Support</span>
            <div className="flex flex-col gap-2.5">
              {supportLinks.map((l) => (
                <a key={l.label} href={l.href} className="text-gray-500 hover:text-white text-xs font-medium transition-colors">{l.label}</a>
              ))}
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-4">Resources</span>
            <div className="flex flex-col gap-2.5">
              {resourceLinks.map((l) => (
                l.href.startsWith('/') ?
                  <Link key={l.label} to={l.href} className="text-gray-500 hover:text-white text-xs font-medium transition-colors">{l.label}</Link> :
                  <a key={l.label} href={l.href} className="text-gray-500 hover:text-white text-xs font-medium transition-colors">{l.label}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-gray-600 text-[11px]">&copy; 2024 GhostLane. All rights reserved. Your privacy is our priority.</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="bg-[#000000] min-h-screen font-sans antialiased">
      <Navbar />
      <HeroSection />
      <ProductsSection />
      <Ux402Section />
      <WhySection />
      <HowItWorksSection />
      <TechnologySection />
      <SupportedAssetsSection />
      <ComparisonSection />
      <SecuritySection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
