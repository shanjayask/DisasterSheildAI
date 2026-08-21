import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, User, Users, CloudRain, Bell, Map, ScrollText,
  Newspaper, Building2, Home, AlertCircle, Phone, Bot, Settings, LogOut,
  Menu, X, Globe, Sun, Moon, Wifi, WifiOff, type LucideIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useI18n, LANGUAGES, type LanguageCode } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/profile', label: 'My Profile', icon: User },
  { path: '/dashboard/family', label: 'Family Safety', icon: Users },
  { path: '/dashboard/weather', label: 'Weather', icon: CloudRain },
  { path: '/dashboard/alerts', label: 'Live Alerts', icon: Bell },
  { path: '/dashboard/risk-map', label: 'Current Risk Map', icon: Map },
  { path: '/dashboard/history', label: 'Disaster History', icon: ScrollText },
  { path: '/dashboard/news', label: 'Disaster News', icon: Newspaper },
  { path: '/dashboard/hospitals', label: 'Nearby Hospitals', icon: Building2 },
  { path: '/dashboard/shelters', label: 'Emergency Shelters', icon: Home },
  { path: '/dashboard/report', label: 'Report Disaster', icon: AlertCircle },
  { path: '/dashboard/contacts', label: 'Emergency Contacts', icon: Phone },
  { path: '/dashboard/assistant', label: 'AI Assistant', icon: Bot },
  { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const { isDark, setTheme, theme } = useTheme();
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const locationLabel = profile
    ? [profile.city, profile.state, profile.country].filter(Boolean).join(', ')
    : 'Location not set';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar - desktop */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 transition-transform duration-300 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">DisasterShield</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <Map className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">{locationLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Offline indicator */}
            {!online && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Offline Mode</span>
              </div>
            )}
            {online && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <Wifi className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
              </div>
            )}

            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl glass-strong shadow-xl py-2 z-50">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code as LanguageCode); setLangOpen(false); }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800',
                        lang === l.code ? 'text-blue-600 dark:text-cyan-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme */}
            <button onClick={cycleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notifications */}
            <Link to="/dashboard/notifications" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative">
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>

            {/* Avatar */}
            <Link to="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
