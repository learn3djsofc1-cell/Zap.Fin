import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Shield, Code2, Zap, Lock, HelpCircle, BookOpen, Menu, X, Terminal, MessageSquare, ArrowLeftRight, Wifi, FileCode2 } from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Platform Overview', icon: <BookOpen size={16} /> },
  { id: 'getting-started', title: 'Getting Started', icon: <Terminal size={16} /> },
  { id: 'mixer', title: 'Privacy Mixer', icon: <Lock size={16} /> },
  { id: 'messenger', title: 'Encrypted Messenger', icon: <MessageSquare size={16} /> },
  { id: 'bridge', title: 'Privacy Bridge', icon: <ArrowLeftRight size={16} /> },
  { id: 'vpn', title: 'GhostLane VPN', icon: <Wifi size={16} /> },
  { id: 'ux402', title: 'Ux402 Protocol', icon: <Zap size={16} /> },
  { id: 'security', title: 'Security Framework', icon: <Shield size={16} /> },
  { id: 'sdk', title: 'SDK Reference', icon: <Code2 size={16} /> },
  { id: 'api', title: 'API Reference', icon: <FileCode2 size={16} /> },
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
                Technical reference for the GhostLane privacy ecosystem. This guide covers all five core products, the Ux402 protocol, security architecture, SDK integration, and the complete API surface.
              </p>
            </div>

            {/* ── Platform Overview ── */}
            <Section id="overview" title="Platform Overview">
              <P>
                GhostLane is a privacy-first cryptocurrency ecosystem that unifies five core products under a single platform: a cross-asset Privacy Mixer, an end-to-end Encrypted Messenger, a cross-chain Privacy Bridge, a military-grade VPN with private search, and the Ux402 Protocol for shielded cross-chain facilitation on Solana. Every component is engineered around zero-knowledge cryptography to ensure that no party — including GhostLane — can observe, correlate, or reconstruct user activity.
              </P>
              <H3>System Architecture</H3>
              <P>
                The platform employs a decentralized node topology distributed across 50+ countries. Transaction privacy is enforced through zk-SNARK circuits that produce succinct, non-interactive proofs of validity without revealing underlying data. Infrastructure operates under a strict zero-log policy: no transaction metadata, IP addresses, or session identifiers are persisted beyond the minimum required for active operation. There is no single point of failure — each subsystem is independently fault-tolerant.
              </P>
              <H3>Core Products</H3>
              <Table
                headers={['Product', 'Function', 'Key Technology']}
                rows={[
                  ['Privacy Mixer', 'Cross-asset swaps with broken transaction links', 'zk-SNARKs, CoinGecko rate oracle, anonymity pools'],
                  ['Encrypted Messenger', 'Private communication between wallet addresses', 'AES-256-GCM E2E encryption, self-destructing payloads'],
                  ['Privacy Bridge', 'Anonymous cross-chain asset transfers', 'Relay nodes, threshold signatures, 15+ chain support'],
                  ['GhostLane VPN', 'Encrypted tunneling with private web search', 'WireGuard protocol, 24 global servers, SerpAPI proxy'],
                  ['Ux402 Protocol', 'Shielded cross-chain facilitation on Solana', 'Multi-hop routing, privacy pools, x402 standard'],
                ]}
              />
              <H3>Key Capabilities</H3>
              <UL>
                <LI>Cross-asset mixing across 8 cryptocurrencies (BTC, ETH, XMR, LTC, DASH, ZEC, BCH, DOGE) with live CoinGecko exchange rates</LI>
                <LI>End-to-end encrypted messaging with configurable self-destruct timers and Solana address-based identity</LI>
                <LI>Cross-chain bridge transfers across 15+ blockchains with deposit tracking and status lifecycle</LI>
                <LI>VPN service spanning 24 servers across 6 global regions with kill switch, bandwidth monitoring, and dApp session tracking</LI>
                <LI>Ux402 Protocol for untraceable cross-chain transactions using multi-hop privacy pool routing</LI>
                <LI>Full developer SDK support in TypeScript, Python, and Rust</LI>
                <LI>Non-custodial architecture — users retain full control of private keys at all times</LI>
              </UL>
            </Section>

            {/* ── Getting Started ── */}
            <Section id="getting-started" title="Getting Started">
              <H3>Installation</H3>
              <P>
                The GhostLane SDK is available for three runtime environments. Select the package manager that corresponds to your development stack.
              </P>
              <CodeBlock code={`# Node.js / TypeScript (requires Node.js 18+)\nnpm install @ghostlane/sdk\n\n# Python (requires Python 3.10+)\npip install ghostlane\n\n# Rust (add to Cargo.toml)\n[dependencies]\nghostlane = "0.9"`} />
              <H3>Client Initialization</H3>
              <P>
                Instantiate the GhostLane client with an API key generated from your dashboard. API keys are environment-scoped: production keys carry the <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">gl_live_</code> prefix, while sandbox keys use <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">gl_test_</code>.
              </P>
              <CodeBlock code={`import { GhostLane } from '@ghostlane/sdk';\n\nconst client = new GhostLane({\n  apiKey: 'gl_live_your_api_key',\n  environment: 'production', // or 'sandbox'\n  timeout: 30_000,           // request timeout in ms\n});\n\n// Verify connectivity\nconst health = await client.health();\nconsole.log(health); // { ok: true, latency: '12ms', version: '2.4.1' }`} />
              <H3>Authentication Flow</H3>
              <P>
                All API requests require a valid JWT token obtained through the authentication endpoint. The SDK handles token lifecycle automatically when initialized with an API key, including refresh on expiry. For direct REST integration, include the token in the <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">Authorization: Bearer</code> header.
              </P>
              <CodeBlock code={`// Direct REST authentication\nconst response = await fetch('/api/auth/login', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ email, password }),\n});\n\nconst { token } = await response.json();\n// Use token in subsequent requests:\n// Authorization: Bearer <token>`} />
              <Callout type="info" title="Sandbox Environment">
                Sandbox mode executes all operations immediately without consuming real funds or interacting with live blockchains. Use it for integration testing, UI prototyping, and CI/CD pipelines. Sandbox data is isolated and reset daily.
              </Callout>
            </Section>

            {/* ── Privacy Mixer ── */}
            <Section id="mixer" title="Privacy Mixer">
              <H3>Cross-Asset Swap Mechanics</H3>
              <P>
                The GhostLane Mixer enables cross-asset swaps that simultaneously exchange and anonymize cryptocurrency. Unlike single-asset tumblers, GhostLane allows users to deposit one asset (e.g., BTC) and withdraw a different asset (e.g., ETH), with the exchange rate derived from live CoinGecko price feeds. A 1.5% protocol fee is applied to each swap. The mixer uses zero-knowledge proofs to sever the on-chain link between the deposit and withdrawal addresses entirely.
              </P>
              <H3>Supported Assets</H3>
              <Table
                headers={['Asset', 'Symbol', 'Network', 'Min Deposit']}
                rows={[
                  ['Bitcoin', 'BTC', 'Bitcoin Mainnet', '0.001 BTC'],
                  ['Ethereum', 'ETH', 'Ethereum Mainnet', '0.01 ETH'],
                  ['Monero', 'XMR', 'Monero Network', '0.1 XMR'],
                  ['Litecoin', 'LTC', 'Litecoin Mainnet', '0.1 LTC'],
                  ['Dash', 'DASH', 'Dash Network', '0.1 DASH'],
                  ['Zcash', 'ZEC', 'Zcash Network', '0.1 ZEC'],
                  ['Bitcoin Cash', 'BCH', 'BCH Mainnet', '0.01 BCH'],
                  ['Dogecoin', 'DOGE', 'Dogecoin Mainnet', '50 DOGE'],
                ]}
              />
              <H3>Privacy Levels</H3>
              <P>
                Each mix operation specifies a privacy level that controls the anonymity set size and the processing delay. Higher privacy levels route through larger pools and introduce variable time delays to resist timing analysis.
              </P>
              <Table
                headers={['Level', 'Anonymity Set', 'Delay Range', 'Use Case']}
                rows={[
                  ['Standard', '100+ participants', '< 1 minute', 'Routine transactions with basic unlinkability'],
                  ['Enhanced', '500+ participants', '1 – 5 minutes', 'High-value transfers requiring stronger anonymity'],
                  ['Maximum', '1,000+ participants', '5 – 30 minutes', 'Maximum privacy with full timing decorrelation'],
                ]}
              />
              <H3>Deposit Flow</H3>
              <P>
                When a mix operation is created, the system generates a unique deposit address for the send asset. The user transfers funds to this address. Upon confirmation, the protocol executes the cross-asset swap at the current CoinGecko rate, applies the 1.5% fee, and routes the output through the anonymity pool to the recipient's withdrawal address.
              </P>
              <CodeBlock code={`const mix = await client.mixer.create({\n  sendCoin: 'BTC',\n  receiveCoin: 'ETH',\n  sendAmount: '0.5',\n  recipientAddress: '0xABCDEF...1234',\n  privacyLevel: 'enhanced',\n});\n\nconsole.log(mix.depositAddress);  // bc1q...unique_deposit_address\nconsole.log(mix.receiveAmount);   // '8.142' (after 1.5% fee)\nconsole.log(mix.exchangeRate);    // '16.567' (BTC/ETH)\nconsole.log(mix.status);          // 'pending' -> 'mixing' -> 'complete'`} />
              <Callout type="info" title="Exchange Rates">
                Exchange rates are sourced from CoinGecko with a 60-second cache TTL. The rate displayed at mix creation is locked for the duration of the operation. Rate data includes the 1.5% protocol fee.
              </Callout>
            </Section>

            {/* ── Encrypted Messenger ── */}
            <Section id="messenger" title="Encrypted Messenger">
              <H3>End-to-End Encryption Architecture</H3>
              <P>
                The GhostLane Messenger provides fully encrypted communication between users identified by Solana wallet addresses. All message content is encrypted client-side using AES-256-GCM before transmission. The server stores only ciphertext — plaintext content never exists on GhostLane infrastructure. Conversations are initiated by specifying the recipient's Solana address; no phone numbers, emails, or usernames are required.
              </P>
              <H3>Self-Destructing Messages</H3>
              <P>
                Messages can be configured with a self-destruct timer that automatically purges the message from all devices after the specified duration. Available timer presets range from 30 seconds to 24 hours. Once the timer expires, the ciphertext is permanently deleted from the database — no recovery is possible.
              </P>
              <Table
                headers={['Timer', 'Duration', 'Use Case']}
                rows={[
                  ['30s', '30 seconds', 'Highly sensitive one-time information'],
                  ['5m', '5 minutes', 'Short-lived coordination messages'],
                  ['1h', '1 hour', 'Transactional details and confirmations'],
                  ['24h', '24 hours', 'Standard private communications'],
                  ['Off', 'No expiry', 'Persistent conversation history'],
                ]}
              />
              <H3>Zero Metadata Collection</H3>
              <P>
                GhostLane does not collect, store, or process any messaging metadata. There are no read receipts, typing indicators, or online status signals. The server cannot determine who is communicating with whom, how frequently messages are exchanged, or the size of message payloads. All metadata fields are encrypted alongside content.
              </P>
              <CodeBlock code={`// Create a new conversation with a Solana address\nconst conversation = await client.messenger.create({\n  contactAddress: 'Gh0sT...SolanaAddress',\n});\n\n// Send a self-destructing message\nconst msg = await client.messenger.send({\n  conversationId: conversation.id,\n  content: 'Transfer confirmed. Funds cleared.',\n  selfDestructSeconds: 300, // 5 minutes\n});\n\nconsole.log(msg.encrypted);  // true\nconsole.log(msg.expiresAt);  // '2025-03-24T12:10:00Z'`} />
            </Section>

            {/* ── Privacy Bridge ── */}
            <Section id="bridge" title="Privacy Bridge">
              <H3>Cross-Chain Transfer Mechanics</H3>
              <P>
                The Privacy Bridge enables anonymous asset transfers between blockchains. Users specify a source chain, destination chain, token, amount, and recipient address. The bridge generates a unique deposit address on the source chain. Once the deposit is confirmed on-chain, the bridge protocol initiates a corresponding transfer on the destination chain through a network of relay nodes using threshold signatures, ensuring no single entity can reconstruct the full transfer path.
              </P>
              <H3>Supported Chains</H3>
              <Table
                headers={['Chain', 'Tokens', 'Confirmation Time']}
                rows={[
                  ['Ethereum', 'ETH, USDC, USDT, WBTC', '~2 minutes'],
                  ['Solana', 'SOL, USDC, USDT', '~30 seconds'],
                  ['Polygon', 'MATIC, USDC, USDT', '~1 minute'],
                  ['Arbitrum', 'ETH, USDC, ARB', '~1 minute'],
                  ['Avalanche', 'AVAX, USDC, USDT', '~1 minute'],
                  ['BSC', 'BNB, BUSD, USDT', '~30 seconds'],
                  ['Optimism', 'ETH, USDC, OP', '~1 minute'],
                  ['Base', 'ETH, USDC', '~1 minute'],
                ]}
              />
              <P>
                Additional chains including Fantom, Cronos, zkSync, Starknet, Celo, Moonbeam, and Gnosis are available. The full list is returned by the <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">GET /api/bridge/chains</code> endpoint.
              </P>
              <H3>Transfer Status Lifecycle</H3>
              <P>
                Every bridge transfer progresses through a defined status lifecycle. The current status is available via polling or webhook notification.
              </P>
              <Table
                headers={['Status', 'Description']}
                rows={[
                  ['initiated', 'Transfer created; awaiting deposit on source chain'],
                  ['confirming', 'Deposit detected; waiting for required block confirmations'],
                  ['bridging', 'Confirmed on source chain; relay nodes executing cross-chain transfer'],
                  ['complete', 'Funds delivered to recipient on destination chain'],
                  ['failed', 'Transfer could not be completed; funds returned to source'],
                ]}
              />
              <CodeBlock code={`const transfer = await client.bridge.create({\n  sourceChain: 'ethereum',\n  destChain: 'solana',\n  token: 'USDC',\n  amount: '1000',\n  recipientAddress: 'Gh0sT...SolanaAddress',\n});\n\nconsole.log(transfer.depositAddress); // 0x...unique_deposit\nconsole.log(transfer.status);         // 'initiated'\n\n// Poll for status updates\nconst updated = await client.bridge.status(transfer.id);\nconsole.log(updated.status);          // 'bridging' | 'complete'`} />
            </Section>

            {/* ── GhostLane VPN ── */}
            <Section id="vpn" title="GhostLane VPN">
              <H3>Encrypted Tunnel Infrastructure</H3>
              <P>
                GhostLane VPN provides military-grade encrypted tunneling through 24 server locations across 6 global regions (North America, Europe, Asia-Pacific, South America, Middle East, and Africa). All connections use the WireGuard protocol for minimal latency and maximum throughput. The service enforces a strict zero-log policy: no connection timestamps, IP addresses, bandwidth data, or DNS queries are retained after session termination.
              </P>
              <H3>Server Regions</H3>
              <Table
                headers={['Region', 'Locations', 'Server Count']}
                rows={[
                  ['North America', 'New York, Los Angeles, Miami, Chicago, Toronto', '5'],
                  ['Europe', 'London, Frankfurt, Amsterdam, Paris, Zurich, Stockholm, Madrid, Milan, Reykjavik, Bucharest', '10'],
                  ['Asia-Pacific', 'Tokyo, Singapore, Sydney, Seoul, Mumbai, Hong Kong', '6'],
                  ['South America', 'S\u00e3o Paulo', '1'],
                  ['Middle East', 'Dubai', '1'],
                  ['Africa', 'Johannesburg', '1'],
                ]}
              />
              <H3>Kill Switch</H3>
              <P>
                The kill switch is a network-level safety mechanism that blocks all outbound traffic if the VPN tunnel drops unexpectedly. This prevents accidental exposure of the user's real IP address during connection interruptions. The kill switch state is persisted per session and survives application restarts.
              </P>
              <H3>Private Search</H3>
              <P>
                While connected to the VPN, users can perform web searches that are routed through the encrypted tunnel and proxied server-side via SerpAPI. Search queries never leave GhostLane infrastructure unencrypted, and results are returned without third-party tracking cookies, fingerprinting scripts, or personalization signals. Search history is associated with the VPN session and can be reviewed or cleared.
              </P>
              <H3>dApp Session Tracking</H3>
              <P>
                When a user opens a URL from search results, GhostLane creates a tracked dApp session that records the URL, a display title, and the duration of the browsing session. Active dApp sessions display a real-time duration counter. Users can manually close dApp sessions, and all active sessions are automatically terminated when the VPN disconnects or the VPN session is ended.
              </P>
              <H3>Bandwidth Monitoring</H3>
              <P>
                Real-time bandwidth statistics (upload and download) are displayed during an active VPN session. Bandwidth values update every second and accumulate over the session lifetime. Upon disconnection, final bandwidth figures are persisted to the session record for historical reference.
              </P>
              <CodeBlock code={`// Connect to a VPN server\nconst session = await client.vpn.connect({ serverId: 'de-fra-1' });\nconsole.log(session.assignedIp);     // '10.8.42.137'\nconsole.log(session.fingerprintHash); // 'A3F2B8C1D4E5F607'\nconsole.log(session.relayNode);       // 'relay-charlie.ghostlane.net'\n\n// Enable kill switch\nawait client.vpn.toggleKillSwitch({ enabled: true });\n\n// Perform private search\nconst results = await client.vpn.search({ query: 'defi yield farming' });\nconsole.log(results.length);          // 10\n\n// Disconnect\nconst ended = await client.vpn.disconnect();\nconsole.log(ended.bytesUp);           // 2457600\nconsole.log(ended.bytesDown);         // 18432000`} />
            </Section>

            {/* ── Ux402 Protocol ── */}
            <Section id="ux402" title="Ux402 Protocol">
              <H3>Shielded Cross-Chain Facilitator</H3>
              <P>
                The Ux402 Protocol is the first implementation of the x402 standard for untraceable cross-chain transactions. Built on Solana for sub-second finality and minimal gas costs, Ux402 routes transfers through a series of privacy pools using multi-hop obfuscation. Each hop re-encrypts the transaction payload and shuffles it with other in-flight transfers, making it computationally infeasible to correlate the source and destination.
              </P>
              <H3>Protocol Flow</H3>
              <UL>
                <LI><strong>Initiation:</strong> The sender submits a shielded transfer request specifying the source chain, destination chain, token, amount, and privacy level.</LI>
                <LI><strong>Pool Entry:</strong> Funds are deposited into a privacy pool on the source chain. A zk-SNARK proof is generated attesting to the deposit without revealing the depositor's identity.</LI>
                <LI><strong>Multi-Hop Routing:</strong> The transfer is routed through 2–5 intermediate privacy pools across different chains. Each hop re-randomizes the proof and merges the transfer with the ambient pool liquidity.</LI>
                <LI><strong>Exit:</strong> The recipient withdraws from the final pool on the destination chain using a zero-knowledge withdrawal proof. No on-chain link exists between the original deposit and the withdrawal.</LI>
              </UL>
              <H3>Supported Chains</H3>
              <P>
                Ux402 supports cross-chain transfers between 15+ blockchains including Ethereum, Solana, Bitcoin (via wrapped BTC), Polygon, Avalanche, Arbitrum, Optimism, Base, BSC, Fantom, zkSync, Starknet, Celo, Moonbeam, and Gnosis. New chain integrations are deployed quarterly.
              </P>
              <CodeBlock code={`import { Ux402Client } from '@ghostlane/ux402-sdk';\n\nconst ux402 = new Ux402Client({\n  network: 'mainnet',\n  rpcUrl: 'https://api.ghostlane.net/ux402',\n});\n\nconst transfer = await ux402.createTransfer({\n  sourceChain: 'ethereum',\n  destChain: 'solana',\n  amount: '1.5',\n  token: 'ETH',\n  privacyLevel: 'maximum',\n  hops: 3,              // number of intermediate pools\n});\n\nconsole.log(transfer.proofHash);     // zk-SNARK proof identifier\nconsole.log(transfer.estimatedTime); // '~45 seconds'\nconsole.log(transfer.status);        // 'routing' -> 'complete'`} />
              <Callout type="info" title="Liquidity Requirements">
                Multi-hop routing requires sufficient liquidity in intermediate pools. For transfers exceeding $100,000 USD equivalent, the protocol may split the amount across multiple routing paths to maintain anonymity set density.
              </Callout>
            </Section>

            {/* ── Security Framework ── */}
            <Section id="security" title="Security Framework">
              <H3>Zero-Knowledge Architecture</H3>
              <P>
                All privacy-critical operations in GhostLane are secured by zero-knowledge proofs (zk-SNARKs). These proofs enable the platform to verify the validity of transactions — confirming that balances are correct, assets exist, and transfer rules are satisfied — without revealing any information about the sender, recipient, amount, or asset type. The proving system is non-interactive: proofs are generated client-side and verified on-chain in constant time.
              </P>
              <H3>Encryption Standards</H3>
              <P>
                All data in transit is protected by TLS 1.3. Data at rest uses AES-256-GCM authenticated encryption. Messaging payloads are encrypted end-to-end with per-message ephemeral keys derived from X25519 key exchange. VPN tunnels use WireGuard with ChaCha20-Poly1305. No plaintext user data exists on GhostLane servers at any time.
              </P>
              <H3>Security Measures</H3>
              <Table
                headers={['Layer', 'Measure', 'Implementation']}
                rows={[
                  ['Transport', 'TLS 1.3', 'Enforced on all API and WebSocket connections'],
                  ['Storage', 'AES-256-GCM', 'All data at rest, including database fields and backups'],
                  ['Messaging', 'E2E Encryption', 'Client-side AES-256-GCM with X25519 key exchange'],
                  ['VPN Tunnel', 'WireGuard', 'ChaCha20-Poly1305 with Curve25519 key agreement'],
                  ['Key Management', 'Cold Storage', 'Multi-signature cold storage for protocol treasury'],
                  ['Infrastructure', 'Distributed', '50+ countries, no single point of failure'],
                  ['Logging', 'Zero-Log', 'No transaction data, IPs, or session identifiers retained'],
                  ['Network', 'Tor Compatible', 'Full Tor and I2P network compatibility'],
                  ['Authentication', 'JWT + bcrypt', 'Tokens with 7-day expiry, bcrypt (12 rounds) for passwords'],
                  ['Asset Protection', 'Insurance Fund', 'Dedicated fund for user asset protection'],
                ]}
              />
              <Callout type="warning" title="Security Notice">
                Never share your API keys or wallet private keys. GhostLane will never ask for your private keys through any communication channel. All mixing and bridge operations are non-custodial — you maintain full control of your assets throughout the entire process. Report any suspicious communications to security@ghostlane.net.
              </Callout>
            </Section>

            {/* ── SDK Reference ── */}
            <Section id="sdk" title="SDK Reference">
              <H3>TypeScript SDK</H3>
              <P>
                The TypeScript SDK provides a fully typed interface to all GhostLane operations. It supports ESM and CJS module systems, requires Node.js 18+, and includes built-in retry logic, request timeout configuration, and structured error types.
              </P>
              <CodeBlock code={`import { GhostLane, GhostLaneError } from '@ghostlane/sdk';\n\nconst gl = new GhostLane({ apiKey: 'gl_live_...' });\n\ntry {\n  // Mixer: cross-asset swap\n  const mix = await gl.mixer.create({\n    sendCoin: 'BTC',\n    receiveCoin: 'ETH',\n    sendAmount: '0.5',\n    recipientAddress: '0xABC...DEF',\n    privacyLevel: 'maximum',\n  });\n  console.log(mix.depositAddress, mix.receiveAmount);\n\n  // Bridge: cross-chain transfer\n  const bridge = await gl.bridge.create({\n    sourceChain: 'ethereum',\n    destChain: 'solana',\n    token: 'USDC',\n    amount: '5000',\n    recipientAddress: 'Gh0sT...addr',\n  });\n\n  // Messenger: send encrypted message\n  const msg = await gl.messenger.send({\n    conversationId: 'conv_123',\n    content: 'Funds transferred.',\n    selfDestructSeconds: 3600,\n  });\n\n  // VPN: connect and search\n  const session = await gl.vpn.connect({ serverId: 'us-nyc-1' });\n  const results = await gl.vpn.search({ query: 'privacy coins' });\n} catch (err) {\n  if (err instanceof GhostLaneError) {\n    console.error(err.code, err.message, err.retryable);\n  }\n}`} />
              <H3>Python SDK</H3>
              <P>
                The Python SDK mirrors the TypeScript API surface with Pythonic naming conventions. It uses <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">async/await</code> for all I/O operations, supports Python 3.10+, and provides dataclass-based response models with full type annotations.
              </P>
              <CodeBlock code={`from ghostlane import GhostLane, GhostLaneError\n\nasync def main():\n    gl = GhostLane(api_key="gl_live_...")\n\n    try:\n        mix = await gl.mixer.create(\n            send_coin="BTC",\n            receive_coin="ETH",\n            send_amount="0.5",\n            recipient_address="0xABC...DEF",\n            privacy_level="maximum",\n        )\n        print(f"Deposit to: {mix.deposit_address}")\n        print(f"Receive: {mix.receive_amount} ETH")\n\n        status = await gl.mixer.status(mix.id)\n        print(f"Status: {status.state}")\n    except GhostLaneError as e:\n        print(f"Error {e.code}: {e.message}")`} />
              <H3>Rust SDK</H3>
              <P>
                The Rust SDK offers zero-cost abstractions over the GhostLane API with compile-time type safety. It uses <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">tokio</code> for async runtime and <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">serde</code> for serialization. All response types implement <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">Debug</code>, <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">Clone</code>, and <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">Serialize</code>.
              </P>
              <CodeBlock code={`use ghostlane::{Client, MixRequest, PrivacyLevel};\n\n#[tokio::main]\nasync fn main() -> Result<(), ghostlane::Error> {\n    let client = Client::new("gl_live_...")?;\n\n    let mix = client.mixer().create(MixRequest {\n        send_coin: "BTC".into(),\n        receive_coin: "ETH".into(),\n        send_amount: "0.5".into(),\n        recipient_address: "0xABC...DEF".into(),\n        privacy_level: PrivacyLevel::Maximum,\n    }).await?;\n\n    println!("Deposit: {}", mix.deposit_address);\n    println!("Receive: {} ETH", mix.receive_amount);\n    Ok(())\n}`} />
              <H3>Error Codes</H3>
              <Table
                headers={['Code', 'HTTP Status', 'Description', 'Resolution']}
                rows={[
                  ['INSUFFICIENT_FUNDS', '400', 'Balance too low for the requested operation', 'Deposit additional funds before retrying'],
                  ['INVALID_ASSET', '400', 'Specified asset is not supported', 'Verify against the supported assets list'],
                  ['INVALID_ADDRESS', '400', 'Recipient address format is invalid for the target chain', 'Check address format and network compatibility'],
                  ['POOL_UNAVAILABLE', '503', 'Mixing pool is temporarily at capacity', 'Retry with exponential backoff (recommended: 2s base)'],
                  ['CHAIN_UNAVAILABLE', '503', 'Target blockchain is temporarily unreachable', 'Check network status page and retry'],
                  ['RATE_LIMITED', '429', 'Request rate limit exceeded', 'Implement exponential backoff with jitter'],
                  ['VPN_NOT_CONNECTED', '400', 'Operation requires an active VPN connection', 'Connect to a VPN server before retrying'],
                  ['SESSION_EXPIRED', '401', 'Authentication token has expired', 'Re-authenticate to obtain a new token'],
                ]}
              />
            </Section>

            {/* ── API Reference ── */}
            <Section id="api" title="API Reference">
              <P>
                All endpoints are served under the <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">/api</code> base path. Authenticated endpoints require a valid JWT in the <code className="text-[#0AF5D6] bg-[#0AF5D6]/5 px-1.5 py-0.5 rounded text-xs">Authorization: Bearer</code> header. All request and response bodies use JSON.
              </P>

              <H3>Authentication</H3>
              <Table
                headers={['Method', 'Endpoint', 'Description']}
                rows={[
                  ['POST', '/api/auth/register', 'Create a new user account (email, password, name)'],
                  ['POST', '/api/auth/login', 'Authenticate and receive a JWT token (7-day expiry)'],
                  ['GET', '/api/auth/me', 'Retrieve the authenticated user profile'],
                ]}
              />

              <H3>Overview</H3>
              <Table
                headers={['Method', 'Endpoint', 'Description']}
                rows={[
                  ['GET', '/api/overview/stats', 'Dashboard statistics: privacy score, total mixes, active bridges, encrypted messages, VPN uptime'],
                  ['GET', '/api/overview/activity', 'Recent activity feed across all products (paginated)'],
                ]}
              />

              <H3>Mixer</H3>
              <Table
                headers={['Method', 'Endpoint', 'Description']}
                rows={[
                  ['GET', '/api/mixer', 'List all mix operations for the authenticated user'],
                  ['POST', '/api/mixer', 'Create a new cross-asset swap (sendCoin, receiveCoin, sendAmount, recipientAddress, privacyLevel)'],
                  ['GET', '/api/mixer/:id', 'Retrieve details of a specific mix operation'],
                  ['GET', '/api/mixer/rates', 'Current exchange rates from CoinGecko (60-second cache)'],
                  ['GET', '/api/mixer/pools', 'Available mixing pool sizes by asset'],
                  ['POST', '/api/mixer/validate-address', 'Validate a recipient address for a given coin type'],
                ]}
              />

              <H3>Messenger</H3>
              <Table
                headers={['Method', 'Endpoint', 'Description']}
                rows={[
                  ['GET', '/api/messenger/conversations', 'List all conversations for the authenticated user'],
                  ['POST', '/api/messenger/conversations', 'Create a new conversation by Solana address'],
                  ['GET', '/api/messenger/conversations/:id/messages', 'Retrieve messages in a conversation'],
                  ['POST', '/api/messenger/conversations/:id/messages', 'Send an encrypted message (supports selfDestructSeconds)'],
                  ['GET', '/api/messenger/contacts', 'List contacts derived from conversation history'],
                ]}
              />

              <H3>Bridge</H3>
              <Table
                headers={['Method', 'Endpoint', 'Description']}
                rows={[
                  ['GET', '/api/bridge', 'List all bridge transfers for the authenticated user'],
                  ['POST', '/api/bridge', 'Create a new cross-chain bridge transfer'],
                  ['GET', '/api/bridge/chains', 'List all supported blockchain networks and their tokens'],
                ]}
              />

              <H3>VPN</H3>
              <Table
                headers={['Method', 'Endpoint', 'Description']}
                rows={[
                  ['GET', '/api/vpn/servers', 'List all 24 VPN server locations with latency and load'],
                  ['GET', '/api/vpn/session', 'Retrieve the current active VPN session'],
                  ['POST', '/api/vpn/connect', 'Connect to a VPN server by serverId'],
                  ['POST', '/api/vpn/disconnect', 'Disconnect the active VPN session (persists bandwidth)'],
                  ['POST', '/api/vpn/kill-switch', 'Toggle the kill switch on/off'],
                  ['POST', '/api/vpn/end-session/:id', 'End a specific active session by ID'],
                  ['GET', '/api/vpn/history', 'Session history (paginated with limit/offset)'],
                  ['POST', '/api/vpn/search', 'Execute a private search query via SerpAPI (requires active VPN)'],
                  ['POST', '/api/vpn/search/log-open', 'Log a URL opened from search results'],
                  ['GET', '/api/vpn/searches', 'Retrieve search history (optional session_id filter)'],
                  ['POST', '/api/vpn/dapp/open', 'Track opening a dApp URL (creates a dApp session)'],
                  ['POST', '/api/vpn/dapp/:id/close', 'Close an active dApp session'],
                  ['GET', '/api/vpn/dapps', 'List dApp sessions (filter by status: active/closed/all)'],
                ]}
              />

              <H3>Settings</H3>
              <Table
                headers={['Method', 'Endpoint', 'Description']}
                rows={[
                  ['GET', '/api/settings/profile', 'Retrieve the user profile'],
                  ['PATCH', '/api/settings/profile', 'Update profile fields (name, email)'],
                  ['POST', '/api/settings/password', 'Change the account password'],
                  ['POST', '/api/settings/2fa', 'Enable or disable two-factor authentication'],
                  ['GET', '/api/settings/sessions', 'List active login sessions'],
                  ['DELETE', '/api/settings/sessions/:id', 'Revoke a specific login session'],
                ]}
              />
            </Section>

            {/* ── FAQ ── */}
            <Section id="faq" title="Frequently Asked Questions">
              <FAQ q="What is GhostLane?" a="GhostLane is a privacy-first cryptocurrency ecosystem comprising five integrated products: a cross-asset Privacy Mixer, an end-to-end Encrypted Messenger, a cross-chain Privacy Bridge, a military-grade VPN with private search, and the Ux402 Protocol for shielded cross-chain facilitation. All components are built on zero-knowledge cryptography." />
              <FAQ q="Is using GhostLane legal?" a="GhostLane is a privacy tool analogous to encrypted email, VPN services, or HTTPS. The legality of privacy tools varies by jurisdiction. Users are responsible for complying with applicable laws and regulations in their region. GhostLane does not facilitate or endorse any unlawful activity." />
              <FAQ q="Which cryptocurrencies are supported for mixing?" a="The Privacy Mixer supports cross-asset swaps between eight cryptocurrencies: Bitcoin (BTC), Ethereum (ETH), Monero (XMR), Litecoin (LTC), Dash (DASH), Zcash (ZEC), Bitcoin Cash (BCH), and Dogecoin (DOGE). Exchange rates are sourced live from CoinGecko with a 1.5% protocol fee." />
              <FAQ q="How does the mixer ensure privacy?" a="The mixer uses zero-knowledge proofs (zk-SNARKs) to mathematically prove that a withdrawal is valid without revealing which deposit it corresponds to. Combined with large anonymity sets (up to 1,000+ participants at Maximum privacy level) and variable time delays, it is computationally infeasible to link deposits to withdrawals." />
              <FAQ q="What blockchains does the Privacy Bridge support?" a="The bridge supports 15+ blockchains including Ethereum, Solana, Polygon, Arbitrum, Avalanche, BSC, Optimism, Base, Fantom, zkSync, Starknet, Celo, Moonbeam, and Gnosis. New chains are integrated quarterly." />
              <FAQ q="Is there a sandbox environment for testing?" a="Yes. Use API keys with the gl_test_ prefix to access the sandbox environment. Sandbox operations execute instantly without interacting with live blockchains or consuming real funds. Sandbox data is isolated and reset daily." />
              <FAQ q="Does GhostLane store any user data?" a="GhostLane enforces a strict zero-log policy. No transaction data, IP addresses, session metadata, message content, or browsing activity is retained after the relevant operation completes. Messenger content is encrypted end-to-end — the server stores only ciphertext." />
              <FAQ q="How does the VPN private search work?" a="When connected to the VPN, search queries are encrypted and routed through the VPN tunnel to GhostLane's server-side proxy, which executes the search via SerpAPI. Results are returned without third-party tracking cookies, fingerprinting, or personalization. Your query never reaches the search engine directly." />
              <FAQ q="What happens if the VPN connection drops?" a="If the kill switch is enabled, all outbound network traffic is blocked immediately upon connection loss. This prevents your real IP address from being exposed. The kill switch state is persisted per session and remains active until you explicitly disable it or end the session." />
              <FAQ q="Is GhostLane custodial?" a="No. GhostLane is fully non-custodial. Users retain control of their private keys at all times. Mixing and bridge operations generate unique deposit addresses, but private keys for those addresses are encrypted client-side and never accessible to GhostLane infrastructure." />
            </Section>
          </div>
        </main>
      </div>

      <footer className="border-t border-white/[0.04] py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-600">
          <span>&copy; 2026 GhostLane. All rights reserved.</span>
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
