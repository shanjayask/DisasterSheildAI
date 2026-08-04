import type { EarthquakeFeature } from '@/types';

const FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

export async function getEarthquakes(): Promise<EarthquakeFeature[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error('Earthquake feed request failed');
  const data = await res.json();
  return (data.features || []) as EarthquakeFeature[];
}

export async function getNearbyEarthquakes(
  lat: number,
  lon: number,
  radiusKm = 500
): Promise<EarthquakeFeature[]> {
  const all = await getEarthquakes();
  return all.filter((eq) => {
    const [eqLon, eqLat] = eq.geometry.coordinates;
    return haversine(lat, lon, eqLat, eqLon) <= radiusKm;
  });
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
