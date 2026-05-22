import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1e2a', border: '1px solid #252a38',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#6b7294', marginBottom: 4, fontFamily: 'var(--mono)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontFamily: 'var(--mono)' }}>
          {p.name}: {p.value?.toFixed(2)} lbs
        </p>
      ))}
    </div>
  );
}

export default function WeightChart({ insights, history }) {
  // Use insights if available, else fall back to activity history weight points
  let data = [];

  if (insights && insights.length > 0) {
    data = insights
      .filter(i => i.average_weight)
      .map(i => ({
        date: i.date ? new Date(i.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '?',
        avg: Number(i.average_weight?.toFixed(2)),
        min: Number(i.min_weight?.toFixed(2)),
        max: Number(i.max_weight?.toFixed(2)),
      }));
  } else if (history && history.length > 0) {
    data = history
      .filter(h => h.weight != null)
      .slice(0, 30)
      .reverse()
      .map(h => ({
        date: h.timestamp
          ? new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '?',
        avg: Number(Number(h.weight).toFixed(2)),
      }));
  }

  const hasData = data.length > 0;
  const avgWeight = hasData
    ? (data.reduce((s, d) => s + (d.avg || 0), 0) / data.length).toFixed(1)
    : null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Weight Trend</span>
        {avgWeight && (
          <span style={styles.avg}>
            avg <span style={{ color: 'var(--accent2)', fontFamily: 'var(--mono)' }}>{avgWeight} lbs</span>
          </span>
        )}
      </div>

      {!hasData ? (
        <div style={styles.empty}>No weight data available yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="wAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c6aff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c6aff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="wRange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3eccb8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3eccb8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#252a38" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#6b7294', fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7294', fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            {avgWeight && <ReferenceLine y={parseFloat(avgWeight)} stroke="#6b7294" strokeDasharray="4 4" />}
            {data[0]?.max && <Area type="monotone" dataKey="max" stroke="#3eccb8" strokeWidth={1} fill="url(#wRange)" name="max" dot={false} />}
            {data[0]?.min && <Area type="monotone" dataKey="min" stroke="#3eccb8" strokeWidth={1} fill="none" name="min" dot={false} />}
            <Area type="monotone" dataKey="avg" stroke="#7c6aff" strokeWidth={2} fill="url(#wAvg)" name="avg" dot={false} activeDot={{ r: 5, fill: '#7c6aff' }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 24,
    marginTop: 24,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)' },
  avg: { fontSize: 13, color: 'var(--muted)' },
  empty: { textAlign: 'center', padding: 40, color: 'var(--muted)', fontStyle: 'italic' },
};
