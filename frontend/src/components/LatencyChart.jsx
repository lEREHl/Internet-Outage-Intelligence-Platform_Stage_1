import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const TARGET_COLORS = {
  'https://www.google.com': '#4285F4', // Google Blue
  'https://github.com': '#2DBA4E',     // GitHub Green
  'https://1.1.1.1': '#F38020',         // Cloudflare Orange
};

const DEFAULT_COLORS = ['#3182CE', '#38A169', '#DD6B20', '#805AD5', '#E53E3E'];

export default function LatencyChart({ measurements }) {
  // Transform flat measurement array into chart-friendly pivot records
  const { chartData, targets } = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return { chartData: [], targets: [] };
    }

    // Sort measurements chronologically (oldest first for time series axis)
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const targetSet = new Set();
    const timeMap = new Map();

    sorted.forEach((m) => {
      targetSet.add(m.target);
      const timeKey = new Date(m.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, { time: timeKey });
      }
      // Set response time (ms) if successful ping
      if (m.success && m.response_time_ms !== null) {
        timeMap.get(timeKey)[m.target] = m.response_time_ms;
      }
    });

    return {
      chartData: Array.from(timeMap.values()),
      targets: Array.from(targetSet),
    };
  }, [measurements]);

  if (chartData.length === 0) {
    return (
      <div className="empty-state">
        <p>No chart data available yet.</p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
          <XAxis dataKey="time" stroke="#A0AEC0" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
          <YAxis
            stroke="#A0AEC0"
            unit=" ms"
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A202C',
              borderColor: '#4A5568',
              borderRadius: '8px',
              color: '#EDF2F7',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {targets.map((target, idx) => {
            const color =
              TARGET_COLORS[target] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            return (
              <Line
                key={target}
                type="monotone"
                dataKey={target}
                name={target.replace('https://', '')}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 6 }}
                connectNulls={true}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
