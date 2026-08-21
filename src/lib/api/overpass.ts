import type { PlaceResult } from '@/types';
import { haversineDistance } from '@/lib/utils';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const REQUEST_TIMEOUT_MS = 20000;

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Overpass ${endpoint} returned HTTP ${res.status}`);
      }

      const text = await res.text();
      let data: { elements?: OverpassElement[] };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Overpass ${endpoint} returned invalid JSON`);
      }

      clearTimeout(timeout);
      return data.elements || [];
    } catch (err) {
      clearTimeout(timeout);
      lastError = err as Error;
      console.warn(`[Overpass] ${endpoint} failed:`, (err as Error).message);
    }
  }

  throw lastError || new Error('All Overpass endpoints failed');
}

export async function findNearbyHospitals(
  lat: number,
  lon: number,
  radiusKm: number
): Promise<PlaceResult[]> {
  const radius = Math.min(radiusKm * 1000, 50000);
  const query = `[out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
    );
    out center 30;`;

  const data = await queryOverpass(query);
  return data
    .map((el: OverpassElement) => {
      const eLat = el.lat ?? el.center?.lat;
      const eLon = el.lon ?? el.center?.lon;
      if (eLat == null || eLon == null) return null;
      return {
        name: el.tags?.name || el.tags?.['name:en'] || 'Unnamed Facility',
        latitude: eLat,
        longitude: eLon,
        distance: haversineDistance(lat, lon, eLat, eLon),
        phone: el.tags?.phone || el.tags?.['contact:phone'] || undefined,
        address: el.tags?.['addr:full'] || undefined,
        source: 'OpenStreetMap',
      } as PlaceResult;
    })
    .filter((p): p is PlaceResult => p !== null)
    .sort((a, b) => a.distance - b.distance);
}

export async function findNearbyShelters(
  lat: number,
  lon: number,
  radiusKm: number
): Promise<PlaceResult[]> {
  const radius = Math.min(radiusKm * 1000, 50000);
  const query = `[out:json][timeout:25];
    (
      node["emergency"="assembly_point"](around:${radius},${lat},${lon});
      way["emergency"="assembly_point"](around:${radius},${lat},${lon});
      node["building"="civic"](around:${radius},${lat},${lon});
      way["building"="civic"](around:${radius},${lat},${lon});
      node["amenity"="townhall"](around:${radius},${lat},${lon});
      way["amenity"="townhall"](around:${radius},${lat},${lon});
      node["social_facility"="shelter"](around:${radius},${lat},${lon});
      way["social_facility"="shelter"](around:${radius},${lat},${lon});
    );
    out center 30;`;

  const data = await queryOverpass(query);
  return data
    .map((el: OverpassElement) => {
      const eLat = el.lat ?? el.center?.lat;
      const eLon = el.lon ?? el.center?.lon;
      if (eLat == null || eLon == null) return null;
      return {
        name: el.tags?.name || el.tags?.['name:en'] || 'Emergency Shelter',
        latitude: eLat,
        longitude: eLon,
        distance: haversineDistance(lat, lon, eLat, eLon),
        address: el.tags?.['addr:full'] || undefined,
        source: 'OpenStreetMap',
      } as PlaceResult;
    })
    .filter((p): p is PlaceResult => p !== null)
    .sort((a, b) => a.distance - b.distance);
}
