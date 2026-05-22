import React, { useState } from 'react';

const ACTION_COLORS = {
  Clean: '#7c6aff',
  CatDetect: '#3eccb8',
  Empty: '#f5a623',
  Reset: '#6b7294',
};

function actionColor(a) {
  const key = Object.keys(ACTION_COLORS).find(k => a && a.includes(k));
  return ACTION_COLORS[key] || '#6b7294';
}

export default function ActivityTable({ history }) {
  const [filter, setFilter] = useState('All');

  const actions = ['All', ...new Set(history.map(h => h.action).filter(Boolean))];
  const filtered = filter === 'All' ? history : history.filter(h => h.action === filter);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Activity History</span>
        <div style={styles.filters}>
          {actions.slice(0, 6).map(a => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              style={{ ...styles.filterBtn, ...(filter === a ? styles.filterActive : {}) }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Timestamp', 'Action', 'Weight', 'Duration'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={styles.empty}>No activity found</td></tr>
            )}
            {filtered.map((row, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={{ ...styles.td, fontFamily: 'var(--mono)', fontSize: 12 }}>
                  {row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: actionColor(row.action) + '22', color: actionColor(row.action) }}>
                    {row.action || '—'}
                  </span>
                </td>
                <td style={{ ...styles.td, fontFamily: 'var(--mono)' }}>
                  {row.weight != null ? `${row.weight} lbs` : '—'}
                </td>
                <td style={{ ...styles.td, fontFamily: 'var(--mono)' }}>
                  {row.duration != null ? `${row.duration}s` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 12, marginBottom: 20,
  },
  title: { fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)' },
  filters: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn: {
    background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
    borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
    fontFamily: 'var(--sans)', transition: 'all 0.2s',
  },
  filterActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '10px 14px', fontSize: 10,
    letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)',
    borderBottom: '1px solid var(--border)',
  },
  td: { padding: '11px 14px', fontSize: 13, color: 'var(--text)' },
  rowEven: { background: 'transparent' },
  rowOdd: { background: 'var(--surface2)' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  empty: { textAlign: 'center', padding: 32, color: 'var(--muted)', fontStyle: 'italic' },
};
