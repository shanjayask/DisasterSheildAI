import { Loader2, AlertTriangle, CheckCircle, MapPin, Clock, ExternalLink, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useDashboardData } from '@/lib/useDashboardData';
import { getRiskLabel, getRiskTextColor, getRiskBgColor, formatRelativeTime, haversineDistance, cn } from '@/lib/utils';

export default function AlertsPage() {
  const { profile } = useAuth();
  const { earthquakes, risk, loading, eqError } = useDashboardData();
  const lat = profile?.latitude ?? 20;
  const lon = profile?.longitude ?? 78;

  if (loading) {
    return <div className="flex justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  const nearbyEq = earthquakes
    .map((eq) => {
      const [eqLon, eqLat] = eq.geometry.coordinates;
      return { eq, dist: haversineDistance(lat, lon, eqLat, eqLon) };
    })
    .filter((x) => x.dist <= 1000)
    .sort((a, b) => a.dist - b.dist);

  const riskAlerts = risk?.assessments.filter((a) => a.riskLevel === 'high' || a.riskLevel === 'critical') || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-red-500" /> Live Alerts
      </h1>

      {riskAlerts.length === 0 && nearbyEq.length === 0 && !eqError && (
        <div className="flex items-center gap-3 p-6 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-300">No active alerts in your area</p>
            <p className="text-sm text-green-600 dark:text-green-400">All clear. We're monitoring for any changes.</p>
          </div>
        </div>
      )}

      {/* Risk-based alerts */}
      {riskAlerts.map((a, i) => (
        <div key={i} className={cn('p-4 rounded-xl border', getRiskBgColor(a.riskLevel))}>
          <div className="flex items-center justify-between mb-2">
            <span className={cn('font-bold text-sm', getRiskTextColor(a.riskLevel))}>
              {getRiskLabel(a.riskLevel)} {a.hazardType.replace('_', ' ').toUpperCase()} RISK
            </span>
            <span className="text-xs text-slate-500">AI Risk Estimate</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{a.reasons.join(' ')}</p>
          {a.probability != null && (
            <p className="text-xs text-slate-500">Probability: {a.probability}% · Confidence: {a.confidence ?? 'Not available'}%</p>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Link to="/dashboard/risk-map" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:shadow-sm">
              View on Map
            </Link>
            <Link to="/dashboard/shelters" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:shadow-sm">
              Find Shelter
            </Link>
            <Link to="/dashboard/hospitals" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:shadow-sm">
              Find Hospital
            </Link>
          </div>
        </div>
      ))}

      {/* Earthquake alerts */}
      {nearbyEq.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Earthquake Monitoring (USGS)</h2>
          {nearbyEq.slice(0, 10).map(({ eq, dist }) => (
            <div key={eq.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <p className="font-medium text-sm text-slate-900 dark:text-white">Magnitude {eq.properties.mag}</p>
                <p className="text-xs text-slate-500">{eq.properties.place}</p>
                <p className="text-xs text-slate-400">{formatRelativeTime(eq.properties.time)} · {dist.toFixed(0)} km away</p>
              </div>
              <a href={eq.properties.url} target="_blank" rel="noopener" className="text-blue-500 hover:text-blue-400">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}

      {eqError && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">Earthquake feed temporarily unavailable.</p>
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            These alerts are AI-generated risk estimates based on available data. Always follow official emergency warnings
            from local authorities for evacuation decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
