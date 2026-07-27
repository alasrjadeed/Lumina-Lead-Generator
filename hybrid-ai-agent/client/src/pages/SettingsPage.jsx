import { useState, useEffect, useRef } from 'react';
import { FiCamera, FiSave, FiLock, FiUser, FiGlobe, FiCpu, FiBriefcase } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const themeSwatches = [
  'light', 'dark', 'emerald', 'corporate', 'cyberpunk', 'valentine',
  'halloween', 'garden', 'forest', 'lofi', 'pastel', 'fantasy',
  'wireframe', 'luxury', 'dracula', 'cmyk', 'autumn', 'business',
  'acid', 'lemonade', 'night', 'coffee', 'dim', 'nord', 'sunset',
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', status: '' });
  const [preferences, setPreferences] = useState({ theme: 'dark', language: 'en', notifications: true });
  const [aiSettings, setAiSettings] = useState({ provider: 'deepseek', systemPrompt: '' });
  const [business, setBusiness] = useState({ name: '', industry: '', website: '', workingHours: '' });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [twoFactor, setTwoFactor] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/auth/me');
        const u = res?.user || res;
        setProfile({
          name: u?.name || user?.name || '',
          email: u?.email || user?.email || '',
          phone: u?.phone || '',
          status: u?.status || '',
        });
        setPreferences({
          theme: u?.theme || user?.theme || 'dark',
          language: u?.language || 'en',
          notifications: u?.notifications ?? true,
        });
        if (u?.avatar) setAvatarPreview(u.avatar);
      } catch {
        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          status: '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        name: profile.name,
        theme: preferences.theme,
      };

      if (profile.status) updates.status = profile.status;

      const res = await api.put('/auth/profile', updates);
      const updatedUser = res?.user || res;

      if (avatarFile && updatedUser?.avatar) {
        // Avatar was uploaded as part of profile update
      }

      setUser({ ...user, ...updates, avatar: updatedUser?.avatar || user?.avatar });
      document.documentElement.setAttribute('data-theme', preferences.theme);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (security.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await api.put('/auth/change-password', {
        oldPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      toast.success('Password changed!');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        {/* Profile */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title gap-2"><FiUser /> Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-20">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="rounded-full" />
                  ) : (
                    <span className="text-2xl">{profile.name?.[0] || 'U'}</span>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <button
                  className="btn btn-outline btn-sm gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiCamera /> Change Avatar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Name</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Email</span></label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={profile.email}
                  disabled
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Phone</span></label>
                <input
                  type="tel"
                  className="input input-bordered"
                  value={profile.phone}
                  disabled
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Status</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="What's on your mind?"
                  value={profile.status}
                  onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title gap-2"><FiGlobe /> Preferences</h2>
            <div className="mb-4">
              <label className="label"><span className="label-text">Theme</span></label>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {themeSwatches.map((t) => (
                  <button
                    key={t}
                    className={`btn btn-xs ${preferences.theme === t ? 'btn-primary' : 'btn-ghost'} normal-case`}
                    data-theme={t}
                    onClick={() => setPreferences({ ...preferences, theme: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Language</span></label>
                <select
                  className="select select-bordered"
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ur">Urdu</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Notifications</span></label>
                <div className="flex items-center h-12">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                  />
                  <span className="ml-3 text-sm">{preferences.notifications ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title gap-2"><FiCpu /> AI Settings</h2>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">Preferred AI Provider</span></label>
              <select
                className="select select-bordered"
                value={aiSettings.provider}
                onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
              >
                <option value="deepseek">DeepSeek</option>
                <option value="openai">OpenAI</option>
                <option value="google">Google Gemini</option>
                <option value="groq">Groq</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Custom System Prompt</span></label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder="You are a helpful assistant..."
                value={aiSettings.systemPrompt}
                onChange={(e) => setAiSettings({ ...aiSettings, systemPrompt: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Business */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title gap-2"><FiBriefcase /> Business</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Business Name</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Industry</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={business.industry}
                  onChange={(e) => setBusiness({ ...business, industry: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Website</span></label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={business.website}
                  onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Working Hours</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="9:00 AM - 5:00 PM"
                  value={business.workingHours}
                  onChange={(e) => setBusiness({ ...business, workingHours: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title gap-2"><FiLock /> Security</h2>
            <form onSubmit={handleChangePassword} className="space-y-4 mb-6">
              <div className="form-control">
                <label className="label"><span className="label-text">Current Password</span></label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">New Password</span></label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Confirm New Password</span></label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-outline btn-sm">Change Password</button>
            </form>
            <div className="flex items-center justify-between">
              <span className="font-medium">Two-Factor Authentication</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            className={`btn btn-primary gap-2 ${saving ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
