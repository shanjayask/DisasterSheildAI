import type { WeatherData, WeatherForecast } from '@/types';
import { getWeatherDescription } from '@/lib/utils';

const BASE = 'https://api.open-meteo.com/v1/forecast';

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
    timezone: 'auto',
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error('Weather request failed');
  const data = await res.json();
  const c = data.current;
  return {
    temperature: Math.round(c.temperature_2m),
    apparentTemperature: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    windSpeed: Math.round(c.wind_speed_10m),
    precipitation: c.precipitation,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    time: c.time,
  };
}

export async function getForecast(
  lat: number,
  lon: number
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly:
      'temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code,relative_humidity_2m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '3',
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error('Forecast request failed');
  const data = await res.json();
  return {
    time: data.hourly.time,
    temperature: data.hourly.temperature_2m,
    precipitationProbability: data.hourly.precipitation_probability,
    precipitation: data.hourly.precipitation,
    windSpeed: data.hourly.wind_speed_10m,
    weatherCode: data.hourly.weather_code,
    humidity: data.hourly.relative_humidity_2m,
    tempMax: data.daily.temperature_2m_max,
    tempMin: data.daily.temperature_2m_min,
  };
}

export function getWeatherCondition(code: number): string {
  return getWeatherDescription(code);
}
