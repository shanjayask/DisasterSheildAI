import { CloudRain, Waves, Cloud, Mountain, Flame, Map, Bell, Cross, Home, ScrollText, Newspaper, Bot, AlertCircle, type LucideIcon } from 'lucide-react';

const FEATURES: { icon: LucideIcon; title: string; desc: string; emoji: string }[] = [
  { icon: CloudRain, title: 'Real-Time Weather', desc: 'Temperature, rainfall, wind, humidity, and forecast from Open-Meteo.', emoji: '🌧️' },
  { icon: Waves, title: 'Flood Risk', desc: 'Rainfall data with AI/rule-based flood risk estimation.', emoji: '🌊' },
  { icon: Cloud, title: 'Cyclone Monitoring', desc: 'Cyclone information and weather-based risk analysis.', emoji: '🌀' },
  { icon: Mountain, title: 'Earthquake Monitoring', desc: 'Live earthquake events from USGS feeds.', emoji: '🌍' },
  { icon: Flame, title: 'Wildfire Monitoring', desc: 'Satellite-based fire detection using NASA FIRMS where available.', emoji: '🔥' },
  { icon: Map, title: 'Global Risk Map', desc: 'Live disaster and weather visualization on interactive maps.', emoji: '🗺️' },
  { icon: Bell, title: 'Emergency Alerts', desc: 'Location-aware alerts with severity levels and guidance.', emoji: '🚨' },
  { icon: Cross, title: 'Nearby Hospitals', desc: 'Find nearby healthcare facilities via OpenStreetMap.', emoji: '🏥' },
  { icon: Home, title: 'Emergency Shelters', desc: 'Find mapped shelters and evacuation centres.', emoji: '🏠' },
  { icon: ScrollText, title: 'Disaster History', desc: 'Explore disasters by year and location with sources.', emoji: '📜' },
  { icon: Newspaper, title: 'Disaster News', desc: 'Current disaster and weather-related news from ReliefWeb.', emoji: '📰' },
  { icon: Bot, title: 'AI Disaster Assistant', desc: 'An AI chatbot for preparedness and emergency guidance.', emoji: '🤖' },
  { icon: AlertCircle, title: 'Community Reporting', desc: 'Users can report disasters with location and optional image.', emoji: '🚨' },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Platform Features
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A comprehensive suite of tools for disaster prediction, monitoring, and emergency response.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center group-hover:from-blue-500 group-hover:to-cyan-500 transition-all">
                  <f.icon className="w-5 h-5 text-blue-600 dark:text-cyan-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-2xl">{f.emoji}</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
