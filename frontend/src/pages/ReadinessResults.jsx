import React from 'react';
import { ScoreGauge } from '../components/ScoreGauge';

export const ReadinessResults = ({ prediction, profile, onViewGaps, onViewCompanies, onGenerateRoadmap }) => {
  if (!prediction) return null;

  const { readiness_score, predicted_status, predicted_salary_lpa, feature_importances } = prediction;
  const isPlaced = predicted_status === "Placed";

  return (
    <div style={{ maxWidth: '1100px', margin: '36px auto', padding: '0 20px' }}>
      {/* Centered Top Banner */}
      <div className="card-3d" style={{
        textAlign: 'center',
        background: 'var(--card-gradient-primary)',
        marginBottom: '36px',
        padding: '40px 28px'
      }}>
        {/* Prominently Centered Gauge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <ScoreGauge score={readiness_score} title="Readiness Score" subtitle="ML Predicted Index" />
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            padding: '8px 24px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '1.1rem',
            background: isPlaced ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isPlaced ? '#22C55E' : '#EF4444',
            border: `1px solid ${isPlaced ? '#22C55E' : '#EF4444'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            {isPlaced ? '✅ Predicted Status: Placed' : '⚠️ Action Required: At-Risk Placement'}
          </span>
        </div>

        {/* Salary Package Estimate */}
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '12px' }}>
          Estimated Salary Package: <span style={{ color: '#4F46E5' }}>{predicted_salary_lpa} LPA</span>
        </div>

        <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--color-text-body)', fontSize: '0.925rem', lineHeight: '1.6' }}>
          Based on your CGPA ({profile?.cgpa || 8.2}), aptitude score ({profile?.aptitude_score || 80}), and {profile?.projects_count || 4} technical projects evaluated against 100,000 historic campus placement outcomes.
        </p>
      </div>

      {/* SHAP Explainability Waterfall Section */}
      {prediction?.top_contributions && prediction.top_contributions.length > 0 && (
        <div className="card-3d" style={{ marginBottom: '36px', padding: '32px 28px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="icon-chip icon-chip-primary" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>💡</span>
            Why This Score?
          </h3>

          <p style={{ color: 'var(--color-text-body)', fontSize: '0.925rem', marginBottom: '24px', lineHeight: '1.6' }}>
            This breakdown shows exactly which factors increased or decreased your readiness score, based on your specific profile.
          </p>

          {/* Waterfall Chart Box */}
          <div style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '8px' }}>
              <span>BASELINE EXPECTED VALUE: <strong style={{ color: 'var(--color-text-heading)' }}>{prediction.base_value}%</strong></span>
              <span>FINAL PREDICTED SCORE: <strong style={{ color: '#4F46E5' }}>{readiness_score}%</strong></span>
            </div>

            {/* Cascading Waterfall Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                let runningTotal = prediction.base_value || 50;
                return prediction.top_contributions.map((item, idx) => {
                  const val = item.shap_contribution;
                  const isPos = val >= 0;
                  const startVal = runningTotal;
                  const endVal = runningTotal + val;
                  runningTotal = endVal;

                  const signedVal = isPos ? `+${val.toFixed(1)}` : `${val.toFixed(1)}`;
                  const color = isPos ? 'var(--color-success, #10B981)' : 'var(--color-danger, #EF4444)';

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '700' }}>
                        <span style={{ color: 'var(--color-text-heading)' }}>
                          {item.feature_name} <span style={{ fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>({item.value})</span>
                        </span>
                        <span style={{ color: color, fontWeight: '800' }}>{signedVal}</span>
                      </div>

                      {/* Cascading Horizontal Track */}
                      <div style={{ position: 'relative', height: '14px', background: 'var(--color-border)', borderRadius: '7px', overflow: 'hidden' }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${Math.max(0, Math.min(99, isPos ? startVal : endVal))}%`,
                          width: `${Math.max(1, Math.min(100, Math.abs(val)))}%`,
                          background: color,
                          borderRadius: '4px',
                          transition: 'all 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* 4 Category Impact Summary Cards */}
          {prediction.category_impacts && prediction.category_impacts.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '16px' }}>
                Category Contribution Totals
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {prediction.category_impacts.map((catItem, idx) => {
                  const isPos = catItem.total_contribution >= 0;
                  const signedVal = isPos ? `+${catItem.total_contribution.toFixed(1)}` : `${catItem.total_contribution.toFixed(1)}`;
                  const color = isPos ? '#10B981' : '#EF4444';
                  const icon = isPos ? '↑' : '↓';
                  const bg = isPos ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';

                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: bg,
                        color: color,
                        fontWeight: '800',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{catItem.category}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: color }}>{signedVal} pts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Importance Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        <div className="card-3d">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="icon-chip icon-chip-primary" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>📊</span>
            ML Feature Importance Factors
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(feature_importances || {}).map(([feature, pct]) => (
              <div key={feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-body)', marginBottom: '6px' }}>
                  <span>{feature}</span>
                  <span style={{ color: '#4F46E5', fontWeight: '800' }}>{pct}%</span>
                </div>
                <div style={{ height: '12px', width: '100%', background: 'var(--color-border)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, pct * 2.5)}%`,
                    background: 'linear-gradient(90deg, #4F46E5, #0EA5E9)',
                    borderRadius: '6px',
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '14px' }}>
              Next Steps for Placement Success
            </h3>
            <p style={{ color: 'var(--color-text-body)', fontSize: '0.925rem', marginBottom: '28px', lineHeight: '1.6' }}>
              Unlock company recommendations matching your readiness tier, perform skill gap radar analysis, or let Mistral-7B generate a week-by-week preparation roadmap.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button onClick={onViewGaps} className="btn-3d-secondary" style={{ justifyContent: 'space-between', padding: '14px 20px' }}>
                <span>🎯 View Benchmark Skill Gaps</span>
                <span>→</span>
              </button>
              <button onClick={onViewCompanies} className="btn-3d-secondary" style={{ justifyContent: 'space-between', padding: '14px 20px' }}>
                <span>🏢 Explore Matched Companies</span>
                <span>→</span>
              </button>
              <button onClick={onGenerateRoadmap} className="btn-3d-primary" style={{ justifyContent: 'center', padding: '14px 20px' }}>
                <span>✨ Generate GenAI 4-Week Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
