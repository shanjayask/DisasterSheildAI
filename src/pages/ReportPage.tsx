import { useState } from 'react';
import { AlertCircle, MapPin, Loader2, Check, Camera, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getBrowserLocation, getDisasterLabel, cn } from '@/lib/utils';

const REPORT_TYPES = [
  'flood', 'fire', 'landslide', 'heavy_rain', 'road_blockage',
  'building_damage', 'earthquake_damage', 'other',
];

export default function ReportPage() {
  const { user } = useAuth();
  const [type, setType] = useState('flood');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const useLocation = async () => {
    setLocating(true);
    try {
      const { lat, lon } = await getBrowserLocation();
      setLat(lat);
      setLon(lon);
    } catch {
      alert('Could not get location. Please allow location access.');
    }
    setLocating(false);
  };

  const submit = async () => {
    if (!user || !description.trim()) return;
    setSubmitting(true);
    await supabase.from('disaster_reports').insert({
      user_id: user.id,
      type,
      latitude: lat,
      longitude: lon,
      description,
      verification_status: 'pending',
    });
    setSubmitting(false);
    setSubmitted(true);
    setDescription('');
    setType('flood');
    setLat(null);
    setLon(null);
    setTimeout(() => setSubmitted(false), 5000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Report Submitted</h2>
        <p className="text-sm text-slate-500 mt-2">
          Your report has been submitted as a User Report. It will go through verification before being displayed as a verified public alert.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-red-500" /> Report a Disaster
      </h1>

      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Disaster Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-all',
                  type === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                )}
              >
                {getDisasterLabel(t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Location</label>
          <button onClick={useLocation} disabled={locating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Use My Location
          </button>
          {lat !== null && (
            <p className="text-xs text-green-600 mt-2">Location: {lat.toFixed(4)}, {lon?.toFixed(4)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what you're seeing..."
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Optional Image</label>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
            <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Image upload coming soon</p>
          </div>
        </div>

        <button onClick={submit} disabled={submitting || !description.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Report
        </button>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Your report is labeled as a <strong>User Report</strong>. It must go through verification before being displayed as a Verified Report.
            Never present an unverified user report as an official disaster warning.
          </p>
        </div>
      </div>
    </div>
  );
}
