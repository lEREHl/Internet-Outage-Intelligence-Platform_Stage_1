import React from 'react';

export default function MeasurementsTable({ measurements }) {
  if (!measurements || measurements.length === 0) {
    return (
      <div className="empty-state">
        <p>No measurement data recorded yet. Waiting for probe checks...</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="measurements-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Target Website</th>
            <th>Status</th>
            <th>Latency (ms)</th>
            <th>Details / Errors</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m) => {
            const formattedTime = new Date(m.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <tr key={m.id} className={m.success ? 'row-success' : 'row-failure'}>
                <td className="time-col">{formattedTime}</td>
                <td className="target-col">
                  <code>{m.target}</code>
                </td>
                <td>
                  <span className={`badge ${m.success ? 'badge-success' : 'badge-failure'}`}>
                    {m.status_code ? `${m.status_code} OK` : 'DOWN / ERROR'}
                  </span>
                </td>
                <td className="latency-col">
                  {m.response_time_ms ? `${m.response_time_ms} ms` : '—'}
                </td>
                <td className="error-col">
                  {m.error_message ? (
                    <span className="error-text" title={m.error_message}>
                      {m.error_message.length > 50
                        ? `${m.error_message.substring(0, 50)}...`
                        : m.error_message}
                    </span>
                  ) : (
                    <span className="text-muted">Healthy</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
