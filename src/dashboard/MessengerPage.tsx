import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Lock, Timer, Plus, Search, Shield, AlertCircle } from 'lucide-react';
import { api, type Conversation, type Message } from '../lib/api';
import { useToast } from '../lib/toast';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

function timeAgo(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const SOLANA_BASE58 = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

function isValidSolanaAddress(address: string): boolean {
  if (!address || address.length < 32 || address.length > 44) return false;
  return SOLANA_BASE58.test(address);
}

const SELF_DESTRUCT_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 30, label: '30s' },
  { value: 300, label: '5m' },
  { value: 3600, label: '1h' },
  { value: 86400, label: '24h' },
];

export default function MessengerPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selfDestruct, setSelfDestruct] = useState(0);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [addressTouched, setAddressTouched] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.messenger.conversations()
      .then((data) => setConversations(data.conversations))
      .catch(() => toast('error', 'Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  function openConversation(conv: Conversation) {
    setActiveConversation(conv);
    setShowMobileChat(true);
    setMessagesLoading(true);
    api.messenger.messages(conv.id)
      .then((data) => setMessages(data.messages))
      .catch(() => toast('error', 'Failed to load messages'))
      .finally(() => setMessagesLoading(false));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    setSending(true);
    try {
      const data = await api.messenger.send(activeConversation.id, {
        content: messageText.trim(),
        selfDestructSeconds: selfDestruct > 0 ? selfDestruct : undefined,
      });
      setMessages((prev) => [...prev, data.message]);
      setMessageText('');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, lastMessage: messageText.trim().slice(0, 100), lastMessageAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      toast('error', message);
    } finally {
      setSending(false);
    }
  }

  const addressValid = newContactAddress.trim().length > 0 && isValidSolanaAddress(newContactAddress.trim());
  const showAddressError = addressTouched && newContactAddress.trim().length > 0 && !addressValid;

  async function handleNewChat(e: React.FormEvent) {
    e.preventDefault();
    if (!newContactAddress.trim()) {
      toast('error', 'Solana address is required');
      return;
    }
    if (!addressValid) {
      toast('error', 'Invalid Solana address');
      return;
    }
    try {
      const data = await api.messenger.createConversation({
        contactAddress: newContactAddress.trim(),
      });
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === data.conversation.id);
        if (exists) return prev;
        return [data.conversation, ...prev];
      });
      openConversation(data.conversation);
      setShowNewChat(false);
      setNewContactAddress('');
      setAddressTouched(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create conversation';
      toast('error', message);
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.contactAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Messenger</h1>
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/15 rounded-lg px-2.5 py-1">
              <Lock size={10} className="text-blue-400" />
              <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">E2E Encrypted</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">End-to-end encrypted private messaging</p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="bg-[#0AF5D6] hover:bg-[#08D4B8] text-black px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden h-[calc(100vh-320px)] sm:h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] min-h-[300px]"
      >
        <div className="flex h-full">
          <div className={`w-full md:w-80 border-r border-white/[0.04] flex flex-col shrink-0 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-white/[0.04]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by address..."
                  className="w-full bg-[#111111] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-white/[0.03]">
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
                    <div className="flex-1">
                      <div className="w-24 h-3.5 bg-white/[0.04] rounded animate-pulse mb-1.5" />
                      <div className="w-40 h-3 bg-white/[0.04] rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full px-4 py-3 flex items-center gap-3 border-b border-white/[0.03] text-left transition-colors hover:bg-white/[0.02] ${
                      activeConversation?.id === conv.id ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shrink-0">
                      <span className="text-purple-400 text-[10px] font-bold font-mono">{conv.contactAddress.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-white text-xs font-semibold truncate font-mono">{truncateAddress(conv.contactAddress)}</span>
                        <span className="text-gray-600 text-[10px] shrink-0 ml-2">{timeAgo(conv.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock size={8} className="text-[#0AF5D6]/40 shrink-0" />
                        <span className="text-gray-500 text-xs truncate">{conv.lastMessage || 'Encrypted message'}</span>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-[#0AF5D6] flex items-center justify-center shrink-0">
                        <span className="text-black text-[9px] font-bold">{conv.unreadCount}</span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={24} className="text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">Select a conversation</h3>
                  <p className="text-gray-500 text-xs">Choose a chat or start a new one</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setShowMobileChat(false); setActiveConversation(null); }}
                      className="md:hidden text-gray-400 hover:text-white p-1 shrink-0"
                    >
                      ←
                    </button>
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shrink-0">
                      <span className="text-purple-400 text-[9px] font-bold font-mono">{activeConversation.contactAddress.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-xs font-semibold block truncate font-mono">{truncateAddress(activeConversation.contactAddress)}</span>
                      <div className="flex items-center gap-1">
                        <Lock size={8} className="text-[#0AF5D6]" />
                        <span className="text-[#0AF5D6] text-[10px] font-semibold">Encrypted</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      {SELF_DESTRUCT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSelfDestruct(opt.value)}
                          className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                            selfDestruct === opt.value
                              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          {opt.value === 0 ? <Timer size={10} /> : opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex sm:hidden items-center gap-1 mt-2 pl-9">
                    {SELF_DESTRUCT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelfDestruct(opt.value)}
                        className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                          selfDestruct === opt.value
                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                      >
                        {opt.value === 0 ? <Timer size={10} /> : opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {messagesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className={`w-48 h-10 rounded-2xl animate-pulse ${i % 2 === 0 ? 'bg-[#0AF5D6]/10' : 'bg-white/[0.04]'}`} />
                      </div>
                    ))
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <div className="text-center">
                        <Shield size={20} className="text-[#0AF5D6]/40 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">Messages are end-to-end encrypted</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          msg.sender === 'me'
                            ? 'bg-[#0AF5D6]/15 border border-[#0AF5D6]/20'
                            : 'bg-[#111111] border border-white/[0.06]'
                        }`}>
                          <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Lock size={8} className="text-[#0AF5D6]/40" />
                            <span className="text-gray-500 text-[10px]">{timeAgo(msg.timestamp)}</span>
                            {msg.selfDestructSeconds && (
                              <span className="text-orange-400/60 text-[10px] flex items-center gap-0.5">
                                <Timer size={8} /> {msg.selfDestructSeconds}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-2 sm:p-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 transition-all"
                      />
                      <Lock size={10} className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[#0AF5D6]/30" />
                    </div>
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 disabled:cursor-not-allowed text-black p-2.5 sm:p-3 rounded-xl transition-all shrink-0"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <Modal open={showNewChat} onClose={() => { setShowNewChat(false); setNewContactAddress(''); setAddressTouched(false); }} title="New Encrypted Chat">
        <form onSubmit={handleNewChat} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Solana Address</label>
            <input
              type="text"
              value={newContactAddress}
              onChange={(e) => { setNewContactAddress(e.target.value); setAddressTouched(true); }}
              onBlur={() => setAddressTouched(true)}
              placeholder="Enter Solana wallet address"
              className={`w-full bg-[#111111] border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all font-mono text-xs ${
                showAddressError
                  ? 'border-red-500/50 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/20'
                  : addressValid
                    ? 'border-[#0AF5D6]/30 focus:border-[#0AF5D6]/50 focus:ring-1 focus:ring-[#0AF5D6]/20'
                    : 'border-white/[0.06] focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20'
              }`}
            />
            {showAddressError && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle size={12} className="text-red-400 shrink-0" />
                <span className="text-red-400 text-[11px]">Invalid Solana address. Must be 32-44 base58 characters.</span>
              </div>
            )}
            {addressValid && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-3 h-3 rounded-full bg-[#0AF5D6]/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0AF5D6]" />
                </div>
                <span className="text-[#0AF5D6] text-[11px]">Valid Solana address</span>
              </div>
            )}
          </div>
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 flex items-start gap-2">
            <Lock size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">All messages are end-to-end encrypted using 256-bit encryption. GhostLane cannot read your messages.</p>
          </div>
          <button
            type="submit"
            disabled={!addressValid}
            className="w-full bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-40 disabled:cursor-not-allowed text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0AF5D6]/20"
          >
            <MessageSquare size={16} /> Start Encrypted Chat
          </button>
        </form>
      </Modal>
    </div>
  );
}
