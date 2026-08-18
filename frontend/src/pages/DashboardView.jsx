import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';

export const DashboardView = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      setApiError('Could not connect to backend server. Please ensure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDownloadPdf = async () => {
    setPdfError('');
    setDownloadingPdf(true);
    try {
      await api.downloadReportPdf();
    } catch (err) {
      setPdfError('Failed to download PDF report. Ensure backend server is running.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #4F46E5', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
        Loading your placement dashboard...
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px 20px' }} className="card-3d">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>Backend Unavailable</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>{apiError}</p>
        <button onClick={fetchDashboard} className="btn-3d-primary">🔄 Retry Connection</button>
      </div>
    );
  }

  const { user_name, readiness, ats, top_companies, roadmap } = data || {};
  const hasProfile = !!readiness;
  const hasResume = !!ats;
  const hasCompanies = top_companies && top_companies.length > 0;
  const hasRoadmap = roadmap && roadmap.weeks && roadmap.weeks.length > 0;

  // Empty state card helper
  const EmptyCard = ({ icon, title, desc, action, actionLabel }) => (
    <div style={{ textAlign: 'center', padding: '28px 20px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontWeight: '700', color: 'var(--color-text-heading)', fontSize: '0.95rem', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>{desc}</div>
      <button onClick={action} className="btn-3d-secondary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>{actionLabel}</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      {/* Welcome Banner */}
      <div className="card-3d" style={{
        marginBottom: '30px',
        padding: '30px 24px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '6px', color: '#FFFFFF' }}>
            Welcome Back, {user_name || 'Student'}! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            {hasProfile
              ? 'Here is your real-time placement readiness overview, ATS resume status, and company target list.'
              : 'Complete your profile to unlock personalized placement insights and recommendations.'}
          </p>
          {pdfError && (
            <div style={{ marginTop: '10px', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              ⚠️ {pdfError}
            </div>
          )}
        </div>

        {hasProfile && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="btn-3d-primary"
            style={{
              background: '#FFFFFF',
              color: '#4F46E5',
              fontWeight: '800',
              padding: '12px 24px',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {downloadingPdf ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #4F46E5', borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                Generating PDF...
              </>
            ) : '📥 Download PDF Report'}
          </button>
        )}
      </div>

      {/* Score Gauges — only show when real data exists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        {/* Readiness Card */}
        <div className="card-3d" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', minHeight: '160px' }}>
          {hasProfile ? (
            <>
              <ScoreGauge score={readiness.readiness_score} title="Placement Readiness" subtitle="ML Model Index" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: readiness.predicted_status === 'Placed' ? '#22C55E' : '#EF4444' }}>
                  {readiness.predicted_status}
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Estimated LPA</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--badge-indigo-text)' }}>
                  {readiness.predicted_salary_lpa} LPA
                </div>
                <button onClick={() => onNavigate('profile')} className="btn-3d-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.785rem' }}>
                  Recalculate
                </button>
              </div>
            </>
          ) : (
            <EmptyCard
              icon="📊"
              title="No Readiness Score Yet"
              desc="Fill in your profile to get your ML placement prediction."
              action={() => onNavigate('profile')}
              actionLabel="🚀 Fill Profile"
            />
          )}
        </div>

        {/* ATS Card */}
        <div className="card-3d" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', minHeight: '160px' }}>
          {hasResume ? (
            <>
              <ScoreGauge score={ats.ats_score} title="ATS Resume Score" subtitle="Keyword Compatibility" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Detected Skills</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0EA5E9' }}>{ats.extracted_skills?.length || 0} Skills</div>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Missing Keywords</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F59E0B' }}>{ats.missing_skills?.length || 0} Keywords</div>
                <button onClick={() => onNavigate('resume')} className="btn-3d-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.785rem' }}>
                  Scan New Resume
                </button>
              </div>
            </>
          ) : (
            <EmptyCard
              icon="📄"
              title="No Resume Scanned Yet"
              desc="Upload your PDF/DOCX to get your ATS compatibility score."
              action={() => onNavigate('resume')}
              actionLabel="📄 Upload Resume"
            />
          )}
        </div>
      </div>

      {/* Companies + Roadmap Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Companies */}
        <div className="card-3d">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>Top Company Matches</h3>
            {hasCompanies && (
              <button onClick={() => onNavigate('companies')} className="btn-3d-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                View All ({top_companies.length}) →
              </button>
            )}
          </div>

          {hasCompanies ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {top_companies.map((c, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--color-text-heading)', fontSize: '0.95rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.expected_package_lpa} LPA</div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22C55E',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    {c.match_percentage}% Match
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCard
              icon="🏢"
              title="No Company Matches Yet"
              desc="Complete your profile first to get personalized company recommendations."
              action={() => onNavigate('profile')}
              actionLabel="🚀 Fill Profile"
            />
          )}
        </div>

        {/* Roadmap */}
        <div className="card-3d">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>Active Preparation Roadmap</h3>
            {hasRoadmap && (
              <button onClick={() => onNavigate('roadmap')} className="btn-3d-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Open Full Roadmap →
              </button>
            )}
          </div>

          {hasRoadmap ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roadmap.weeks.slice(0, 2).map((w, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--badge-indigo-bg)', borderRadius: '10px', border: '1px solid var(--badge-indigo-border)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--badge-indigo-text)', fontSize: '0.9rem', marginBottom: '6px' }}>
                    {w.title}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--color-text-body)' }}>
                    • {w.tasks && w.tasks[0]}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCard
              icon="🗺️"
              title="No Roadmap Generated Yet"
              desc="Generate a personalized 4-week AI roadmap based on your skill gaps."
              action={() => onNavigate('skillgap')}
              actionLabel="✨ Generate Roadmap"
            />
          )}
        </div>
      </div>
    </div>
  );
};
