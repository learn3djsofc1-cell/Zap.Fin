import { useEffect, useState, useCallback, useRef } from 'react';
import { Wifi, WifiOff, Shield, Globe, Zap, Power, Search, MapPin, Signal, Lock, Fingerprint, Radio, Clock, ExternalLink, History, X, ChevronDown, ChevronUp } from 'lucide-react';
import { api, type VpnServer, type VpnSession, type VpnSearchResult, type VpnSearchEntry } from '../lib/api';
import { useToast } from '../lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(connectedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(connectedAt).getTime()) / 1000);
  const hours = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatSessionDuration(connectedAt: string, disconnectedAt?: string | null): string {
  const start = new Date(connectedAt).getTime();
  const end = disconnectedAt ? new Date(disconnectedAt).getTime() : Date.now();
  const diff = Math.floor((end - start) / 1000);
  const hours = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function latencyColor(ms: number): string {
  if (ms < 50) return 'text-green-400';
  if (ms < 100) return 'text-yellow-400';
  return 'text-red-400';
}

function loadColor(load: number): string {
  if (load < 50) return 'bg-green-400';
  if (load < 80) return 'bg-yellow-400';
  return 'bg-red-400';
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type Tab = 'search' | 'history';

export default function VpnPage() {
  const { toast } = useToast();
  const [servers, setServers] = useState<VpnServer[]>([]);
  const [session, setSession] = useState<VpnSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [serverFilter, setServerFilter] = useState('');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [durationStr, setDurationStr] = useState('00:00:00');

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VpnSearchResult[]>([]);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [history, setHistory] = useState<VpnSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [serversExpanded, setServersExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [serversRes, sessionRes] = await Promise.allSettled([
        api.vpn.servers(),
        api.vpn.session(),
      ]);
      if (serversRes.status === 'fulfilled') setServers(serversRes.value.servers);
      if (sessionRes.status === 'fulfilled') {
        const s = sessionRes.value.session;
        setSession(s);
        if (s.serverId) setSelectedServer(s.serverId);
      }
    } catch {
      toast('error', 'Failed to load VPN data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!session?.connected || !session.connectedAt) return;
    const interval = setInterval(() => {
      setDurationStr(formatDuration(session.connectedAt!));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.connected, session?.connectedAt]);

  async function handleToggleConnection() {
    if (connecting) return;
    setConnecting(true);
    try {
      if (session?.connected) {
        const data = await api.vpn.disconnect();
        setSession(data.session);
        setSearchResults([]);
        setLastSearchQuery('');
        toast('info', 'VPN disconnected');
      } else {
        if (!selectedServer) {
          toast('error', 'Select a server first');
          setConnecting(false);
          return;
        }
        const data = await api.vpn.connect(selectedServer);
        setSession(data.session);
        toast('success', 'VPN connected — tunnel active');
      }
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }

  async function handleToggleKillSwitch() {
    try {
      const data = await api.vpn.toggleKillSwitch(!session?.killSwitch);
      setSession(data.session);
      toast('success', `Kill switch ${data.session.killSwitch ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to toggle kill switch');
    }
  }

  async function handleSearch(e?: { preventDefault: () => void }) {
    e?.preventDefault();
    if (!searchQuery.trim() || searching) return;
    if (!session?.connected) {
      toast('error', 'Connect VPN first to search privately');
      return;
    }
    setSearching(true);
    try {
      const data = await api.vpn.search(searchQuery.trim());
      setSearchResults(data.results);
      setLastSearchQuery(data.query);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function handleOpenResult(url: string) {
    try {
      await api.vpn.logOpen(url, lastSearchQuery);
    } catch {}
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await api.vpn.history({ limit: 20 });
      setHistory(data.sessions);
    } catch {
      toast('error', 'Failed to load session history');
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab]);

  const countriesMap = new Map<string, VpnServer[]>();
  servers.forEach((s) => {
    const list = countriesMap.get(s.country) || [];
    list.push(s);
    countriesMap.set(s.country, list);
  });
  const filteredCountries = Array.from(countriesMap.entries()).filter(([country]) =>
    country.toLowerCase().includes(serverFilter.toLowerCase())
  );

  const selectedServerData = servers.find((s) => s.id === selectedServer);

  const visibleServerCount = serversExpanded ? filteredCountries.length : Math.min(filteredCountries.length, 6);
  const visibleCountries = filteredCountries.slice(0, visibleServerCount);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">VPN</h1>
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/15 rounded-lg px-2.5 py-1">
            <Shield size={10} className="text-orange-400" />
            <span className="text-orange-400 text-[10px] font-bold uppercase tracking-wider">Military-Grade</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">Secure VPN with no-logs policy and encrypted tunneling</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6 flex flex-col items-center justify-center"
        >
          <button
            onClick={handleToggleConnection}
            disabled={loading || connecting}
            className="group focus:outline-none mb-4"
          >
            <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-500 cursor-pointer ${
              session?.connected
                ? 'border-[#0AF5D6] bg-[#0AF5D6]/10 shadow-lg shadow-[#0AF5D6]/20 group-hover:shadow-[#0AF5D6]/30'
                : 'border-white/[0.08] bg-white/[0.02] group-hover:border-white/[0.15] group-hover:bg-white/[0.04]'
            }`}>
              {loading ? (
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#0AF5D6] rounded-full animate-spin" />
              ) : (
                <motion.div
                  animate={connecting ? { rotate: 360 } : {}}
                  transition={connecting ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <Power size={36} className={session?.connected ? 'text-[#0AF5D6]' : 'text-gray-500 group-hover:text-gray-400'} />
                </motion.div>
              )}
            </div>
          </button>

          <span className={`text-lg font-bold mb-0.5 ${session?.connected ? 'text-[#0AF5D6]' : 'text-gray-400'}`}>
            {loading ? 'Loading...' : connecting ? (session?.connected ? 'Disconnecting...' : 'Connecting...') : session?.connected ? 'Connected' : 'Disconnected'}
          </span>

          {session?.connected && session.serverName && (
            <span className="text-gray-500 text-xs mb-3">{session.serverName}</span>
          )}
          {!session?.connected && selectedServerData && (
            <span className="text-gray-600 text-xs mb-3">{selectedServerData.flag} {selectedServerData.city}, {selectedServerData.country}</span>
          )}

          {!session?.connected && !selectedServer && (
            <span className="text-gray-600 text-[11px] mb-3">Select a server below</span>
          )}

          <button
            onClick={handleToggleConnection}
            disabled={loading || connecting}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              session?.connected
                ? 'bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25'
                : 'bg-[#0AF5D6] hover:bg-[#08D4B8] text-black shadow-lg shadow-[#0AF5D6]/20'
            }`}
          >
            {connecting ? (
              <div className={`w-5 h-5 border-2 ${session?.connected ? 'border-red-400' : 'border-black'} border-t-transparent rounded-full animate-spin`} />
            ) : (
              <>
                <Power size={16} />
                {session?.connected ? 'Disconnect' : 'Connect'}
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4"
        >
          <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock size={13} className="text-orange-400" />
              </div>
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Duration</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white font-mono">{session?.connected ? durationStr : '--:--:--'}</span>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Fingerprint size={13} className="text-purple-400" />
              </div>
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Fingerprint</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-white font-mono break-all">{session?.connected && session.fingerprintHash ? session.fingerprintHash : '----------------'}</span>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe size={13} className="text-blue-400" />
              </div>
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">IP Cloak</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white font-mono">{session?.connected && session.assignedIp ? session.assignedIp : '---'}</span>
            {session?.connected && (
              <div className="flex items-center gap-1 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-[9px] font-bold uppercase">Cloaked</span>
              </div>
            )}
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Radio size={13} className="text-cyan-400" />
              </div>
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Relayer</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white font-mono truncate block">{session?.connected && session.relayNode ? session.relayNode : '---'}</span>
            {session?.connected && (
              <div className="flex items-center gap-1 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400 text-[9px] font-bold uppercase">Relaying</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-white/[0.04] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Zap size={14} className="text-green-400" />
            </div>
            <div>
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider block">Bandwidth</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">↑</span>
                <span className="text-sm font-bold text-white">{session?.connected && session.bytesUp ? formatBytes(session.bytesUp) : '0 B'}</span>
                <span className="text-xs text-gray-500 ml-1">↓</span>
                <span className="text-sm font-bold text-white">{session?.connected && session.bytesDown ? formatBytes(session.bytesDown) : '0 B'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-white/[0.04] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Lock size={14} className="text-red-400" />
            </div>
            <div>
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider block">Kill Switch</span>
              <span className="text-[10px] text-gray-600 mt-0.5 block">Block all traffic if VPN drops</span>
            </div>
          </div>
          <button
            onClick={handleToggleKillSwitch}
            className={`relative w-12 h-6 rounded-full transition-all ${
              session?.killSwitch ? 'bg-[#0AF5D6]' : 'bg-white/[0.08]'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow ${
              session?.killSwitch ? 'left-7' : 'left-1'
            }`} />
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden mb-6"
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04]">
          <MapPin size={15} className="text-orange-400" />
          <span className="text-white text-sm font-bold">Server Locations</span>
          <span className="text-gray-600 text-xs ml-auto">{servers.length} servers</span>
        </div>

        <div className="p-3 border-b border-white/[0.04]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={serverFilter}
              onChange={(e) => setServerFilter(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-[#111111] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4">
                <div className="w-6 h-4 bg-white/[0.04] rounded animate-pulse" />
                <div className="w-24 h-3.5 bg-white/[0.04] rounded animate-pulse" />
                <div className="ml-auto w-16 h-3 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/[0.03]">
              {visibleCountries.map(([_country, countryServers]) => (
                countryServers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    disabled={session?.connected}
                    className={`w-full px-5 py-3 flex items-center gap-3 text-left transition-colors ${
                      session?.connected ? 'cursor-default' : 'hover:bg-white/[0.02] cursor-pointer'
                    } ${selectedServer === server.id ? 'bg-[#0AF5D6]/5' : ''}`}
                  >
                    <span className="text-base">{server.flag}</span>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${selectedServer === server.id ? 'bg-[#0AF5D6]' : 'bg-white/[0.08]'}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-xs sm:text-sm font-medium">{server.city}, {server.country}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={`h-full rounded-full ${loadColor(server.load)}`} style={{ width: `${server.load}%` }} />
                        </div>
                        <span className="text-gray-500 text-[10px] w-8">{server.load}%</span>
                      </div>
                      <span className={`text-xs font-mono ${latencyColor(server.latencyMs)}`}>{server.latencyMs}ms</span>
                    </div>
                    <span className={`sm:hidden text-[10px] font-mono ${latencyColor(server.latencyMs)}`}>{server.latencyMs}ms</span>
                    {session?.connected && session.serverId === server.id && (
                      <div className="flex items-center gap-1 bg-[#0AF5D6]/10 rounded px-1.5 py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0AF5D6] animate-pulse" />
                        <span className="text-[#0AF5D6] text-[9px] font-bold">ACTIVE</span>
                      </div>
                    )}
                  </button>
                ))
              ))}
            </div>
            {filteredCountries.length > 6 && (
              <button
                onClick={() => setServersExpanded(!serversExpanded)}
                className="w-full py-2.5 flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-400 text-xs font-medium transition-colors border-t border-white/[0.04]"
              >
                {serversExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {serversExpanded ? 'Show less' : `Show all ${filteredCountries.reduce((a, [, s]) => a + s.length, 0)} servers`}
              </button>
            )}
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden mb-6"
      >
        <div className="flex border-b border-white/[0.04]">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'search'
                ? 'text-[#0AF5D6] border-b-2 border-[#0AF5D6] bg-[#0AF5D6]/5'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <Search size={14} />
            Private Search
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'text-[#0AF5D6] border-b-2 border-[#0AF5D6] bg-[#0AF5D6]/5'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <History size={14} />
            Session History
          </button>
        </div>

        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="p-4 border-b border-white/[0.04]">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={session?.connected ? 'Search privately through VPN tunnel...' : 'Connect VPN to enable private search...'}
                    disabled={!session?.connected}
                    className="w-full bg-[#111111] border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!session?.connected || searching || !searchQuery.trim()}
                  className="px-4 sm:px-5 py-2.5 bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-30 disabled:hover:bg-[#0AF5D6] text-black rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0"
                >
                  {searching ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
              {!session?.connected && (
                <p className="text-gray-600 text-[11px] mt-2 flex items-center gap-1">
                  <Lock size={10} />
                  Connect to a VPN server to search privately
                </p>
              )}
            </form>

            <AnimatePresence mode="wait">
              {searching && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center"
                >
                  <div className="w-8 h-8 border-2 border-white/10 border-t-[#0AF5D6] rounded-full animate-spin mb-3" />
                  <span className="text-gray-500 text-xs">Searching through encrypted tunnel...</span>
                </motion.div>
              )}

              {!searching && searchResults.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{searchResults.length} results for "{lastSearchQuery}"</span>
                    <button
                      onClick={() => { setSearchResults([]); setSearchQuery(''); setLastSearchQuery(''); }}
                      className="text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-white/[0.03] max-h-[500px] overflow-y-auto">
                    {searchResults.map((result, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                        <button
                          onClick={() => handleOpenResult(result.link)}
                          className="w-full text-left group"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[#0AF5D6] text-sm font-medium group-hover:underline truncate">{result.title}</p>
                              <p className="text-green-700 text-[11px] truncate mt-0.5">{result.link}</p>
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{result.snippet}</p>
                            </div>
                            <ExternalLink size={14} className="text-gray-600 group-hover:text-[#0AF5D6] shrink-0 mt-1 transition-colors" />
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {!searching && searchResults.length === 0 && lastSearchQuery && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center"
                >
                  <p className="text-gray-500 text-sm">No results found for "{lastSearchQuery}"</p>
                </motion.div>
              )}

              {!searching && searchResults.length === 0 && !lastSearchQuery && session?.connected && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0AF5D6]/10 flex items-center justify-center mx-auto mb-3">
                    <Shield size={20} className="text-[#0AF5D6]" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Private Search Ready</p>
                  <p className="text-gray-600 text-xs">Your searches are routed through the VPN tunnel — untraceable</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {historyLoading ? (
              <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-[#0AF5D6] rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  <History size={20} className="text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">No Sessions Yet</p>
                <p className="text-gray-600 text-xs">Connect to a VPN server to start your first session</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03] max-h-[500px] overflow-y-auto">
                {history.map((s) => (
                  <div key={s.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.connected ? 'bg-[#0AF5D6] animate-pulse' : 'bg-gray-600'}`} />
                        <span className="text-white text-sm font-medium">{s.serverName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.connected && (
                          <span className="text-[#0AF5D6] text-[9px] font-bold uppercase bg-[#0AF5D6]/10 px-1.5 py-0.5 rounded">Active</span>
                        )}
                        <span className="text-gray-600 text-[10px]">{s.connectedAt ? timeAgo(s.connectedAt) : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-500">
                      <span className="font-mono">{s.assignedIp}</span>
                      <span>{s.connectedAt ? formatSessionDuration(s.connectedAt, s.disconnectedAt) : '--'}</span>
                      {(s.bytesUp || s.bytesDown) && (
                        <span>↑{formatBytes(s.bytesUp || 0)} ↓{formatBytes(s.bytesDown || 0)}</span>
                      )}
                      {s.killSwitch && <span className="text-red-400">Kill Switch ON</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
