import { useState } from 'react';
import { Loader2, Search, Maximize2, Layers, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useDashboardData } from '@/lib/useDashboardData';
import RiskMap from '@/components/RiskMap';
import { geocodeSearch } from '@/lib/utils';

export default function RiskMapPage() {
  const { profile } = useAuth();
  const { earthquakes, loading, eqError } = useDashboardData();
  const [center, setCenter] = useState<[number, number]>([profile?.latitude ?? 20, profile?.longitude ?? 78]);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const doSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const results = await geocodeSearch(search);
    if (results.length > 0) {
      setCenter([results[0].lat, results[0].lon]);
    }
    setSearching(false);
  };

  if (loading) {
    return <div className="flex justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Current Risk Map</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Search location..."
              className="pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-48 sm:w-64"
            />
          </div>
          <button onClick={doSearch} disabled={searching} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-400">Legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> High</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Low</span>
        <span className="text-slate-400">|</span>
        <span>🌍 Earthquake</span>
        <span>🏥 Hospital</span>
        <span>🏠 Shelter</span>
      </div>

      <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <RiskMap
          center={center}
          zoom={5}
          earthquakes={earthquakes}
          userLocation={{ lat: profile?.latitude ?? 20, lon: profile?.longitude ?? 78 }}
        />
      </div>

      {eqError && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700 dark:text-amber-300">Some data sources may be temporarily unavailable. The map still shows available data.</p>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Map data © OpenStreetMap contributors · Earthquake data from USGS · Markers show real events only.
      </p>
    </div>
  );
}
