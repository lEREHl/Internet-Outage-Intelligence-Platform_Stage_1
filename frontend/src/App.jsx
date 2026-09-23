import React, { useState, useEffect } from 'react';
import './App.css';
import MeasurementsTable from './components/MeasurementsTable';
import LatencyChart from './components/LatencyChart';

const API_BASE_URL = 'http://127.0.0.1:8000/api/measurements';

export default function App() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMeasurements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?limit=100`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      setMeasurements(data);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to fetch data from FastAPI backend. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
    // Poll every 5 seconds for real-time dashboard updates
    const interval = setInterval(fetchMeasurements, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate summary metrics
  const totalChecks = measurements.length;
  const successfulChecks = measurements.filter((m) => m.success);
  const successRate = totalChecks > 0 ? ((successfulChecks.length / totalChecks) * 100).toFixed(1) : 0;
  
  const latencies = successfulChecks
    .map((m) => m.response_time_ms)
    .filter((l) => l !== null);
  const avgLatency = latencies.length > 0
    ? (latencies.reduce((acc, curr) => acc + curr, 0) / latencies.length).toFixed(1)
    : 0;

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="header-banner">
        <div className="header-title">
          <h1>Internet Outage Intelligence Platform</h1>
          <p>Stage 1 MVP — Multi-Target HTTP Latency & Availability Monitor</p>
        </div>
        <div className="status-pill">
          <span className="dot-live"></span>
          <span>Probe Active (10s interval)</span>
        </div>
      </header>

      {error && (
        <div className="card" style={{ borderColor: 'var(--failure-red)', backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <p style={{ margin: 0, color: '#f87171' }}>⚠️ {error}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <label>Total Probe Checks</label>
          <div className="metric-value">{loading ? '...' : totalChecks}</div>
        </div>
        <div className="metric-card">
          <label>Average Latency</label>
          <div className="metric-value" style={{ color: 'var(--accent-blue)' }}>
            {loading ? '...' : `${avgLatency} ms`}
          </div>
        </div>
        <div className="metric-card">
          <label>Availability Success Rate</label>
          <div className="metric-value" style={{ color: successRate >= 90 ? 'var(--success-green)' : 'var(--failure-red)' }}>
            {loading ? '...' : `${successRate}%`}
          </div>
        </div>
        <div className="metric-card">
          <label>Last Dashboard Refresh</label>
          <div className="metric-value" style={{ fontSize: '1.1rem', marginTop: '6px' }}>
            {lastUpdated || 'Initializing...'}
          </div>
        </div>
      </div>

      {/* Latency Chart Card */}
      <section className="card">
        <div className="card-title">
          <span>Target Response Time Over Time (Latency in ms)</span>
          <button className="btn-refresh" onClick={fetchMeasurements}>
            Refresh Now
          </button>
        </div>
        <LatencyChart measurements={measurements} />
      </section>

      {/* Measurements Table Card */}
      <section className="card">
        <div className="card-title">
          <span>Recent Probe Measurements</span>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Showing latest {measurements.length} checks
          </span>
        </div>
        <MeasurementsTable measurements={measurements} />
      </section>
    </div>
  );
}
