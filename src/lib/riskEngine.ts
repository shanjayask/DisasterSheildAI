import type {
  RiskAssessment,
  RiskLevel,
  WeatherData,
  WeatherForecast,
  EarthquakeFeature,
} from '@/types';
import { haversineDistance } from '@/lib/utils';

interface RiskInput {
  lat: number;
  lon: number;
  weather: WeatherData | null;
  forecast: WeatherForecast | null;
  earthquakes: EarthquakeFeature[];
}

export interface OverallRisk {
  level: RiskLevel;
  label: string;
  assessments: RiskAssessment[];
  summary: string;
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function scoreToProbability(score: number): number {
  return Math.min(Math.round(score), 99);
}

export function assessFloodRisk(input: RiskInput): RiskAssessment {
  const { weather, forecast } = input;
  const reasons: string[] = [];
  let score = 0;
  const sources: string[] = ['Open-Meteo'];

  if (!weather) {
    return noData('flood', 'Flood Risk');
  }

  if (weather.precipitation > 10) {
    score += 30;
    reasons.push(`Current precipitation is high (${weather.precipitation} mm).`);
  } else if (weather.precipitation > 4) {
    score += 15;
    reasons.push(`Moderate current precipitation (${weather.precipitation} mm).`);
  }

  if (forecast) {
    const next24hRain = forecast.precipitation.slice(0, 24).reduce((a, b) => a + b, 0);
    const maxProb = Math.max(...forecast.precipitationProbability.slice(0, 24));
    if (next24hRain > 30) {
      score += 35;
      reasons.push(`Heavy rainfall forecast in next 24h (${next24hRain.toFixed(1)} mm).`);
    } else if (next24hRain > 15) {
      score += 20;
      reasons.push(`Moderate rainfall forecast in next 24h (${next24hRain.toFixed(1)} mm).`);
    }
    if (maxProb > 70) {
      score += 15;
      reasons.push(`High precipitation probability (${maxProb}%).`);
    }
  }

  if (weather.humidity > 85) {
    score += 10;
    reasons.push(`High humidity (${weather.humidity}%) suggests saturated conditions.`);
  }

  const level = levelFromScore(score);
  return {
    hazardType: 'flood',
    riskLevel: level,
    probability: score > 0 ? scoreToProbability(score) : null,
    confidence: score > 0 ? Math.min(60 + score / 2, 85) : null,
    reasons: reasons.length ? reasons : ['No significant flood indicators detected.'],
    sources,
    estimatedImpactTime: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function assessCycloneRisk(input: RiskInput): RiskAssessment {
  const { weather, forecast } = input;
  const reasons: string[] = [];
  let score = 0;
  const sources: string[] = ['Open-Meteo'];

  if (!weather) return noData('cyclone', 'Cyclone Risk');

  if (weather.windSpeed > 62) {
    score += 45;
    reasons.push(`Dangerous wind speeds (${weather.windSpeed} km/h).`);
  } else if (weather.windSpeed > 40) {
    score += 25;
    reasons.push(`Strong winds detected (${weather.windSpeed} km/h).`);
  } else if (weather.windSpeed > 25) {
    score += 10;
    reasons.push(`Moderate winds (${weather.windSpeed} km/h).`);
  }

  if (forecast) {
    const maxWind = Math.max(...forecast.windSpeed.slice(0, 24));
    if (maxWind > 62) {
      score += 30;
      reasons.push(`Severe winds forecast (${maxWind} km/h) in next 24h.`);
    } else if (maxWind > 40) {
      score += 15;
      reasons.push(`Strong winds forecast (${maxWind} km/h).`);
    }
  }

  if (weather.weatherCode >= 95) {
    score += 15;
    reasons.push('Thunderstorm conditions detected.');
  }

  const level = levelFromScore(score);
  return {
    hazardType: 'cyclone',
    riskLevel: level,
    probability: score > 0 ? scoreToProbability(score) : null,
    confidence: score > 0 ? Math.min(55 + score / 2, 80) : null,
    reasons: reasons.length ? reasons : ['No significant cyclone indicators detected.'],
    sources,
    estimatedImpactTime: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function assessEarthquakeRisk(input: RiskInput): RiskAssessment {
  const { lat, lon, earthquakes } = input;
  const sources: string[] = ['USGS'];
  const nearby = earthquakes
    .map((eq) => {
      const [eqLon, eqLat] = eq.geometry.coordinates;
      return { eq, distance: haversineDistance(lat, lon, eqLat, eqLon) };
    })
    .filter((x) => x.distance <= 500)
    .sort((a, b) => a.distance - b.distance);

  if (nearby.length === 0) {
    return {
      hazardType: 'earthquake',
      riskLevel: 'low',
      probability: null,
      confidence: 70,
      reasons: ['No active nearby earthquake events detected (within 500 km).'],
      sources,
      estimatedImpactTime: null,
      lastUpdated: new Date().toISOString(),
    };
  }

  const closest = nearby[0];
  const reasons: string[] = [];
  let score = 0;

  reasons.push(
    `Magnitude ${closest.eq.properties.mag} earthquake ${closest.distance.toFixed(0)} km away.`
  );
  if (closest.eq.properties.mag >= 5) {
    score += 40;
    reasons.push('Significant magnitude event.');
  } else if (closest.eq.properties.mag >= 4) {
    score += 20;
  } else {
    score += 8;
  }

  if (closest.distance < 50) score += 25;
  else if (closest.distance < 150) score += 15;
  else if (closest.distance < 300) score += 8;

  const level = levelFromScore(score);
  return {
    hazardType: 'earthquake',
    riskLevel: level,
    probability: null,
    confidence: 75,
    reasons: [
      ...reasons,
      'Note: This is monitoring of real events, not earthquake prediction.',
    ],
    sources,
    estimatedImpactTime: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function assessWildfireRisk(input: RiskInput): RiskAssessment {
  const { weather } = input;
  const reasons: string[] = [];
  let score = 0;
  const sources: string[] = ['Open-Meteo'];

  if (!weather) return noData('wildfire', 'Wildfire Risk');

  if (weather.temperature > 38) {
    score += 35;
    reasons.push(`Extreme heat (${weather.temperature}°C) increases fire risk.`);
  } else if (weather.temperature > 32) {
    score += 20;
    reasons.push(`High temperature (${weather.temperature}°C).`);
  }

  if (weather.humidity < 25) {
    score += 30;
    reasons.push(`Very low humidity (${weather.humidity}%) — dry conditions.`);
  } else if (weather.humidity < 40) {
    score += 15;
    reasons.push(`Low humidity (${weather.humidity}%).`);
  }

  if (weather.precipitation === 0 && weather.temperature > 30) {
    score += 10;
    reasons.push('No recent precipitation with high temperature.');
  }

  const level = levelFromScore(score);
  return {
    hazardType: 'wildfire',
    riskLevel: level,
    probability: score > 0 ? scoreToProbability(score) : null,
    confidence: score > 0 ? Math.min(50 + score / 2, 75) : null,
    reasons: reasons.length ? reasons : ['No significant wildfire indicators detected.'],
    sources,
    estimatedImpactTime: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function assessHeatwaveRisk(input: RiskInput): RiskAssessment {
  const { weather, forecast } = input;
  const reasons: string[] = [];
  let score = 0;
  const sources: string[] = ['Open-Meteo'];

  if (!weather) return noData('heatwave', 'Heatwave Risk');

  if (weather.temperature > 42) {
    score += 45;
    reasons.push(`Extreme heat (${weather.temperature}°C).`);
  } else if (weather.temperature > 37) {
    score += 30;
    reasons.push(`Very high temperature (${weather.temperature}°C).`);
  } else if (weather.temperature > 33) {
    score += 15;
    reasons.push(`High temperature (${weather.temperature}°C).`);
  }

  if (forecast) {
    const next3Max = Math.max(...forecast.tempMax.slice(0, 3));
    if (next3Max > 40) {
      score += 20;
      reasons.push(`Sustained extreme heat forecast (${next3Max}°C).`);
    }
  }

  if (weather.humidity > 60 && weather.temperature > 32) {
    score += 10;
    reasons.push('High humidity makes heat feel more dangerous.');
  }

  const level = levelFromScore(score);
  return {
    hazardType: 'heatwave',
    riskLevel: level,
    probability: score > 0 ? scoreToProbability(score) : null,
    confidence: score > 0 ? Math.min(55 + score / 2, 80) : null,
    reasons: reasons.length ? reasons : ['No significant heatwave indicators detected.'],
    sources,
    estimatedImpactTime: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function assessOverallRisk(input: RiskInput): OverallRisk {
  const assessments: RiskAssessment[] = [
    assessFloodRisk(input),
    assessCycloneRisk(input),
    assessEarthquakeRisk(input),
    assessWildfireRisk(input),
    assessHeatwaveRisk(input),
  ];

  const maxScore = Math.max(
    ...assessments.map((a) => {
      if (a.riskLevel === 'critical') return 100;
      if (a.riskLevel === 'high') return 75;
      if (a.riskLevel === 'medium') return 50;
      if (a.riskLevel === 'low') return 20;
      return 0;
    })
  );

  const level = levelFromScore(maxScore);
  const label =
    level === 'critical'
      ? 'CRITICAL'
      : level === 'high'
        ? 'HIGH'
        : level === 'medium'
          ? 'MEDIUM'
          : 'LOW';

  const topRisk = assessments.find((a) => a.riskLevel === level);
  const summary = topRisk
    ? topRisk.reasons[0]
    : 'No significant hazards detected in your area.';

  return { level, label, assessments, summary };
}

function noData(type: string, label: string): RiskAssessment {
  return {
    hazardType: type,
    riskLevel: 'unknown',
    probability: null,
    confidence: null,
    reasons: ['Insufficient data for reliable risk estimation.'],
    sources: [],
    estimatedImpactTime: null,
    lastUpdated: new Date().toISOString(),
  };
}

export function getEstimatedImpactWindow(
  forecast: WeatherForecast | null,
  hazardType: string
): string | null {
  if (!forecast) return null;
  const now = new Date();
  for (let i = 0; i < forecast.time.length && i < 24; i++) {
    const rain = forecast.precipitation[i];
    const prob = forecast.precipitationProbability[i];
    const wind = forecast.windSpeed[i];
    if (hazardType === 'flood' && rain > 5 && prob > 60) {
      const t = new Date(forecast.time[i]);
      const diffMs = t.getTime() - now.getTime();
      if (diffMs > 0) return forecast.time[i];
    }
    if (hazardType === 'cyclone' && wind > 50) {
      const t = new Date(forecast.time[i]);
      const diffMs = t.getTime() - now.getTime();
      if (diffMs > 0) return forecast.time[i];
    }
  }
  return null;
}

export function getAlertPriority(
  level: RiskLevel,
  distanceKm: number,
  impactTime: string | null
): 'low' | 'medium' | 'high' | 'critical' {
  if (level === 'critical' && distanceKm < 25) return 'critical';
  if (level === 'high' && distanceKm < 50) return 'high';
  if (impactTime) {
    const diff = new Date(impactTime).getTime() - Date.now();
    if (diff < 3600000 && level !== 'low') return 'critical';
    if (diff < 7200000) return 'high';
  }
  if (level === 'medium') return 'medium';
  return 'low';
}
