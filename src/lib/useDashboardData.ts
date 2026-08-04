import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getCurrentWeather, getForecast } from '@/lib/api/weather';
import { getEarthquakes } from '@/lib/api/earthquakes';
import { getDisasterReports } from '@/lib/api/reliefweb';
import { assessOverallRisk, type OverallRisk } from '@/lib/riskEngine';
import type { WeatherData, WeatherForecast, EarthquakeFeature, ReliefWebReport } from '@/types';

interface DashboardData {
  weather: WeatherData | null;
  forecast: WeatherForecast | null;
  earthquakes: EarthquakeFeature[];
  news: ReliefWebReport[];
  risk: OverallRisk | null;
  loading: boolean;
  error: string | null;
  weatherError: boolean;
  eqError: boolean;
  newsError: boolean;
  refresh: () => void;
}

export function useDashboardData(): DashboardData {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [news, setNews] = useState<ReliefWebReport[]>([]);
  const [risk, setRisk] = useState<OverallRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [eqError, setEqError] = useState(false);
  const [newsError, setNewsError] = useState(false);

  const lat = profile?.latitude ?? 20;
  const lon = profile?.longitude ?? 78;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [w, f, eq, nw] = await Promise.allSettled([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon),
      getEarthquakes(),
      getDisasterReports(6),
    ]);

    const wData = w.status === 'fulfilled' ? w.value : null;
    const fData = f.status === 'fulfilled' ? f.value : null;
    const eqData = eq.status === 'fulfilled' ? eq.value : [];
    const nwData = nw.status === 'fulfilled' ? nw.value : [];

    setWeather(wData);
    setForecast(fData);
    setEarthquakes(eqData);
    setNews(nwData);
    setWeatherError(w.status !== 'fulfilled');
    setEqError(eq.status !== 'fulfilled');
    setNewsError(nw.status !== 'fulfilled');

    if (wData || eqData.length) {
      const r = assessOverallRisk({
        lat,
        lon,
        weather: wData,
        forecast: fData,
        earthquakes: eqData,
      });
      setRisk(r);
    }

    setLoading(false);
  }, [lat, lon]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    weather,
    forecast,
    earthquakes,
    news,
    risk,
    loading,
    error,
    weatherError,
    eqError,
    newsError,
    refresh: load,
  };
}
