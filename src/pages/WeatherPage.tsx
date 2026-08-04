import { Loader2, Thermometer, Droplets, Wind, CloudRain, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useDashboardData } from '@/lib/useDashboardData';
import { getWeatherDescription, getWeatherEmoji, cn } from '@/lib/utils';

export default function WeatherPage() {
  const { profile } = useAuth();
  const { weather, forecast, loading, weatherError } = useDashboardData();

  if (loading) {
    return <div className="flex justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weather</h1>

      {weatherError && !weather ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-700 dark:text-amber-300">Weather data temporarily unavailable. Please try again later.</p>
        </div>
      ) : weather ? (
        <>
          {/* Current weather */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{profile?.city || 'Your Location'}</p>
                <p className="text-5xl font-bold mt-1">{weather.temperature}°C</p>
                <p className="text-lg mt-1">{getWeatherDescription(weather.weatherCode)}</p>
              </div>
              <div className="text-6xl">{getWeatherEmoji(weather.weatherCode)}</div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Thermometer, label: 'Feels Like', value: `${weather.apparentTemperature}°C` },
              { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h` },
              { icon: CloudRain, label: 'Precipitation', value: `${weather.precipitation} mm` },
            ].map((d, i) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <d.icon className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{d.value}</p>
              </div>
            ))}
          </div>

          {/* 24-hour forecast */}
          {forecast && (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Next 24 Hours
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {forecast.time.slice(0, 24).map((t, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[60px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-xs text-slate-500">{new Date(t).toLocaleTimeString([], { hour: '2-digit' })}</span>
                    <span className="text-2xl my-1">{getWeatherEmoji(forecast.weatherCode[i])}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{Math.round(forecast.temperature[i])}°</span>
                    <span className="text-xs text-blue-500">{forecast.precipitationProbability[i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3-day forecast */}
          {forecast && (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-3">3-Day Forecast</h2>
              <div className="space-y-2">
                {forecast.tempMax.slice(0, 3).map((max, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getWeatherEmoji(forecast.weatherCode[i * 8] || 0)}</span>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {i === 0 ? 'Today' : new Date(forecast.time[i * 8]).toLocaleDateString([], { weekday: 'long' })}
                        </p>
                        <p className="text-xs text-slate-500">{getWeatherDescription(forecast.weatherCode[i * 8] || 0)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">{Math.round(max)}° / {Math.round(forecast.tempMin[i])}°</p>
                      <p className="text-xs text-blue-500">{forecast.precipitationProbability[i * 8] || 0}% rain</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
