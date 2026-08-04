import { useState, useEffect } from 'react';
import { Phone, Loader2, Search, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { EmergencyContact } from '@/types';

export default function ContactsPage() {
  const { profile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [allContacts, setAllContacts] = useState<EmergencyContact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('emergency_contacts').select('*').then(({ data }) => {
      const all = (data as EmergencyContact[]) || [];
      setAllContacts(all);
      const country = profile?.country || '';
      const filtered = all.filter((c) =>
        c.country.toLowerCase() === country.toLowerCase()
      );
      setContacts(filtered.length > 0 ? filtered : all.filter((c) => c.country === 'United States'));
      setLoading(false);
    });
  }, [profile]);

  const filtered = search
    ? allContacts.filter((c) =>
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.service_name.toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  if (loading) {
    return <div className="flex justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Phone className="w-6 h-6 text-orange-500" /> Emergency Contacts
      </h1>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Globe className="w-4 h-4" />
        Showing contacts for: <span className="font-medium text-slate-700 dark:text-slate-300">{profile?.country || 'your region'}</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by country or service..."
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{c.service_name}</p>
              <p className="text-xs text-slate-500">{c.country}</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-1">{c.phone_number}</p>
            </div>
            <a
              href={`tel:${c.phone_number}`}
              className="flex items-center gap-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-500 transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-400 py-8">No emergency contacts found for your search.</p>
      )}

      <p className="text-xs text-slate-400 text-center">
        Emergency numbers vary by country. Always verify with local authorities. Call only in genuine emergencies.
      </p>
    </div>
  );
}
