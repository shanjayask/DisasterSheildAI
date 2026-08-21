import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Users, MapPin, Bell, Loader2, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n, LANGUAGES, type LanguageCode } from '@/lib/i18n';
import { getBrowserLocation, reverseGeocode } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { FamilyMember } from '@/types';

const STEPS = ['Personal', 'Family', 'Location', 'Preferences'];

function getGeolocationMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location permission was denied. You can enter your location manually.';
    case 2:
      return 'Location is unavailable right now. You can enter your location manually.';
    case 3:
      return 'Location request timed out. You can enter your location manually.';
    default:
      return 'Location access is unavailable. You can enter your location manually.';
  }
}

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const [familyCount, setFamilyCount] = useState(0);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [approx, setApprox] = useState(false);

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [shelterRadius, setShelterRadius] = useState(10);
  const [alertThreshold, setAlertThreshold] = useState('medium');

  const updateMember = (idx: number, field: string, value: string) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), user_id: user?.id || '', name: '', age: null, gender: '', relationship: '', status: 'unknown' },
    ]);
  };

  const removeMember = (idx: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const useMyLocation = async () => {
    setLocating(true);
    setLocationError('');
    try {
      const { lat, lon } = await getBrowserLocation();
      const finalLat = approx ? Math.round(lat * 10) / 10 : lat;
      const finalLon = approx ? Math.round(lon * 10) / 10 : lon;
      setLat(finalLat);
      setLon(finalLon);
      const geo = await reverseGeocode(finalLat, finalLon);
      if (geo.country) setCountry(geo.country);
      if (geo.state) setStateName(geo.state);
      if (geo.city) setCity(geo.city);
      if (geo.address) setAddress(geo.address);
    } catch (err) {
      setLat(null);
      setLon(null);
      const msg = err instanceof GeolocationPositionError || (err as GeolocationPositionError)?.code !== undefined
        ? getGeolocationMessage((err as GeolocationPositionError).code)
        : 'Location access is unavailable. You can enter your location manually.';
      setLocationError(msg);
    }
    setLocating(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: fullName || user.email,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        country: country || null,
        state: stateName || null,
        city: city || null,
        address: address || null,
        latitude: lat,
        longitude: lon,
        approximate_location: approx,
        preferred_language: lang,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
        medical_accessibility_needs: medicalNeeds || null,
        shelter_radius_km: shelterRadius,
        alert_severity_threshold: alertThreshold,
        onboarding_completed: true,
      }, { onConflict: 'user_id' });
      if (profileError) throw profileError;

      if (members.length > 0) {
        const { error: membersError } = await supabase.from('family_members').upsert(
          members.map((m) => ({
            id: m.id,
            user_id: user.id,
            name: m.name,
            age: m.age ? parseInt(String(m.age)) : null,
            gender: m.gender || null,
            relationship: m.relationship || null,
            status: 'unknown',
          }))
        );
        if (membersError) throw membersError;
      }

      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 0) return fullName.trim() !== '';
    if (step === 1) return true;
    if (step === 2) return country.trim() !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-white">DisasterShield AI</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {/* Step 0: Personal */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Your full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Family */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Family Safety Profile</h2>
              </div>
              <p className="text-sm text-slate-400">Add your household members for family safety alerts.</p>
              <div>
                <label className="block text-sm text-slate-300 mb-1">How many family members are in your household?</label>
                <input
                  type="number"
                  min="0"
                  value={familyCount}
                  onChange={(e) => {
                    const n = parseInt(e.target.value) || 0;
                    setFamilyCount(n);
                    setMembers((prev) => {
                      if (n > prev.length) {
                        return [
                          ...prev,
                          ...Array.from({ length: n - prev.length }, () => ({
                            id: crypto.randomUUID(),
                            user_id: user?.id || '',
                            name: '',
                            age: null,
                            gender: '',
                            relationship: '',
                            status: 'unknown' as const,
                          })),
                        ];
                      }
                      return prev.slice(0, n);
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              {members.map((m, idx) => (
                <div key={m.id} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Member {idx + 1}</span>
                    <button onClick={() => { removeMember(idx); setFamilyCount(familyCount - 1); }} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Name"
                      value={m.name}
                      onChange={(e) => updateMember(idx, 'name', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={m.age ?? ''}
                      onChange={(e) => updateMember(idx, 'age', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={m.gender ?? ''}
                      onChange={(e) => updateMember(idx, 'gender', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      placeholder="Relationship (optional)"
                      value={m.relationship ?? ''}
                      onChange={(e) => updateMember(idx, 'relationship', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              ))}
              <button onClick={addMember} className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
                <Plus className="w-4 h-4" /> Add member
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Your Location</h2>
              </div>
              <button
                onClick={useMyLocation}
                disabled={locating}
                className="w-full py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Use My Current Location
              </button>
              {lat !== null && (
                <p className="text-xs text-green-400 text-center">
                  Location detected: {lat.toFixed(4)}, {lon?.toFixed(4)}
                </p>
              )}
              {locationError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-300">{locationError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Country</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="India"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">State/Province</label>
                  <input
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Tamil Nadu"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Madurai"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Address or approximate location</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={approx}
                  onChange={(e) => setApprox(e.target.checked)}
                  className="rounded border-slate-600"
                />
                Use approximate location for privacy (rounds coordinates)
              </label>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Emergency Preferences</h2>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Preferred Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Emergency Contact Name</label>
                  <input
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Emergency Contact Phone</label>
                  <input
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Medical Accessibility Needs (optional)</label>
                <input
                  value={medicalNeeds}
                  onChange={(e) => setMedicalNeeds(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., wheelchair access"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Preferred Shelter Radius (km)</label>
                  <select
                    value={shelterRadius}
                    onChange={(e) => setShelterRadius(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Alert Severity Threshold</label>
                  <select
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="low">All alerts (Low+)</option>
                    <option value="medium">Medium and above</option>
                    <option value="high">High and above</option>
                    <option value="critical">Critical only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => (step === 0 ? navigate('/login') : setStep(step - 1))}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Complete Setup
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
