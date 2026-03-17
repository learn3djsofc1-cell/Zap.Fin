import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Shield, Code2, Zap, Lock, HelpCircle, BookOpen, Menu, X, Terminal } from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Platform Overview', icon: <BookOpen size={16} /> },
  { id: 'getting-started', title: 'Getting Started', icon: <Terminal size={16} /> },
  { id: 'mixer', title: 'Privacy Mixer', icon: <Lock size={16} /> },
  { id: 'ux402', title: 'Ux402 Protocol', icon: <Zap size={16} /> },
  { id: 'security', title: 'Security Framework', icon: <Shield size={16} /> },
  { id: 'sdk', title: 'SDK Reference', icon: <Code2 size={16} /> },
  { id: 'faq', title: 'FAQ', icon: <HelpCircle size={16} /> },
];

function SidebarNav({ activeSection, onSelect }: { activeSection: string; onSelect?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={onSelect}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeSection === s.id
              ? 'bg-[#0AF5D6]/10 text-[#0AF5D6]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {s.icon}
          {s.title}
        </a>
      ))}
    </nav>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] font-sans">
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/ghostlane-logo.png" alt="GhostLane" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-bold tracking-tight text-white">GhostLane</span>
            </Link>
            <ChevronRight size={14} className="text-gray-600 hidden sm:block" />
            <span className="text-gray-400 text-sm font-medium hidden sm:block">Documentation</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <button className="lg:hidden text-gray-400 hover:text-white p-1.5" onClick={() => setMobileNav(!mobileNav)}>
              {mobileNav ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileNav && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileNav(false)}>
          <div className="absolute top-[65px] left-0 w-72 h-[calc(100vh-65px)] bg-[#0A0A0A] border-r border-white/[0.04] p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <SidebarNav activeSection={activeSection} onSelect={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 sm:px-6 flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0 sticky top-[73px] h-[calc(100vh-73px)] py-8 overflow-y-auto">
          <div className="mb-6">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-4 px-3">Contents</span>
            <SidebarNav activeSection={activeSection} />
          </div>
        </aside>

        <main className="flex-1 min-w-0 py-8 pb-24">
          <div className="max-w-3xl">
            <div className="mb-12">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">GhostLane Documentation</h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Complete reference for the GhostLane privacy platform. Learn how to use the mixer, integrate the Ux402 protocol, configure security policies, and access the SDK.
              </p>
            </div>

            <Section id="overview" title="Platform Overview">
              <P>
                GhostLane is a complete privacy ecosystem built for cryptocurrency users who value financial confidentiality. It combines advanced mixing technology, encrypted messaging, cross-chain privacy bridges, and VPN services into a unified platform powered by zero-knowledge cryptography.
              </P>
              <P>
                The platform operates through four core products: a privacy mixer with zero-knowledge proofs, an encrypted messenger with disappearing messages, a cross-chain privacy bridge, and a military-grade VPN with Tor integration.
              </P>
              <H3>Architecture</H3>
              <P>
                GhostLane uses a decentralized architecture with distributed nodes across the globe. Zero-knowledge proofs (zk-SNARKs) ensure transaction privacy while maintaining verifiability. No logs are stored, and the infrastructure has no single point of failure.
              </P>
              <H3>Key Capabilities</H3>
              <UL>
                <LI>Advanced cryptocurrency mixing with zero-knowledge proofs across 15+ chains</LI>
                <LI>End-to-end encrypted messaging with self-destructing messages</LI>
                <LI>Cross-chain asset transfers with complete anonymity</LI>
                <LI>Military-grade VPN with Tor integration and kill switch</LI>
                <LI>Ux402 Protocol for untraceable cross-chain transactions on Solana</LI>
                <LI>TypeScript, Python, and Rust SDKs for developer integration</LI>
              </UL>
            </Section>

            <Section id="getting-started" title="Getting Started">
              <H3>Installation</H3>
              <P>
                Install the GhostLane SDK using your preferred package manager. The SDK supports Node.js 18+ and Python 3.10+.
              </P>
              <CodeBlock code={`# Node.js / TypeScript\nnpm install @ghostlane/sdk\n\n# Python\npip install ghostlane`} />
              <H3>Initialization</H3>
              <P>
                Create a GhostLane client instance with your API key. API keys are generated from the GhostLane dashboard and scoped to specific environments (sandbox or production).
              </P>
              <CodeBlock code={`import { GhostLane } from '@ghostlane/sdk';\n\nconst client = new GhostLane('gl_live_your_api_key');\n\n// Verify connection\nconst status = await client.health();\nconsole.log(status); // { ok: true, latency: '12ms' }`} />
              <Callout type="info" title="Sandbox Environment">
                Use the sandbox API key prefix <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">gl_test_</code> for development. Sandbox transactions execute immediately but do not use real funds.
              </Callout>
            </Section>

            <Section id="mixer" title="Privacy Mixer">
              <H3>How Mixing Works</H3>
              <P>
                The GhostLane mixer uses advanced zero-knowledge proofs to break the link between deposit and withdrawal addresses. Assets enter a mixing pool where they are combined with other users' funds, making it impossible to trace the origin of any withdrawal.
              </P>
              <CodeBlock code={`const mix = await client.mixer.create({\n  asset: 'ETH',\n  amount: '1.5',\n  delay: 'random',\n  privacyLevel: 'maximum',\n});\n\nconsole.log(mix.status); // 'mixing'\nconsole.log(mix.estimatedCompletion); // '~2 minutes'`} />
              <H3>Privacy Levels</H3>
              <Table
                headers={['Level', 'Anonymity Set', 'Typical Delay']}
                rows={[
                  ['Standard', '100+ participants', '< 1 minute'],
                  ['Enhanced', '500+ participants', '1-5 minutes'],
                  ['Maximum', '1000+ participants', '5-30 minutes'],
                ]}
              />
            </Section>

            <Section id="ux402" title="Ux402 Protocol">
              <H3>Shielded Cross-Chain Facilitator</H3>
              <P>
                The Ux402 Protocol is the world's first untraceable x402 implementation, enabling complete transaction privacy across blockchains. Built on Solana for speed and low cost, it uses multi-hop routing through privacy pools.
              </P>
              <CodeBlock code={`import { Ux402Client } from '@ghostlane/ux402-sdk';\n\nconst ux402 = new Ux402Client({\n  network: 'mainnet',\n  rpcUrl: 'https://api.ghostlane.io/ux402',\n});\n\nconst transfer = await ux402.createTransfer({\n  sourceChain: 'ethereum',\n  destChain: 'solana',\n  amount: '1.5',\n  token: 'ETH',\n  privacyLevel: 'maximum',\n});`} />
              <H3>Supported Chains</H3>
              <P>
                Ux402 currently supports cross-chain transfers between 15+ blockchains including Ethereum, Solana, Bitcoin, Polygon, Avalanche, Arbitrum, and more.
              </P>
            </Section>

            <Section id="security" title="Security Framework">
              <H3>Zero-Knowledge Architecture</H3>
              <P>
                GhostLane's security is built on zero-knowledge proofs that ensure no party - including GhostLane itself - can link deposits to withdrawals. All cryptographic operations are verified on-chain.
              </P>
              <H3>Security Measures</H3>
              <Table
                headers={['Measure', 'Implementation']}
                rows={[
                  ['Encryption', 'AES-256-GCM for all data at rest and in transit'],
                  ['Key Management', 'Multi-signature cold storage for treasury funds'],
                  ['Infrastructure', 'Distributed nodes across 50+ countries'],
                  ['Logging', 'Zero-log policy - no transaction data stored'],
                  ['Network', 'Full Tor network compatibility'],
                  ['Insurance', 'Insurance fund for asset protection'],
                ]}
              />
              <Callout type="warning" title="Security Notice">
                Never share your API keys or wallet private keys. GhostLane will never ask for your private keys. All mixing operations are non-custodial - you maintain full control of your assets.
              </Callout>
            </Section>

            <Section id="sdk" title="SDK Reference">
              <H3>TypeScript SDK</H3>
              <P>
                The TypeScript SDK provides a fully typed interface to all GhostLane operations. It supports both ESM and CJS module systems and requires Node.js 18+.
              </P>
              <CodeBlock code={`import { GhostLane } from '@ghostlane/sdk';\n\nconst gl = new GhostLane('gl_live_...');\n\n// Mixer\nconst mix = await gl.mixer.create({ asset, amount, privacyLevel });\nconst status = await gl.mixer.status(mix.id);\n\n// Bridge\nconst bridge = await gl.bridge.transfer({ from, to, amount, chain });\n\n// Messenger\nconst msg = await gl.messenger.send({ to, content, selfDestruct: '24h' });`} />
              <H3>Python SDK</H3>
              <P>
                The Python SDK mirrors the TypeScript API surface with Pythonic naming conventions. It uses async/await for all I/O operations and supports Python 3.10+.
              </P>
              <CodeBlock code={`from ghostlane import GhostLane\n\ngl = GhostLane("gl_live_...")\n\n# Create mixing operation\nmix = await gl.mixer.create(\n    asset="ETH",\n    amount="1.5",\n    privacy_level="maximum"\n)\n\nstatus = await gl.mixer.status(mix.id)\nprint(f"Status: {status.state}")`} />
              <H3>Error Handling</H3>
              <Table
                headers={['Error Code', 'Description', 'Resolution']}
                rows={[
                  ['InsufficientFunds', 'Not enough balance for operation', 'Deposit additional funds before retrying'],
                  ['InvalidAsset', 'Asset not supported for mixing', 'Check supported assets list'],
                  ['PoolUnavailable', 'Mixing pool temporarily at capacity', 'Retry after a short delay'],
                  ['RateLimited', 'Too many requests in time window', 'Implement exponential backoff'],
                  ['ChainUnavailable', 'Target blockchain temporarily unavailable', 'Check network status and retry'],
                ]}
              />
            </Section>

            <Section id="faq" title="Frequently Asked Questions">
              <FAQ q="What is GhostLane?" a="GhostLane is a complete privacy ecosystem for cryptocurrency users. It provides advanced mixing, encrypted messaging, cross-chain privacy bridges, and VPN services - all powered by zero-knowledge cryptography." />
              <FAQ q="Is using GhostLane legal?" a="GhostLane is a privacy tool, similar to encrypted messaging apps or VPNs. The legality of privacy tools varies by jurisdiction. We encourage users to comply with their local laws." />
              <FAQ q="Which assets are supported?" a="GhostLane supports mixing for BTC, ETH, XMR, LTC, DASH, ZEC, BCH, DOGE, and more. The Ux402 protocol supports cross-chain transfers across 15+ blockchains." />
              <FAQ q="How does the mixer ensure privacy?" a="The mixer uses zero-knowledge proofs (zk-SNARKs), ring signatures, and large anonymity sets to break the link between deposit and withdrawal addresses. No logs are stored." />
              <FAQ q="Is there a sandbox for testing?" a="Yes. Use API keys with the gl_test_ prefix to access the sandbox environment. Sandbox operations execute instantly but do not use real funds." />
              <FAQ q="What is the Ux402 Protocol?" a="Ux402 is our shielded cross-chain facilitator built on Solana. It enables untraceable asset transfers between blockchains using multi-hop routing through privacy pools." />
            </Section>
          </div>
        </main>
      </div>

      <footer className="border-t border-white/[0.04] py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600">
          <span>&copy; 2024 GhostLane. All rights reserved.</span>
          <Link to="/" className="text-gray-500 hover:text-white transition-colors text-xs">Back to Home</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-white/5">{title}</h2>
      {children}
    </section>
  );
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-bold text-white mt-8 mb-3">{children}</h3>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-gray-400 text-sm leading-relaxed mb-4">{children}</p>;
}

function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc list-outside ml-5 mb-4 flex flex-col gap-2">{children}</ul>;
}

function LI({ children }: { children: ReactNode }) {
  return <li className="text-gray-400 text-sm leading-relaxed">{children}</li>;
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-[#0A0A0A] rounded-xl border border-white/[0.04] p-5 mb-6 overflow-x-auto">
      <pre className="text-[12px] sm:text-[13px] font-mono leading-relaxed text-gray-300 whitespace-pre">{code}</pre>
    </div>
  );
}

function Callout({ type, title, children }: { type: 'warning' | 'info'; title: string; children: ReactNode }) {
  const styles = type === 'warning'
    ? 'bg-amber-500/5 border-amber-500/20 text-amber-200'
    : 'bg-[#0AF5D6]/5 border-[#0AF5D6]/20 text-[#0AF5D6]/80';
  const labelColor = type === 'warning' ? 'text-amber-400' : 'text-[#0AF5D6]';

  return (
    <div className={`rounded-xl border p-5 mb-6 ${styles}`}>
      <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${labelColor}`}>{title}</span>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-6 rounded-xl border border-white/[0.04]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0A0A0A]">
            {headers.map((h, i) => (
              <th key={i} className="text-left text-gray-300 font-semibold px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-white/[0.04]">
              {row.map((cell, ci) => (
                <td key={ci} className="text-gray-400 px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="mb-6 pb-6 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
      <h4 className="text-white font-semibold text-sm mb-2">{q}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
    </div>
  );
}
