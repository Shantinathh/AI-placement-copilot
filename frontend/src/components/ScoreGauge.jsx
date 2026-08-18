import React from 'react';

export const ScoreGauge = ({ score = 0, title = "Score", subtitle = "" }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = "#EF4444"; // Red (0-39)
  if (normalizedScore >= 70) {
    strokeColor = "#22C55E"; // Green (70-100)
  } else if (normalizedScore >= 40) {
    strokeColor = "#F59E0B"; // Amber (40-69)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div className="gauge-container">
        <svg width="150" height="150" className="gauge-svg">
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="var(--color-border)"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s ease-in-out, stroke 0.5s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%'
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '2.4rem',
            fontWeight: '800',
            color: 'var(--color-text-heading)',
            textShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}>
            {Math.round(normalizedScore)}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            / 100
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>{title}</h4>
        {subtitle && <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>{subtitle}</p>}
      </div>
    </div>
  );
};
