import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Wallet, CreditCard, Repeat, Shield, Coins, HelpCircle, BookOpen, Menu, X } from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Platform Overview', icon: <BookOpen size={16} /> },
  { id: 'getting-started', title: 'Getting Started', icon: <Wallet size={16} /> },
  { id: 'virtual-cards', title: 'Virtual Cards', icon: <CreditCard size={16} /> },
  { id: 'funding', title: 'Funding & Top-ups', icon: <Repeat size={16} /> },
  { id: 'security', title: 'Security & Controls', icon: <Shield size={16} /> },
  { id: 'supported-tokens', title: 'Supported Tokens', icon: <Coins size={16} /> },
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
              ? 'bg-[#FF5550]/10 text-[#FF5550]'
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
    <div className="min-h-screen bg-[#0A0B0E] font-sans">
      <header className="sticky top-0 z-50 bg-[#0A0B0E]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="WispTap" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold tracking-tight text-white">WispTap</span>
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
          <div className="absolute top-[65px] left-0 w-72 h-[calc(100vh-65px)] bg-[#111215] border-r border-white/5 p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">WispTap Documentation</h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Complete reference for the WispTap platform. Learn how to create wallets, issue virtual cards, fund your account, and manage security controls.
              </p>
            </div>

            <Section id="overview" title="Platform Overview">
              <P>
                WispTap is a financial technology platform built on the Solana blockchain. It enables users to convert cryptocurrency holdings into spendable funds through virtual Visa card issuance. The platform bridges decentralized finance (DeFi) with traditional payment infrastructure, allowing users to transact at any Visa-accepting merchant worldwide.
              </P>
              <P>
                The platform operates through three core modules: a self-custody Solana wallet, an instant token conversion engine, and a virtual card issuance system. Each module is designed to function independently while providing a unified experience through a single dashboard interface.
              </P>
              <H3>Architecture</H3>
              <P>
                WispTap follows a hybrid architecture model. Wallet operations execute directly on the Solana blockchain, ensuring full custody remains with the user. Card issuance and transaction processing are handled through licensed payment infrastructure that connects to the Visa network. Token conversions leverage on-chain liquidity pools for real-time rate discovery and settlement.
              </P>
              <H3>Key Capabilities</H3>
              <UL>
                <LI>Self-custody Solana wallet generation with full private key ownership</LI>
                <LI>Virtual Visa card issuance (up to 2 cards per account)</LI>
                <LI>Real-time SOL to USDC/USDT conversion with live market rates</LI>
                <LI>Per-card security controls including freeze, online payment toggles, and contactless settings</LI>
                <LI>Live transaction monitoring and balance tracking</LI>
                <LI>Portfolio overview with token breakdown and historical performance</LI>
              </UL>
            </Section>

            <Section id="getting-started" title="Getting Started">
              <H3>Account Creation</H3>
              <P>
                To begin using WispTap, create an account by providing an email address and a password of at least 8 characters. No identity verification (KYC) is required for account creation. Upon successful registration, you are automatically redirected to the dashboard.
              </P>
              <H3>Wallet Generation</H3>
              <P>
                After signing in, navigate to the Fund section of the dashboard. If no wallet exists, the system prompts you to generate one. Wallet generation is instantaneous and produces a standard Solana keypair consisting of a public address and a private key.
              </P>
              <Callout type="warning" title="Private Key Security">
                Your private key is displayed only once during wallet generation. WispTap does not store or have access to your private key after this initial display. You must back up this key immediately in a secure location. Loss of the private key results in permanent, irrecoverable loss of access to the wallet and any funds it contains.
              </Callout>
              <H3>Receiving Funds</H3>
              <P>
                Once your wallet is generated, you can receive SOL or SPL tokens by sharing your public wallet address. The address is displayed on the Fund page and can be copied to your clipboard. Incoming transactions are reflected in your balance after on-chain confirmation, which typically takes 400 milliseconds on the Solana network.
              </P>
            </Section>

            <Section id="virtual-cards" title="Virtual Cards">
              <H3>Card Issuance</H3>
              <P>
                WispTap allows you to issue up to 2 virtual Visa cards per account. Each card is generated instantly and comes with a unique card number, expiration date, and CVV. Cards are ready for use immediately after issuance.
              </P>
              <P>
                To issue a card, navigate to the Cards section of your dashboard and select "Issue Card." The system assigns a unique identifier and card credentials. Each card operates independently with its own set of security controls.
              </P>
              <H3>Card Details</H3>
              <P>
                Card credentials (full card number, expiration date, and CVV) are masked by default for security. To view complete card details, use the "Reveal" action on any card. You can copy the full card number to your clipboard for use in online transactions.
              </P>
              <H3>Accepted Merchants</H3>
              <P>
                WispTap virtual cards operate on the Visa network and are accepted at any merchant that processes Visa transactions. This includes online retailers, subscription services, digital platforms, and point-of-sale terminals in over 200 countries.
              </P>
              <H3>Card Limits</H3>
              <Table
                headers={['Parameter', 'Value']}
                rows={[
                  ['Maximum cards per account', '2'],
                  ['Card network', 'Visa'],
                  ['Card type', 'Virtual (no physical card)'],
                  ['Issuance time', 'Instant'],
                  ['Geographic coverage', '200+ countries'],
                ]}
              />
            </Section>

            <Section id="funding" title="Funding & Top-ups">
              <H3>Token Conversion</H3>
              <P>
                The Fund section provides a built-in conversion interface for swapping SOL to stablecoins (USDC or USDT). Conversion rates are sourced in real-time from on-chain liquidity pools and displayed before you confirm any transaction.
              </P>
              <P>
                To perform a conversion, enter the amount of SOL you wish to convert, select your target stablecoin, and confirm the transaction. The conversion executes on-chain and your card balance updates immediately upon settlement.
              </P>
              <H3>Conversion Parameters</H3>
              <Table
                headers={['Parameter', 'Details']}
                rows={[
                  ['Supported input token', 'SOL'],
                  ['Supported output tokens', 'USDC, USDT'],
                  ['Rate source', 'Live on-chain liquidity pools'],
                  ['Settlement time', 'Near-instant (Solana block time)'],
                  ['Transaction fee', '~0.0001 SOL (Solana network fee)'],
                ]}
              />
              <H3>Balance Management</H3>
              <P>
                Your dashboard displays your current SOL balance, its USD equivalent (calculated from the live SOL price), and the breakdown of your token holdings. The portfolio view provides a visual representation of your asset allocation across SOL, USDC, and USDT.
              </P>
              <Callout type="info" title="Price Data">
                SOL price data is fetched in real-time from market APIs. Price updates occur automatically when you load or refresh the dashboard. The displayed USD value of your portfolio reflects the most recent available market price.
              </Callout>
            </Section>

            <Section id="security" title="Security & Controls">
              <H3>Card Freeze</H3>
              <P>
                Any virtual card can be frozen instantly from either the Cards page or the Security page. Freezing a card blocks all new transactions while preserving the card credentials. Unfreezing restores full functionality immediately. This feature is useful for temporarily disabling a card without permanent cancellation.
              </P>
              <H3>Per-Card Controls</H3>
              <P>
                The Security section of the dashboard provides granular controls for each issued card. Available controls include:
              </P>
              <UL>
                <LI><strong>Freeze/Unfreeze:</strong> Instantly suspend or reactivate transaction processing on a card.</LI>
                <LI><strong>Online Payments:</strong> Toggle whether the card can be used for online (card-not-present) transactions.</LI>
                <LI><strong>Contactless Payments:</strong> Enable or disable contactless (NFC/tap) payment capability.</LI>
              </UL>
              <P>
                Each control applies independently per card. Changes take effect immediately and do not require confirmation or waiting periods.
              </P>
              <H3>Self-Custody Model</H3>
              <P>
                WispTap operates on a self-custody model for wallet management. This means:
              </P>
              <UL>
                <LI>You hold your own private keys. WispTap never stores or has access to your private key.</LI>
                <LI>Only you can authorize on-chain transactions from your wallet.</LI>
                <LI>Fund recovery is impossible without your private key. There is no "forgot password" mechanism for wallet access.</LI>
              </UL>
              <Callout type="warning" title="Important">
                The self-custody model places full responsibility for key management on you. Store your private key in a secure, offline location. Consider using a hardware wallet or encrypted backup for long-term storage.
              </Callout>
            </Section>

            <Section id="supported-tokens" title="Supported Tokens">
              <P>
                WispTap currently supports three tokens on the Solana blockchain. Each token serves a specific role within the platform ecosystem.
              </P>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <TokenCard name="SOL" desc="Native Solana token. Used for wallet funding and gas fees." logo="/sol-logo.png" color="#9945FF" />
                <TokenCard name="USDC" desc="USD-pegged stablecoin by Circle. Primary card funding currency." logo="/usdc-logo.png" color="#2775CA" />
                <TokenCard name="USDT" desc="USD-pegged stablecoin by Tether. Alternative card funding currency." logo="/usdt-logo.png" color="#26A17B" />
              </div>
              <H3>Token Roles</H3>
              <Table
                headers={['Token', 'Role', 'Notes']}
                rows={[
                  ['SOL', 'Wallet funding, gas fees', 'Required for all on-chain transactions'],
                  ['USDC', 'Card balance, payments', 'Primary stablecoin for card top-ups'],
                  ['USDT', 'Card balance, payments', 'Alternative stablecoin option'],
                ]}
              />
              <P>
                Additional token support may be introduced in future platform updates. The conversion engine is designed to accommodate new trading pairs as they become available through Solana liquidity pools.
              </P>
            </Section>

            <Section id="faq" title="Frequently Asked Questions">
              <FAQ q="Is WispTap a bank?" a="No. WispTap is a financial technology platform, not a bank. Funds held in your wallet are cryptocurrency assets on the Solana blockchain. Virtual card balances are managed through licensed payment infrastructure. Deposits are not FDIC insured." />
              <FAQ q="Do I need to verify my identity (KYC) to use WispTap?" a="No identity verification is required to create an account, generate a wallet, or issue virtual cards. WispTap is designed for permissionless access." />
              <FAQ q="How many virtual cards can I create?" a="Each account can issue up to 2 virtual Visa cards. Each card operates independently with its own credentials and security controls." />
              <FAQ q="What happens if I lose my private key?" a="If you lose your private key, access to your wallet and its funds is permanently lost. WispTap does not store private keys and cannot recover them. Always create a secure backup during wallet generation." />
              <FAQ q="What are the transaction fees?" a="On-chain operations (token conversions, transfers) incur standard Solana network fees, typically around 0.0001 SOL per transaction. WispTap does not charge additional platform fees for conversions." />
              <FAQ q="Which countries are supported?" a="WispTap virtual cards operate on the Visa network and are accepted in over 200 countries at any merchant that processes Visa transactions." />
              <FAQ q="Can I withdraw funds back to SOL?" a="The current platform version supports SOL-to-stablecoin conversion. Reverse conversion (stablecoin-to-SOL) may be supported in a future update." />
              <FAQ q="How fast are conversions?" a="Token conversions execute on the Solana blockchain with near-instant settlement. Solana's average block time is approximately 400 milliseconds, making conversions effectively real-time." />
              <FAQ q="Is my wallet secure?" a="WispTap uses a self-custody model. Your private key is generated locally and displayed only once. The platform never stores, transmits, or has access to your private key. Security of the wallet is entirely under your control." />
            </Section>
          </div>
        </main>
      </div>

      <footer className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600">
          <span>&copy; 2026 WispTap. All rights reserved.</span>
          <Link to="/" className="text-gray-500 hover:text-white transition-colors text-xs">Back to Home</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-white/5">{title}</h2>
      {children}
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-white mt-8 mb-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 text-sm leading-relaxed mb-4">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-outside ml-5 mb-4 flex flex-col gap-2">{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return <li className="text-gray-400 text-sm leading-relaxed">{children}</li>;
}

function Callout({ type, title, children }: { type: 'warning' | 'info'; title: string; children: React.ReactNode }) {
  const styles = type === 'warning'
    ? 'bg-amber-500/5 border-amber-500/20 text-amber-200'
    : 'bg-blue-500/5 border-blue-500/20 text-blue-200';
  const labelColor = type === 'warning' ? 'text-amber-400' : 'text-blue-400';

  return (
    <div className={`rounded-xl border p-5 mb-6 ${styles}`}>
      <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${labelColor}`}>{title}</span>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-6 rounded-xl border border-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#161719]">
            {headers.map((h, i) => (
              <th key={i} className="text-left text-gray-300 font-semibold px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-white/5">
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

function TokenCard({ name, desc, logo, color }: { name: string; desc: string; logo: string; color: string }) {
  return (
    <div className="bg-[#111215] rounded-xl border border-white/5 p-5 flex flex-col items-center text-center">
      <img src={logo} alt={name} className="w-10 h-10 rounded-full mb-3" />
      <span className="font-bold text-white text-sm mb-1" style={{ color }}>{name}</span>
      <span className="text-gray-500 text-xs leading-relaxed">{desc}</span>
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
