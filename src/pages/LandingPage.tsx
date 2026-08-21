import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, AlertTriangle, MapPin, ScrollText, Newspaper } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function LandingPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <Hero />
      <About />
      <Features />

      {/* Live Alerts teaser */}
      <section id="alerts" className="py-20 bg-slate-900 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-400">Live Alerts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay Ahead of Disasters
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Get location-aware early warnings, AI risk assessments, and emergency guidance
            before disaster strikes your area.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Risk Map teaser */}
      <section id="risk-map" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 mb-4">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Interactive Maps</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Global Risk Visualization
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Explore an interactive map with real-time disaster markers, risk zones, hospitals,
            and shelters powered by OpenStreetMap and live data feeds.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            {t('hero.exploreMap')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* History teaser */}
      <section id="history" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 mb-4">
            <ScrollText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Historical Data</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Learn From the Past
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Browse verified historical disasters from 2000 to today. Each record cites its source,
            and uncertain figures are clearly labeled as estimates.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Explore History
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* News teaser */}
      <section id="news" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 mb-4">
            <Newspaper className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">Current News</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Disaster & Weather News
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Breaking disaster news, weather events, and humanitarian updates sourced from ReliefWeb
            with links to original articles.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Read News
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start Protecting Your Family Today
          </h2>
          <p className="text-lg text-blue-50 mb-8 max-w-2xl mx-auto">
            Create your free account, set up your safety profile, and get personalized disaster
            intelligence for your location.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              {t('common.signup')}
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 glass text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              {t('common.login')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
