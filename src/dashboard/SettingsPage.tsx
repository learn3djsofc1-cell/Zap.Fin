import { useEffect, useState } from 'react';
import { User, Lock, Bell, Smartphone } from 'lucide-react';
import { api, type UserSession, type NotificationPreference } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../lib/toast';
import { motion } from 'framer-motion';

function NotificationToggle({ label, desc, enabled, onToggle }: { label: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div>
        <span className="text-white text-sm font-medium block">{label}</span>
        <span className="text-gray-500 text-xs">{desc}</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-all shrink-0 ml-4 ${
          enabled ? 'bg-[#0AF5D6]' : 'bg-white/[0.08]'
        }`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${
          enabled ? 'left-[22px]' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}

function NotificationPreferences() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.notifications()
      .then((data) => setPreferences(data.preferences))
      .catch(() => toast('error', 'Failed to load notification preferences'))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(key: string, currentEnabled: boolean) {
    try {
      const data = await api.settings.updateNotification(key, !currentEnabled);
      setPreferences((prev) => prev.map((p) => p.key === key ? data.preference : p));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preference';
      toast('error', message);
    }
  }

  return (
    <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6">
      <h2 className="text-white font-bold text-base mb-6">Notification Preferences</h2>
      {loading ? (
        <div className="space-y-4 max-w-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <div className="w-32 h-3.5 bg-white/[0.04] rounded animate-pulse mb-1.5" />
                <div className="w-48 h-3 bg-white/[0.04] rounded animate-pulse" />
              </div>
              <div className="w-10 h-5 bg-white/[0.04] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : preferences.length === 0 ? (
        <p className="text-gray-500 text-xs">No notification preferences available</p>
      ) : (
        <div className="space-y-0 max-w-md">
          {preferences.map((pref) => (
            <NotificationToggle
              key={pref.key}
              label={pref.label}
              desc={pref.description}
              enabled={pref.enabled}
              onToggle={() => handleToggle(pref.key, pref.enabled)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [togglingTwoFa, setTogglingTwoFa] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
      api.settings.get2FAStatus()
        .then((data) => setTwoFaEnabled(data.enabled))
        .catch(() => {});
    }
  }, [activeTab]);

  function loadSessions() {
    setSessionsLoading(true);
    api.settings.sessions()
      .then((data) => setSessions(data.sessions))
      .catch(() => toast('error', 'Failed to load sessions'))
      .finally(() => setSessionsLoading(false));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast('error', 'Name is required'); return; }
    if (!email.trim()) { toast('error', 'Email is required'); return; }

    setSaving(true);
    try {
      await api.settings.updateProfile({ name: name.trim(), email: email.trim() });
      toast('success', 'Profile updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast('error', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) { toast('error', 'Enter current password'); return; }
    if (newPassword.length < 8) { toast('error', 'New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast('error', 'Passwords do not match'); return; }

    setChangingPassword(true);
    try {
      await api.settings.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast('success', 'Password changed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      toast('error', message);
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleToggle2FA() {
    setTogglingTwoFa(true);
    try {
      await api.settings.toggle2FA(!twoFaEnabled);
      setTwoFaEnabled(!twoFaEnabled);
      toast('success', `Two-factor authentication ${!twoFaEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle 2FA';
      toast('error', message);
    } finally {
      setTogglingTwoFa(false);
    }
  }

  async function handleRevokeSession(id: string) {
    try {
      await api.settings.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast('success', 'Session revoked');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke session';
      toast('error', message);
    }
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0AF5D6]/10 text-[#0AF5D6] border border-[#0AF5D6]/20'
                : 'text-gray-500 hover:text-gray-300 border border-white/[0.04] hover:border-white/[0.08]'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {activeTab === 'profile' && (
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6">
            <h2 className="text-white font-bold text-base mb-6">Profile Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-5 max-w-md">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6">
              <h2 className="text-white font-bold text-base mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#0AF5D6]/40 focus:ring-1 focus:ring-[#0AF5D6]/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-[#0AF5D6] hover:bg-[#08D4B8] disabled:opacity-50 text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                >
                  {changingPassword ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>

            <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-bold text-base">Two-Factor Authentication</h2>
                  <p className="text-gray-500 text-xs mt-1">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  disabled={togglingTwoFa}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    twoFaEnabled ? 'bg-[#0AF5D6]' : 'bg-white/[0.08]'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow ${
                    twoFaEnabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-base">Active Sessions</h2>
                  <p className="text-gray-500 text-xs mt-1">Manage your logged-in devices</p>
                </div>
              </div>
              {sessionsLoading ? (
                <div className="divide-y divide-white/[0.03]">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] animate-pulse" />
                      <div className="flex-1">
                        <div className="w-32 h-3.5 bg-white/[0.04] rounded animate-pulse mb-1.5" />
                        <div className="w-20 h-3 bg-white/[0.04] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center">
                  <Smartphone size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No session data available</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {sessions.map((s) => (
                    <div key={s.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <Smartphone size={14} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-medium block truncate">{s.device || 'Unknown Device'}</span>
                        <span className="text-gray-500 text-xs">{s.ip || 'Unknown IP'} · {s.lastActive || 'Unknown'}</span>
                      </div>
                      {s.current ? (
                        <span className="text-[#0AF5D6] text-[10px] font-bold uppercase bg-[#0AF5D6]/10 px-2 py-1 rounded">Current</span>
                      ) : (
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="text-red-400 text-xs font-semibold hover:text-red-300 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationPreferences />
        )}
      </motion.div>
    </div>
  );
}
