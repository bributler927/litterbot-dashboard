import { useState, useEffect, useCallback } from 'react';

const BASE = '/api';

export function useRobots() {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE}/robots`)
      .then(r => r.json())
      .then(d => { setRobots(d.robots || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return { robots, loading, error };
}

export function useRobotStatus(serial) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    if (!serial) return;
    setLoading(true);
    fetch(`${BASE}/robot/${serial}/status`)
      .then(r => r.json())
      .then(d => { setStatus(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [serial]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000); // auto-refresh every 60s
    return () => clearInterval(id);
  }, [refresh]);

  return { status, loading, error, refresh };
}

export function useActivityHistory(serial) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!serial) return;
    fetch(`${BASE}/robot/${serial}/activity`)
      .then(r => r.json())
      .then(d => { setHistory(d.history || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [serial]);

  return { history, loading, error };
}

export function useInsights(serial) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!serial) return;
    fetch(`${BASE}/robot/${serial}/insights`)
      .then(r => r.json())
      .then(d => { setInsights(d.insights || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [serial]);

  return { insights, loading, error };
}
