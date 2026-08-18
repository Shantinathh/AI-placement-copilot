import React from 'react';
import { ScoreGauge } from '../components/ScoreGauge';

export const ResumeAnalysis = ({ analysis, onReupload }) => {
  if (!analysis || !analysis.ats_score) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '40px 20px' }} className="card-3d">
        <div className="icon-chip icon-chip-primary" style={{ margin: '0 auto 16px auto', width: '56px', height: '56px' }}>
          📄
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
          No Resume Analyzed Yet
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', marginBottom: '24px' }}>
          Please upload your PDF or DOCX resume to view your ATS compatibility score and extracted skill taxonomy.
        </p>
        <button onClick={onReupload} className="btn-3d-primary">
          Upload Resume Now
        </button>
      </div>
    );
  }

  const { ats_score, extracted_skills, missing_skills, quality_checks, domain } = analysis;

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      {/* Top Banner */}
      <div className="card-3d" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '30px',
        padding: '36px 24px',
        background: 'var(--card-gradient-info)'
      }}>
        <ScoreGauge score={ats_score} title="ATS Match Score" subtitle="Parser Optimization Index" />

        <div style={{ maxWidth: '500px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
            Resume Evaluation Summary
          </h2>
          {domain && domain !== 'General' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '20px',
              background: 'rgba(79,70,229,0.14)',
              color: '#4F46E5',
              fontWeight: '700',
              fontSize: '0.82rem',
              border: '1px solid rgba(79,70,229,0.3)',
              marginBottom: '12px'
            }}>
              🎯 Domain: {domain}
            </span>
          )}
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
            Your resume was scanned for key placement skill taxonomies, formatting sections, contact details, and ATS parser readability.
          </p>
          <button onClick={onReupload} className="btn-3d-secondary">
            📄 Upload Updated Resume
          </button>
        </div>
      </div>

      {/* Grid Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Extracted Skills */}
        <div className="card-3d">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="icon-chip icon-chip-success" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>✓</span>
            Detected Technical & Soft Skills ({extracted_skills?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {extracted_skills && extracted_skills.length > 0 ? (
              extracted_skills.map((skill, idx) => (
                <span key={idx} style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22C55E',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  {skill}
                </span>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No specific technical skills detected.</p>
            )}
          </div>
        </div>

        {/* Missing Recommended Skills */}
        <div className="card-3d">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="icon-chip icon-chip-danger" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>!</span>
            Missing High-Impact Placement Keywords ({missing_skills?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {missing_skills && missing_skills.length > 0 ? (
              missing_skills.map((skill, idx) => (
                <span key={idx} style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  + {skill}
                </span>
              ))
            ) : (
              <p style={{ color: '#22C55E', fontSize: '0.875rem', fontWeight: '600' }}>Great job! All core placement keywords are present.</p>
            )}
          </div>
        </div>

        {/* Quality Checks */}
        <div className="card-3d" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '16px' }}>
            Professional Quality & Format Audit
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {Object.entries(quality_checks || {}).map(([check, passed]) => (
              <div key={check} style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: passed ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-heading)' }}>{check}</span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: passed ? '#22C55E' : '#EF4444'
                }}>
                  {passed ? 'PASSED ✓' : 'MISSING ✗'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
