import { Shield, Globe, Activity, AlertTriangle, MapPin, Database, HeartPulse } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 mb-4">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">About the Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            What is DisasterShield AI?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            A global disaster intelligence platform that combines real-time data, geospatial intelligence,
            AI-powered risk analysis, and emergency alerts to help communities prepare for disasters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Activity, title: 'Real-Time Monitoring', desc: 'Weather, earthquakes, floods, wildfires, and cyclones tracked continuously from verified sources.' },
            { icon: Globe, title: 'Geospatial Intelligence', desc: 'Interactive maps with risk zones, disaster markers, and nearby emergency facilities.' },
            { icon: AlertTriangle, title: 'AI Risk Assessment', desc: 'Transparent, rule-based risk scoring with clear explanations — never fabricated probabilities.' },
            { icon: MapPin, title: 'Personalized Alerts', desc: 'Location-aware early warnings tailored to your registered home and current location.' },
            { icon: Database, title: 'Historical Data', desc: 'Explore verified historical disasters from 2000 to the present year with sources cited.' },
            { icon: HeartPulse, title: 'Emergency Resources', desc: 'Find nearby hospitals, shelters, and evacuation centres via OpenStreetMap.' },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Official emergency warnings should always be treated as the
              primary source for evacuation decisions. DisasterShield AI provides informational risk
              assessments and does not replace official emergency services, government warnings, or local authorities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
