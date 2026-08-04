export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export type DisasterType =
  | 'flood'
  | 'cyclone'
  | 'heavy_rain'
  | 'wildfire'
  | 'earthquake'
  | 'tsunami'
  | 'snow'
  | 'drought'
  | 'landslide'
  | 'heatwave'
  | 'severe_storm'
  | 'volcanic_eruption';

export interface Profile {
  user_id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  approximate_location: boolean;
  preferred_language: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_accessibility_needs: string | null;
  shelter_radius_km: number;
  alert_severity_threshold: string;
  profile_photo_url: string | null;
  onboarding_completed: boolean;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  gender: string | null;
  relationship: string | null;
  status: 'safe' | 'need_assistance' | 'unknown';
}

export interface EmergencyContact {
  id: string;
  country: string;
  service_name: string;
  phone_number: string;
}

export interface DisasterEvent {
  id: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  severity: string | null;
  title: string | null;
  description: string | null;
  source: string | null;
  source_url: string | null;
  event_time: string | null;
  updated_at: string;
}

export interface HistoricalDisaster {
  id: string;
  year: number;
  event_name: string;
  type: string;
  country: string | null;
  date: string | null;
  death_toll: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string | null;
  source_url: string | null;
}

export interface DisasterReport {
  id: string;
  user_id: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  image_url: string | null;
  verification_status: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  severity: string | null;
  acknowledged: boolean;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface WeatherForecast {
  time: string[];
  temperature: number[];
  precipitationProbability: number[];
  precipitation: number[];
  windSpeed: number[];
  weatherCode: number[];
  humidity: number[];
  tempMax: number[];
  tempMin: number[];
}

export interface RiskAssessment {
  hazardType: DisasterType | string;
  riskLevel: RiskLevel;
  probability: number | null;
  confidence: number | null;
  reasons: string[];
  sources: string[];
  estimatedImpactTime: string | null;
  lastUpdated: string;
}

export interface EarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    title: string;
    type: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export interface ReliefWebReport {
  id: string;
  fields: {
    title: string;
    date: { original: string };
    url: string;
    country?: { name: string }[];
    source?: { name: string }[];
    image?: { url: string }[];
  };
}

export interface PlaceResult {
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  phone?: string;
  address?: string;
  openNow?: boolean | null;
  source: string;
}
