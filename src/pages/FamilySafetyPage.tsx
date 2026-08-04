import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Check, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { FamilyMember } from '@/types';
import { cn } from '@/lib/utils';

export default function FamilySafetyPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', age: '', gender: '', relationship: '' });

  useEffect(() => {
    if (user) {
      supabase.from('family_members').select('*').eq('user_id', user.id).then(({ data }) => {
        setMembers((data as FamilyMember[]) || []);
        setLoading(false);
      });
    }
  }, [user]);

  const updateStatus = async (id: string, status: FamilyMember['status']) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    await supabase.from('family_members').update({ status }).eq('id', id);
  };

  const addMember = async () => {
    if (!user || !newMember.name) return;
    const { data } = await supabase.from('family_members').insert({
      user_id: user.id,
      name: newMember.name,
      age: newMember.age ? parseInt(newMember.age) : null,
      gender: newMember.gender || null,
      relationship: newMember.relationship || null,
      status: 'unknown',
    }).select().single();
    if (data) setMembers((prev) => [...prev, data as FamilyMember]);
    setNewMember({ name: '', age: '', gender: '', relationship: '' });
    setAdding(false);
  };

  const removeMember = async (id: string) => {
    await supabase.from('family_members').delete().eq('id', id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const sendCheckIn = (name: string) => {
    const msg = `I am safe. — Sent via DisasterShield AI`;
    if (navigator.share) {
      navigator.share({ title: 'Family Check-In', text: msg }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(msg);
      alert(`Check-in message copied: "${msg}"`);
    }
  };

  if (loading) {
    return <div className="flex justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" /> Family Safety
        </h1>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {adding && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <input placeholder="Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm" />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Age" type="number" value={newMember.age} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm" />
            <select value={newMember.gender} onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm">
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Relationship" value={newMember.relationship} onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={addMember} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500">Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-slate-500 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {members.length === 0 && !adding ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No family members added yet.</p>
          <p className="text-sm text-slate-400 mt-1">Add members to receive family safety alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.age} years · {m.relationship || 'Family member'}</p>
                </div>
                <button onClick={() => removeMember(m.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {(['safe', 'need_assistance', 'unknown'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(m.id, s)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                      m.status === s
                        ? s === 'safe' ? 'bg-green-500 text-white'
                          : s === 'need_assistance' ? 'bg-red-500 text-white'
                          : 'bg-slate-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {s === 'safe' ? 'Safe' : s === 'need_assistance' ? 'Need Assistance' : 'Unknown'}
                  </button>
                ))}
              </div>
              <button onClick={() => sendCheckIn(m.name)} className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-cyan-400 hover:underline">
                <MessageSquare className="w-3 h-3" /> Send "I am safe" check-in
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            DisasterShield AI does not track family members' real-time locations unless they explicitly opt into location sharing.
            Status is manually set by you.
          </p>
        </div>
      </div>
    </div>
  );
}
