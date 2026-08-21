import { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Globe, MapPin, Bell, Lock, Shield, Trash2, Check, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useI18n, LANGUAGES, type LanguageCode } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getBrowserLocation, reverseGeocode, cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useI18n();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateProfile = async (field: string, value: string | number | boolean) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert(
      { user_id: user.id, [field]: value },
      { onConflict: 'user_id' }
    );
    if (error) {
      alert(error.message);
      return;
    }
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateLocation = async () => {
    setLocating(true);
    try {
      const { lat, lon } = await getBrowserLocation();
      const geo = await reverseGeocode(lat, lon);
      const { error } = await supabase.from('profiles').upsert({
        user_id: user!.id,
        latitude: lat,
        longitude: lon,
        country: geo.country,
        state: geo.state,
        city: geo.city,
        address: geo.address,
      }, { onConflict: 'user_id' });
      if (error) {
        alert(error.message);
        setLocating(false);
        return;
      }
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Could not get location.');
    }
    setLocating(false);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data. This cannot be undone.')) return;
    setDeleting(true);
    await supabase.from('profiles').delete().eq('user_id', user!.id);
    await supabase.from('family_members').delete().eq('user_id', user!.id);
    await supabase.from('disaster_reports').delete().eq('user_id', user!.id);
    await supabase.from('notifications').delete().eq('user_id', user!.id);
    await signOut();
    setDeleting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-blue-500" /> Settings
      </h1>

      {saved && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700 dark:text-green-300">Settings saved successfully.</p>
        </div>
      )}

      {/* Appearance */}
      <Section icon={Moon} title="Appearance">
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
                theme === opt.value
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              )}
            >
              <opt.icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{opt.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Language */}
      <Section icon={Globe} title="Language">
        <select
          value={lang}
          onChange={(e) => { setLang(e.target.value as LanguageCode); updateProfile('preferred_language', e.target.value); }}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
        >
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
        </select>
      </Section>

      {/* Location */}
      <Section icon={MapPin} title="Location">
        <p className="text-sm text-slate-500 mb-2">
          Current: {profile?.city || 'Not set'}, {profile?.country || ''}
        </p>
        <button onClick={updateLocation} disabled={locating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50">
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          Use Current Location
        </button>
        <label className="flex items-center gap-2 mt-3 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={profile?.approximate_location || false}
            onChange={(e) => updateProfile('approximate_location', e.target.checked)}
            className="rounded"
          />
          Use approximate location for privacy
        </label>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Critical Safety Alerts</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Always enabled for your safety</p>
            </div>
            <span className="px-2 py-1 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">Locked On</span>
          </div>
          <label className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Non-critical notifications</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Weather updates</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
        </div>
      </Section>

      {/* Privacy */}
      <Section icon={Lock} title="Privacy">
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Share location for alerts</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Allow data sharing for improvement</span>
            <input type="checkbox" className="rounded" />
          </label>
        </div>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security">
        <div className="space-y-2">
          <button onClick={() => supabase.auth.resetPasswordForEmail(user?.email || '')} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            Change Password
          </button>
          <button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            Active Sessions / Logout
          </button>
        </div>
      </Section>

      {/* Delete account */}
      <Section icon={Trash2} title="Delete Account" danger>
        <p className="text-sm text-slate-500 mb-3">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button onClick={deleteAccount} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 disabled:opacity-50">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete My Account
        </button>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children, danger }: { icon: typeof Moon; title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={cn('rounded-xl bg-white dark:bg-slate-900 border p-5', danger ? 'border-red-200 dark:border-red-900' : 'border-slate-200 dark:border-slate-800')}>
      <h2 className={cn('font-semibold mb-3 flex items-center gap-2', danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>
        <Icon className="w-4 h-4" /> {title}
      </h2>
      {children}
    </div>
  );
}
