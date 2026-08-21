import { useState, useEffect } from 'react';
import { Loader2, Save, Check, MapPin, User, Mail, Calendar, Globe, Phone, Camera } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useI18n, LANGUAGES, type LanguageCode } from '@/lib/i18n';
import { getBrowserLocation, reverseGeocode } from '@/lib/utils';
import type { Profile, FamilyMember } from '@/types';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { lang, setLang } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [form, setForm] = useState<Partial<Profile>>(profile || {});

  useEffect(() => {
    setForm(profile || {});
  }, [profile]);

  useEffect(() => {
    if (user) {
      supabase.from('family_members').select('*').eq('user_id', user.id).then(({ data }) => {
        setMembers((data as FamilyMember[]) || []);
      });
    }
  }, [user]);

  const update = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { lat, lon } = await getBrowserLocation();
      const geo = await reverseGeocode(lat, lon);
      setForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        country: geo.country || prev.country,
        state: geo.state || prev.state,
        city: geo.city || prev.city,
        address: geo.address || prev.address,
      }));
    } catch {
      alert('Could not get location.');
    }
    setLocating(false);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert(
      { ...form, user_id: user.id },
      { onConflict: 'user_id' }
    );
    if (error) {
      alert(error.message);
    } else {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>

      {saved && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700 dark:text-green-300">Profile Updated Successfully</p>
        </div>
      )}

      {/* Personal info */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" /> Personal Information
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
            {form.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <p className="text-sm text-slate-500">Profile photo (upload coming soon)</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" value={form.full_name || ''} onChange={(v) => update('full_name', v)} />
          <Field label="Age" type="number" value={form.age ?? ''} onChange={(v) => update('age', parseInt(v) || 0)} />
          <SelectField label="Gender" value={form.gender || ''} onChange={(v) => update('gender', v)} options={[
            { value: '', label: 'Prefer not to say' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]} />
          <Field label="Email" value={user?.email || ''} onChange={() => {}} disabled icon={<Mail className="w-4 h-4" />} />
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" /> Location
        </h2>
        <button onClick={useMyLocation} disabled={locating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50">
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          Use My Current Location
        </button>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Country" value={form.country || ''} onChange={(v) => update('country', v)} />
          <Field label="State/Province" value={form.state || ''} onChange={(v) => update('state', v)} />
          <Field label="City" value={form.city || ''} onChange={(v) => update('city', v)} />
          <Field label="Address" value={form.address || ''} onChange={(v) => update('address', v)} />
        </div>
        {form.latitude != null && (
          <p className="text-xs text-green-600">{form.latitude.toFixed(4)}, {form.longitude?.toFixed(4)}</p>
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input type="checkbox" checked={form.approximate_location || false} onChange={(e) => update('approximate_location', e.target.checked)} className="rounded" />
          Use approximate location for privacy
        </label>
      </div>

      {/* Preferences */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" /> Emergency Preferences
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Preferred Language" value={lang} onChange={(v) => { setLang(v as LanguageCode); update('preferred_language', v); }} options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.flag} ${l.label}` }))} />
          <Field label="Emergency Contact Name" value={form.emergency_contact_name || ''} onChange={(v) => update('emergency_contact_name', v)} />
          <Field label="Emergency Contact Phone" value={form.emergency_contact_phone || ''} onChange={(v) => update('emergency_contact_phone', v)} icon={<Phone className="w-4 h-4" />} />
          <Field label="Medical Accessibility Needs" value={form.medical_accessibility_needs || ''} onChange={(v) => update('medical_accessibility_needs', v)} />
          <SelectField label="Shelter Radius (km)" value={String(form.shelter_radius_km || 10)} onChange={(v) => update('shelter_radius_km', parseInt(v))} options={[
            { value: '5', label: '5 km' }, { value: '10', label: '10 km' }, { value: '25', label: '25 km' }, { value: '50', label: '50 km' },
          ]} />
          <SelectField label="Alert Severity Threshold" value={form.alert_severity_threshold || 'medium'} onChange={(v) => update('alert_severity_threshold', v)} options={[
            { value: 'low', label: 'All alerts' }, { value: 'medium', label: 'Medium+' }, { value: 'high', label: 'High+' }, { value: 'critical', label: 'Critical only' },
          ]} />
        </div>
      </div>

      {/* Family */}
      {members.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> Family Members
          </h2>
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                <p className="text-xs text-slate-500">{m.age} years · {m.relationship || 'Family'}</p>
              </div>
              <span className="text-xs text-slate-400 capitalize">{m.status}</span>
            </div>
          ))}
          <p className="text-xs text-slate-400">Edit family members in the Family Safety section.</p>
        </div>
      )}

      <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', disabled, icon }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; disabled?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
