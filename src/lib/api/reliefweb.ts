import type { ReliefWebReport } from '@/types';

const BASE = 'https://api.reliefweb.int/v2';
const APP_NAME = 'disastershield-ai';

export async function getDisasterReports(limit = 12): Promise<ReliefWebReport[]> {
  const res = await fetch(`${BASE}/reports?appname=${APP_NAME}&limit=${limit}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        include: ['title', 'date.original', 'url', 'country.name', 'source.name'],
      },
      sort: ['date:desc'],
      filter: {
        field: 'disaster',
        operator: 'notnull',
      },
    }),
  });
  if (!res.ok) throw new Error('ReliefWeb request failed');
  const data = await res.json();
  return data.data || [];
}

export async function getDisasterNews(limit = 10): Promise<ReliefWebReport[]> {
  return getDisasterReports(limit);
}
