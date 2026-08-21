import { Link } from 'react-router-dom';
import {
  MapPin, Thermometer, Droplets, Wind, CloudRain, AlertTriangle,
  Loader2, RefreshCw, Activity, TrendingUp, Clock, ArrowRight, Globe,
  Building2, Home, Phone, Bot, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useDashboardData } from '@/lib/useDashboardData';
import RiskMap from '@/components/RiskMap';
import {
  getRiskLabel, getRiskTextColor, getRiskBgColor, getWeatherDescription,
  getWeatherEmoji, formatRelativeTime, cn
} from '@/lib/utils';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { weather, forecast, earthquakes, news, risk, loading, weatherError, eqError, newsError, refresh } = useDashboardData();

  const lat = profile?.latitude ?? 20;
  const lon = profile?.longitude ?? 78;
  const locationLabel = profile
    ? [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Your Location'
    : 'Location not set';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const overallLevel = risk?.level || 'unknown';
  const nearbyEq = earthquakes
    .map((eq) => {
      const [eqLon, eqLat] = eq.geometry.coordinates;
      const dist = haversine(lat, lon, eqLat, eqLon);
      return { eq, dist };
    })
    .filter((x) => x.dist <= 500)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Disaster Dashboard</h1>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <MapPin className="w-4 h-4" />
            {locationLabel}
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:shadow-md transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-medium">Location</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{locationLabel}</p>
          <p className="text-xs text-slate-400 mt-1">{lat.toFixed(2)}, {lon.toFixed(2)}</p>
        </div>

        {/* Temperature */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-medium">Temperature</span>
          </div>
          {weather ? (
            <>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{weather.temperature}°C</p>
              <p className="text-xs text-slate-400">Feels like {weather.apparentTemperature}°C</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">{weatherError ? 'Data unavailable' : 'Loading...'}</p>
          )}
        </div>

        {/* Weather */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <CloudRain className="w-4 h-4" />
            <span className="text-xs font-medium">Weather</span>
          </div>
          {weather ? (
            <>
              <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                <span>{getWeatherEmoji(weather.weatherCode)}</span>
                {getWeatherDescription(weather.weatherCode)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {weather.precipitation > 0 ? `${weather.precipitation}mm rain` : 'No rain'}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">{weatherError ? 'Data unavailable' : 'Loading...'}</p>
          )}
        </div>

        {/* Overall Risk */}
        <div className={cn('p-4 rounded-xl border', getRiskBgColor(overallLevel))}>
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Overall Risk</span>
          </div>
          <p className={cn('text-2xl font-bold', getRiskTextColor(overallLevel))}>
            {getRiskLabel(overallLevel)}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">{risk?.summary || 'Assessing...'}</p>
        </div>
      </div>

      {/* Weather details */}
      {weather && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Wind className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Wind</p>
              <p className="font-semibold text-slate-900 dark:text-white">{weather.windSpeed} km/h</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Droplets className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="font-semibold text-slate-900 dark:text-white">{weather.humidity}%</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <CloudRain className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Precipitation</p>
              <p className="font-semibold text-slate-900 dark:text-white">{weather.precipitation} mm</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-slate-500">Feels Like</p>
              <p className="font-semibold text-slate-900 dark:text-white">{weather.apparentTemperature}°C</p>
            </div>
          </div>
        </div>
      )}

      {/* Map + Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Live Disaster Map
            </h2>
            <Link to="/dashboard/risk-map" className="text-xs text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              Full map <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-80 rounded-lg overflow-hidden">
            <RiskMap
              center={[lat, lon]}
              zoom={5}
              earthquakes={earthquakes.slice(0, 20)}
              userLocation={{ lat, lon }}
            />
          </div>
          {eqError && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Earthquake feed temporarily unavailable.
            </p>
          )}
        </div>

        {/* Risk Assessment */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-500" />
            AI Risk Assessment
          </h2>
          {risk ? (
            <div className="space-y-3">
              {risk.assessments.map((a, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{a.hazardType.replace('_', ' ')}</span>
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', getRiskBgColor(a.riskLevel), getRiskTextColor(a.riskLevel))}>
                      {getRiskLabel(a.riskLevel)}
                    </span>
                  </div>
                  {a.probability != null && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full', a.riskLevel === 'critical' ? 'bg-red-500' : a.riskLevel === 'high' ? 'bg-orange-500' : a.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500')}
                          style={{ width: `${a.probability}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8">{a.probability}%</span>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Top risk summary:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{risk.summary}</p>
                <p className="text-xs text-slate-400 mt-2 italic">AI Risk Estimate — not an official warning.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Insufficient data for reliable risk estimation.</p>
          )}
        </div>
      </div>

      {/* Live Alerts + Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Live Alerts
          </h2>
          {nearbyEq.length > 0 ? (
            <div className="space-y-2">
              {nearbyEq.map(({ eq, dist }) => (
                <div key={eq.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-red-700 dark:text-red-300">
                      M{eq.properties.mag} Earthquake
                    </span>
                    <span className="text-xs text-red-500">{dist.toFixed(0)} km away</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{eq.properties.place}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(eq.properties.time)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-700 dark:text-green-300">No active alerts in your area.</p>
            </div>
          )}
          <Link to="/dashboard/alerts" className="block mt-3 text-xs text-blue-600 dark:text-cyan-400 hover:underline">
            View all alerts →
          </Link>
        </div>

        {/* Forecast */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Weather Forecast
          </h2>
          {forecast ? (
            <div className="space-y-2">
              {forecast.tempMax.slice(0, 3).map((max, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getWeatherEmoji(forecast.weatherCode[i * 8] || 0)}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(forecast.time[i * 8]).toLocaleDateString([], { weekday: 'short' })}
                      </p>
                      <p className="text-xs text-slate-500">{getWeatherDescription(forecast.weatherCode[i * 8] || 0)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{Math.round(max)}° / {Math.round(forecast.tempMin[i])}°</p>
                    <p className="text-xs text-blue-500">{forecast.precipitationProbability[i * 8] || 0}% rain</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">{weatherError ? 'Forecast data unavailable.' : 'Loading forecast...'}</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/dashboard/hospitals', icon: Building2, label: 'Hospitals', color: 'text-red-500' },
          { to: '/dashboard/shelters', icon: Home, label: 'Shelters', color: 'text-green-500' },
          { to: '/dashboard/contacts', icon: Phone, label: 'Emergency', color: 'text-orange-500' },
          { to: '/dashboard/assistant', icon: Bot, label: 'AI Assistant', color: 'text-blue-500' },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <a.icon className={cn('w-6 h-6', a.color)} />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* News */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Disaster News
          </h2>
          <Link to="/dashboard/news" className="text-xs text-blue-600 dark:text-cyan-400 hover:underline">
            View all →
          </Link>
        </div>
        {news.length > 0 ? (
          <div className="space-y-2">
            {news.slice(0, 4).map((n) => (
              <a
                key={n.id}
                href={n.fields.url}
                target="_blank"
                rel="noopener"
                className="block p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{n.fields.title}</p>
                <p className="text-xs text-slate-500">
                  {n.fields.country?.[0]?.name || 'Global'} · {formatRelativeTime(n.fields.date.original)}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">{newsError ? 'News temporarily unavailable.' : 'No recent news.'}</p>
        )}
      </div>
    </div>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
