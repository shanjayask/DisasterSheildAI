import { Shield, Info, FileText, Database, Phone, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">DisasterShield AI</span>
            </div>
            <p className="text-sm">Predict. Prepare. Protect.</p>
            <p className="text-xs mt-2 text-slate-500">
              AI-powered global disaster intelligence, early warning, risk monitoring, and emergency response platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#risk-map" className="hover:text-cyan-400 transition-colors">Risk Map</a></li>
              <li><a href="#history" className="hover:text-cyan-400 transition-colors">Disaster History</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#news" className="hover:text-cyan-400 transition-colors">Disaster News</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><FileText className="w-3 h-3" /> Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><Info className="w-3 h-3" /> Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><Database className="w-3 h-3" /> Data Sources</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Data Sources</h4>
            <ul className="space-y-2 text-xs">
              <li>Open-Meteo (Weather)</li>
              <li>USGS (Earthquakes)</li>
              <li>NASA FIRMS (Wildfires)</li>
              <li>ReliefWeb (Reports)</li>
              <li>OpenStreetMap (Maps)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex items-start gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">{t('disclaimer')}</p>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} DisasterShield AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
