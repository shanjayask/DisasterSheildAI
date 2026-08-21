import { useState, useEffect } from 'react';
import { Loader2, Newspaper, ExternalLink, AlertCircle } from 'lucide-react';
import { getDisasterNews } from '@/lib/api/reliefweb';
import type { ReliefWebReport } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

export default function NewsPage() {
  const [news, setNews] = useState<ReliefWebReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDisasterNews(20)
      .then((data) => setNews(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Newspaper className="w-6 h-6 text-blue-500" /> Disaster News
      </h1>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-700 dark:text-amber-300">News feed temporarily unavailable. Please try again later.</p>
        </div>
      )}

      {!error && news.length === 0 ? (
        <p className="text-slate-400 text-center py-16">No recent disaster news available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {news.map((n) => (
            <a
              key={n.id}
              href={n.fields.url}
              target="_blank"
              rel="noopener"
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                {n.fields.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                {n.fields.country?.[0]?.name && <span>{n.fields.country[0].name}</span>}
                <span>·</span>
                <span>{formatRelativeTime(n.fields.date.original)}</span>
              </div>
              {n.fields.source?.[0]?.name && (
                <p className="text-xs text-slate-400 mt-1">Source: {n.fields.source[0].name}</p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
                Read article <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        News from ReliefWeb API. Summaries link to original sources. We do not scrape copyrighted content.
      </p>
    </div>
  );
}
