import { useState, useEffect } from 'react';
import { Loader2, Stethoscope, MapPin, Phone, Navigation, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { findNearbyHospitals } from '@/lib/api/overpass';
import type { PlaceResult } from '@/types';
import { formatDistance, cn } from '@/lib/utils';
import RiskMap from '@/components/RiskMap';

export default function HospitalsPage() {
  const { profile } = useAuth();
  const [hospitals, setHospitals] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [radius, setRadius] = useState(profile?.shelter_radius_km || 10);
  const lat = profile?.latitude ?? 20;
  const lon = profile?.longitude ?? 78;

  const load = async (r: number) => {
    setLoading(true);
    setError(false);
    try {
      const data = await findNearbyHospitals(lat, lon, r);
      setHospitals(data);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-red-500" /> Nearby Hospitals
        </h1>
        <select
          value={radius}
          onChange={(e) => { const r = parseInt(e.target.value); setRadius(r); load(r); }}
          className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={25}>25 km</option>
          <option value={50}>50 km</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-700 dark:text-amber-300">Could not fetch hospitals. The map service may be busy. Please try again.</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Stethoscope className="w-8 h-8 mx-auto mb-2" />
          No hospitals found within {radius} km. Try increasing the search radius.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <RiskMap center={[lat, lon]} zoom={11} hospitals={hospitals.slice(0, 15)} userLocation={{ lat, lon }} />
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {hospitals.map((h, i) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{h.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {formatDistance(h.distance)} away
                    </p>
                    {h.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {h.phone}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Source: {h.source}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href={`https://www.openstreetmap.org/directions?from=${lat},${lon}&to=${h.latitude},${h.longitude}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                  >
                    <Navigation className="w-3 h-3" /> Directions
                  </a>
                  {h.phone && (
                    <a href={`tel:${h.phone}`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-500">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Hospital data from OpenStreetMap. We do not invent phone numbers or availability. Verify with local authorities if needed.
      </p>
    </div>
  );
}
