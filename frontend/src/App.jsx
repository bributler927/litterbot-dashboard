import React, { useState } from 'react';
import { useRobots, useRobotStatus, useActivityHistory, useInsights } from './hooks/useLitterbot';
import StatusCard from './components/StatusCard';
import ActivityTable from './components/ActivityTable';
import WeightChart from './components/WeightChart';

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', padding: '40px 0' }}>
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 20 }}>⟳</span>
      Loading…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div style={{
      background: '#ff5e6d22', border: '1px solid #ff5e6d44',
      borderRadius: 8, padding: '12px 16px', color: '#ff5e6d',
      fontFamily: 'var(--mono)', fontSize: 13, marginTop: 16,
    }}>
      ⚠ {msg}
    </div>
  );
}

function RobotDashboard({ serial }) {
  const { status, loading: sl, error: se, refresh } = useRobotStatus(serial);
  const { history, loading: hl, error: he } = useActivityHistory(serial);
  const { insights, loading: il } = useInsights(serial);

  return (
    <div>
      {sl ? <Loader /> : se ? <ErrorBanner msg={se} /> : <StatusCard status={status} onRefresh={refresh} />}
      {(!il) && <WeightChart insights={insights} history={history} />}
      {hl ? <Loader /> : he ? <ErrorBanner msg={he} /> : <ActivityTable history={history} />}
    </div>
  );
}

export default function App() {
  const { robots, loading, error } = useRobots();
  const [selected, setSelected] = useState(null);

  const activeSerial = selected || robots[0]?.serial;

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🐱</span>
          <span style={styles.logoText}>LitterBot</span>
        </div>
        <nav style={styles.nav}>
          <p style={styles.navLabel}>Your Robots</p>
          {loading && <Loader />}
          {error && <ErrorBanner msg={error} />}
          {robots.map(r => (
            <button
              key={r.serial}
              onClick={() => setSelected(r.serial)}
              style={{
                ...styles.navItem,
                ...(r.serial === activeSerial ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navDot} />
              <div>
                <p style={styles.navName}>{r.name || 'Litter-Robot'}</p>
                <p style={styles.navSerial}>{r.serial}</p>
              </div>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <p style={styles.footerText}>Auto-refreshes every 60s</p>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <header style={styles.pageHeader}>
          <div>
            <h1 style={styles.h1}>Dashboard</h1>
            <p style={styles.subtitle}>
              {robots.find(r => r.serial === activeSerial)?.name || 'Select a robot'} · Litter-Robot 5
            </p>
          </div>
          <div style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {activeSerial
          ? <RobotDashboard serial={activeSerial} />
          : !loading && <p style={{ color: 'var(--muted)', marginTop: 40 }}>No robots found on this account.</p>
        }
      </main>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 28px', borderBottom: '1px solid var(--border)' },
  logoIcon: { fontSize: 24 },
  logoText: { fontSize: 18, fontWeight: 800, letterSpacing: -0.5 },
  nav: { flex: 1, padding: '20px 12px' },
  navLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', padding: '0 8px', marginBottom: 8 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'none', border: 'none', padding: '10px 12px', borderRadius: 8,
    cursor: 'pointer', textAlign: 'left', color: 'var(--text)', transition: 'background 0.2s',
    fontFamily: 'var(--sans)',
  },
  navItemActive: { background: 'var(--surface2)' },
  navDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  navName: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
  navSerial: { fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' },
  sidebarFooter: { padding: '16px 20px', borderTop: '1px solid var(--border)' },
  footerText: { fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' },
  main: { flex: 1, padding: '32px 40px', maxWidth: 960, overflowY: 'auto' },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)',
  },
  h1: { fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--muted)' },
  headerDate: { fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', textAlign: 'right' },
};
