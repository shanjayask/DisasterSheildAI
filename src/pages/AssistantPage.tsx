import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const KNOWLEDGE: Record<string, string> = {
  flood: `During a flood:\n1. Move to higher ground immediately if instructed by authorities.\n2. Avoid walking or driving through flood waters — even 15 cm of water can sweep you away.\n3. Turn off utilities at the main switches if you have time.\n4. Keep emergency supplies ready: water, food, flashlight, medications.\n5. Do not return home until authorities say it is safe.\n\nAlways follow official evacuation orders from local authorities.`,
  earthquake: `During an earthquake:\n1. DROP to the ground, take COVER under a sturdy table, and HOLD ON.\n2. Stay away from windows, glass, and exterior walls.\n3. If outdoors, move to an open area away from buildings and power lines.\n4. If driving, pull over safely and stay in the vehicle.\n5. After shaking stops, check for injuries and damage. Be prepared for aftershocks.\n\nNote: Earthquakes cannot be predicted. This is safety guidance, not a prediction.`,
  cyclone: `Preparing for a cyclone:\n1. Secure loose outdoor items and reinforce doors/windows.\n2. Stock emergency supplies: water, food, batteries, first aid.\n3. Charge phones and keep a battery radio.\n4. Know your nearest shelter and evacuation route.\n5. Follow official evacuation orders. Do not go outside during the eye of the storm.\n\nMonitor official weather warnings from your local meteorological department.`,
  wildfire: `During a wildfire:\n1. Evacuate immediately if told to do so by authorities.\n2. Wear protective clothing — N95 mask, long sleeves, sturdy shoes.\n3. Close all doors and windows before leaving to slow fire spread.\n4. Keep emergency supplies and important documents ready to grab.\n5. Do not return until authorities confirm it is safe.\n\nMonitor official fire warnings and air quality reports.`,
  shelter: `To find your nearest shelter:\n1. Go to the "Emergency Shelters" section in the sidebar.\n2. Select your preferred search radius (5-50 km).\n3. The map will show nearby shelters from OpenStreetMap data.\n4. Tap "Directions" to navigate to a shelter.\n\nNote: Shelter availability cannot be verified automatically. Always confirm with local authorities.`,
  emergency_number: `Emergency numbers vary by country:\n• India: 112 (Emergency), 100 (Police), 101 (Fire), 108 (Ambulance)\n• United States: 911\n• United Kingdom: 999\n• Australia: 000\n• Japan: 110 (Police), 119 (Ambulance)\n\nCheck the "Emergency Contacts" page for numbers specific to your country.`,
  risk_level: `Your risk level is calculated by our AI Risk Engine using:\n• Current weather data (Open-Meteo)\n• Earthquake events (USGS)\n• Forecast precipitation and wind\n• Historical patterns\n\nLevels: LOW (minimal risk), MEDIUM (monitor), HIGH (prepare), CRITICAL (take action).\n\nThis is an AI Risk Estimate — always prioritize official emergency warnings.`,
  default: `I'm ShieldAI, your disaster preparedness assistant. I can help with:\n• What to do during floods, earthquakes, cyclones, and wildfires\n• How to prepare for disasters\n• Finding nearby shelters and hospitals\n• Emergency contact numbers\n• Understanding your risk level\n\nFor immediate danger, always contact your local emergency services.`,
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('flood')) return KNOWLEDGE.flood;
  if (lower.includes('earthquake')) return KNOWLEDGE.earthquake;
  if (lower.includes('cyclone') || lower.includes('hurricane') || lower.includes('typhoon')) return KNOWLEDGE.cyclone;
  if (lower.includes('fire') || lower.includes('wildfire')) return KNOWLEDGE.wildfire;
  if (lower.includes('shelter')) return KNOWLEDGE.shelter;
  if (lower.includes('emergency number') || lower.includes('call') || lower.includes('phone')) return KNOWLEDGE.emergency_number;
  if (lower.includes('risk')) return KNOWLEDGE.risk_level;
  if (lower.includes('prepare')) return KNOWLEDGE.cyclone;
  return KNOWLEDGE.default;
}

const QUICK_QUESTIONS = [
  'What should I do during a flood?',
  'How do I prepare for a cyclone?',
  'Where is the nearest shelter?',
  'What does my risk level mean?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: KNOWLEDGE.default },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: getResponse(text) }]);
      setTyping(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">ShieldAI Assistant</h1>
          <p className="text-xs text-slate-500">Your disaster preparedness guide</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-line',
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask about disaster preparedness..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button onClick={() => send(input)} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-2 mt-2">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          ShieldAI provides general guidance only. For immediate danger, contact your local emergency services. Always follow official instructions.
        </p>
      </div>
    </div>
  );
}
