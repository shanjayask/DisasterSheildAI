import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { DisasterEvent, EarthquakeFeature } from '@/types';
import { getDisasterIcon, getDisasterLabel, formatDistance, formatDateTime, getWeatherDescription } from '@/lib/utils';

// Fix default icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
});

function createDisasterIcon(type: string, severity?: string): L.DivIcon {
  const emoji = getDisasterIcon(type);
  const color =
    severity === 'critical' ? '#ef4444' :
    severity === 'high' ? '#f97316' :
    severity === 'medium' ? '#eab308' :
    severity === 'low' ? '#22c55e' : '#64748b';
  return L.divIcon({
    className: 'disaster-marker',
    html: `<div style="font-size: 24px; filter: drop-shadow(0 0 4px ${color});">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createEarthquakeIcon(mag: number): L.DivIcon {
  const color = mag >= 5 ? '#ef4444' : mag >= 4 ? '#f97316' : '#eab308';
  return L.divIcon({
    className: 'earthquake-marker',
    html: `<div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: white; box-shadow: 0 0 8px ${color};">${mag.toFixed(1)}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createPlaceIcon(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    className: 'place-marker',
    html: `<div style="font-size: 22px; filter: drop-shadow(0 0 3px ${color});">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface MapProps {
  center: [number, number];
  zoom?: number;
  events?: DisasterEvent[];
  earthquakes?: EarthquakeFeature[];
  hospitals?: { name: string; latitude: number; longitude: number; distance: number; phone?: string; source: string }[];
  shelters?: { name: string; latitude: number; longitude: number; distance: number; source: string }[];
  userLocation?: { lat: number; lon: number };
  riskZones?: { lat: number; lon: number; radius: number; level: string }[];
  className?: string;
  onMapReady?: () => void;
}

function MapResizer({ onReady }: { onReady?: () => void }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
    onReady?.();
  }, [map, onReady]);
  return null;
}

export default function RiskMap({
  center,
  zoom = 6,
  events = [],
  earthquakes = [],
  hospitals = [],
  shelters = [],
  userLocation,
  riskZones = [],
  className,
  onMapReady,
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className || 'h-full w-full rounded-xl z-0'}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <MapResizer onReady={onMapReady} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lon]} icon={createPlaceIcon('📍', '#3b82f6')}>
          <Popup>
            <div className="text-sm">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {riskZones.map((zone, i) => (
        <Circle
          key={`zone-${i}`}
          center={[zone.lat, zone.lon]}
          radius={zone.radius * 1000}
          pathOptions={{
            color: zone.level === 'critical' ? '#ef4444' : zone.level === 'high' ? '#f97316' : zone.level === 'medium' ? '#eab308' : '#22c55e',
            fillColor: zone.level === 'critical' ? '#ef4444' : zone.level === 'high' ? '#f97316' : zone.level === 'medium' ? '#eab308' : '#22c55e',
            fillOpacity: 0.15,
          }}
        />
      ))}

      {events.map((ev) =>
        ev.latitude != null && ev.longitude != null ? (
          <Marker
            key={ev.id}
            position={[ev.latitude, ev.longitude]}
            icon={createDisasterIcon(ev.type, ev.severity || undefined)}
          >
            <Popup>
              <div className="text-sm max-w-xs">
                <strong>{getDisasterLabel(ev.type)}</strong>
                {ev.title && <p className="font-medium mt-1">{ev.title}</p>}
                {ev.description && <p className="text-slate-600">{ev.description}</p>}
                {ev.severity && <p className="mt-1"><span className="font-semibold">Severity:</span> {ev.severity}</p>}
                {ev.source && <p className="text-xs text-slate-500">Source: {ev.source}</p>}
                {ev.event_time && <p className="text-xs text-slate-500">{formatDateTime(ev.event_time)}</p>}
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

      {earthquakes.map((eq) => {
        const [lon, lat] = eq.geometry.coordinates;
        return (
          <Marker key={eq.id} position={[lat, lon]} icon={createEarthquakeIcon(eq.properties.mag)}>
            <Popup>
              <div className="text-sm max-w-xs">
                <strong>M{eq.properties.mag} Earthquake</strong>
                <p className="mt-1">{eq.properties.place || 'Location'}</p>
                <p className="text-xs text-slate-500">{formatDateTime(eq.properties.time)}</p>
                <a href={eq.properties.url} target="_blank" rel="noopener" className="text-blue-500 text-xs">View on USGS</a>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {hospitals.map((h, i) => (
        <Marker key={`h-${i}`} position={[h.latitude, h.longitude]} icon={createPlaceIcon('🏥', '#dc2626')}>
          <Popup>
            <div className="text-sm max-w-xs">
              <strong>{h.name}</strong>
              <p className="text-slate-600">{formatDistance(h.distance)} away</p>
              {h.phone && <p className="text-xs">Phone: {h.phone}</p>}
              <p className="text-xs text-slate-500">Source: {h.source}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {shelters.map((s, i) => (
        <Marker key={`s-${i}`} position={[s.latitude, s.longitude]} icon={createPlaceIcon('🏠', '#16a34a')}>
          <Popup>
            <div className="text-sm max-w-xs">
              <strong>{s.name}</strong>
              <p className="text-slate-600">{formatDistance(s.distance)} away</p>
              <p className="text-xs text-slate-500">Source: {s.source}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
