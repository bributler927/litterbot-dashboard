import React from 'react';

const STATUS_COLORS = {
  Ready: '#3eccb8',
  Clean: '#7c6aff',
  CatDetect: '#f5a623',
  DFI: '#ff5e6d',
  Offline: '#6b7294',
};

function statusColor(s) {
  return STATUS_COLORS[s] || '#6b7294';
}

export default function StatusCard({ status, onRefresh }) {
  if (!status) return null;

  const color = statusColor(status.status);
  const drawerPct = status.waste_drawer_level ?? 0;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.label}>Current Status</span>
        <button onClick={onRefresh} style={styles.refreshBtn} title="Refresh">↻</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ ...styles.statusDot, background: color }} />
        <span style={{ ...styles.statusText, color }}>{status.status || 'Unknown'}</span>
      </div>

      <div style={styles.grid}>
        <Stat label="Last Cat Weight" value={status.cat_weight ? `${status.cat_weight} lbs` : '—'} />
        <Stat label="Avg Cat Weight" value={status.avg_cat_weight ? `${status.avg_cat_weight} lbs` : '—'} />
        <Stat label="Total Cycles" value={status.clean_cycle_count ?? '—'} />
        <Stat label="Sleep Mode" value={status.sleep_mode_enabled ? 'On' : 'Off'} />
      </div>

      <div style={styles.drawerSection}>
        <div style={styles.drawerLabel}>
          <span>Waste Drawer</span>
          <span style={{ color: drawerPct > 80 ? '#ff5e6d' : '#3eccb8' }}>{drawerPct}%</span>
        </div>
        <div style={styles.drawerTrack}>
          <div style={{
            ...styles.drawerFill,
            width: `${drawerPct}%`,
            background: drawerPct > 80 ? '#ff5e6d' : drawerPct > 50 ? '#f5a623' : '#3eccb8',
          }} />
        </div>
      </div>

      {status.last_seen && (
        <p style={styles.lastSeen}>
          Last seen: {new Date(status.last_seen).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 24,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)' },
  refreshBtn: {
    background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
    borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 16,
    transition: 'color 0.2s', fontFamily: 'var(--sans)',
  },
  statusDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  statusText: { fontSize: 22, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  stat: {
    background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  statLabel: { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)' },
  statValue: { fontSize: 18, fontWeight: 600, fontFamily: 'var(--mono)' },
  drawerSection: { marginBottom: 16 },
  drawerLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 },
  drawerTrack: { height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' },
  drawerFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s ease' },
  lastSeen: { fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' },
};
