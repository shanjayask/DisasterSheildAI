import type { PlaceResult } from '@/types';
import { haversineDistance } from '@/lib/utils';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

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
      const eLat = el.lat ?? el.center?.lat ?? 0;
      const eLon = el.lon ?? el.center?.lon ?? 0;
      if (!eLat || !eLon) return null;
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
      const eLat = el.lat ?? el.center?.lat ?? 0;
      const eLon = el.lon ?? el.center?.lon ?? 0;
      if (!eLat || !eLon) return null;
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
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const data = await res.json();
      return data.elements || [];
    } catch (err) {
      lastError = err as Error;
    }
  }
  throw lastError || new Error('All Overpass endpoints failed');
}
