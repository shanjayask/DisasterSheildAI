import { useState, useEffect } from 'react';
import { Loader2, ScrollText, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { HistoricalDisaster } from '@/types';
import RiskMap from '@/components/RiskMap';
import { getDisasterLabel, cn } from '@/lib/utils';

export default function HistoryPage() {
  const [year, setYear] = useState(2011);
  const [disasters, setDisasters] = useState<HistoricalDisaster[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);

  useEffect(() => {
    setLoading(true);
    supabase.from('historical_disasters').select('*').eq('year', year).then(({ data }) => {
      setDisasters((data as HistoricalDisaster[]) || []);
      setLoading(false);
    });
  }, [year]);

  const mapEvents = disasters
    .filter((d) => d.latitude != null && d.longitude != null)
    .map((d) => ({
      id: d.id,
      type: d.type.split('/')[0].toLowerCase().replace(' ', '_'),
      latitude: d.latitude,
      longitude: d.longitude,
      severity: 'high',
      title: d.event_name,
      description: `${d.country} · ${d.date || ''} · Deaths: ${d.death_toll || 'Unknown'}`,
      source: d.source,
      source_url: d.source_url,
      event_time: null,
      updated_at: '',
    }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-blue-500" /> Disaster History
        </h1>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-blue-500"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {mapEvents.length > 0 ? (
            <RiskMap center={[20, 0]} zoom={1} events={mapEvents} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'No data for this year'}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : disasters.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              No verified historical disasters found for {year}.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {disasters.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{d.event_name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      {getDisasterLabel(d.type.split('/')[0].toLowerCase().replace(' ', '_'))}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-500">
                    <p><span className="font-medium">Country:</span> {d.country || 'Unknown'}</p>
                    <p><span className="font-medium">Date:</span> {d.date || 'Unknown'}</p>
                    <p><span className="font-medium">Deaths:</span> {d.death_toll || 'Unknown'}</p>
                    <p><span className="font-medium">Source:</span> {d.source || 'Unknown'}</p>
                  </div>
                  {d.source_url && (
                    <a href={d.source_url} target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline mt-2 inline-flex items-center gap-1">
                      View source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Historical data from verified sources (USGS, ReliefWeb). Where estimates vary, ranges are shown.
        Do not treat uncertain figures as exact facts.
      </p>
    </div>
  );
}
