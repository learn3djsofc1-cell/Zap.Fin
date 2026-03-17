import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Shield, Globe, Zap, Power, Search, MapPin, Signal, Lock } from 'lucide-react';
import { api, type VpnServer, type VpnSession } from '../lib/api';
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

export default function VpnPage() {
  const { toast } = useToast();
  const [servers, setServers] = useState<VpnServer[]>([]);
  const [session, setSession] = useState<VpnSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [durationStr, setDurationStr] = useState('00:00:00');

  useEffect(() => {
    Promise.allSettled([
      api.vpn.servers(),
      api.vpn.session(),
    ]).then(([serversRes, sessionRes]) => {
      if (serversRes.status === 'fulfilled') setServers(serversRes.value.servers);
      if (sessionRes.status === 'fulfilled') {
        setSession(sessionRes.value.session);
        if (sessionRes.value.session.serverId) setSelectedServer(sessionRes.value.session.serverId);
      }
      const failures = [serversRes, sessionRes].filter(r => r.status === 'rejected');
      if (failures.length > 0) toast('error', 'Some VPN data failed to load');
    }).finally(() => setLoading(false));
  }, []);

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
        toast('info', 'VPN disconnected');
      } else {
        if (!selectedServer) { toast('error', 'Select a server first'); setConnecting(false); return; }
        const data = await api.vpn.connect(selectedServer);
        setSession(data.session);
        toast('success', 'VPN connected');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      toast('error', message);
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
      const message = err instanceof Error ? err.message : 'Failed to toggle kill switch';
      toast('error', message);
    }
  }

  const countriesMap = new Map<string, VpnServer[]>();
  servers.forEach((s) => {
    const list = countriesMap.get(s.country) || [];
    list.push(s);
    countriesMap.set(s.country, list);
  });

  const filteredCountries = Array.from(countriesMap.entries()).filter(([country]) =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">VPN</h1>
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/15 rounded-lg px-2.5 py-1">
            <Shield size={10} className="text-orange-400" />
            <span className="text-orange-400 text-[10px] font-bold uppercase tracking-wider">Military-Grade</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">Secure VPN with no-logs policy and Tor integration</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6 flex flex-col items-center justify-center"
        >
          <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center mb-4 transition-all duration-500 ${
            session?.connected
              ? 'border-[#0AF5D6] bg-[#0AF5D6]/10 shadow-lg shadow-[#0AF5D6]/20'
              : 'border-white/[0.08] bg-white/[0.02]'
          }`}>
            {loading ? (
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#0AF5D6] rounded-full animate-spin" />
            ) : (
              <motion.div
                animate={connecting ? { rotate: 360 } : {}}
                transition={connecting ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                {session?.connected ? (
                  <Wifi size={36} className="text-[#0AF5D6]" />
                ) : (
                  <WifiOff size={36} className="text-gray-500" />
                )}
              </motion.div>
            )}
          </div>

          <span className={`text-lg font-bold mb-1 ${session?.connected ? 'text-[#0AF5D6]' : 'text-gray-400'}`}>
            {loading ? 'Loading...' : session?.connected ? 'Connected' : 'Disconnected'}
          </span>

          {session?.connected && session.serverName && (
            <span className="text-gray-500 text-xs mb-4">{session.serverName}</span>
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
          className="lg:col-span-2 grid grid-cols-2 gap-4"
        >
          <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Signal size={14} className="text-orange-400" />
              </div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Duration</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">{session?.connected ? durationStr : '--:--:--'}</span>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe size={14} className="text-blue-400" />
              </div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">IP Address</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">{session?.assignedIp || '---'}</span>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Zap size={14} className="text-green-400" />
              </div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Bandwidth</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-400">↑</span>
              <span className="text-base font-bold text-white">{session?.bytesUp ? formatBytes(session.bytesUp) : '0 B'}</span>
              <span className="text-sm text-gray-400 ml-2">↓</span>
              <span className="text-base font-bold text-white">{session?.bytesDown ? formatBytes(session.bytesDown) : '0 B'}</span>
            </div>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Lock size={14} className="text-red-400" />
              </div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Kill Switch</span>
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
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden"
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04]">
          <MapPin size={16} className="text-orange-400" />
          <span className="text-white text-sm font-bold">Server Locations</span>
          <span className="text-gray-600 text-xs ml-auto">{servers.length} servers</span>
        </div>

        <div className="p-3 border-b border-white/[0.04]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-[#111111] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-4">
                <div className="w-6 h-4 bg-white/[0.04] rounded animate-pulse" />
                <div className="w-24 h-3.5 bg-white/[0.04] rounded animate-pulse" />
                <div className="ml-auto w-16 h-3 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto divide-y divide-white/[0.03]">
            {filteredCountries.map(([country, countryServers]) => (
              <div key={country}>
                {countryServers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    className={`w-full px-6 py-3 flex items-center gap-4 text-left transition-colors hover:bg-white/[0.02] ${
                      selectedServer === server.id ? 'bg-[#0AF5D6]/5' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedServer === server.id ? 'bg-[#0AF5D6]' : 'bg-white/[0.08]'}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm font-medium">{server.city}, {server.country}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-1.5 rounded-full bg-white/[0.06] overflow-hidden`}>
                          <div className={`h-full rounded-full ${loadColor(server.load)}`} style={{ width: `${server.load}%` }} />
                        </div>
                        <span className="text-gray-500 text-[10px] w-8">{server.load}%</span>
                      </div>
                      <span className={`text-xs font-mono ${latencyColor(server.latencyMs)}`}>{server.latencyMs}ms</span>
                    </div>
                    {session?.connected && session.serverId === server.id && (
                      <div className="flex items-center gap-1 bg-[#0AF5D6]/10 rounded px-1.5 py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0AF5D6] animate-pulse" />
                        <span className="text-[#0AF5D6] text-[9px] font-bold">ACTIVE</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
