import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const SCENES = [
  {
    label: 'Flood',
    gradient: 'from-blue-900 via-blue-700 to-cyan-600',
    overlay: 'rgba(0, 20, 60, 0.55)',
  },
  {
    label: 'Drought',
    gradient: 'from-amber-900 via-orange-800 to-yellow-700',
    overlay: 'rgba(60, 30, 0, 0.55)',
  },
  {
    label: 'Heavy Rainfall',
    gradient: 'from-slate-900 via-slate-700 to-blue-600',
    overlay: 'rgba(10, 20, 50, 0.6)',
  },
  {
    label: 'Snowfall',
    gradient: 'from-slate-200 via-blue-100 to-white',
    overlay: 'rgba(200, 220, 255, 0.4)',
  },
  {
    label: 'Sunny Weather',
    gradient: 'from-sky-400 via-cyan-300 to-yellow-200',
    overlay: 'rgba(200, 220, 255, 0.35)',
  },
  {
    label: 'Earthquake',
    gradient: 'from-stone-900 via-stone-700 to-amber-800',
    overlay: 'rgba(40, 30, 20, 0.6)',
  },
  {
    label: 'Wildfire',
    gradient: 'from-red-950 via-orange-800 to-yellow-600',
    overlay: 'rgba(80, 20, 0, 0.6)',
  },
  {
    label: 'Tsunami',
    gradient: 'from-slate-950 via-blue-800 to-teal-600',
    overlay: 'rgba(0, 30, 50, 0.6)',
  },
  {
    label: 'Cyclone',
    gradient: 'from-slate-800 via-gray-600 to-cyan-500',
    overlay: 'rgba(20, 30, 50, 0.6)',
  },
  {
    label: 'Landslide',
    gradient: 'from-stone-800 via-amber-800 to-yellow-700',
    overlay: 'rgba(50, 35, 15, 0.6)',
  },
];

export default function Hero() {
  const { t } = useI18n();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const cycleScene = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setSceneIdx((prev) => (prev + 1) % SCENES.length);
      setFade(true);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(cycleScene, 2000);
    return () => clearInterval(interval);
  }, [cycleScene]);

  const scene = SCENES[sceneIdx];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div
          className={`bg-gradient-to-br ${scene.gradient} absolute inset-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: scene.overlay }}
        />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse-slow"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 animate-slide-up">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            AI-POWERED GLOBAL DISASTER INTELLIGENCE
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight animate-slide-up">
          {t('hero.tagline')}
        </h1>

        <p className="text-lg sm:text-xl text-slate-100 mb-2 max-w-2xl mx-auto animate-slide-up">
          {t('hero.subtitle')}
        </p>

        <div className="flex items-center justify-center gap-2 mb-8 text-white/70 text-sm">
          <span className="px-3 py-1 rounded-full glass">
            Now showing: {scene.label}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up">
          <Link
            to="/signup"
            className="group flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-cyan-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Shield className="w-5 h-5" />
            {t('hero.checkRisk')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-2 px-6 py-3 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
          >
            <MapPin className="w-5 h-5" />
            {t('hero.exploreMap')}
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-2 px-6 py-3 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
          >
            <AlertTriangle className="w-5 h-5" />
            {t('hero.viewAlerts')}
          </Link>
        </div>

        {/* Scene indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-12">
          {SCENES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setSceneIdx(i);
                  setFade(true);
                }, 300);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === sceneIdx ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Scene: ${s.label}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
