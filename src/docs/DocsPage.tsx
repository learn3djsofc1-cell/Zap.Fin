import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Wallet, Code2, Zap, Shield, Cpu, HelpCircle, BookOpen, Menu, X, Layers, Terminal } from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Platform Overview', icon: <BookOpen size={16} /> },
  { id: 'getting-started', title: 'Getting Started', icon: <Terminal size={16} /> },
  { id: 'agent-accounts', title: 'Agent Accounts', icon: <Wallet size={16} /> },
  { id: 'settlement', title: 'Settlement Engine', icon: <Zap size={16} /> },
  { id: 'policies', title: 'Policy Framework', icon: <Shield size={16} /> },
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
              ? 'bg-[#FF6940]/10 text-[#FF6940]'
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
    <div className="min-h-screen bg-[#08090C] font-sans">
      <header className="sticky top-0 z-50 bg-[#08090C]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6940] to-[#FF8F6B] flex items-center justify-center">
                <Layers size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Molt.Fin</span>
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
          <div className="absolute top-[65px] left-0 w-72 h-[calc(100vh-65px)] bg-[#0D0E12] border-r border-white/[0.04] p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">Molt.Fin Documentation</h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Complete reference for the Molt.Fin platform. Learn how to create agent accounts, configure spending policies, integrate the SDK, and manage settlement operations.
              </p>
            </div>

            <Section id="overview" title="Platform Overview">
              <P>
                Molt.Fin is a financial infrastructure platform built on the Solana blockchain, purpose-designed for autonomous AI agents. It provides programmable bank accounts, sub-second settlement, and cryptographic policy enforcement — enabling AI systems to hold, send, and manage funds without human intervention.
              </P>
              <P>
                The platform operates through four core modules: an agent account system, an instant settlement engine, a policy enforcement layer, and native SDK tooling. Each module is designed for programmatic interaction, with no UI-dependent workflows.
              </P>
              <H3>Architecture</H3>
              <P>
                Molt.Fin follows a decentralized settlement model. Agent accounts are represented as on-chain programs on Solana, ensuring transparency and auditability. Policy rules are encoded as smart contract constraints, meaning spending limits and merchant whitelists are enforced cryptographically rather than through centralized middleware.
              </P>
              <H3>Key Capabilities</H3>
              <UL>
                <LI>Programmable agent bank accounts with multi-currency support (USDC, SOL, ETH)</LI>
                <LI>Sub-400ms transaction settlement with on-chain finality</LI>
                <LI>Cryptographic spending policies: velocity limits, merchant whitelists, multi-sig thresholds</LI>
                <LI>Native MCP integration for conversational financial operations</LI>
                <LI>TypeScript and Python SDKs with type-safe API surfaces</LI>
                <LI>Verifiable on-chain audit trail for every transaction</LI>
              </UL>
            </Section>

            <Section id="getting-started" title="Getting Started">
              <H3>Installation</H3>
              <P>
                Install the Molt.Fin SDK using your preferred package manager. The SDK supports Node.js 18+ and Python 3.10+.
              </P>
              <CodeBlock code={`# Node.js / TypeScript\nnpm install @moltfin/sdk\n\n# Python\npip install moltfin`} />
              <H3>Initialization</H3>
              <P>
                Create a Molt.Fin client instance with your API key. API keys are generated from the Molt.Fin developer dashboard and scoped to specific environments (sandbox or production).
              </P>
              <CodeBlock code={`import { MoltFin } from '@moltfin/sdk';\n\nconst moltfin = new MoltFin('mf_live_your_api_key');\n\n// Verify connection\nconst status = await moltfin.health();\nconsole.log(status); // { ok: true, latency: '12ms' }`} />
              <Callout type="info" title="Sandbox Environment">
                Use the sandbox API key prefix <code className="text-[#FF6940] bg-[#FF6940]/5 px-1.5 py-0.5 rounded text-xs">mf_test_</code> for development. Sandbox transactions settle immediately but do not move real funds.
              </Callout>
            </Section>

            <Section id="agent-accounts" title="Agent Accounts">
              <H3>Creating an Agent Account</H3>
              <P>
                Each AI agent receives its own dedicated bank account. Accounts are isolated — one agent cannot access another agent's funds. Multi-currency support allows agents to hold USDC, SOL, and ETH simultaneously.
              </P>
              <CodeBlock code={`const account = await moltfin.accounts.create({\n  agentId: 'trading_bot_01',\n  currency: 'USDC',\n  initialDeposit: 10000,\n  metadata: { purpose: 'Market making' }\n});\n\nconsole.log(account.address); // 'mf_acct_7Kv2...'\nconsole.log(account.balance); // 10000`} />
              <H3>Account Operations</H3>
              <P>
                Agent accounts support standard financial operations: deposits, withdrawals, transfers between agents, and payments to external merchants. All operations are atomic and produce verifiable on-chain receipts.
              </P>
              <Table
                headers={['Operation', 'Method', 'Latency']}
                rows={[
                  ['Deposit', 'account.deposit(amount)', '<100ms'],
                  ['Withdraw', 'account.withdraw(amount, to)', '<400ms'],
                  ['Transfer', 'account.transfer(toAgent, amount)', '<400ms'],
                  ['Payment', 'account.send({ to, amount })', '<400ms'],
                  ['Balance', 'account.balance()', '<50ms'],
                ]}
              />
            </Section>

            <Section id="settlement" title="Settlement Engine">
              <H3>How Settlement Works</H3>
              <P>
                Molt.Fin settles transactions on the Solana blockchain for sub-400ms finality. When an agent initiates a payment, the settlement engine validates the transaction against the agent's policy rules, executes the on-chain transfer, and returns a cryptographic receipt — all within a single Solana block.
              </P>
              <H3>Settlement Flow</H3>
              <UL>
                <LI><strong>Step 1 — Initiation:</strong> Agent calls <code className="text-[#FF6940] bg-[#FF6940]/5 px-1.5 py-0.5 rounded text-xs">account.send()</code> with recipient and amount</LI>
                <LI><strong>Step 2 — Policy check:</strong> The on-chain policy program validates against spending rules (~12ms)</LI>
                <LI><strong>Step 3 — Settlement:</strong> Funds transfer on Solana with cryptographic finality (~340ms)</LI>
                <LI><strong>Step 4 — Receipt:</strong> Transaction receipt returned with on-chain proof (~380ms total)</LI>
              </UL>
              <H3>Settlement Parameters</H3>
              <Table
                headers={['Parameter', 'Value']}
                rows={[
                  ['Average latency', '<400ms'],
                  ['Finality', 'Cryptographic (Solana consensus)'],
                  ['Settlement currency', 'USDC, SOL, ETH'],
                  ['Network fees', '~0.0001 SOL per transaction'],
                  ['Throughput', '~65,000 TPS (Solana limit)'],
                ]}
              />
            </Section>

            <Section id="policies" title="Policy Framework">
              <H3>Defining Spending Rules</H3>
              <P>
                Policies are cryptographic rules attached to agent accounts. They are validated on-chain before every transaction, meaning policy enforcement cannot be bypassed by application-level bugs or compromised middleware.
              </P>
              <CodeBlock code={`const policy = await moltfin.policies.create({\n  agentId: 'trading_bot_01',\n  rules: {\n    maxPerTransaction: 500,\n    dailyLimit: 5000,\n    allowedMerchants: ['vendor_a', 'vendor_b'],\n    requireMultiSig: false,\n    allowedCurrencies: ['USDC']\n  }\n});\n\n// Policies are enforced on-chain\n// Attempting to exceed limits returns PolicyViolation error`} />
              <H3>Available Policy Rules</H3>
              <Table
                headers={['Rule', 'Type', 'Description']}
                rows={[
                  ['maxPerTransaction', 'number', 'Maximum amount per single transaction'],
                  ['dailyLimit', 'number', 'Maximum total spend within 24-hour window'],
                  ['monthlyLimit', 'number', 'Maximum total spend within 30-day window'],
                  ['allowedMerchants', 'string[]', 'Whitelist of permitted payment recipients'],
                  ['blockedMerchants', 'string[]', 'Blacklist of blocked payment recipients'],
                  ['requireMultiSig', 'boolean', 'Require multi-signature approval for transactions'],
                  ['multiSigThreshold', 'number', 'Number of signatures required (if multi-sig enabled)'],
                  ['allowedCurrencies', 'string[]', 'Restrict transactions to specific currencies'],
                ]}
              />
              <Callout type="warning" title="Policy Immutability">
                Once a policy is active, it can only be replaced — not modified in place. This ensures that policy changes are auditable on-chain. Use <code className="text-amber-200 bg-amber-500/5 px-1.5 py-0.5 rounded text-xs">policies.replace()</code> to update an existing policy.
              </Callout>
            </Section>

            <Section id="sdk" title="SDK Reference">
              <H3>TypeScript SDK</H3>
              <P>
                The TypeScript SDK provides a fully typed interface to all Molt.Fin operations. It supports both ESM and CJS module systems and requires Node.js 18+.
              </P>
              <CodeBlock code={`import { MoltFin } from '@moltfin/sdk';\n\nconst mf = new MoltFin('mf_live_...');\n\n// Accounts\nconst account = await mf.accounts.create({ agentId, currency });\nconst balance = await account.balance();\nconst tx = await account.send({ to, amount });\n\n// Policies\nconst policy = await mf.policies.create({ agentId, rules });\nconst updated = await mf.policies.replace({ agentId, rules });\n\n// Transactions\nconst history = await mf.transactions.list({ agentId, limit: 50 });\nconst receipt = await mf.transactions.get(txId);`} />
              <H3>Python SDK</H3>
              <P>
                The Python SDK mirrors the TypeScript API surface with Pythonic naming conventions. It uses async/await for all I/O operations and supports Python 3.10+.
              </P>
              <CodeBlock code={`from moltfin import MoltFin\n\nmf = MoltFin("mf_live_...")\n\n# Create agent account\naccount = await mf.accounts.create(\n    agent_id="trading_bot_01",\n    currency="USDC"\n)\n\n# Send payment\ntx = await account.send(to="vendor.moltfin", amount=249.99)\nprint(f"Settled in {tx.latency}ms")`} />
              <H3>Error Handling</H3>
              <Table
                headers={['Error Code', 'Description', 'Resolution']}
                rows={[
                  ['PolicyViolation', 'Transaction violates spending policy', 'Check policy rules and transaction parameters'],
                  ['InsufficientBalance', 'Account lacks funds for transaction', 'Deposit additional funds before retrying'],
                  ['InvalidRecipient', 'Recipient address not found', 'Verify the merchant or agent address'],
                  ['RateLimited', 'Too many requests in time window', 'Implement exponential backoff'],
                  ['SettlementTimeout', 'On-chain settlement did not finalize', 'Retry with idempotency key'],
                ]}
              />
            </Section>

            <Section id="faq" title="Frequently Asked Questions">
              <FAQ q="What is Molt.Fin?" a="Molt.Fin is financial infrastructure designed specifically for AI agents. It provides programmable bank accounts, sub-second settlement on Solana, and cryptographic policy enforcement — enabling autonomous systems to manage money without human approval loops." />
              <FAQ q="Is Molt.Fin a bank?" a="No. Molt.Fin is a financial technology platform. Agent accounts are on-chain representations of value, not traditional bank accounts. Funds are settled on the Solana blockchain and are not FDIC insured." />
              <FAQ q="Which currencies are supported?" a="Molt.Fin currently supports USDC, SOL, and ETH. Additional currencies and stablecoins are on the roadmap." />
              <FAQ q="How fast do transactions settle?" a="Transactions settle in under 400 milliseconds with cryptographic finality on the Solana blockchain. This is roughly 100x faster than traditional ACH or wire transfers." />
              <FAQ q="Can I set spending limits on agents?" a="Yes. The policy framework allows you to define per-transaction limits, daily/monthly caps, merchant whitelists, and multi-signature requirements. Policies are enforced on-chain and cannot be bypassed." />
              <FAQ q="Is there a sandbox for testing?" a="Yes. Use API keys with the mf_test_ prefix to access the sandbox environment. Sandbox transactions settle instantly but do not move real funds." />
              <FAQ q="What agent frameworks are supported?" a="Molt.Fin is framework-agnostic. The SDK works with any TypeScript or Python application, including popular agent frameworks like LangChain, AutoGPT, and CrewAI. Native MCP integration is also available." />
              <FAQ q="How are policies enforced?" a="Policies are compiled to Solana smart contract constraints. Before every transaction, the on-chain program validates the request against active policy rules. If any rule is violated, the transaction is rejected before funds move." />
            </Section>
          </div>
        </main>
      </div>

      <footer className="border-t border-white/[0.04] py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600">
          <span>&copy; 2026 Molt.Fin. All rights reserved.</span>
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

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-[#0D0E12] rounded-xl border border-white/[0.04] p-5 mb-6 overflow-x-auto">
      <pre className="text-[12px] sm:text-[13px] font-mono leading-relaxed text-gray-300 whitespace-pre">{code}</pre>
    </div>
  );
}

function Callout({ type, title, children }: { type: 'warning' | 'info'; title: string; children: React.ReactNode }) {
  const styles = type === 'warning'
    ? 'bg-amber-500/5 border-amber-500/20 text-amber-200'
    : 'bg-blue-500/5 border-blue-500/20 text-blue-200';
  const labelColor = type === 'warning' ? 'text-amber-400' : 'text-blue-400';

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
          <tr className="bg-[#111318]">
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
