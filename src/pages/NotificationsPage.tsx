import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { AppNotification } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications((data as AppNotification[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const acknowledge = async (id: string) => {
    await supabase.from('notifications').update({ acknowledged: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n)));
  };

  const remove = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Bell className="w-6 h-6 text-blue-500" /> Notifications
      </h1>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No notifications yet.</p>
          <p className="text-sm text-slate-400 mt-1">You'll receive alerts here when disaster risks are detected near you.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'p-4 rounded-xl border flex items-start justify-between gap-3',
                n.acknowledged
                  ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                  : n.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    : n.severity === 'high'
                      ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {!n.acknowledged && <span className={cn('w-2 h-2 rounded-full', n.severity === 'critical' ? 'bg-red-500' : n.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500')} />}
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{n.title}</p>
                </div>
                {n.message && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>}
                <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.created_at)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.acknowledged && (
                  <button onClick={() => acknowledge(n.id)} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => remove(n.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
